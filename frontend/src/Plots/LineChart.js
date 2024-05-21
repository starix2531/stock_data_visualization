// LineChart.js
import React, { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";

const LineChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (data.length > 0) {
      renderChart();
    }
  }, [data]);

  const renderChart = () => {
    const options = {
      chart: {
        height: 500,
        width: "100%",
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
          autoSelected: "zoom", // Set the default selected tool to zoom
          position: "bottom", // Position the toolbar at the bottom
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
      },
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
      series: data.map((result) => ({
        name: result.ticker,
        data: result.data.map((d) => d.Close),
      })),
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "left", // Align the legend to the left
        offsetX: 40,
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
      },
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        categories: data[0].data.map((d) => d.Date),
        labels: {
          show: true,
          style: {
            fontFamily: "Inter, sans-serif",
            cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
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
        },
        title: {
          text: "Price",
          style: {
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
          },
        },
      },
    };

    if (chartRef.current) {
      const chart = new ApexCharts(chartRef.current, options);
      chart.render();
    }
  };

  return <div ref={chartRef} style={{ height: "500px", width: "100%" }}></div>;
};

export default LineChart;