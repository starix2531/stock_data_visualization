import React from 'react';
import LoginForm from './SigninPart/login';
import RegistrationForm from './SigninPart/Registration';
import { useState, useEffect, useContext } from 'react';
import { AuthProvider, useAuth } from './SigninPart/index';
import { Autocomplete, TextField, Chip } from '@mui/material';
import { db } from './SigninPart/firebase';
import { getFirestore, collection, query, where, doc,getDoc, getDocs, addDoc, setDoc, deleteDoc, average, sum } from 'firebase/firestore';
import Portfolio_chart from "./Plots/Protfolio_line";
import { PortfolioContext } from './PortfolioContext';
import { DataContext } from './DataContext';
import EfficientFrontierPlot from './Plots/EfficientFrontierPlot';
import PieChart from './Plots/WeightPiechat';
import BarChart from './Plots/PorfolioWeighEfficient';
import { useNavigate } from 'react-router-dom';


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
  colSpan3: 'col-span-3',  // Add this line
  hFull: 'h-full',
  objectCover: 'object-cover',
};

const inputClasses = 'mt-1 block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-zinc-800 dark:text-white';
const buttonClasses = 'rounded-md px-4 py-2';
const labelClasses = 'block text-sm font-medium text-zinc-700 dark:text-zinc-200';


const AddTransactionForm = ({ visible, onCancel, onSubmit, tickerOptions }) => {
  const [stockSymbol, setStockSymbol] = useState('');
  const [tradeDate, setTradeDate] = useState('');
  const [tradeType, setTradeType] = useState('Buy');
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [commission, setCommission] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    setTotalCost(price * quantity + commission);
  }, [price, quantity, commission]);

  useEffect(() => {
    const fetchPrice = async () => {
      if (stockSymbol && tradeDate) {
        try {
          const response = await fetch(
            `https://fastapi-stock-price-info-niayqkcaza-uw.a.run.app/api/stock_price?ticker=${stockSymbol}&date=${tradeDate}`
          );
          const data = await response.json();
          const fetchedPrice = data;
          console.log( 'fetchedPrice',fetchedPrice);
          if (fetchedPrice !== undefined) {
            setPrice(fetchedPrice);
          } else {
            setPrice(0);
          }
        } catch (error) {
          console.error('Error fetching the stock price:', error);
          setPrice(0);
        }
      }
    };

    fetchPrice();
  }, [stockSymbol, tradeDate]);

  if (!visible) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ stockSymbol, tradeDate, tradeType, price, quantity, commission, comment });
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
            
            <Autocomplete
              value={stockSymbol}
              options={tickerOptions}
              getOptionLabel={(option) => option}
              renderInput={(params) => <TextField {...params} label="Search Tickers" />}
              onChange={(event, newValue) => setStockSymbol(newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip key={index} label={option} {...getTagProps({ index })} />
                ))
              }
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Trade Date</label>
            <input
              type="date"
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={tradeDate}
              onChange={(e) => setTradeDate(e.target.value)}
            />
          </div>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Trade Type</label>
              <select
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={tradeType}
                onChange={(e) => setTradeType(e.target.value)}
              >
                <option value="Buy">Buy</option>
                <option value="Buy with Cash">Buy with Cash</option>
                <option value="Sell">Sell</option>
                <option value="Deposit">Deposit</option>
                <option value="Withdrawal">Withdrawal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                step="0.01"
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
              />
            </div>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Commission</label>
              <input
                type="number"
                step="0.01"
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={commission}
                onChange={(e) => setCommission(parseFloat(e.target.value))}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Total Cost</label>
            <input
              type="number"
              step="0.01"
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={totalCost}
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Comment</label>
            <textarea
              rows="3"
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <button
              type="button"
              className="bg-zinc-300 dark:bg-zinc-600 text-zinc-800 dark:text-zinc-200 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 dark:bg-blue-600 text-white inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
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

