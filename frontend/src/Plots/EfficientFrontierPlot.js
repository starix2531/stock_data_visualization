import React, { useEffect, useRef, useState, useContext } from "react";
import ApexCharts from "apexcharts";
import { Autocomplete, TextField, Chip } from '@mui/material';
import { EfficientFrontierContext } from "./EfficientFrontierContext";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong. Please try again later.</h2>;
    }

    return this.props.children;
  }
}

const EfficientFrontierPlot = ({ portfolios, tickerOptions, currentUserId, tableData, setTableData }) => {
  const { selectedPortfolios, setSelectedPortfolio, selectedTickers, setSelectedTickers, selectTicker1, setSelectTicker1, selectTicker2, setSelectTicker2, timePeriod, setTimePeriod, plotData, setPlotData } = useContext(EfficientFrontierContext);

  const chartRef = useRef(null);
  const timeRange = ["1 Day", "1 Week", "1 Month", "3 Months", "6 Months"];
  const options = [...(Array.isArray(tickerOptions) ? tickerOptions : []), ...(Array.isArray(portfolios) ? portfolios : [])];

  const handleTickersChange = (e, value) => {
    const selectedOption = value;
    if (typeof selectedOption === "string") {
      setSelectedTickers(selectedOption);
      setSelectTicker2("true");
    } else {
      setSelectedTickers(selectedOption);
      setSelectTicker2("false");
    }
  };

  const handlePortfolioChange = (e, value) => {
    const selectedOption = value;
    if (typeof selectedOption === "string") {
      setSelectedPortfolio(selectedOption);
      setSelectTicker1("true");
    } else {
      setSelectedPortfolio(selectedOption);
      setSelectTicker1("false");
    }
  };

  const handlePlotClick = async () => {
    try {
      let portfolioWeight1, portfolioWeight2;
      if (selectTicker1 === "false") {
        portfolioWeight1 = selectedPortfolios.id;
      } else {
        portfolioWeight1 = selectedPortfolios;
      }

      if (selectTicker2 === "false") {
        portfolioWeight2 = selectedTickers.id;
      } else {
        portfolioWeight2 = selectedTickers;
      }
      const url = `https://efficient-frontier-niayqkcaza-uw.a.run.app/api/portfolio_fronties?portfolio_weight_1=${portfolioWeight1}&portfolio_weight_2=${portfolioWeight2}&future_time=${timePeriod}&user_id=${currentUserId}&type1=${selectTicker1}&type2=${selectTicker2}`;
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);
      setPlotData(data);
      const min_x_index = data.x.indexOf(Math.min(...data.x));
      const tangent_index = data.sharpe_ratios.indexOf(Math.max(...data.sharpe_ratios));
      setTableData([{
        Risk: data.x[min_x_index],
        Return: data.y[min_x_index],
        SharpeRatio: data.sharpe_ratios[min_x_index],
        Weights1: data.weights_1[min_x_index],
        Weights2: data.weights_2[min_x_index],
      },
      {
        Risk: data.x[tangent_index],
        Return: data.y[tangent_index],
        SharpeRatio: data.max_sharpe_return,
        Weights1: data.tangent_weights[0],
        Weights2: data.tangent_weights[1],
      }]);
    } catch (error) {
      console.error('Error fetching efficient frontier data:', error);
    }
  };

  useEffect(() => {
    if (plotData && plotData.x && plotData.y) {
      renderChart();
    }
  }, [plotData]);

  const renderChart = () => {
    const options = {
      chart: {
        height: 400,
        width: "90%",
        type: "line",
        fontFamily: "Inter, sans-serif",
        dropShadow: {
          enabled: false,
        },
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
          autoSelected: "zoom",
          position: "bottom",
          offsetX: 0,
          offsetY: 0,
        },
        zoom: {
          enabled: true,
          type: "x",
          autoScaleYaxis: true,
        },
      },
      tooltip: {
        enabled: true,
        x: {
          show: true,
          formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
            const weightX = plotData.weights_1 && plotData.weights_1[dataPointIndex] !== undefined ? plotData.weights_1[dataPointIndex].toFixed(2) : 'N/A';
            const weightY = plotData.weights_2 && plotData.weights_2[dataPointIndex] !== undefined ? plotData.weights_2[dataPointIndex].toFixed(2) : 'N/A';
            const sharpeRatio = plotData.sharpe_ratios && plotData.sharpe_ratios[dataPointIndex] !== undefined ? plotData.sharpe_ratios[dataPointIndex].toFixed(2) : 'N/A';
            return `Risk: ${value.toFixed(2)}<br>Weight 1: ${weightX}<br>Weight 2: ${weightY}<br>Sharpe Ratio: ${sharpeRatio}`;
          }
        },
        y: {
          formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
            return `Return: ${value.toFixed(2)}`;
          }
        }
      },
      series: [
        {
          name: "Efficient Frontier",
          data: plotData.y.map((y, i) => ({
            x: plotData.x[i],
            y: y
          }))
        },
      ],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 6,
      },
      grid: {
        show: true,
        strokeDashArray: 4,
        padding: {
          left: 2,
          right: 2,
          top: -26,
        },
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "left",
        offsetX: 40,
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
      },
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        categories: plotData.x,
        labels: {
          show: true,
          style: {
            fontFamily: "Inter, sans-serif",
            cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
          },
          min: 0,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        title: {
          text: "Risk",
          style: {
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
          },
        },
        tickAmount: 5,
      },
      yaxis: {
        show: true,
        labels: {
          show: true,
          style: {
            fontFamily: "Inter, sans-serif",
            cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
          },
          formatter: function (value) {
            return value.toFixed(2);
          },
        },
        title: {
          text: "Return",
          style: {
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
          },
        },
      },
    };

    const chart = new ApexCharts(chartRef.current, options);
    chart.render();
  };

  return (
    <ErrorBoundary>
      <div style={{ position: "relative", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem" }}>
          <h2 className="text-2xl font-semibold">Efficient Frontier</h2>
          <Autocomplete
            options={options}
            getOptionLabel={(option) => option.name || option}
            renderInput={(params) => <TextField {...params} label="Portfolio" />}
            onChange={handlePortfolioChange}
            value={selectedPortfolios}
            size="small"
            style={{ width: "150px" }}
          />
          <Autocomplete
            options={options}
            getOptionLabel={(option) => option.name || option}
            renderInput={(params) => <TextField {...params} label="Portfolio" />}
            onChange={handleTickersChange}
            value={selectedTickers}
            size="small"
            style={{ width: "150px" }}
          />
          <Autocomplete
            options={timeRange}
            getOptionLabel={(timeRange) => timeRange.name || timeRange}
            renderInput={(params) => <TextField {...params} label="Time Period" />}
            onChange={(e, value) => setTimePeriod(value)}
            value={timePeriod}
            size="small"
            style={{ width: "150px" }}
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            onClick={handlePlotClick}
          >
            Plot
          </button>
        </div>
        <div className="overflow-y-auto flex items-center justify-center">
          {plotData && plotData.x && plotData.y && (
            <div ref={chartRef} className="h-full w-full"></div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default EfficientFrontierPlot;
