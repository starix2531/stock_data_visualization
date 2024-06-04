import React, { createContext, useState } from 'react';

export const EfficientFrontierContext = createContext();

export const EfficientFrontierProvider = ({ children }) => {
    const [selectedPortfolios, setSelectedPortfolio] = useState(null);
    const [selectedTickers, setSelectedTickers] = useState(null);
    const [selectTicker1, setSelectTicker1] = useState("false");
    const [selectTicker2, setSelectTicker2] = useState("false");
    const [timePeriod, setTimePeriod] = useState(null);
    const [plotData, setPlotData] = useState(null);
    const [tableData, setTableData] = useState(null);

  return (
    <EfficientFrontierContext.Provider
      value={{
        selectedPortfolios,
        setSelectedPortfolio,
        selectedTickers,
        setSelectedTickers,
        selectTicker1,
        setSelectTicker1,
        selectTicker2,
        setSelectTicker2,
        timePeriod,
        setTimePeriod,
        plotData,
        setPlotData,
      }}
    >
      {children}
    </EfficientFrontierContext.Provider>
  );
};
