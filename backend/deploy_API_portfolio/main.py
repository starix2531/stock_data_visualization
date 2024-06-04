from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlalchemy
from google.cloud.sql.connector import Connector
import os
from firebase_admin import credentials, firestore, initialize_app
from datetime import datetime, timedelta, date
from collections import defaultdict
import json
import numpy as np
from scipy.optimize import minimize
import requests
from urllib.parse import unquote

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

@app.get('/api/portfolio_fronties')
def get_portfolio_equity(portfolio_weight_1: str = Query(...), portfolio_weight_2: str = Query(...), future_time: str = Query(...), user_id = Query(...), type1: str = Query(...), type2: str = Query(...)):
    future_time = unquote(future_time)
    try:
        if type1 == "false":
            api_url = f"https://fastapi-portfolio-weight-niayqkcaza-uw.a.run.app/api/portfolio_weight?user_id={user_id}&portfolio_id={portfolio_weight_1}"
            response = requests.get(api_url)
            data_1 = response.json()
            data_1 = data_1['portfolio_weight']
        else:
            data_1 = [{
                "ticker": portfolio_weight_1,
                "current_weight": 1 
            }]
        if type2 == "false":
            api_url = f"https://fastapi-portfolio-weight-niayqkcaza-uw.a.run.app/api/portfolio_weight?user_id={user_id}&portfolio_id={portfolio_weight_2}"
            response = requests.get(api_url)
            data_2 = response.json()
            data_2 = data_2['portfolio_weight']
        else:
            data_2 = [{
                "ticker": portfolio_weight_2,
                "current_weight": 1
            }]
        
        if not isinstance(data_1, list) or not isinstance(data_2, list):
            raise HTTPException(status_code=400, detail="Portfolio weights must be provided as a list.")
        
        for weight in data_1 + data_2:
            if not isinstance(weight, dict) or 'ticker' not in weight:
                raise HTTPException(status_code=400, detail="Each portfolio weight must be a dictionary with a 'ticker' key.")
        
        def get_portfolio_data(portfolio_weight, future_time):
            start_time = date.today()
            if future_time == "1 Day":
                start_time -= timedelta(days=60)
            elif future_time == "1 Week":
                start_time -= timedelta(days=180)
            elif future_time == "1 Month":
                start_time -= timedelta(days=365)
            elif future_time == "3 Months":
                start_time -= timedelta(days=365 * 2)
            elif future_time == "6 Months":
                start_time -= timedelta(days=365 * 3)
            portfolio_prices = []
            with pool.connect() as conn:
                for stock in portfolio_weight:
                    ticker = stock['ticker']
                    weight = stock['current_weight']
                    sql = sqlalchemy.text(f"""
                        SELECT Date, `Adj Close` * :weight AS weighted_price
                        FROM {ticker}
                        WHERE Date >= :start_date
                    """)
                    result = conn.execute(sql, {"weight": weight, "start_date": start_time})
                    prices = result.fetchall()
                    if not prices:
                        print(f"No data found for {ticker}. Skipping...")
                        continue
                    portfolio_prices.append(prices)

            if not portfolio_prices:
                print("No data found for any stocks in the portfolio. Returning empty array.")
                return np.array([])

            # Combine the weighted prices of all stocks by date
            combined_prices = defaultdict(float)
            for prices in portfolio_prices:
                for da, price in prices:
                    combined_prices[da] += price
            # Calculate the portfolio's return
            sorted_prices = sorted(combined_prices.items())
            portfolio_values = [price for _, price in sorted_prices]
            portfolio_returns = np.diff(portfolio_values) / portfolio_values[:-1]

            return portfolio_returns[1:]
        
        def portfolio_stats(weights, mean_returns, cov_matrix):
            returns = np.sum(mean_returns * weights) * 252
            std = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights))) * np.sqrt(252)
            return returns, std

        def minimize_variance(mean_returns, cov_matrix, target_return):
            num_assets = len(mean_returns)
            args = (mean_returns, cov_matrix)
            constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1},
                        {'type': 'eq', 'fun': lambda x: np.sum(x * mean_returns) - target_return})
            bounds = tuple((0, 1) for _ in range(num_assets))
            result = minimize(portfolio_variance, num_assets * [1. / num_assets], args=args, bounds=bounds, constraints=constraints)
            return result.x

        def portfolio_variance(weights, mean_returns, cov_matrix):
            return np.dot(weights.T, np.dot(cov_matrix, weights))

        def plot_efficient_frontier(mean_returns, cov_matrix, num_portfolios=150):
            returns_range = np.linspace(mean_returns.min(), mean_returns.max(), num_portfolios)
            risks = []
            returns = []
            sharpe_ratios = []
            weights_list = []
            for ret in returns_range:
                weights = minimize_variance(mean_returns, cov_matrix, ret)
                portf_return, portf_risk = portfolio_stats(weights, mean_returns, cov_matrix)
                risks.append(portf_risk)
                returns.append(portf_return)
                sharpe_ratios.append(portf_return / portf_risk)
                weights_list.append(weights.tolist())
            # Find the portfolio with the highest Sharpe ratio
            max_sharpe_idx = np.argmax(sharpe_ratios)
            max_sharpe_weights = weights_list[max_sharpe_idx]
            print("got the x and y values",risks)
            return {
                'x': risks,
                'y': returns,
                'weights': weights_list,
                'sharpe_ratios': sharpe_ratios,
                'max_sharpe_weights': max_sharpe_weights,
                'max_sharpe_return': sharpe_ratios[max_sharpe_idx],
            }
        
        portfolio1_returns = get_portfolio_data(data_1, future_time)
        portfolio2_returns = get_portfolio_data(data_2, future_time)
        if len(portfolio1_returns) == 0 or len(portfolio2_returns) == 0:
            raise HTTPException(status_code=400, detail="Insufficient data to calculate portfolio returns.")

        mean_returns = np.array([portfolio1_returns.mean(), portfolio2_returns.mean()])
        cov_matrix = np.cov(np.vstack((portfolio1_returns, portfolio2_returns)))
        print(mean_returns, cov_matrix)

        result = plot_efficient_frontier(mean_returns, cov_matrix)
        
        return {
            "x": result["x"],
            "y": result["y"],
            "weights_1": [w[0] for w in result["weights"]],
            "weights_2": [w[1] for w in result["weights"]],
            "max_sharpe_return": result["max_sharpe_return"],
            "sharpe_ratios": result["sharpe_ratios"],
            "tangent_weights": result["max_sharpe_weights"]
        }
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format for portfolio weights.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))