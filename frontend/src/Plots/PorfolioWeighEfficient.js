import React, { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";

const BarChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    console.log("Bar data", data);
    if (data && data.length >= 2) {
      renderChart();
    }
  }, [data]);

  const renderChart = () => {
    const options = {
    series: [
        {
            name: "Max Sharp Ratio",
            color: "#31C48D",
            data: [
            data[1]?.Risk ?? 0,
            data[1]?.Return ?? 0,
            data[1]?.Weights1 ?? 0,
            data[1]?.Weights2 ?? 0,
            data[1]?.SharpeRatio ?? 0,
            ],
        },
        {
            name: "Min Risk",
            data: [
            data[0]?.Risk ?? 0,
            data[0]?.Return ?? 0,
            data[0]?.Weights1 ?? 0,
            data[0]?.Weights2 ?? 0,
            data[0]?.SharpeRatio ?? 0,
            ],
            color: "#F05252",
        },
        ],
      chart: {
        type: "bar",
        width: "100%",
        height: 400,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: "80%",
          borderRadius: 6,
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: ["Risk", "Return", "1st Weight", "2nd Weight", "Sharpe Ratio"],
        labels: {
          style: {
            fontFamily: "Inter, sans-serif",
            cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            fontFamily: "Inter, sans-serif",
            cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
          },
          formatter: function (value) {
            if (typeof value === 'number' && !isNaN(value)) {
              return value.toFixed(2);
            }
            return value;
          },
        },
      },
      grid: {
        show: true,
        strokeDashArray: 4,
        padding: {
          left: 2,
          right: 2,
          top: -20,
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        show: true,
        position: "bottom",
      },
      tooltip: {
        shared: true,
        intersect: false,
        x: {
          formatter: function (value) {
            return value;
          },
        },
        y: {
          formatter: function (value) {
            return value.toFixed(2);
          },
        },
      },
    };

    if (chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      const chart = new ApexCharts(chartRef.current, options);
      chart.render();
      chart.addEventListener("legendClick", (event, chartContext, config) => {
        const seriesName = config.seriesName;
        if (seriesName) {
          chart.toggleSeries(seriesName);
        }
      });
      chartInstanceRef.current = chart;
    }
  };

  return <div ref={chartRef} style={{ height: "500px", width: "100%" }}></div>;
};

export default BarChart;
