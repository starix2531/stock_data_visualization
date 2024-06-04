from fastapi import FastAPI, Query
import sqlalchemy
from google.cloud.sql.connector import Connector
import os
from firebase_admin import credentials, firestore, initialize_app
from datetime import datetime, timedelta
from collections import defaultdict
import json

app = FastAPI()

# Initialize Firebase app
cred = credentials.Certificate("stock-firebase-v1-firebase-adminsdk-phrfc-5e8cf0a852.json")
firebase_app = initialize_app(cred)
db = firestore.client()


os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = "/Users/chenghaosun/.config/gcloud/application_default_credentials.json"

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
        end_date = "2024-04-01"  # Replace with the desired end date

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
                end_date = "2024-04-01"

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

            data.extend(list(equity_data.values()))

        # Calculate daily returns
        for i, d in enumerate(data):
            if i == 0:
                continue
            prev_d = data[i-1]
            if d['Date'] not in trade_dates:
                d['Return'] = round((d['equity'] - prev_d['equity']) / prev_d['equity'] * 100, 3)

        # Return the portfolio equity data
        return {'equity_data': data}

    except Exception as e:
        print(f"Error in get_portfolio_equity: {str(e)}")
        raise

@app.get('/api/portfolio_weight')
def get_portfolio_weight(user_id: str = Query(...), portfolio_id: str = Query(...)):
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

        # Initialize an empty dictionary to store the portfolio weight data
        quantity_data = {}
        end_date = "2024-04-01"  # datetime.now().strftime('%Y-%m-%d')

        # Iterate over each investment in the portfolio
        for idx, investment in enumerate(investments):
            ticker = investment['ticker']
            quantity = investment['quantity']
            start_date = investment['tradeDate']
            trade_type = investment['tradeType']

            # Handle Buy
            if trade_type == "Buy":
                if ticker not in quantity_data:
                    quantity_data[ticker] = 0
                quantity_data[ticker] += quantity
                continue

            # Handle Sell
            if trade_type == "Sell":
                if ticker not in quantity_data:
                    quantity_data[ticker] = 0
                quantity_data[ticker] -= quantity
                continue

        tickers = list(quantity_data.keys())
        sql_parts = []
        for ticker in tickers:
            sql_parts.append(f"""
                SELECT '{ticker}' AS ticker, 
                    Date,
                    `Adj Close`,
                    CASE
                        WHEN LAG(`Adj Close`, 1) OVER (ORDER BY Date) IS NULL THEN NULL
                        ELSE 100 * (`Adj Close` - LAG(`Adj Close`, 1) OVER (ORDER BY Date)) / LAG(`Adj Close`, 1) OVER (ORDER BY Date)
                    END AS `Return`
                FROM `{ticker}`
                WHERE Date <= :end_date
            """)
        sql = sqlalchemy.text(" UNION ALL ".join(sql_parts))
        
        with pool.connect() as conn:
            result = conn.execute(sql, {"end_date": end_date})

        equity_data = {}

        for row in result:
            ticker = row[0]
            quantity = quantity_data[ticker]
            equity = quantity * float(row[2])
            equity_data[ticker] = {
                "ticker": ticker,
                "current_equity": float(equity),
                "Last_return": float(row[3]) if row[3] else None,
            }
        total_equity = sum(equity_data[ticker]['current_equity'] for ticker in equity_data)
        for ticker in equity_data:
            equity_data[ticker]['current_weight'] = float(equity_data[ticker]['current_equity'] / total_equity)
        portfolio_weight_data = {'portfolio_weight': list(equity_data.values())}
        #print(total_equity)  # Print the JSON data

        return portfolio_weight_data

    except Exception as e:
        print(f"Error in get_portfolio_weight: {str(e)}")
        raise

@app.get('/api/stock_data')
def get_stock_data(ticker: str = Query(...), start_date: str = Query(...), end_date: str = Query(...)):
    with pool.connect() as conn:
        sql = sqlalchemy.text(f"""
            SELECT Date, Open, High, Low, Close, `Adj Close`, Volume
            FROM `{ticker}`
            WHERE Date BETWEEN :start_date AND :end_date
        """)
        result = conn.execute(sql, parameters={
            "start_date": start_date,
            "end_date": end_date
        })
        data = []
        for row in result:
            data.append({
                "Date": row[0].strftime('%Y-%m-%d'),
                "Open": float(row[1]),
                "High": float(row[2]),
                "Low": float(row[3]),
                "Close": float(row[4]),
                "Adj Close": float(row[5]),
                "Volume": float(row[6])
            })

    return data

@app.get('/api/financial_info')
def get_financial_info(ticker: str = Query(...)):
    with pool.connect() as conn:
        sql = sqlalchemy.text("""
            SELECT *
            FROM StockFinancialInfo
            WHERE ticker = :ticker
        """)
        result = conn.execute(sql, parameters={
            "ticker": ticker
        })
        row = result.fetchone()

        if row:
            financial_info = {
                "ticker": row[0],
                "debt_ratio": float(row[1]) if row[1] is not None else None,
                "current_ratio": float(row[2]) if row[2] is not None else None,
                "return_on_equity": float(row[3]) if row[3] is not None else None,
                "market_cap": float(row[4]) if row[4] is not None else None,
                "enterprise_value": float(row[5]) if row[5] is not None else None,
                "price_to_earnings_ratio": float(row[6]) if row[6] is not None else None,
                "price_to_book_ratio": float(row[7]) if row[7] is not None else None,
                "price_to_sales_ratio": float(row[8]) if row[8] is not None else None,
                "enterprise_value_to_revenue": float(row[9]) if row[9] is not None else None,
                "enterprise_value_to_ebitda": float(row[10]) if row[10] is not None else None,
                "book_value_per_share": float(row[11]) if row[11] is not None else None,
                "forward_pe": float(row[12]) if row[12] is not None else None,
                "peg_ratio": float(row[13]) if row[13] is not None else None,
                "beta": float(row[14]) if row[14] is not None else None,
                "total_debt_to_equity": float(row[15]) if row[15] is not None else None,
                "total_cash_to_debt": float(row[16]) if row[16] is not None else None,
                "revenue_per_share": float(row[17]) if row[17] is not None else None,
                "earnings_per_share": float(row[18]) if row[18] is not None else None
            }
        else:
            financial_info = None

    return financial_info

@app.get('/api/tickers')
def get_tickers():
    try:
        with open('tickers.txt', 'r') as file:
            tickers = file.read()
        return tickers
    except FileNotFoundError:
        return {'error': 'Ticker file not found'}
            
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))