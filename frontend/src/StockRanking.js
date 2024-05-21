import React from 'react';
import LoginForm from './SigninPart/login';
import RegistrationForm from './SigninPart/Registration';
import { useState, useEffect } from 'react';
import { AuthProvider } from './SigninPart/index';
import { Autocomplete, TextField, Chip } from '@mui/material';
import { db } from './SigninPart/firebase';
import { getFirestore, collection, query, where, doc,getDoc, getDocs, addDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from './SigninPart/index';


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
};

const inputClasses = 'mt-1 block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-zinc-800 dark:text-white';
const buttonClasses = 'rounded-md px-4 py-2';
const labelClasses = 'block text-sm font-medium text-zinc-700 dark:text-zinc-200';



const AddTransactionForm = ({ visible, onCancel, onSubmit, tickers, setTickers, tickerOptions }) => {
  const [stockSymbol, setStockSymbol] = useState('');
  const [tradeDate, setTradeDate] = useState('');
  const [tradeType, setTradeType] = useState('Buy');
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [commission, setCommission] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    setTotalCost(price * quantity);
  }, [price, quantity]);

  if (!visible) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(stockSymbol, tradeDate, tradeType, price, quantity, commission, comment);
    // Reset form fields after successful submission
    setStockSymbol('');
    setTradeDate('');
    setTradeType('Buy');
    setPrice(0);
    setQuantity(0);
    setCommission(0);
    setTotalCost(0);
    setComment('');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-zinc-700 rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Add Transaction</h2>
          <button
            className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
            onClick={onCancel}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={labelClasses}></label>
              <Autocomplete
                multiple
                value={tickers}
                options={tickerOptions}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField {...params} label="Search Tickers" />}
                onChange={(event, newValue) => setTickers(newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip key={index} label={option} {...getTagProps({ index })} />
                  ))
                }
              />
          </div>
          <div className="mb-4">
            <label className={labelClasses}>Trade Date</label>
            <input
              type="date"
              className={inputClasses}
              value={tradeDate}
              onChange={(e) => setTradeDate(e.target.value)}
            />
          </div>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Trade Type</label>
              <select
                className={inputClasses}
                value={tradeType}
                onChange={(e) => setTradeType(e.target.value)}
              >
                <option value="Buy">Buy</option>
                <option value="Sell">Sell</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>Price</label>
              <input
                type="number"
                step="0.01"
                className={inputClasses}
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
              />
            </div>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Quantity</label>
              <input
                type="number"
                className={inputClasses}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className={labelClasses}>Commission</label>
              <input
                type="number"
                step="0.01"
                className={inputClasses}
                value={commission}
                onChange={(e) => setCommission(parseFloat(e.target.value))}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className={labelClasses}>Total Cost</label>
            <input
              type="number"
              step="0.01"
              className={inputClasses}
              value={totalCost}
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className={labelClasses}>Comment</label>
            <textarea
              rows="3"
              className={inputClasses}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <button
              type="button"
              className={`bg-zinc-300 dark:bg-zinc-600 text-zinc-800 dark:text-zinc-200 ${buttonClasses}`}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`bg-blue-500 dark:bg-blue-600 text-white ${buttonClasses}`}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreatePortfolioModal = ({ visible, onClose, onSubmit }) => {
  const [portfolioName, setPortfolioName] = useState('');
  const [portfolioComment, setPortfolioComment] = useState('');

  const handleSubmit = () => {
    onSubmit(portfolioName, portfolioComment);
    setPortfolioName('');
    setPortfolioComment('');
  };
  if (!visible) return null;
  return (
    // Render the modal with input fields for portfolio name and comment
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-zinc-700 rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Create Portfolio</h2>
          <button
            className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-4">
            <label className={labelClasses}>Portfolio Name</label>
            <input type="text" className={inputClasses} value={portfolioName} onChange={(e) => setPortfolioName(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className={labelClasses}>Comment</label>
            <textarea rows="3" className={inputClasses} value={portfolioComment} onChange={(e) => setPortfolioComment(e.target.value)} />
          </div>
          <div className="flex items-center justify-end space-x-2">
            <button
              type="button"
              className={`bg-zinc-300 dark:bg-zinc-600 text-zinc-800 dark:text-zinc-200 ${buttonClasses}`}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`bg-blue-500 dark:bg-blue-600 text-white ${buttonClasses}`}
              onClick={handleSubmit}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const GrowthComparisonChart = () => {
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [isRegistrationVisible, setIsRegistrationVisible] = useState(false);
  const [isTransactionFormVisible, setIsTransactionFormVisible] = useState(false);
  const [portfolios, setPortfolios] = useState([]);
  const { currentUser } = useAuth();
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [isCreatePortfolioModalVisible, setIsCreatePortfolioModalVisible] = useState(false);
  const [investmentData, setInvestmentData] = useState([]);
  const [tickerOptions, setTickerOptions] = useState([]);
  const [data, setData] = useState([]);
  const [tickers, setTickers] = useState(["AAPL"]);
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
    const endDate = "2024-04-01"

    const promises = investmentData.map(async (investment) => {
      const { ticker, tradeDate } = investment;
      if (ticker && tradeDate) {
        const url = `http://127.0.0.1:8000/api/stock_data?ticker=${ticker}&start_date=${tradeDate}&end_date=${endDate}`;
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



  useEffect(() => {
    const fetchPortfolios = async () => {
      if (currentUser) {
        const db = getFirestore();
        const userRef = doc(db, 'users', currentUser.uid);
        const portfoliosCollectionRef = collection(userRef, 'portfolios');
        const portfoliosQuerySnapshot = await getDocs(portfoliosCollectionRef);
    
        const portfoliosData = portfoliosQuerySnapshot.docs.map((portfolioDoc) => {
          const portfolioData = portfolioDoc.data();
          const investments = portfolioData.investments || [];
    
          return {
            id: portfolioDoc.id,
            ...portfolioData,
            investments,
          };
        });
    
        setPortfolios(portfoliosData);
      } else {
        setPortfolios([]);
      }
    };
  
    fetchPortfolios();
  }, [currentUser]);

  const fetchInvestmentData = async () => {
    if (currentUser && selectedPortfolio) {
      const db = getFirestore();
      const userRef = doc(db, 'users', currentUser.uid);
      const portfolioRef = doc(userRef, 'portfolios', selectedPortfolio.id);
      const investmentsCollectionRef = collection(portfolioRef, 'investments');
      const investmentsQuerySnapshot = await getDocs(investmentsCollectionRef);
  
      const investmentsData = investmentsQuerySnapshot.docs.map((doc) => doc.data());
      setInvestmentData(investmentsData);
      console.log(selectedPortfolio.id, currentUser.uid);
      console.log('Investment data fetched:', investmentsData);
    } else {
      setInvestmentData([]);
    }
  };

  useEffect(() => {
    fetchInvestmentData();
  }, [selectedPortfolio]);

  const handleLoginCancel = () => {
    setIsLoginVisible(false);
  };

  const handleAddStock = () => {
    setIsTransactionFormVisible(true);
  };

  const handleTransactionCancel = () => {
    setIsTransactionFormVisible(false);
  };

  const handleTransactionSave = () => {
    // Handle transaction save logic here
    console.log('Transaction form saved');
    setIsTransactionFormVisible(false);
  };


  const handleLogin = (formData) => {
    // Handle login logic here
    console.log('Login form submitted:', formData);
    setIsLoginVisible(false);
  };

  const handleShowRegistration = () => {
    setIsLoginVisible(false);
    setIsRegistrationVisible(true);
  };

  const handleRegistrationCancel = () => {
    setIsRegistrationVisible(false);
  };

  const handleRegistrationSubmit = (formData) => {
    // Handle registration logic here
    console.log('Registration form submitted:', formData);
    setIsRegistrationVisible(false);
  };

  const handleSwitchToLogin = () => {
    setIsRegistrationVisible(false);
    setIsLoginVisible(true);
  };

  const handleCreatePortfolio = async () => {
    setIsCreatePortfolioModalVisible(true);
  };

  const handleCreatePortfolioSubmit = async (portfolioName, portfolioComment) => {
    if (currentUser) {
      const db = getFirestore();
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
  
      if (!userDoc.exists()) {
        // If the user document doesn't exist, create it
        await setDoc(userRef, {
          email: currentUser.email,
          name: currentUser.displayName,
          // Add other relevant user fields
        });
      }
  
      const portfoliosCollectionRef = collection(userRef, 'portfolios');
      const newPortfolio = {
        name: portfolioName,
        comment: portfolioComment,
        createdAt: new Date(),
      };
  
      const docRef = await addDoc(portfoliosCollectionRef, newPortfolio);
      setPortfolios((prevPortfolios) => [...prevPortfolios, { id: docRef.id, ...newPortfolio }]);
      setIsCreatePortfolioModalVisible(false);
    }
  };

  const handlePortfolioChange = (e) => {
    const selectedPortfolioId = e.target.value;
    const portfolio = portfolios.find((portfolio) => portfolio.id === selectedPortfolioId);
    setSelectedPortfolio(portfolio);
  };

  const handleTransactionSubmit = async (stockSymbol, tradeDate, tradeType, price, quantity, commission, comment) => {
    if (currentUser && selectedPortfolio) {
      const db = getFirestore();
      const userRef = doc(db, 'users', currentUser.uid);
      const portfolioRef = doc(userRef, 'portfolios', selectedPortfolio.id);
  
      const investmentsCollectionRef = collection(portfolioRef, 'investments');
      const newInvestment = {
        ticker: stockSymbol,
        tradeDate: tradeDate,
        tradeType: tradeType,
        price: price,
        quantity: quantity,
        commission: commission,
        comment: comment,
      };
  
      await addDoc(investmentsCollectionRef, newInvestment);
      console.log('Investment added to portfolio:', selectedPortfolio.id);
      setIsTransactionFormVisible(false);
    } else {
      console.log('No portfolio selected');
    }
  };


    return (
      <AuthProvider>
        <div className={`container mx-auto ${sharedClasses.px4} ${sharedClasses.py6}`}>
            <div className={`flex ${sharedClasses.justifyBetween} ${sharedClasses.itemsCenter} ${sharedClasses.mb6}`}>
                  <div className={`flex ${sharedClasses.itemsCenter}`}>
                    <h1 className={`${sharedClasses.text2xl} ${sharedClasses.fontSemiBold}`}>Growth Comparison Chart</h1>
                    <select
                      className={`${sharedClasses.ml4} ${sharedClasses.bgRed} ${sharedClasses.textWhite} ${sharedClasses.px2} ${sharedClasses.py1} ${sharedClasses.rounded}`}
                      value={selectedPortfolio ? selectedPortfolio.id : ''}
                      onChange={handlePortfolioChange}
                    >
                      <option value="">Select a portfolio</option>
                        {portfolios.map((portfolio) => (
                          <option key={portfolio.id} value={portfolio.id}>
                            {portfolio.name}
                          </option>
                      ))}
                    </select>
                    <button
                      className={`${sharedClasses.ml2} ${sharedClasses.bgBlue} ${sharedClasses.textWhite} ${sharedClasses.px2} ${sharedClasses.py1} ${sharedClasses.rounded}`}
                      onClick={handleCreatePortfolio}
                    >
                      Add new portfolio
                    </button>
                  </div>
                <div className={`flex ${sharedClasses.itemsCenter}`}>
                  <button
                    className={`${sharedClasses.bgBlue} ${sharedClasses.textWhite} ${sharedClasses.px4} ${sharedClasses.py2} ${sharedClasses.rounded} ${sharedClasses.mr2}`}
                    onClick={handleAddStock}
                  >
                    Add Stock
                  </button>
                </div>
            </div>

            <div>
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
                onSubmit={handleRegistrationSubmit}
                onSwitchToLogin={handleSwitchToLogin}
              />
              )}
            </div>

            <div className={`${sharedClasses.bgWhite} ${sharedClasses.bgDark} ${sharedClasses.rounded} ${sharedClasses.p4} ${sharedClasses.shadow}`}>
                <img src="https://placehold.co/600x300" alt="Growth Chart" className={sharedClasses.wFull} crossorigin="anonymous" />
            </div>
            <div className={`${sharedClasses.grid} ${sharedClasses.gridCols1} sm:${sharedClasses.gridCols2} lg:${sharedClasses.gridCols4} ${sharedClasses.gap4} ${sharedClasses.mt6}`}>
                <div className={`${sharedClasses.bgWhite} ${sharedClasses.bgDark} ${sharedClasses.p4} ${sharedClasses.rounded} ${sharedClasses.shadow}`}>
                    <h2 className={`${sharedClasses.fontSemiBold} ${sharedClasses.textLg}`}>Today</h2>
                    <p className={sharedClasses.textSm}>Compared to Yesterday</p>
                    <p className={`${sharedClasses.textXl} ${sharedClasses.fontSemiBold} ${sharedClasses.textGreen}`}>+2.86%</p>
                </div>
                <div className={`${sharedClasses.bgWhite} ${sharedClasses.bgDark} ${sharedClasses.p4} ${sharedClasses.rounded} ${sharedClasses.shadow}`}>
                    <h2 className={`${sharedClasses.fontSemiBold} ${sharedClasses.textLg}`}>This Week</h2>
                    <p className={sharedClasses.textSm}>Compared to Last Week</p>
                    <p className={`${sharedClasses.textXl} ${sharedClasses.fontSemiBold} ${sharedClasses.textGreen}`}>+1.98%</p>
                </div>
                <div className={`${sharedClasses.bgWhite} ${sharedClasses.bgDark} ${sharedClasses.p4} ${sharedClasses.rounded} ${sharedClasses.shadow}`}>
                    <h2 className={`${sharedClasses.fontSemiBold} ${sharedClasses.textLg}`}>This Month</h2>
                    <p className={sharedClasses.textSm}>Compared to Last Month</p>
                    <p className={`${sharedClasses.textXl} ${sharedClasses.fontSemiBold} ${sharedClasses.textRed}`}>-2.57%</p>
                </div>
                <div className={`${sharedClasses.bgWhite} ${sharedClasses.bgDark} ${sharedClasses.p4} ${sharedClasses.rounded} ${sharedClasses.shadow}`}>
                    <h2 className={`${sharedClasses.fontSemiBold} ${sharedClasses.textLg}`}>This Year</h2>
                    <p className={sharedClasses.textSm}>Compared to Last Year</p>
                    <p className={`${sharedClasses.textXl} ${sharedClasses.fontSemiBold} ${sharedClasses.textGreen}`}>+8.83%</p>
                </div>
            </div>
            <div className={`${sharedClasses.mt6} ${sharedClasses.bgWhite} ${sharedClasses.bgDark} ${sharedClasses.rounded} ${sharedClasses.shadow}`}>
                <table className="w-full">
                    <thead>
                        <tr className={sharedClasses.textLeft}>
                            <th className={sharedClasses.p4}>Name</th>
                            <th className={sharedClasses.p4}>Gain</th>
                            <th className={sharedClasses.p4}>Monthly</th>
                            <th className={sharedClasses.p4}>Yearly</th>
                            <th className={sharedClasses.p4}>Drawdown</th>
                            <th className={sharedClasses.p4}>Equity</th>
                            <th className={sharedClasses.p4}>Chart</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className={sharedClasses.p4}>new_test</td>
                            <td className={`${sharedClasses.p4} ${sharedClasses.textGreen}`}>0%</td>
                            <td className={sharedClasses.p4}>2.25%</td>
                            <td className={sharedClasses.p4}>6.7%</td>
                            <td className={sharedClasses.p4}>8.5%</td>
                            <td className={sharedClasses.p4}>$482,342.42</td>
                            <td className={sharedClasses.p4}>No data to display</td>
                        </tr>
                        <tr>
                            <td className={sharedClasses.p4}>Test</td>
                            <td className={`${sharedClasses.p4} ${sharedClasses.textGreen}`}>+8%</td>
                            <td className={sharedClasses.p4}>2.35%</td>
                            <td className={sharedClasses.p4}>6.9%</td>
                            <td className={sharedClasses.p4}>8.3%</td>
                            <td className={sharedClasses.p4}>$482,300.00</td>
                            <td className={sharedClasses.p4}>No data to display</td>
                        </tr>
                    </tbody>
                </table>
            </div>
          <AddTransactionForm
            visible={isTransactionFormVisible}
            onCancel={handleTransactionCancel}
            onSubmit={handleTransactionSubmit}
            tickers={tickers}
            tickerOptions={tickerOptions}
            setTickers={setTickers}
          />
          <CreatePortfolioModal
            visible={isCreatePortfolioModalVisible}
            onClose={() => setIsCreatePortfolioModalVisible(false)}
            onSubmit={handleCreatePortfolioSubmit}
          />
        </div>
      </AuthProvider>
    );
};

export default GrowthComparisonChart;
