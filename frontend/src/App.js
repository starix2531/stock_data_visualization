import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import stock3 from './assets/stock_3.jpeg';
import stock4 from './assets/stock_4.jpg';
import stockMarket from './assets/stock-market.jpg';
import stockPrices from './assets/stock-prices.jpg';
import Dashboard from './Dashboard';

const App = () => {
  return (
    <Router>
      <div>
        <header>
          <h1>InvestorData</h1>
          <h2>Functions</h2>
          <ul>
            <li>
              <Link to="#">LOGIN</Link>
            </li>
            <li>
              <Link to="#">FORUM</Link>
            </li>
          </ul>
        </header>
        <main>
          <ul>
            <li>
              <Link to="/dashboard">
                <img src={stock3} alt="Comparison Board" />
                COMPARISON BOARD
              </Link>
            </li>
            <li>
              <Link to="#">
                <img src={stock4} alt="Stock Price Trend" />
                Stock Price Trend
              </Link>
            </li>
            <li>
              <Link to="#">
                <img src={stockMarket} alt="Company Financial Information" />
                Company Financial Information
              </Link>
            </li>
            <li>
              <Link to="#">
                <img src={stockPrices} alt="Portfolio Backtesting" />
                Portfolio Backtesting
              </Link>
            </li>
          </ul>
          <section>
            <h2>Explore the dynamic world of finance and investment</h2>
            <p>
              Dive into the list of top-performing companies. Analyse key financial metrics across different firms.
              Discuss the latest trends and insights with fellow enthusiasts.
            </p>
            <button>EXPLORE</button>
            <button>COMPARE</button>
            <button>VISIT FORUM</button>
          </section>
        </main>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <footer>
          <p>Footer content goes here</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;