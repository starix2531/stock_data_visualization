import React, { useState, useEffect, useContext } from "react";
import { Autocomplete, TextField, Chip } from '@mui/material';
import LineChart from "./Plots/LineChart";
import DebtEquityScatterPlot from "./Plots/DebtEquityScatterPlot";
import EPSBarChart from "./Plots/EPSBarChart";
import SpotPlot from "./Plots/SpotPlot";
import DebtRatioBarChart from "./Plots/DebtRatioBarChart";
import { DataContext } from './DataContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

const Dashboard = () => {
  const [tickerOptions, setTickerOptions] = useState([]);
  const { data, setData, financialData, setFinancialData, tickers, setTickers } = useContext(DataContext);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [sortOrder, setSortOrder] = useState({
    ticker: 'asc',
    debt_ratio: 'asc',
    current_ratio: 'asc',
    return_on_equity: 'asc',
    market_cap: 'asc',
  });

  useEffect(() => {
    fetchTickerOptions();
  }, []);

  useEffect(() => {
    setDisplayedItems(Object.entries(financialData));
  }, [financialData]);

  const handleSort = (columnName) => {
    const isAscending = sortOrder[columnName] === 'asc';
    const sortedData = [...Object.entries(financialData)].sort((a, b) => {
      const itemA = a[1][columnName];
      const itemB = b[1][columnName];
      if (itemA === null || itemA === undefined) return 1;
      if (itemB === null || itemB === undefined) return -1;
      if (itemA === itemB) return 0;
      return isAscending ? itemA - itemB : itemB - itemA;
    });
    setDisplayedItems(sortedData);
    setSortOrder({ ...sortOrder, [columnName]: isAscending ? 'desc' : 'asc' });
  };

  const getSortIcon = (columnName) => {
    if (sortOrder[columnName] === 'asc') return faSortUp;
    if (sortOrder[columnName] === 'desc') return faSortDown;
    return faSort;
  };

  const fetchTickerOptions = async () => {
    try {
      const response = await fetch('https://fastapi-cloud-run-niayqkcaza-uw.a.run.app/api/tickers');
      if (!response.ok) {
        throw new Error('Error fetching ticker options');
      }
      const tickersData = await response.text();
      const options = tickersData
        .split(/\\n/)
        .map((ticker) => ticker.trim().replace(/^"|"$/g, '')) // Adjusted regex to remove leading and trailing quotes
        .filter((ticker) => ticker !== '');
      setTickerOptions(options);
    } catch (error) {
      console.error('Error fetching ticker options:', error);
    }
  };

  const fetchData = async () => {
    const promises = tickers.map(async (ticker) => {
      if (ticker) {
        const url = `https://fastapi-stock-price-info-niayqkcaza-uw.a.run.app/api/stock_data?ticker=${ticker}`;
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
        const url = `https://fastapi-stock-price-info-niayqkcaza-uw.a.run.app/api/financial_info?ticker=${result.ticker}`;
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
        limitTags={100}
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
    <button
      onClick={fetchData}
      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
    >
      Plot
    </button>
    <div className="mt-8">
      {data.length > 0 && Object.keys(financialData).length === data.length ? (
        <>
          <div v-slide-in className="mb-8 bg-white shadow rounded p-4">
            <LineChart data={data} />
          </div>
          <div v-slide-in className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white shadow rounded p-4">
              <DebtEquityScatterPlot data={data} financialData={financialData} />
            </div>
            <div className="bg-white shadow rounded p-4">
              <DebtRatioBarChart data={data} financialData={financialData} />
            </div>
            <div className="bg-white shadow rounded p-4">
              <EPSBarChart data={data} financialData={financialData} />
            </div>
            <div className="bg-white shadow rounded p-4">
              <SpotPlot data={data} financialData={financialData} />
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-200 shadow rounded p-4 h-48 flex items-center justify-center">
            <span>Loading chart...</span>
          </div>
          <div className="bg-gray-200 shadow rounded p-4 h-48 flex items-center justify-center">
            <span>Loading chart...</span>
          </div>
          <div className="bg-gray-200 shadow rounded p-4 h-48 flex items-center justify-center">
            <span>Loading chart...</span>
          </div>
          <div className="bg-gray-200 shadow rounded p-4 h-48 flex items-center justify-center">
            <span>Loading chart...</span>
          </div>
        </div>
      )}
    </div>
    <div className="container mx-auto px-4 py-8">
      <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-100 text-gray-600 uppercase text-xm leading-normal">
            <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSort('ticker')}>
              Ticker <FontAwesomeIcon icon={getSortIcon('ticker')} />
            </th>
            <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSort('debt_ratio')}>
              Debt Ratio <FontAwesomeIcon icon={getSortIcon('debt_ratio')} />
            </th>
            <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSort('current_ratio')}>
              Current Ratio <FontAwesomeIcon icon={getSortIcon('current_ratio')} />
            </th>
            <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSort('return_on_equity')}>
              Return on Equity <FontAwesomeIcon icon={getSortIcon('return_on_equity')} />
            </th>
            <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSort('market_cap')}>
              Market Cap <FontAwesomeIcon icon={getSortIcon('market_cap')} />
            </th>
            <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSort('market_cap')}>
              Beta <FontAwesomeIcon icon={getSortIcon('beta')} />
            </th>
            <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSort('market_cap')}>
              Forward PE <FontAwesomeIcon icon={getSortIcon('forward_pe')} />
            </th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-xm">
          {displayedItems.map(([ticker, item]) => (
            <tr key={ticker} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-2 px-4">{ticker}</td>
              <td className="py-2 px-4">{item.debt_ratio != null ? item.debt_ratio.toFixed(2) : 'N/A'}</td>
              <td className="py-2 px-4">{item.current_ratio != null ? item.current_ratio.toFixed(2) : 'N/A'}</td>
              <td className="py-2 px-4">{item.return_on_equity != null ? item.return_on_equity.toFixed(5) : 'N/A'}</td>
              <td className="py-2 px-4">{item.market_cap != null ? item.market_cap.toLocaleString() : 'N/A'}</td>
              <td className="py-2 px-4">{item.beta != null ? item.beta.toFixed(2) : 'N/A'}</td>
              <td className="py-2 px-4">{item.forward_pe != null ? item.forward_pe.toFixed(2) : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  
  );
};

export default Dashboard;
