from flask import Flask, jsonify, request
import sqlalchemy
from google.cloud.sql.connector import Connector
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# '/app/credentials.json'
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'application_default_credentials.json'

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
        column_names = result.keys()
        data = []
        for row in result:
            row_data = {}
            for i, column in enumerate(column_names):
                if column == 'Date':
                    row_data[column] = row[i].strftime('%Y-%m-%d')
                else:
                    row_data[column] = float(row[i])
            data.append(row_data)

    return jsonify(data)

if __name__ == '__main__':
    app.run()