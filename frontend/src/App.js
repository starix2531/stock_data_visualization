import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import './App.css';
import stock3 from './assets/stock_3.jpeg';
import stock4 from './assets/stock_4.jpg';
import stockMarket from './assets/stock-market.jpg';
import stockPrices from './assets/stock-prices.jpg';
import Dashboard from './Dashboard';

const { Sider, Content } = Layout;

const pageItems = [
  {
    key: '/dashboard',
    //icon: <Icon EditOutlined />,
    label: 'Visualization Board',
  },
  {
    key: '/ranking',
    //icon: <Icon DiffsOutlined />,
    label: 'Stock Ranking',
  },
];

const App = () => {
  const navigate = useNavigate();
  const onMenuClick = (route) => {
    console.log('click');
    const path = route.key;
    navigate(path);
  };

  return (
    <Layout>
      <Sider width={200} style={{ background: '#fff' }}>
        <Menu
          mode="inline"
          onClick={onMenuClick}
          style={{ height: '100%', borderRight: 0 }}
          items={pageItems}
        />
      </Sider>
      <Layout>
        <Content style={{ padding: '24px' }}>
            <header>
              <h1>InvestorData</h1>
              <h2>Functions</h2>
              <ul>
                <li> <Link to="#">LOGIN</Link></li>
                <li><Link to="#">FORUM</Link></li>
              </ul>
            </header>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Add more routes for other pages */}
            </Routes>
            <main>
              <ul>
                <li>
                  <Link to="/dashboard">
                    <img src={stock3} alt="Comparison Board" /> COMPARISON BOARD
                  </Link>
                </li>
                <li>
                  <Link to="#">
                    <img src={stock4} alt="Stock Price Trend" /> Stock Price Trend
                  </Link>
                </li>
                <li>
                  <Link to="#">
                    <img src={stockMarket} alt="Company Financial Information" /> Company Financial Information
                  </Link>
                </li>
                <li>
                  <Link to="#">
                    <img src={stockPrices} alt="Portfolio Backtesting" /> Portfolio Backtesting
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
            <footer>
              <p>Footer content goes here</p>
            </footer>
          </Content>
        </Layout>
      </Layout>
  );
};

const Home = () => {
  return (
    <div>
      <h1>Welcome to InvestorData</h1>
      {/* Add content for the home page */}
    </div>
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