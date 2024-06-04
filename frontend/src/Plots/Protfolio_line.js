// LineChart.js
import React, { useEffect, useRef, useState } from "react";
import ApexCharts from "apexcharts";

const LineChart = ({ data }) => {
  const chartRef = useRef(null);
  const [chartType, setChartType] = useState("equity");

  useEffect(() => {
    if (data.length > 0) {
      renderChart();
    }
  }, [data, chartType]);

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
      series: [
        {
          name: chartType === "equity" ? "Equity" : "Return",
          data: data.map((d) => ({
            x: d.Date,
            y: d[chartType],
          })),
        },
      ],
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
        type: "datetime",
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
          text: chartType === "equity" ? "Equity" : "Return",
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

  const handleChartToggle = () => {
    setChartType((prevType) => (prevType === "equity" ? "Return" : "equity"));
  };

  return (
    <div>
      <div ref={chartRef} style={{ height: "500px", width: "100%" }}></div>
      <button onClick={handleChartToggle}>
        Toggle Chart: {chartType === "equity" ? "Equity" : "Return"}
      </button>
    </div>
  );
};

export default LineChart;