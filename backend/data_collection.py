import os
from flask import Flask, jsonify, request
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

@app.route('/api/stock_data', methods=['GET'])
def get_stock_data():
    ticker = request.args.get('ticker')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

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
        data = result.fetchall()

    return jsonify(data)

if __name__ == '__main__':
    app.run()
