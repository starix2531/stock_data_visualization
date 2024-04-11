import os
import pandas as pd
import yfinance as yf
import pymysql
import sqlalchemy
from google.cloud.sql.connector import Connector
# https://cloud.google.com/sdk/docs/install GCL installations
# get credentials for type: gcloud auth application-default login
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/Users/chenghaosun/.config/gcloud/application_default_credentials.json'
connector = Connector() 
def getconn() -> pymysql.connections.Connection:
    conn: pymysql.connections.Connection = connector.connect(
        "avid-booster-386403:us-west1:stats418stock",
        "pymysql",
        user='starix',
        password='**##418project',
        db='stock_test'
    )
    return conn

def create_table_if_not_exists(engine, ticker):
    with engine.connect() as conn:  
            create_table_sql = sqlalchemy.text(f"""
                    CREATE TABLE IF NOT EXISTS `{ticker}` (
                        Date DATE,
                        Open FLOAT,
                        High FLOAT,
                        Low FLOAT,
                        Close FLOAT,
                        `Adj Close` FLOAT,
                        Volume FLOAT
                    )
                """)
            conn.execute(create_table_sql) 

pool = sqlalchemy.create_engine(
    "mysql+pymysql://",
    creator=getconn,
)

def get_sp500_data():
    # Get S&P 500 ticker symbols
    try:  
        sp500_tickers = pd.read_html('https://en.wikipedia.org/wiki/List_of_S%26P_500_companies')[0]['Symbol'].to_list()
    except Exception as e: 
        print(f"Error getting ticker symbols: {e}") 
        return None  # Return None on error


    for ticker in sp500_tickers:
        try:
            data = yf.download(ticker, group_by="Ticker", period='5y')

        except Exception as e: 
            print(f"Error fetching data for {ticker}: {e}") 
        
        #create table if not exists
        create_table_if_not_exists(pool, ticker)
        
        with pool.connect() as conn:  
            create_table_if_not_exists(pool, ticker)
            
            data.to_sql(ticker, con=conn, if_exists='append', index=True, index_label='Date')
            conn.commit()

    return 

# Test the function 

if __name__ == '__main__':
    sp500_data = get_sp500_data()
