import React, { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";

const PieChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if ( data && data.length > 0) {
      renderChart();
    }
  }, [data]);

  const generateColors = (count) => {
    const colors = [];
    const hueStep = 360 / count;

    for (let i = 0; i < count; i++) {
      const hue = i * hueStep;
      const color = `hsl(${hue}, 70%, 50%)`;
      colors.push(color);
    }

    return colors;
  };

  const formatValue = (value) => {
    const numericValue = Number(value);
    return isNaN(numericValue) ? value : numericValue.toFixed(2) + "%";
  };

  const renderChart = () => {
    const series = data.map((item) => item.current_weight * 100);
    const labels = data.map((item) => item.ticker);
    const colors = generateColors(data.length);
    const totalEquity = data.reduce((sum, item) => sum + item.current_equity, 0);

    const options = {
      series: series,
      colors: colors,
      chart: {
        height: 320,
        width: "100%",
        type: "donut",
      },
      stroke: {
        colors: ["transparent"],
        lineCap: "",
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              name: {
                show: true,
                fontFamily: "Inter, sans-serif",
                offsetY: 20,
              },
              total: {
                showAlways: true,
                show: true,
                label: "Total Equity",
                fontFamily: "Inter, sans-serif",
                formatter: function () {
                  return '$' + totalEquity.toFixed(2);
                },
              },
              value: {
                show: true,
                fontFamily: "Inter, sans-serif",
                offsetY: -20,
                formatter: function (value) {
                  return formatValue(value);
                },
              },
            },
            size: data.length === 1 ? "50%" : "80%",
          },
        },
      },
      grid: {
        padding: {
          top: -2,
        },
      },
      labels: labels,
      dataLabels: {
        enabled: false,
      },
      legend: {
        position: "bottom",
        fontFamily: "Inter, sans-serif",
      },
      yaxis: {
        labels: {
          formatter: function (value) {
            return formatValue(value);
          },
        },
      },
      xaxis: {
        labels: {
          formatter: function (value) {
            return value;
          },
        },
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
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

export default PieChart;
