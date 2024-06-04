from fastapi import FastAPI, Query
import sqlalchemy
from google.cloud.sql.connector import Connector
from fastapi.middleware.cors import CORSMiddleware
import os
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

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

@app.get('/api/stock_data')
def get_stock_data(ticker: str = Query(...)):
    
    with pool.connect() as conn:
        sql = sqlalchemy.text(f"""
            SELECT Date, Open, High, Low, Close, `Adj Close`, Volume,
            CASE
                WHEN LAG(`Adj Close`, 1) OVER (ORDER BY Date) IS NULL THEN NULL
                ELSE 100 * (`Adj Close` - LAG(`Adj Close`, 1) OVER (ORDER BY Date)) / LAG(`Adj Close`, 1) OVER (ORDER BY Date)
            END AS `Return`
            FROM `{ticker}`
        """)
        result = conn.execute(sql)
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

@app.get('/api/stock_price')
def get_stock_data(ticker: str = Query(...), date: str = Query(...)):
    with pool.connect() as conn:
        sql = sqlalchemy.text(f"""
            SELECT `Adj Close`
            FROM `{ticker}`
            WHERE `Date` = :date
        """)
        result = conn.execute(sql, {"date": date}).fetchone()
        if result is not None:
            return result[0]
        else:
            return None


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