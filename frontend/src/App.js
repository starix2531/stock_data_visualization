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
      {/* Sidebar */}
      <Sider width={200} style={{ background: '#1f2937' }}>
        <div className="logo">InvestorData</div>
        <Menu
          theme="dark"
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

      {/* Main Content */}
      <Layout>
        <Content style={{ padding: '24px' }}>
          {location.pathname === '/' && (
            <>
              <header>
                <h1>Welcome to InvestorData</h1>
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
                {/* Main Content - Image Links */}
                <div className="image-links">
                  <div className="image-link">
                    <Link to="/dashboard">
                      <img src={stock3} alt="Comparison Board" />
                      <h3>COMPARISON BOARD</h3>
                      <p>Compare the performance of different stocks and analyze their trends.</p>
                    </Link>
                  </div>
                  <div className="image-link">
                    <Link to="/stock-trend">
                      <img src={stock4} alt="Stock Price Trend" />
                      <h3>STOCK PRICE TREND</h3>
                      <p>Visualize the historical price trends of individual stocks.</p>
                    </Link>
                  </div>
                  <div className="image-link">
                    <Link to="/financial-info">
                      <img src={stockMarket} alt="Company Financial Information" />
                      <h3>COMPANY FINANCIAL INFORMATION</h3>
                      <p>Access detailed financial information for various companies.</p>
                    </Link>
                  </div>
                </div>

                {/* Main Content - Explore Section */}
                <section className="explore-section">
                  <h2>Explore the Dynamic World of Finance and Investment</h2>
                  <p>
                    Dive into the list of top-performing companies. Analyze key financial metrics across different firms.
                    Discuss the latest trends and insights with fellow enthusiasts.
                  </p>
                  <div className="button-group">
                    <button>EXPLORE</button>
                    <button>COMPARE</button>
                    <button>VISIT FORUM</button>
                  </div>
                </section>
              </main>
            </>
          )}

          {/* Routes */}
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ranking" element={<StockRanking />} />
          </Routes>

          {/* Footer */}
          <Footer />
        </Content>
      </Layout>
    </Layout>
  );
};

const Footer = () => {
  return (
    <footer>
      <p>&copy; 2023 InvestorData. All rights reserved.</p>
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