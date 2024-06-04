import React, { useRef, useEffect } from "react";
import ApexCharts from "apexcharts";

const EPSBarChart = ({ data, financialData }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (data.length > 0) {
      renderEPSBarChart();
    }
  }, [data, financialData]);

  const renderEPSBarChart = () => {
    const EarningsPerShare = data.map((d) => ({
      x: d.ticker,
      y: financialData[d.ticker].revenue_per_share,
    }));

    const PriceToEarningsRatio = data.map((d) => ({
      x: d.ticker,
      y: financialData[d.ticker].price_to_earnings_ratio,
    }));

    const options = {
      chart: {
        type: "bar",
        zoom: {
          enabled: true,
        },
        toolbar: {
          show: true
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "50%",
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
          text: "Earnings Per Share",
        },
      },
      tooltip: {
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
        colors: ['#80f1cb','#008FFB'],
      },
    };

    const series = [
      {
        name: "Earnings Per Share",
        data: EarningsPerShare,
      },
      {
        name: "Price to Earnings Ratio",
        data: PriceToEarningsRatio,
      }
    ];

    const chart = new ApexCharts(chartRef.current, {
      series: series,
      ...options,
    });

    chart.render();
  };

  return <div ref={chartRef}></div>;
};

export default EPSBarChart;
