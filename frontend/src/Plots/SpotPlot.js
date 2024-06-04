import React, { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";

const SpotPlot = ({ data, financialData }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (data && data.length > 0 && Object.keys(financialData).length === data.length) {
      renderChart();
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, financialData]);

  const renderChart = () => {
    const generateRandomColor = () => {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };

    const spotData = data.map((d) => ({
      x: d.ticker,
      y: financialData[d.ticker].price_to_earnings_ratio,
      z: financialData[d.ticker].price_to_earnings_ratio, // z represents the size of the bubble
      fillColor: generateRandomColor()
    }));

    const options = {
      chart: {
        type: 'bubble',
        zoom: {
          enabled: true
        },
        toolbar: {
          show: true
        }
      },
      xaxis: {
        title: {
          text: 'Price to Earnings Ratio'
        },
        labels: {
          rotate: -45,
          style: {
            fontSize: "12px",
            fontFamily: "Helvetica, Arial, sans-serif",
          },
        }
      },
      yaxis: {
        categories: data.map((d) => d.ticker),
        title: {
          text: 'Ticker'
        }
      },
      tooltip: {
        custom: function({ series, seriesIndex, dataPointIndex, w }) {
          const d = data[dataPointIndex];
          const peRatio = financialData[d.ticker].price_to_earnings_ratio.toFixed(2);
          return `<div class="tooltip">
                    <strong>Ticker:</strong> ${d.ticker}<br/>
                    <strong>P/E Ratio:</strong> ${peRatio}
                  </div>`;
        }
      },
      dataLabels: {
        enabled: false
      },
      series: [{
        name: 'Price to Earnings Ratio',
        data: spotData,
      }],
      fill: {
        opacity: 0.8
      },
      plotOptions: {
        bubble: {
          minBubbleRadius: 5,
          maxBubbleRadius: 30
        }
      }
    };

    chartRef.current = new ApexCharts(document.querySelector("#spot-plot"), options);
    chartRef.current.render();
  };

  return <div id="spot-plot" ref={chartRef}></div>;
};

export default SpotPlot;
