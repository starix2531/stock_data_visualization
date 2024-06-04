import React, { createContext, useState } from 'react';

export const PortfolioContext = createContext();

export const PortfolioProvider = ({ children }) => {
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [portfolioWeight, setportfolioWeight] = useState([]);
  const [investmentData, setInvestmentData] = useState([]);
  const [data, setData] = useState([]);
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [quarterlyData, setQuarterlyData] = useState(null);
  const [annualData, setAnnualData] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [weeklyReturns, setweeklyReturns] = useState(null);
  const [monthlyReturns, setmonthlyReturns] = useState(null);
  const [quarterlyReturns, setquarterlyReturns] = useState(null);
  
  return (
    <PortfolioContext.Provider
      value={{
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
        setTableData,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

