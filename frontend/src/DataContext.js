import React, { createContext, useState } from 'react';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [financialData, setFinancialData] = useState({});
  const [tickers, setTickers] = useState(["AAPL", "GOOGL", "MSFT", "NVDA", "AMZN", "TSLA", "META"]);

  return (
    <DataContext.Provider value={{ data, setData, financialData, setFinancialData, tickers, setTickers }}>
      {children}
    </DataContext.Provider>
  );
};