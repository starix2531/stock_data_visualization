import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import './App.css';
import stock3 from './assets/stock_3.jpeg';
import stock4 from './assets/stock_4.jpg';
import stockMarket from './assets/stock-market.jpg';
import stockPrices from './assets/stock-prices.jpg';
import Dashboard from './Dashboard';
import StockRanking from './StockRanking';

const { Sider, Content } = Layout;

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const onMenuClick = (route) => {
    navigate(route.key);
  };

  return (
    <Layout>
      <Sider width={200} style={{ background: '#fff' }}>
        <Menu
          mode="inline"
          onClick={onMenuClick}
          selectedKeys={[location.pathname]}
          style={{ height: '100%', borderRight: 0 }}
        >
          <Menu.Item key="/">Home</Menu.Item>
          <Menu.Item key="/dashboard">Visualization Board</Menu.Item>
          <Menu.Item key="/ranking">Stock Ranking</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content style={{ padding: '24px' }}>
          {location.pathname === '/' && (
            <>
              <header>
                <h1>InvestorData</h1>
                <h2>Functions</h2>
                <ul>
                  <li>
                    <Link to="/login">LOGIN</Link>
                  </li>
                  <li>
                    <Link to="/forum">FORUM</Link>
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
                    <Link to="/stock-trend">
                      <img src={stock4} alt="Stock Price Trend" />
                      Stock Price Trend
                    </Link>
                  </li>
                  <li>
                    <Link to="/financial-info">
                      <img src={stockMarket} alt="Company Financial Information" />
                      Company Financial Information
                    </Link>
                  </li>
                  <li>
                    <Link to="/backtesting">
                      <img src={stockPrices} alt="Portfolio Backtesting" />
                      Portfolio Backtesting
                    </Link>
                  </li>
                </ul>
                <section>
                  <h2>Explore the dynamic world of finance and investment</h2>
                  <p>
                    Dive into the list of top-performing companies. Analyse key
                    financial metrics across different firms. Discuss the latest
                    trends and insights with fellow enthusiasts.
                  </p>
                  <button>EXPLORE</button>
                  <button>COMPARE</button>
                  <button>VISIT FORUM</button>
                </section>
              </main>
            </>
          )}
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ranking" element={<StockRanking />} />
          </Routes>
          <Footer />
        </Content>
      </Layout>
    </Layout>
  );
};

const Footer = () => {
  return (
    <footer>
      <p>Footer content goes here</p>
    </footer>
  );
};

const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default AppWrapper;