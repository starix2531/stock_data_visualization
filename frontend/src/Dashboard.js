// Dashboard.js
import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { Autocomplete, TextField, Chip } from '@mui/material';
import LineChart from "./LineChart";
import DebtEquityScatterPlot from "./DebtEquityScatterPlot";
import EPSBarChart from "./EPSBarChart";

const Dashboard = () => {
  const [tickerOptions, setTickerOptions] = useState([]);
  const [data, setData] = useState([]);
  const [tickers, setTickers] = useState(["AAPL", "GOOGL", "MSFT", "", ""]);
  const [financialData, setFinancialData] = useState({});
  const [selectedTickers, setSelectedTickers] = useState([]);

  useEffect(() => {
    fetchTickerOptions();
  }, []);

  const fetchTickerOptions = async () => {
    try {
      const tickersData = await fetch('assets/tickers.txt').then(response => response.text());
      const options = tickersData.split('\n').map((ticker) => ticker.trim());
      setTickerOptions(options);
      console.log('Ticker options:', tickersData);
    } catch (error) {
      console.error('Error fetching ticker options:', error);
    }
  };

  const fetchData = async () => {
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    const promises = tickers.map(async (ticker) => {
      if (ticker) {
        const url = `http://127.0.0.1:5000/api/stock_data?ticker=${ticker}&start_date=${startDate}&end_date=${endDate}`;
        const response = await fetch(url);
        const jsonData = await response.json();
        return { ticker, data: jsonData };
      }
      return null;
    });

    try {
      const results = await Promise.all(promises);
      const filteredResults = results.filter((result) => result !== null);
      setData(filteredResults);

      const financialDataPromises = filteredResults.map(async (result) => {
        const url = `http://127.0.0.1:5000/api/financial_info?ticker=${result.ticker}`;
        const response = await fetch(url);
        const jsonData = await response.json();
        return { ticker: result.ticker, data: jsonData };
      });

      const financialDataResults = await Promise.all(financialDataPromises);
      const financialDataMap = financialDataResults.reduce((acc, result) => {
        acc[result.ticker] = result.data;
        return acc;
      }, {});
      setFinancialData(financialDataMap);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleTickerChange = (index, value) => {
    const newTickers = [...tickers];
    newTickers[index] = value;
    setTickers(newTickers);
  };

  const handleTickerSelect = (event, value) => {
    setSelectedTickers(value);
  };

  return (
    <div className="dashboard">
      <h1>Stock Price Visualization</h1>
      <div className="search-bar">
        <Autocomplete
          multiple
          value={selectedTickers}
          options={tickerOptions}
          getOptionLabel={(option) => option}
          renderInput={(params) => <TextField {...params} label="Search Tickers" />}
          onChange={(event, value) => handleTickerSelect(event, value)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip key={index} label={option} {...getTagProps({ index })} />
            ))
          }
        />
      </div>
      <div className="input-container">
        {tickers.map((ticker, index) => (
          <div key={index} className="ticker-input">
            <label htmlFor={`ticker-${index}`}>Ticker {index + 1}:</label>
            <Autocomplete
              id={`ticker-${index}`}
              value={ticker}
              options={tickerOptions}
              getOptionLabel={(option) => option}
              renderInput={(params) => <TextField {...params} label={`Ticker ${index + 1}`} />}
              onChange={(event, value) => handleTickerChange(index, value)}
            />
          </div>
        ))}
      </div>
      <div className="date-input-container">
        <div className="date-input">
          <label htmlFor="startDate">Start Date:</label>
          <input type="date" id="startDate" />
        </div>
        <div className="date-input">
          <label htmlFor="endDate">End Date:</label>
          <input type="date" id="endDate" />
        </div>
      </div>
      <button onClick={fetchData}>Fetch Data</button>
      {data.length > 0 && Object.keys(financialData).length === data.length && (
        <>
          <LineChart data={data} />
          <DebtEquityScatterPlot data={data} financialData={financialData} />
          <EPSBarChart data={data} financialData={financialData} />
        </>
      )}
      <div className="financial-info-container">
        {data.map((result) => (
          <div key={result.ticker} className="financial-info">
            <h3>{result.ticker}</h3>
            {financialData[result.ticker] ? (
              <div>
                <p>Market Cap: {financialData[result.ticker].market_cap}</p>
                <p>P/E Ratio: {financialData[result.ticker].price_to_earnings_ratio}</p>
                <p>P/B Ratio: {financialData[result.ticker].price_to_book_ratio}</p>
                <p>EPS: {financialData[result.ticker].earnings_per_share}</p>
              </div>
            ) : (
              <p>Loading financial data...</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;