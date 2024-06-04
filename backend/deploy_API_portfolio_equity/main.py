from fastapi import FastAPI, Query
import sqlalchemy
from google.cloud.sql.connector import Connector
from fastapi.middleware.cors import CORSMiddleware
import os
from firebase_admin import credentials, firestore, initialize_app
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from collections import defaultdict
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


# Initialize Firebase app
cred = credentials.Certificate("stock-firebase-v1-firebase-adminsdk-phrfc-5e8cf0a852.json")
firebase_app = initialize_app(cred)
db = firestore.client()

def getconn() -> sqlalchemy.engine.Connection:
    connector = Connector()
    conn = connector.connect(
        "avid-booster-386403:us-west1:stats418stock",
        "pymysql",
        user='starix',
        password='**##418project',
        db='stock_test'
    )
    return conn

pool = sqlalchemy.create_engine(
    "mysql+pymysql://",
    creator=getconn,
)

def calculate_return_percentage(current_value, previous_value):
    if previous_value != 0:
        return round((current_value - previous_value) / previous_value * 100, 3)
    else:
        return 0

@app.get('/api/portfolio_equity')
def get_portfolio_equity(user_id: str = Query(...), portfolio_id: str = Query(...)):
    try:
        # Retrieve user's stock holdings from Firebase
        portfolio_ref = db.collection('users').document(user_id).collection('portfolios').document(portfolio_id)
        portfolio_doc = portfolio_ref.get()

        # Check if the portfolio exists for the user
        if not portfolio_doc.exists:
            raise ValueError(f"Portfolio {portfolio_id} does not exist for user {user_id}")

        # Retrieve the investment documents from the "investments" subcollection
        investments_ref = portfolio_ref.collection('investments')
        investments_docs = investments_ref.get()

        # Extract the investment data from each document and store it in the "investments" list
        investments = []
        for doc in investments_docs:
            investment_data = doc.to_dict()
            investments.append(investment_data)

        # Check if there are any investments in the portfolio
        if not investments:
            return {'message': 'No investments found for the portfolio.'}

        # Sort the data by trade date in ascending order
        investments.sort(key=lambda x: datetime.strptime(x['tradeDate'], '%Y-%m-%d'))
        earliest_trade_date = investments[0]['tradeDate']
        # Set the end date for the portfolio equity calculation
        end_date = datetime.now().strftime('%Y-%m-%d')
        
        # Initialize an empty list to store the portfolio equity data
        quantity_data = [{'date': earliest_trade_date, 'cash': 0, 'investment': 0}]
        data = []
        trade_dates = defaultdict(int)
        n = len(investments) - 1

        # Iterate over each investment in the portfolio
        for idx, investment in enumerate(investments):
            ticker = investment['ticker']
            quantity = investment['quantity']
            start_date = investment['tradeDate']
            trade_type = investment['tradeType']

            # Handle Withdrawal
            if trade_type == "Withdrawal":
                if quantity_data[-1]['date'] == start_date:
                    quantity_data[-1]['cash'] -= investment['price']
                    continue
                temp = quantity_data[-1].copy()
                temp['cash'] -= investment['price']
                temp['date'] = start_date
                quantity_data.append(temp)
                continue

            # Handle Deposit
            if trade_type == "Deposit":
                if quantity_data[-1]['date'] == start_date:
                    quantity_data[-1]['cash'] += investment['price']
                    quantity_data[-1]['investment'] += investment['price'] * quantity
                    continue
                temp = quantity_data[-1].copy()
                temp['cash'] += investment['price']
                temp['date'] = start_date
                quantity_data.append(temp)
                continue

            # Handle Buy
            if trade_type == "Buy":
                if quantity_data[-1]['date'] == start_date:
                    if ticker in quantity_data[-1]:
                        quantity_data[-1][ticker] += quantity
                    else:
                        quantity_data[-1][ticker] = quantity
                    quantity_data[-1]['investment'] += investment['price'] * quantity
                    trade_dates[start_date] += 1
                    continue
                temp = quantity_data[-1].copy()
                if ticker not in temp:
                    temp[ticker] = 0
                temp[ticker] += quantity
                temp['date'] = start_date
                temp['investment'] += investment['price'] * quantity
                quantity_data.append(temp)
                trade_dates[start_date] += 1
                continue
            
            if trade_type == "Buy with Cash":
                if quantity_data[-1]['date'] == start_date:
                    if ticker in quantity_data[-1]:
                        quantity_data[-1][ticker] += quantity
                    else:
                        quantity_data[-1][ticker] = quantity
                    quantity_data[-1]['cash'] -= investment['price'] * quantity
                    trade_dates[start_date] += 1
                    continue
                temp = quantity_data[-1].copy()
                if ticker not in temp:
                    temp[ticker] = 0
                temp[ticker] += quantity
                temp['date'] = start_date
                temp['cash'] -= investment['price'] * quantity
                temp['investment'] += investment['price'] * quantity
                quantity_data.append(temp)
                trade_dates[start_date] += 1
                continue

            # Handle Sell
            if trade_type == "Sell":
                if quantity_data[-1]['date'] == start_date:
                    if ticker in quantity_data[-1]:
                        quantity_data[-1][ticker] -= quantity
                    else:
                        quantity_data[-1][ticker] = -quantity
                    quantity_data[-1]['cash'] += investment['price'] * quantity
                    trade_dates[start_date] += 1
                    continue
                temp = quantity_data[-1].copy()
                if ticker not in temp:
                    temp[ticker] = 0
                temp[ticker] -= quantity
                temp['date'] = start_date
                temp['cash'] += investment['price'] * quantity
                quantity_data.append(temp)
                trade_dates[start_date] += 1
                continue

        # Sort trade dates in ascending order
        trade_dates = dict(sorted(trade_dates.items(), key=lambda x: datetime.strptime(x[0], '%Y-%m-%d')))
        transactions = len(quantity_data)

        # Iterate over each investment in quantity_data
        for idx, investment in enumerate(quantity_data):
            tickers = list(investment.keys() - {'date', 'cash', 'investment'})
            start_date = investment['date']
            if idx + 1 < transactions:
                end_date = quantity_data[idx+1]['date']
            else:
                end_date = datetime.now().strftime('%Y-%m-%d')

            # Build the SQL query to retrieve stock prices for all tickers within the date range
            sql_parts = []
            for ticker in tickers:
                sql_parts.append(f"""
                    SELECT '{ticker}' AS ticker, Date, `Adj Close`
                    FROM `{ticker}`
                    WHERE Date BETWEEN :start_date AND :end_date
                """)
            sql = sqlalchemy.text(" UNION ALL ".join(sql_parts))

            with pool.connect() as conn:
                result = conn.execute(sql, {"start_date": start_date, "end_date": end_date})

            # Calculate equity for each date
            equity_data = {}
            for row in result:
                ticker = row[0]
                date = row[1].strftime('%Y-%m-%d')
                equity = round(float(row[2]) * investment[ticker], 3)

                if date not in equity_data:
                    equity_data[date] = {
                        "Date": date,
                        "equity": equity,
                        "Return": 0,
                        "cash": investment['cash'],
                        "investment": investment['investment']
                    }
                else:
                    equity_data[date]['equity'] += equity
                    equity_data[date]['Return'] = 0
            data.extend(list(equity_data.values()))
        # Calculate daily returns
        for i, d in enumerate(data):
            if i == 0:
                continue
            prev_d = data[i-1]
            if d['Date'] not in trade_dates:
                d['Return'] = calculate_return_percentage(d['equity'], prev_d['equity'])


        # Initialize dictionaries for weekly, monthly, and yearly returns
        weekly_returns = {}
        monthly_returns = {}
        quarterly_returns = {}
        yearly_returns = {}

        # Helper function to find the first and last data point in a given date range
        def find_first_last_in_range(start_date, end_date):
            start_point = next((x for x in data if datetime.strptime(x['Date'], '%Y-%m-%d') >= start_date), None)
            end_point = next((x for x in reversed(data) if datetime.strptime(x['Date'], '%Y-%m-%d') <= end_date), None)
            # Adjust end_point if the exact date is not available
            if not end_point and data:
                closest_end_date = min((datetime.strptime(x['Date'], '%Y-%m-%d') for x in data if datetime.strptime(x['Date'], '%Y-%m-%d') > end_date), default=None)
                end_point = next((x for x in data if datetime.strptime(x['Date'], '%Y-%m-%d') == closest_end_date), None)
            return start_point, end_point

        # Calculate returns for each week
        current_date = datetime.strptime(data[0]['Date'], '%Y-%m-%d')
        while current_date <= datetime.strptime(data[-1]['Date'], '%Y-%m-%d'):
            start_date = current_date
            end_date = start_date + timedelta(days=6)
            start_point, end_point = find_first_last_in_range(start_date, end_date)
            if start_point and end_point:
                weekly_returns[end_date.strftime('%Y-%m-%d')] = calculate_return_percentage(end_point['equity'], start_point['equity'])
            current_date += timedelta(days=7)

        # Calculate returns for each month
        current_date = datetime.strptime(data[0]['Date'], '%Y-%m-%d')
        while current_date <= datetime.strptime(data[-1]['Date'], '%Y-%m-%d'):
            start_date = current_date
            end_date = (start_date.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
            start_point, end_point = find_first_last_in_range(start_date, end_date)
            if start_point and end_point:
                monthly_returns[end_date.strftime('%Y-%m-%d')] = calculate_return_percentage(end_point['equity'], start_point['equity'])
            current_date = (start_date.replace(day=28) + timedelta(days=4)).replace(day=1)

        # Calculate returns for each quarter
        current_date = datetime.strptime(data[0]['Date'], '%Y-%m-%d')
        while current_date <= datetime.strptime(data[-1]['Date'], '%Y-%m-%d'):
            start_date = current_date
            end_date = (start_date + relativedelta(months=3, days=-1)).replace(day=1)
            start_point, end_point = find_first_last_in_range(start_date, end_date)
            if start_point and end_point:
                quarterly_returns[end_date.strftime('%Y-%m-%d')] = calculate_return_percentage(end_point['equity'], start_point['equity'])
            current_date = (start_date + relativedelta(months=3, days=-1)).replace(day=1)
        
        # Calculate returns for each year
        current_date = datetime.strptime(data[0]['Date'], '%Y-%m-%d')
        while current_date <= datetime.strptime(data[-1]['Date'], '%Y-%m-%d'):
            start_date = current_date
            end_date = start_date.replace(year=start_date.year + 1) - timedelta(days=1)
            start_point, end_point = find_first_last_in_range(start_date, end_date)
            if start_point and end_point:
                yearly_returns[end_date.strftime('%Y-%m-%d')] = calculate_return_percentage(end_point['equity'], start_point['equity'])
            current_date = start_date.replace(year=start_date.year + 1)

        # Return the portfolio equity data along with weekly, monthly, and yearly returns
        return {
            'equity_data': data,
            'weekly_returns': weekly_returns,
            'monthly_returns': monthly_returns,
            'quarterly_returns': quarterly_returns,
            'yearly_returns': yearly_returns
        }

    except Exception as e:
        print(f"Error in get_portfolio_equity: {str(e)}")
        raise
