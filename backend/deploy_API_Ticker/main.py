# This file is used to deploy the API for getting stock tickers.
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Query
import os
import json

app = FastAPI()
# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get('/api/tickers')
def get_tickers():
    try:
        with open('tickers.txt', 'r') as file:
            tickers = file.read()
        return tickers
    except FileNotFoundError:
        return {'error': 'Ticker file not found'}