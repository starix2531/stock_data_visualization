import React, { useRef, useEffect } from "react";
import ApexCharts from "apexcharts";

const DebtRatioBarChart = ({ data, financialData }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (data.length > 0) {
      renderDebtRatioBarChart();
    }
  }, [data, financialData]);

  const renderDebtRatioBarChart = () => {
    const chartDataDebtRatio = data.map((d) => ({
      x: d.ticker,
      y: financialData[d.ticker].debt_ratio,
    }));

    const chartDataTotalCashToDebt = data.map((d) => ({
      x: d.ticker,
      y: financialData[d.ticker].total_cash_to_debt,
    }));

    const options = {
      chart: {
        type: "bar",
        zoom: {
          enabled: true,
        },
        toolbar: {
          show: true,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "45%",
          endingShape: "rounded",
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: data.map((d) => d.ticker),
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
          text: "Ratio",
        },
      },
      grid: {
        borderColor: '#e7e7e7',
        strokeDashArray: 5,
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function (val) {
            return val.toFixed(2);
          },
        },
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "right",
        floating: true,
        offsetY: -25,
        offsetX: -5,
      },
      fill: {
        opacity: 0.8,
      },
      colors: ['#80c7fd', '#00E396'],
    };

    const series = [
      {
        name: "Debt Ratio",
        data: chartDataDebtRatio,
      },
      {
        name: "Total Cash to Debt",
        data: chartDataTotalCashToDebt,
      },
    ];

    const chart = new ApexCharts(chartRef.current, {
      series: series,
      ...options,
    });

    chart.render();
  };

  return <div ref={chartRef}></div>;
};

export default DebtRatioBarChart;
