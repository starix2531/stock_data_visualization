// Dashboard.js
import React, { useState, useEffect } from "react";
import { Autocomplete, TextField, Chip } from '@mui/material';
import LineChart from "./Plots/LineChart";
import DebtEquityScatterPlot from "./Plots/DebtEquityScatterPlot";
import EPSBarChart from "./Plots/EPSBarChart";
import SpotPlot from "./Plots/SpotPlot";
import DebtRatioBarChart from "./Plots/DebtRatioBarChart";

const Dashboard = () => {
  const [tickerOptions, setTickerOptions] = useState([]);
  const [data, setData] = useState([]);
  const [tickers, setTickers] = useState(["AAPL", "GOOGL", "MSFT"]);
  const [financialData, setFinancialData] = useState({});

  useEffect(() => {
    fetchTickerOptions();
  }, []);

  const fetchTickerOptions = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/tickers');
      if (!response.ok) {
        throw new Error('Error fetching ticker options');
      }
      const tickersData = await response.text();
      const options = tickersData
        .split(/\\n/)
        .map((ticker) => ticker.trim().replace(/^"(.*)"$/, '$1'))
        .filter((ticker) => ticker !== '');
      setTickerOptions(options);
    } catch (error) {
      console.error('Error fetching ticker options:', error);
    }
  };

  const fetchData = async () => {
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    const promises = tickers.map(async (ticker) => {
      if (ticker) {
        const url = `http://127.0.0.1:8000/api/stock_data?ticker=${ticker}&start_date=${startDate}&end_date=${endDate}`;
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
        const url = `http://127.0.0.1:8000/api/financial_info?ticker=${result.ticker}`;
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

  const handleTickerSelect = (event, value) => {
    setTickers(value);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Stock Price Visualization</h1>
      <div className="mb-4">
        <Autocomplete
          multiple
          value={tickers}
          limitTags={5}
          options={tickerOptions}
          getOptionLabel={(option) => option}
          renderInput={(params) => <TextField {...params} label="Search Tickers" />}
          onChange={handleTickerSelect}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip key={index} label={option} {...getTagProps({ index })} />
            ))
          }
        />
      </div>
      <div className="flex mb-4">
        <div className="mr-4">
          <label htmlFor="startDate" className="block font-bold mb-1">Start Date:</label>
          <input type="date" id="startDate" className="border border-gray-300 rounded px-2 py-1" />
        </div>
        <div>
          <label htmlFor="endDate" className="block font-bold mb-1">End Date:</label>
          <input type="date" id="endDate" className="border border-gray-300 rounded px-2 py-1" />
        </div>
      </div>
      <button
        onClick={fetchData}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Fetch Data
      </button>
      {data.length > 0 && Object.keys(financialData).length === data.length && (
        <div className="mt-8">
          <div v-slide-in className="mb-8 bg-white shadow rounded p-4">
            <LineChart data={data} />
          </div>
          <div v-slide-in className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white shadow rounded p-4">
              <DebtEquityScatterPlot data={data} financialData={financialData} />
            </div>
            <div className="bg-gray-100 shadow rounded p-4">
              <EPSBarChart data={data} financialData={financialData} />
            </div>
            <div className="bg-white shadow rounded p-4">
              <SpotPlot data={data} financialData={financialData} />
            </div>
            <div className="bg-gray-100 shadow rounded p-4">
              <DebtRatioBarChart data={data} financialData={financialData} />
            </div>
          </div>
        </div>
      )}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((result) => (
          <div key={result.ticker} className="bg-white shadow rounded p-4 border-2 border-blue-500">
            <h3 className="text-xl font-bold mb-2">{result.ticker}</h3>
            {financialData[result.ticker] ? (
              <div>
                <p className="mb-1">Market Cap: {financialData[result.ticker].market_cap}</p>
                <p className="mb-1">P/E Ratio: {financialData[result.ticker].price_to_earnings_ratio}</p>
                <p className="mb-1">P/B Ratio: {financialData[result.ticker].price_to_book_ratio}</p>
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