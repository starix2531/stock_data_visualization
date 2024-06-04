import React, { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";

const LineChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (data.length > 0) {
      renderChart();
    }
  }, [data]);

  const renderChart = () => {
    const series = data.map((result) => ({
      name: result.ticker,
      data: result.data.map((d) => d.Close),
    }));


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
      series: series,
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "left",
        offsetX: 40,
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        onItemClick: {
          toggleDataSeries: false
        },
        onItemHover: {
          highlightDataSeries: true
        }
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

export default LineChart;