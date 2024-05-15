import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './SigninPart/index';
import './App.css';
import LoginForm from './SigninPart/login';
import RegistrationForm from './SigninPart/Registration';
import stock3 from './assets/stock_3.jpeg';
import stock4 from './assets/stock_4.jpg';
import stockMarket from './assets/stock-market.jpg';

const Dashboard = React.lazy(() => import('./Dashboard'));
const StockRanking = React.lazy(() => import('./StockRanking'));

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, setCurrentUser } = useAuth();
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [isRegistrationVisible, setIsRegistrationVisible] = useState(false);

  const onMenuClick = (path) => navigate(path);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setIsLoginVisible(false);
  };

  const handleLoginCancel = () => setIsLoginVisible(false);
  const handleShowRegistration = () => {
    setIsLoginVisible(false);
    setIsRegistrationVisible(true);
  };
  const handleRegistrationCancel = () => {
    setIsRegistrationVisible(false);
  };
  const handleSwitchToLogin = () => {
    setIsRegistrationVisible(false);
    setIsLoginVisible(true);
  };
  const showLoginModal = () => setIsLoginVisible(true);

  const renderUserIcon = () => {
    if (currentUser) {
      const initialLetter = currentUser.email && currentUser.email.charAt(0).toUpperCase();
      const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      return (
        <div className="flex items-center space-x-2">
          {currentUser.photoURL ? (
            <img src={currentUser.photoURL} alt={`${currentUser.displayName} profile`} className="rounded-full w-10 h-10" />
          ) : (
            <div
              className="rounded-full w-8 h-8 bg-gray-400 flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: randomColor }}
            >
              {initialLetter}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <button
          onClick={showLoginModal}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          type="button"
        >
          Sign In/Sign Up
        </button>
      );
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-white font-bold">InvestorData</div>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link to="/" className={`${location.pathname === '/' ? 'text-blue-400' : 'text-white'} hover:text-blue-400`}>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className={`${location.pathname === '/dashboard' ? 'text-blue-400' : 'text-white'} hover:text-blue-400`}
                >
                  Visualization Board
                </Link>
              </li>
              <li>
                <Link
                  to="/ranking"
                  className={`${location.pathname === '/ranking' ? 'text-blue-400' : 'text-white'} hover:text-blue-400`}
                >
                  Stock Ranking
                </Link>
              </li>
            </ul>
          </nav>
          <div className="flex space-x-4 items-center">
            {renderUserIcon()}
            <Link to="/forum" className="text-white hover:text-blue-400">
              FORUM
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100">
        {location.pathname === '/' && (
          <>
            {/* Main Content - Image Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link to="/dashboard" className="block bg-white shadow-md rounded-lg overflow-hidden">
                <img src={stock3} alt="Comparison Board" className="w-full h-32 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">COMPARISON BOARD</h3>
                  <p className="mt-2 text-gray-600">Compare the performance of different stocks and analyze their trends.</p>
                </div>
              </Link>
              <Link to="/stock-trend" className="block bg-white shadow-md rounded-lg overflow-hidden">
                <img src={stock4} alt="Stock Price Trend" className="w-full h-32 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">STOCK PRICE TREND</h3>
                  <p className="mt-2 text-gray-600">Visualize the historical price trends of individual stocks.</p>
                </div>
              </Link>
              <Link to="/financial-info" className="block bg-white shadow-md rounded-lg overflow-hidden">
                <img src={stockMarket} alt="Company Financial Information" className="w-full h-32 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">COMPANY FINANCIAL INFORMATION</h3>
                  <p className="mt-2 text-gray-600">Access detailed financial information for various companies.</p>
                </div>
              </Link>
            </div>

            {/* Main Content - Explore Section */}
            <section className="mt-8 bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold">Explore the Dynamic World of Finance and Investment</h2>
              <p className="mt-4 text-gray-600">
                Dive into the list of top-performing companies. Analyze key financial metrics across different firms. Discuss
                the latest trends and insights with fellow enthusiasts.
              </p>
              <div className="mt-6 flex space-x-4">
                <button className="px-4 py-2 bg-blue-700 text-white rounded-lg">EXPLORE</button>
                <button className="px-4 py-2 bg-blue-700 text-white rounded-lg">COMPARE</button>
                <button className="px-4 py-2 bg-blue-700 text-white rounded-lg">VISIT FORUM</button>
              </div>
            </section>
          </>
        )}

        <React.Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ranking" element={<StockRanking />} />
          </Routes>
        </React.Suspense>
      </main>

      <Footer />
      {isLoginVisible && (
        <LoginForm 
          visible={isLoginVisible} 
          onCancel={handleLoginCancel} 
          onlogIn={handleLogin} 
          onRegister={handleShowRegistration} 
        />
      )}
      {isRegistrationVisible && (
        <RegistrationForm
          visible={isRegistrationVisible}
          onCancel={handleRegistrationCancel}
          onSwitchToLogin={handleSwitchToLogin}
          onlogIn={handleLogin}
        />
      )}
    </div>
  );
};

const Footer = () => (
  <footer className="bg-gray-800 text-white text-center py-4">
    <p>&copy; 2023 InvestorData. All rights reserved.</p>
  </footer>
);

const AppWrapper = () => (
  <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);

export default AppWrapper;