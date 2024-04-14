from flask import Flask, jsonify, request
import sqlalchemy
from google.cloud.sql.connector import Connector
import os

app = Flask(__name__)

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/path/to/your/credentials.json'

def getconn() -> sqlalchemy.engine.Connection:
    connector = Connector()
    conn = connector.connect(
        "your-instance-connection-name",
        "pymysql",
        user="your-username",
        password="your-password",
        db="your-database-name"
    )
    return conn

pool = sqlalchemy.create_engine(
    "mysql+pymysql://",
    creator=getconn,
)

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