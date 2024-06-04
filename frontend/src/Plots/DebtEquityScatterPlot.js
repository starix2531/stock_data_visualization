import React, { useRef, useEffect } from "react";
import ApexCharts from "apexcharts";

const DebtEquityBarChart = ({ data, financialData }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (data.length > 0) {
      renderDebtEquityBarChart();
    }
  }, [data, financialData]);

  const renderDebtEquityBarChart = () => {
    const chartData = data.map((d) => ({
      x: d.ticker,
      y: financialData[d.ticker].total_debt_to_equity,
    }));

    const options = {
      chart: {
        type: "bar",
        zoom: {
          enabled: true,
        },
      },
      xaxis: {
        type: "category",
        labels: {
          rotate: -45,
          style: {
            fontSize: "12px",
            fontFamily: "Helvetica, Arial, sans-serif",
          },
        },
      },
      yaxis: {
        title: {
          text: "Debt to Equity Ratio",
        },
      },
      tooltip: {
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          const ticker = w.globals.labels[dataPointIndex];
          const debtToEquity = series[seriesIndex][dataPointIndex];
          return `<div>Ticker: ${ticker}<br/>Debt to Equity Ratio: ${debtToEquity.toFixed(2)}</div>`;
        },
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -25,
        offsetX: -5,
      },
    };

    const series = [
      {
        name: "Debt to Equity Ratio",
        data: chartData,
      },
    ];

    const chart = new ApexCharts(chartRef.current, {
      chart: {
        type: "bar",
        height: 400,
      },
      series: series,
      ...options,
    });

    chart.render();
  };

  return <div ref={chartRef}></div>;
};

export default DebtEquityBarChart;
