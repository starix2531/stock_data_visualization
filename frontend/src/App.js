import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './SigninPart/index';
import { PortfolioProvider } from './PortfolioContext';
import { DataProvider } from './DataContext';
import './App.css';
import LoginForm from './SigninPart/login';
import RegistrationForm from './SigninPart/Registration';
import stock3 from './assets/stock_3.jpeg';
import stock4 from './assets/stock_4.jpg';
import stockMarket from './assets/stock-market.jpg';
import { EfficientFrontierProvider } from './Plots/EfficientFrontierContext';
import ChatBox from './ChatBox';
const Dashboard = React.lazy(() => import('./Dashboard'));
const StockRanking = React.lazy(() => import('./StockRanking'));

const App = () => {
  const sharedClasses = {
    bgWhite: 'bg-white',
    bgDark: 'dark:bg-zinc-700',
    rounded: 'rounded-lg',
    shadow: 'shadow',
    p4: 'p-4',
    textGreen: 'text-green-500',
    textRed: 'text-red-500',
    flex: 'flex',
    itemsCenter: 'items-center',
    justifyBetween: 'justify-between',
    ml4: 'ml-4',
    mr2: 'mr-2',
    px4: 'px-4',
    py6: 'py-6',
    py2: 'py-2',
    px2: 'px-2',
    py1: 'py-1',
    wFull: 'w-full',
    hSmall: 'h-80',
    hPixels: 'h-pixels',
    grid: 'grid',
    gridCols1: 'grid-cols-1',
    gridCols2: 'grid-cols-2',
    gridCols4: 'grid-cols-4',
    gap4: 'gap-4',
    mt6: 'mt-6',
    text2xl: 'text-2xl',
    fontSemiBold: 'font-semibold',
    textLg: 'text-lg',
    textXl: 'text-xl',
    textSm: 'text-sm',
    bgBlue: 'bg-blue-500',
    bgRed: 'bg-red-500',
    bgGreen: 'bg-green-500',
    textWhite: 'text-white',
    gridCols3: 'grid-cols-3',
    colSpan1: 'col-span-1',
    colSpan2: 'col-span-2',
    colSpan3: 'col-span-3',
    hFull: 'h-full',
    objectCover: 'object-cover',
  };
  
  

  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, setCurrentUser } = useAuth();
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [isRegistrationVisible, setIsRegistrationVisible] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
  };
  const showLoginModal = () => setIsLoginVisible(true);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const dropdownRef = useRef(null);

  const renderUserIcon = () => {
    if (!currentUser) {
      return (
        <button
          onClick={showLoginModal}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          type="button"
        >
          Sign In/Up
        </button>
      );
    }

    const getUserColor = (email) => {
      if (!email) {
        return '#000000';
      }
      let hash = 0;
      for (let i = 0; i < email.length; i++) {
        hash = email.charCodeAt(i) + ((hash << 5) - hash);
      }
      let color = '#';
      for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
      }
      return color;
    };

    const userColor = getUserColor(currentUser.email);
    const initialLetter = currentUser.email && currentUser.email.charAt(0).toUpperCase();

    return (
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 focus:outline-none"
        >
          {currentUser.photoURL ? (
            <img src={currentUser.photoURL} alt={`${currentUser.displayName || 'User'} profile`} className="rounded-full w-15 h-15" />
          ) : (
            <div
              className="rounded-full w-8 h-8 bg-gray-400 flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: userColor }}
            >
              {initialLetter}
            </div>
          )}
        </button>
        {isDropdownOpen && (
          <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
            <a href="/settings" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
              Settings
            </a>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    );
  };

  return  (
    <div className={`min-h-screen flex flex-col bg-gray-100`}>
      {/* Header */}
      <header className="bg-gradient-to-r from-green-200 via-blue-300 to-teal-200 text-white w-full">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-2xl font-bold mr-2 text-yellow-600">Savvy</div>
            <div className="text-2xl font-bold text-white">Investor Hub</div>
          </div>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link to="/" className={`${location.pathname === '/' ? 'text-yellow-400' : 'text-white'} hover:text-yellow-400`}>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className={`${location.pathname === '/dashboard' ? 'text-yellow-400' : 'text-white'} hover:text-yellow-400`}
                >
                  Visualization Board
                </Link>
              </li>
              <li>
                <Link
                  to="/ranking"
                  className={`${location.pathname === '/ranking' ? 'text-yellow-400' : 'text-white'} hover:text-yellow-400`}
                >
                  Stock Portfolios
                </Link>
              </li>
            </ul>
          </nav>
          <div className="flex space-x-4 items-center">
            {renderUserIcon()}
            <Link to="/forum" className="text-white hover:text-yellow-400">
              FORUM
            </Link>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6 bg-gray-100 container mx-auto">
        {location.pathname === '/' && (
          <>
            {/* Main Content - Image Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link to="/dashboard" className="block bg-white shadow-md rounded-lg overflow-hidden">
                <img src={stock3} alt="Visualization Board" className="w-full h-80 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">VISUALIZATION BOARD</h3>
                  <p className="mt-2 text-gray-600">View detailed visualizations of key financial metrics and trends.</p>
                </div>
              </Link>
              <Link to="/ranking" className="block bg-white shadow-md rounded-lg overflow-hidden">
                <img src={stock4} alt="Stock Portfolios" className="w-full h-80 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">STOCK PORTFOLIOS</h3>
                  <p className="mt-2 text-gray-600">Access comprehensive stock portfolios including history and performance.</p>
                </div>
              </Link>
              <Link to="/financial-info" className="block bg-white shadow-md rounded-lg overflow-hidden">
                <img src={stockMarket} alt="Financial Information" className="w-full h-80 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">COMPANY FINANCIAL INFORMATION</h3>
                  <p className="mt-2 text-gray-600">Explore detailed financial information for various companies.</p>
                </div>
              </Link>
            </div>

            {/* Introduction Paragraph */}
            <section className="mt-8 bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold">Welcome to our stock data web application!</h2>
              <p className="mt-4 text-gray-600">
                Our platform is designed to provide you with easy access to historical stock information for various companies.
                Whether you're an investor, analyst, or simply curious about the stock market, our web app allows you to retrieve and
                explore stock data effortlessly.
              </p>
              <p className="mt-4 text-gray-600">
                With our user-friendly interface, you can quickly search for a specific company using its stock symbol and select a
                desired date. Our application will then fetch the relevant stock data from our extensive database and present it to
                you in a clear and organized manner. You can view key information such as opening and closing prices, trading volume,
                and more.
              </p>
              <p className="mt-4 text-gray-600">
                We understand the importance of data accuracy and reliability, which is why we have implemented robust data retrieval
                and processing mechanisms. Our application ensures that the stock data you receive is up-to-date and sourced from
                reliable market data providers.
              </p>
              <p className="mt-4 text-gray-600">
                Whether you're conducting research, analyzing trends, or making informed investment decisions, our stock data web
                application is here to empower you with the information you need. Start exploring now and gain valuable insights into
                the world of stocks!
              </p>
            </section>
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
          onLogin={handleLogin}
          onRegister={handleShowRegistration}
        />
      )}

      {isRegistrationVisible && (
        <RegistrationForm
          visible={isRegistrationVisible}
          onCancel={handleRegistrationCancel}
          onSwitchToLogin={handleSwitchToLogin}
          onLogIn={handleLogin}
        />
      )}

      <ChatBox />
    </div>
  );
};

const Footer = () => (
  <footer className="bg-gradient-to-r from-green-200 via-blue-300 to-teal-200 text-white text-center py-4">
    <p>&copy; 2023 InvestorData. All rights reserved.</p>
  </footer>
);

const AppWrapper = () => (
  <Router>
    <AuthProvider>
      <DataProvider>
        <PortfolioProvider>
          <EfficientFrontierProvider>
            <App />
          </EfficientFrontierProvider>
        </PortfolioProvider>
      </DataProvider>
    </AuthProvider>
  </Router>
);

export default AppWrapper;
