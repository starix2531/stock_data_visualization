import React, { useEffect, useRef, useState } from "react";
import ApexCharts from "apexcharts";

const LineChart = ({ data, weeklyData, monthlyData, quarterlyData }) => {
  const chartRef = useRef(null);
  const [chartType, setChartType] = useState("equity");
  const [chart, setChart] = useState(null);

  useEffect(() => {
    if ((data && data.length > 0 || weeklyData || monthlyData || quarterlyData) && !chart) {
      createChart();
    }
  }, [data, weeklyData, monthlyData, quarterlyData]);

  useEffect(() => {
    if (chart) {
      updateChart();
    }
  }, [chartType]);

  const formatReturnData = (returnData) => {
    return returnData
      ? Object.entries(returnData).map(([date, value]) => ({
          x: new Date(date),
          y: value
        }))
      : [];
  };

  const createChart = () => {
    const options = {
      fill: {
        type: "gradient",
        gradient: {
          opacityFrom: 0.55,
          opacityTo: 0,
          shade: "#1C64F2",
          gradientToColors: ["#1C64F2"],
        },
      },
      chart: {
        height: 500,
        width: "100%",
        type: chartType === "weekly" || chartType === "monthly" || chartType === "quarterly" ? "bar" : "area",
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
          show: false,
        },
        y: {
          formatter: function (value) {
            if (value === undefined) {
              return "";
            } else {
              return chartType === "equity" ? value.toFixed(2) : `${value.toFixed(2)}%`;
            }
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 3,
      },
      grid: {
        show: true,
        strokeDashArray: 4,
        padding: {
          left: 2,
          right: 2,
          top: 0,
        },
      },
      series: getSeries(),
      legend: {
        show: true,
        onItemClick: {
          toggleDataSeries: true
        },
        position: "top",
        horizontalAlign: "left",
        offsetX: 40,
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
      },
      xaxis: {
        type: "datetime",
        labels: {
          show: true,
          style: {
            fontFamily: "Inter, sans-serif",
            cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
          },
          formatter: function (value) {
            const date = new Date(value);
            return date.toLocaleDateString();
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        title: {
          text: "Date",
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
            return chartType === "equity" ? value.toFixed(2) : `${value.toFixed(2)}%`;
          },
        },
        title: {
          text: chartType === "equity" ? "Equity/Investment" : "Return",
          style: {
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
          },
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          opacityFrom: 0.55,
          opacityTo: 0,
          shade: "#1C64F2",
          gradientToColors: ["#1C64F2"],
        },
      }
    };

    if (chartRef.current) {
      const newChart = new ApexCharts(chartRef.current, options);
      newChart.render();
      setChart(newChart);
    }
  };

  const getSeries = () => {
    switch (chartType) {
      case "equity":
        return [
          {
            name: "Equity",
            data: data.map((d) => ({
              x: d.Date,
              y: d.equity,
            })),
          },
          {
            name: "Investment",
            data: data.map((d) => ({
              x: d.Date,
              y: d.investment,
            })),
          },
        ];
      case "Return":
        return [
          {
            name: "Return",
            data: data.map((d) => ({
              x: d.Date,
              y: d.Return,
            })),
          },
        ];
      case "Profit":
        return [
          {
            name: "Profit",
            data: data.map((d) => ({
              x: d.Date,
              y: d.equity - d.investment,
            })),
          },
        ];
      case "CashStock":
        return [
          {
            name: "Cash",
            data: data.map((d) => ({
              x: d.Date,
              y: d.cash,
            })),
          },
          {
            name: "Stock",
            data: data.map((d) => ({
              x: d.Date,
              y: d.equity - d.cash,
            })),
          },
        ];
      case "weekly":
        return [
          {
            name: "Weekly Return",
            data: formatReturnData(weeklyData),
          },
        ];
      case "monthly":
        return [
          {
            name: "Monthly Return",
            data: formatReturnData(monthlyData),
          },
        ];
      case "quarterly":
        return [
          {
            name: "Quarterly Return",
            data: formatReturnData(quarterlyData),
          },
        ];
      default:
        return [];
    }
  };

  const updateChart = () => {
    if (chart) {
      const updatedOptions = {
        chart: {
          type: chartType === "weekly" || chartType === "monthly" || chartType === "quarterly" ? "bar" : "area",
        },
        series: getSeries(),
        yaxis: {
          title: {
            text:
              chartType === "equity"
                ? "Equity/Investment"
                : chartType === "Return"
                ? "Return"
                : chartType === "Profit"
                ? "Profit"
                : chartType === "CashStock"
                ? "Cash vs Stock"
                : "Return",
          },
          labels: {
            formatter: function (value) {
              return chartType === "equity"
                ? value.toFixed(2)
                : chartType === "Return" || chartType === "weekly" || chartType === "monthly" || chartType === "quarterly"
                ? `${value.toFixed(2)}%`
                : value.toFixed(2);
            },
          },
        },
        tooltip: {
          y: {
            formatter: function (value) {
              if (value === undefined) {
                return "";
              } else {
                return chartType === "equity"
                  ? value.toFixed(2)
                  : chartType === "Return" || chartType === "weekly" || chartType === "monthly" || chartType === "quarterly"
                  ? `${value.toFixed(2)}%`
                  : value.toFixed(2);
              }
            },
          },
        },
        fill: {
          type: "gradient",
          gradient: {
            opacityFrom: 0.55,
            opacityTo: 0,
            shade: chartType === "Return" || chartType === "weekly" || chartType === "monthly" || chartType === "quarterly" ? "#15803d" : "#1C64F2",
            gradientToColors: [chartType === "Return" || chartType === "weekly" || chartType === "monthly" || chartType === "quarterly" ? "#15803d" : "#1C64F2"],
          },
        },
      };

      chart.updateOptions(updatedOptions);
    }
  };

  const handleChartToggle = (type) => {
    setChartType(type);
  };

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <div style={{ height: "25px" }}></div>
      <div className="mb-4 flex justify-start">
        <button
          onClick={() => handleChartToggle("equity")}
          className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800"
        >
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            Equity
          </span>
        </button>
        <button
          onClick={() => handleChartToggle("Return")}
          className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800"
        >
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            Return
          </span>
        </button>
        <button
          onClick={() => handleChartToggle("Profit")}
          className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800"
        >
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            Profit
          </span>
        </button>
        <button
          onClick={() => handleChartToggle("CashStock")}
          className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800"
        >
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            Cash vs Stock
          </span>
        </button>
        <button
          onClick={() => handleChartToggle("weekly")}
          className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800"
        >
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            Weekly
          </span>
        </button>
        <button
          onClick={() => handleChartToggle("monthly")}
          className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800"
        >
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            Monthly
          </span>
        </button>
        <button
          onClick={() => handleChartToggle("quarterly")}
          className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800"
        >
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            Quarterly
          </span>
        </button>
      </div>
      <div style={{ height: "35px" }}></div>
      <div ref={chartRef} style={{ height: "500px", width: "100%" }}></div>
    </div>
  );
};

export default LineChart;
