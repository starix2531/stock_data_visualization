import React from 'react';
import stock3 from './assets/stock_3.jpeg';
import stock4 from './assets/stock_4.jpg';
import stockMarket from './assets/stock-market.jpg';
import stockPrices from './assets/stock-prices.jpg';

const App = () => {
  return (
    <div>
      <header>
        <h1>InvestorData</h1>
        <h2>Functions</h2>
        <ul>
          <li><a href="#">LOGIN</a></li>
          <li><a href="#">FORUM</a></li>
        </ul>
      </header>
      <main>
        <ul>
          <li><a href="#"><img src={stock3} alt="Comparison Board" /> COMPARISON BOARD</a></li>
          <li><a href="#"><img src={stock4} alt="Stock Price Trend" /> Stock Price Trend</a></li>
          <li><a href="#"><img src={stockMarket} alt="Company Financial Information" /> Company Financial Information</a></li>
          <li><a href="#"><img src={stockPrices} alt="Portfolio Backtesting" /> Portfolio Backtesting</a></li>
        </ul>
        <section>
          <h2>Explore the dynamic world of finance and investment</h2>
          <p>Dive into the list of top-performing companies. Analyse key financial metrics across different firms. Discuss the latest trends and insights with fellow enthusiasts.</p>
          <button>EXPLORE</button>
          <button>COMPARE</button>
          <button>VISIT FORUM</button>
        </section>
      </main>
      <footer>
        <p>Footer content goes here</p>
      </footer>
    </div>
  );
};

export default App;