const DeleteTransactionModal = ({ visible, onClose, onDelete, transactions }) => {
  const [selectedTransactionIndex, setSelectedTransactionIndex] = useState('');

  if (!visible) return null;

  const handleDelete = () => {
    if (selectedTransactionIndex !== '') {
      const selectedTransaction = transactions[selectedTransactionIndex];
      console.log('Deleting transaction:', selectedTransaction);
      onDelete(selectedTransaction);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-zinc-700 rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Delete Transaction</h2>
          <button
            className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div className="mb-4">
          <label className={labelClasses}>Select Transaction</label>
          <select
            className={inputClasses}
            value={selectedTransactionIndex}
            onChange={(e) => setSelectedTransactionIndex(e.target.value)}
          >
            <option value="">Select a transaction</option>
            {transactions && transactions.map((transaction, index) => (
              <option key={`${transaction.ticker}-${transaction.tradeDate}`} value={index}>
                {transaction.ticker} - {transaction.tradeDate}
              </option>
            ))}
          </select>
        </div>
        {selectedTransactionIndex !== '' && (
          <div className="mb-4">
            <p><strong>Ticker:</strong> {transactions[selectedTransactionIndex].ticker}</p>
            <p><strong>Trade Date:</strong> {transactions[selectedTransactionIndex].tradeDate}</p>
            <p><strong>Total Cost:</strong> {transactions[selectedTransactionIndex].price * transactions[selectedTransactionIndex].quantity}</p>
            <p><strong>Trade Type:</strong> {transactions[selectedTransactionIndex].tradeType}</p>
            <p><strong>Comment:</strong> {transactions[selectedTransactionIndex].comment}</p>
            </div>
        )}
        <p className="mb-4">Are you sure you want to delete this transaction?</p>
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
            className={`bg-red-500 dark:bg-red-600 text-white ${buttonClasses}`}
            onClick={handleDelete}
            disabled={selectedTransactionIndex === ''}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};


const GrowthComparisonChart = () => {

  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [isRegistrationVisible, setIsRegistrationVisible] = useState(false);
  const [isTransactionFormVisible, setIsTransactionFormVisible] = useState(false);
  const { currentUser } = useAuth();
  const [isCreatePortfolioModalVisible, setIsCreatePortfolioModalVisible] = useState(false);
  const [tickerOptions, setTickerOptions] = useState([]);
  const [financialData, setFinancialData] = useState({});
  const navigate = useNavigate();
  const {
    selectedPortfolio,
    setSelectedPortfolio,
    portfolios,
    setPortfolios,
    portfolioWeight,
    setportfolioWeight,
    investmentData,
    setInvestmentData,
    data,
    setData,
    weeklyReturns,
    setweeklyReturns,
    monthlyReturns,
    setmonthlyReturns,
    quarterlyReturns,
    setquarterlyReturns,
    weeklyData,
    setWeeklyData,
    monthlyData,
    setMonthlyData,
    quarterlyData,
    setQuarterlyData,
    annualData,
    setAnnualData,
    tableData, 
    setTableData
  } = useContext(PortfolioContext);
  const { tickers, setTickers } = useContext(DataContext);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [sortOrder, setSortOrder] = useState({
    ticker: 'asc',
    current_equity: 'asc',
    Last_return: 'asc',
    current_weight: 'asc',
  });

  useEffect(() => {
    if (portfolioWeight) {
    setDisplayedItems(portfolioWeight.slice(0, 5));
    }
  }, [portfolioWeight]);

  const [isDeleteTransactionModalVisible, setIsDeleteTransactionModalVisible] = useState(false);
  const handleDeleteTransaction = async (transaction) => {
    if (!transaction || !transaction.id) {
      console.error('Invalid transaction object:', transaction);
      return;
    }
  
    if (currentUser && selectedPortfolio) {
      const db = getFirestore();
      const userRef = doc(db, 'users', currentUser.uid);
      const portfolioRef = doc(userRef, 'portfolios', selectedPortfolio.id);
      const investmentsCollectionRef = collection(portfolioRef, 'investments');
      const investmentQuery = query(investmentsCollectionRef, where('id', '==', transaction.id));
  
      try {
        const querySnapshot = await getDocs(investmentQuery);
  
        if (querySnapshot.empty) {
          console.error('No matching documents found for the given transaction id:', transaction.id);
          return;
        }
  
        querySnapshot.forEach(async (docSnapshot) => {
          await deleteDoc(doc(investmentsCollectionRef, docSnapshot.id));
        });
  
        console.log('Transaction deleted from portfolio:', selectedPortfolio.id);
        setIsDeleteTransactionModalVisible(false);
  
        await fetchInvestmentData(); // Refresh the investment data after deletion
        fetchPortfoliodata(); // Refresh the portfolio data after deletion
        fetchPortfoliosWeight(); // Refresh the portfolio weight after deletion
  
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    } else {
      console.log('No portfolio or transaction selected');
    }
  };
  
  

  useEffect(() => {
    fetchTickerOptions();
  }, []);

  const fetchTickerOptions = async () => {
    try {
      const response = await fetch('https://fastapi-cloud-run-niayqkcaza-uw.a.run.app/api/tickers');
      if (!response.ok) {
        throw new Error('Error fetching ticker options');
      }
      const tickersData = await response.text();
      const options = tickersData
        .split(/\\n/)
        .map((ticker) => ticker.trim().replace(/^"|"$/g, ''))
        .filter((ticker) => ticker !== '');
      setTickerOptions(options);
    } catch (error) {
      console.error('Error fetching ticker options:', error);
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
    setSelectedPortfolio(portfolios[0]);
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
      console.log('Investment data fetched:', investmentsData);
    } else {
      setInvestmentData([]);
    }
  };

  const fetchPortfoliodata = async () => {
    if (currentUser && selectedPortfolio) {
      const url = `https://portfolio-equity-niayqkcaza-uw.a.run.app/api/portfolio_equity?user_id=${currentUser.uid}&portfolio_id=${selectedPortfolio.id}`;
      const response = await fetch(url);
      const jsonData = await response.json();
      setData(jsonData.equity_data)
      setweeklyReturns(jsonData.weekly_returns)
      setmonthlyReturns(jsonData.monthly_returns)
      setquarterlyReturns(jsonData.quarterly_returns)
      if (Array.isArray(jsonData.weekly_returns)) {
        setWeeklyData(jsonData.weekly_returns.reduce((sum, current) => sum + current, 0) / jsonData.weekly_returns.length);
      }
      
      if (Array.isArray(jsonData.monthly_returns)) {
        setMonthlyData(jsonData.monthly_returns.reduce((sum, current) => sum + current, 0) / jsonData.monthly_returns.length);
      }
      
      if (Array.isArray(jsonData.quarterly_returns)) {
        setQuarterlyData(jsonData.quarterly_returns.reduce((sum, current) => sum + current, 0) / jsonData.quarterly_returns.length);
      }
      
      if (Array.isArray(jsonData.yearly_returns)) {
        setAnnualData(jsonData.yearly_returns.reduce((sum, current) => sum + current, 0) / jsonData.yearly_returns.length);
      }
    }
    return null;
  };



  const fetchPortfoliosWeight = async () => {
    if (currentUser && selectedPortfolio) {
      const url = `https://fastapi-portfolio-weight-niayqkcaza-uw.a.run.app/api/portfolio_weight?user_id=${currentUser.uid}&portfolio_id=${selectedPortfolio.id}`;
      const response = await fetch(url);
      const jsonData = await response.json();
      console.log('Portfolio weight fetched:', jsonData);
      setportfolioWeight(jsonData.portfolio_weight);
    }
    return null;
  };

  useEffect(() => {
    fetchInvestmentData();
    fetchPortfoliodata();
    fetchPortfoliosWeight();
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

  const handleTransactionSubmit = async ({ stockSymbol, tradeDate, tradeType, price, quantity, commission, comment }) => {
    if (currentUser && selectedPortfolio) {
      const db = getFirestore();
      const userRef = doc(db, 'users', currentUser.uid);
      const portfolioRef = doc(userRef, 'portfolios', selectedPortfolio.id);

      const investmentsCollectionRef = collection(portfolioRef, 'investments');
      const newInvestmentId = doc(collection(db, 'temp')).id;
      const newInvestment = {
        id: newInvestmentId, 
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
    await fetchInvestmentData(); // Refresh the investment data after addition
    await fetchPortfoliodata(); // Refresh the portfolio data after addition
    await fetchPortfoliosWeight(); // Refresh the portfolio weight after addition
  };


  const handleSort = (columnName) => {
    const isAscending = sortOrder[columnName] === 'asc';
    const sortedData = [...portfolioWeight].sort((a, b) => {
      if (a[columnName] === null) return 1;
      if (b[columnName] === null) return -1;
      if (a[columnName] === b[columnName]) return 0;
      return isAscending ? a[columnName] - b[columnName] : b[columnName] - a[columnName];
    });
    setportfolioWeight(sortedData);
    setDisplayedItems(sortedData.slice(0, 5));
    setSortOrder({ ...sortOrder, [columnName]: isAscending ? 'desc' : 'asc' });
  };


  return (
    <AuthProvider>
    <div className={`container mx-auto ${sharedClasses.px4} ${sharedClasses.py6}`}>
      {!currentUser ? (
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
          {!isLoginVisible && !isRegistrationVisible && (
            <button
              onClick={() => setIsLoginVisible(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Sign In/Up to Access Your Portfolio
            </button>
          )}
        </div>
      ) : (
        <div>
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
              <button
                className={`${sharedClasses.bgGreen} ${sharedClasses.textWhite} ${sharedClasses.px4} ${sharedClasses.py2} ${sharedClasses.rounded} ${sharedClasses.mr2}`}
                onClick={() => {
                  if (portfolioWeight) {
                    const portfolioTickers = portfolioWeight.map(item => item.ticker);
                    setTickers(portfolioTickers);
                    navigate('/dashboard'); // Navigate to the dashboard page
                  }
                }}
              >
                Set Tickers
              </button>
              <button
                className={`bg-red-500 dark:bg-red-600 text-white ${buttonClasses}`}
                onClick={() => {
                  setIsDeleteTransactionModalVisible(true);
                }}
              >
                Delete
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
  
          {selectedPortfolio && investmentData.length > 0 ? (
            <>
              <div className={`${sharedClasses.grid} ${sharedClasses.gridCols3} ${sharedClasses.gap4}`}>
                <div className={`${sharedClasses.bgWhite} ${sharedClasses.bgDark} ${sharedClasses.rounded} ${sharedClasses.p4} ${sharedClasses.shadow} ${sharedClasses.colSpan1} ${sharedClasses.hPixels}`} style={{ height: '700px' }}>
                  <div className="container mx-auto px-4 py-8">
                    <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-gray-100 text-gray-600 uppercase text-xm leading-normal">
                          <th className="py-2 px-4 text-left">
                            <div className="flex items-center">Ticker</div>
                          </th>
                          <th className="py-2 px-4 text-left">
                            <div className="flex items-center">
                              Current Equity
                              <a href="#" onClick={() => handleSort('current_equity')}>
                                <svg className="w-2 h-2 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z"/>
                                </svg>
                              </a>
                            </div>
                          </th>
                          <th className="py-2 px-4 text-left">
                            <div className="flex items-center">
                              Day Return
                              <a href="#" onClick={() => handleSort('Last_return')}>
                                <svg className="w-2 h-2 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z"/>
                                </svg>
                              </a>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-xm">
                        {displayedItems.map((item, index) => (
                          <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-2 px-4">{item.ticker}</td>
                            <td className="py-2 px-4">
                              <div className="flex items-center">
                                {item.current_equity.toFixed(2)}
                                <span className="ml-2">
                                  {item.current_equity_change >= 0 ? (
                                    <svg className="w-3 h-3 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                    </svg>
                                  ) : (
                                    <svg className="w-3 h-3 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                  )}
                                </span>
                              </div>
                            </td>
                            <td className={`${sharedClasses.p4} ${item.Last_return > 0 ? sharedClasses.textGreen : sharedClasses.textRed}`}>
                              <div className="flex items-center">
                                {item.Last_return ? `${item.Last_return.toFixed(2)}%` : 'N/A'}
                                <span className="ml-2">
                                  {item.Last_return >= 0 ? (
                                    <svg className="w-3 h-3 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                    </svg>
                                  ) : (
                                    <svg className="w-3 h-3 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                  )}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <PieChart data={portfolioWeight} />
                  </div>
                </div>
                <div className={`${sharedClasses.bgWhite} ${sharedClasses.bgDark} ${sharedClasses.rounded} ${sharedClasses.p4} ${sharedClasses.shadow} ${sharedClasses.colSpan2} ${sharedClasses.hPixels}`} style={{ height: '700px' }}>
                  <Portfolio_chart
                    data={data}
                    weeklyData={weeklyReturns}
                    monthlyData={monthlyReturns}
                    quarterlyData={quarterlyReturns}
                  />
                </div>
              </div>
  
              <div className={`${sharedClasses.colSpan3}`}>
                <div className={`${sharedClasses.grid} ${sharedClasses.gridCols4} ${sharedClasses.gap4} ${sharedClasses.mt6}`}>
                  <div className={`${sharedClasses.bgWhite} ${sharedClasses.bgDark} ${sharedClasses.p4} ${sharedClasses.rounded} ${sharedClasses.shadow}`}>
                    <h2 className={`${sharedClasses.fontSemiBold} ${sharedClasses.textLg}`}>Today</h2>
                    <p className={sharedClasses.textSm}>Compared to Yesterday</p>
                    <p className={`${sharedClasses.textXl} ${sharedClasses.fontSemiBold} ${sharedClasses.textRed}`}>{data && data.length >= 2 ? (
                      (data[data.length - 1].equity - data[data.length - 2].equity) /
                      data[data.length - 2].equity *
                      100
                    ).toFixed(2) + '%' : 'N/A'}</p>
                  </div>
                  <div className={`${sharedClasses.bgWhite} ${sharedClasses.bgDark} ${sharedClasses.p4} ${sharedClasses.rounded} ${sharedClasses.shadow}`}>
                    <h2 className={`${sharedClasses.fontSemiBold} ${sharedClasses.textLg}`}>This Week</h2>
                    <p className={sharedClasses.textSm}>Compared to Last Week</p>
                    <p className={`${sharedClasses.textXl} ${sharedClasses.fontSemiBold} ${sharedClasses.textRed}`}>{data && data.length >= 2 ? (
                      (() => {
                        const lastRecord = data[data.length - 1];
                        const lastRecordDate = new Date(lastRecord.Date);
                        const oneWeekAgo = new Date(lastRecordDate);
                        oneWeekAgo.setDate(lastRecordDate.getDate() - 7);
                        const oneWeekAgoEquity = data.find(
                          (record) => new Date(record.Date).getTime() >= oneWeekAgo.getTime()
                        )?.equity;
                    
                        if (oneWeekAgoEquity) {
                          const weeklyReturn = ((lastRecord.equity - oneWeekAgoEquity) / oneWeekAgoEquity * 100).toFixed(2);
                          return `${weeklyReturn}%`;
                        } else {
                          return 'N/A';
                        }
                      })()
                    ) : 'N/A'}
                    </p>
                  </div>
                  <div className={`${sharedClasses.bgWhite} ${sharedClasses.bgDark} ${sharedClasses.p4} ${sharedClasses.rounded} ${sharedClasses.shadow}`}>
                    <h2 className={`${sharedClasses.fontSemiBold} ${sharedClasses.textLg}`}>This Month</h2>
                    <p className={sharedClasses.textSm}>Compared to Last Month</p>
                    <p className={`${sharedClasses.textXl} ${sharedClasses.fontSemiBold} ${sharedClasses.textRed}`}>{data && data.length >= 2 ? (
                      (() => {
                        const lastRecord = data[data.length - 1];
                        const lastRecordDate = new Date(lastRecord.Date);
                        const firstDayOfMonth = new Date(lastRecordDate.getFullYear(), lastRecordDate.getMonth(), 1);
                        const firstDayOfMonthEquity = data.find(
                          (record) => new Date(record.Date).getTime() === firstDayOfMonth.getTime()
                        )?.equity;
                    
                        if (firstDayOfMonthEquity) {
                          const monthlyReturn = ((lastRecord.equity - firstDayOfMonthEquity) / firstDayOfMonthEquity * 100).toFixed(2);
                          return `${monthlyReturn}%`;
                        } else {
                          return 'N/A';
                        }
                      })()
                    ) : 'N/A'}
                    </p>
                  </div>
                  <div className={`${sharedClasses.bgWhite} ${sharedClasses.bgDark} ${sharedClasses.p4} ${sharedClasses.rounded} ${sharedClasses.shadow}`}>
                    <h2 className={`${sharedClasses.fontSemiBold} ${sharedClasses.textLg}`}>This Year</h2>
                    <p className={sharedClasses.textSm}>Compared to Last Year</p>
                    <p className={`${sharedClasses.textXl} ${sharedClasses.fontSemiBold} ${sharedClasses.textGreen}`}>{data && data.length >= 2 ? (
                      (() => {
                        const lastRecord = data[data.length - 1];
                        const lastRecordDate = new Date(lastRecord.Date);
                        const oneYearAgo = new Date(lastRecordDate.getFullYear() - 1, lastRecordDate.getMonth(), lastRecordDate.getDate());
                        const oneYearAgoEquity = data.find(
                          (record) => new Date(record.Date).getTime() >= oneYearAgo.getTime()
                        )?.equity;
                    
                        if (oneYearAgoEquity) {
                          const yearlyReturn = ((lastRecord.equity - oneYearAgoEquity) / oneYearAgoEquity * 100).toFixed(2);
                          return `${yearlyReturn}%`;
                        } else {
                          return 'N/A';
                        }
                      })()
                    ) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
  
              <div className={`${sharedClasses.bgWhite} ${sharedClasses.bgDark} ${sharedClasses.rounded} ${sharedClasses.p4} ${sharedClasses.shadow} ${sharedClasses.grid} ${sharedClasses.gridCols3} ${sharedClasses.gap4} mt-4`} style={{ height: '600px' }}>
                <div className={`${sharedClasses.bgWhite} ${sharedClasses.bgDark} ${sharedClasses.rounded} ${sharedClasses.p4} ${sharedClasses.shadow} ${sharedClasses.colSpan1}`} style={{ height: '100%' }}>
                  <h3 className="text-lg font-semibold mb-4">Efficient Frontier Table</h3>
                  <div className="flex justify-center items-center" style={{ height: 'calc(100% - 40px)' }}>
                    <BarChart data={tableData} style={{ height: '100%' }} />
                  </div>
                </div>
                <div className={`${sharedClasses.bgWhite} ${sharedClasses.bgDark} ${sharedClasses.rounded} ${sharedClasses.p4} ${sharedClasses.shadow} ${sharedClasses.colSpan2} flex justify-center items-center`} style={{ height: '100%' }}>
                  <EfficientFrontierPlot
                    portfolios={portfolios}
                    tickerOptions={tickerOptions}
                    currentUserId={currentUser.uid}
                    tableData={tableData}
                    setTableData={setTableData}
                    style={{ height: '100%' }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">No investments found in this portfolio.</p>
            </div>
          )}
  
          <AddTransactionForm
            visible={isTransactionFormVisible}
            onCancel={handleTransactionCancel}
            onSubmit={handleTransactionSubmit}
            tickerOptions={tickerOptions}
          />
  
          <CreatePortfolioModal
            visible={isCreatePortfolioModalVisible}
            onClose={() => setIsCreatePortfolioModalVisible(false)}
            onSubmit={handleCreatePortfolioSubmit}
          />
  
          <DeleteTransactionModal
            visible={isDeleteTransactionModalVisible}
            onClose={() => setIsDeleteTransactionModalVisible(false)}
            onDelete={handleDeleteTransaction}
            transactions={investmentData}
          />
        </div>
      )}
    </div>
  </AuthProvider>
);
};

export default GrowthComparisonChart;