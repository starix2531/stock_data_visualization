import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import "./Dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [tickers, setTickers] = useState(["AAPL", "GOOGL", "MSFT", "", ""]);
  const [financialData, setFinancialData] = useState({});
  useEffect(() => {
    if (data.length > 0) {
      renderChart();
    }
  }, [data]);

  const fetchData = async () => {
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    const promises = tickers.map(async (ticker) => {
      if (ticker) {
        const url = `http://127.0.0.1:5000/api/stock_data?ticker=${ticker}&start_date=${startDate}&end_date=${endDate}`;
        const response = await fetch(url);
        const jsonData = await response.json();
        return { ticker, data: jsonData };
      }
      return null;
    });
    try {
      const results = await Promise.all(promises);
      const filteredResults = results.filter((result) => result !== null);
      setData(filteredResults);

      // Fetch financial data for each ticker
      const financialDataPromises = filteredResults.map(async (result) => {
        const url = `http://127.0.0.1:5000/api/financial_info?ticker=${result.ticker}`;
        const response = await fetch(url);
        const jsonData = await response.json();
        return { ticker: result.ticker, data: jsonData };
      });

      const financialDataResults = await Promise.all(financialDataPromises);
      const financialDataMap = financialDataResults.reduce((acc, result) => {
        acc[result.ticker] = result.data;
        return acc;
      }, {});
      setFinancialData(financialDataMap);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const renderChart = () => {
    // Remove existing chart elements
    d3.select("#chart").selectAll("*").remove();

    // Create the line chart using D3.js
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const parseDate = d3.timeParse("%Y-%m-%d");

    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    const line = d3
      .line()
      .x((d) => x(d.Date))
      .y((d) => y(d.Close));

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    data.forEach((result) => {
      result.data.forEach((d) => {
        d.Date = parseDate(d.Date);
        d.Close = +d.Close;
      });
    });

    const allData = data.reduce((acc, result) => [...acc, ...result.data], []);

    x.domain(d3.extent(allData, (d) => d.Date));
    y.domain([0, d3.max(allData, (d) => d.Close)]);

    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
    svg.append("g").call(d3.axisLeft(y));

    data.forEach((result, i) => {
      svg
        .append("path")
        .datum(result.data)
        .attr("fill", "none")
        .attr("stroke", color(i))
        .attr("stroke-width", 1.5)
        .attr("d", line);
    });

    // Add legend
    const legend = svg
      .selectAll(".legend")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend
      .append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", (d, i) => color(i));

    legend
      .append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text((d) => d.ticker);
        // Add price details on hover
    const focus = svg.append("g").attr("class", "focus").style("display", "none");

    focus.append("circle").attr("r", 4.5);

    focus.append("text").attr("x", 9).attr("dy", ".35em");

    svg
      .append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", () => focus.style("display", null))
      .on("mouseout", () => focus.style("display", "none"))
      .on("mousemove", mousemove);


    // Add zooming functionality
    const zoom = d3
      .zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", zoomed);

    svg.call(zoom);

    function zoomed(event) {
      const xz = event.transform.rescaleX(x);
      svg.select(".x-axis").call(d3.axisBottom(xz));
      svg.select(".vertical-line").attr("transform", event.transform);
      data.forEach((result, i) => {
        svg.select(`path[stroke="${color(i)}"]`).attr("d", line.x((d) => xz(d.Date)));
      });
    }

    const verticalLine = svg.append("line").attr("class", "vertical-line").style("display", "none");

    const tooltip = d3.select(".dashboard").append("div").attr("class", "tooltip").style("display", "none");

    svg
      .append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", () => {
        verticalLine.style("display", null);
        tooltip.style("display", null);
      })
      .on("mouseout", () => {
        verticalLine.style("display", "none");
        tooltip.style("display", "none");
      })
      .on("mousemove", mousemove);

    function mousemove(event) {
      const x0 = x.invert(d3.pointer(event)[0]);
      const prices = data.map((result) => {
        const i = d3.bisector((d) => d.Date).left(result.data, x0, 1);
        const d0 = result.data[i - 1];
        const d1 = result.data[i];
        return x0 - d0.Date > d1.Date - x0 ? d1 : d0;
      });

      verticalLine
        .attr("x1", x(prices[0].Date))
        .attr("y1", 0)
        .attr("x2", x(prices[0].Date))
        .attr("y2", height);

      tooltip.html(
        `Date: ${prices[0].Date.toLocaleDateString()}<br/>` +
          prices.map((price, i) => `${data[i].ticker}: $${price.Close.toFixed(2)}`).join("<br/>")
      );

      const tooltipWidth = tooltip.node().getBoundingClientRect().width;
      const tooltipHeight = tooltip.node().getBoundingClientRect().height;
      const tooltipX = event.pageX  - tooltipWidth*6.5;
      const tooltipY = event.pageY/2 - tooltipHeight*1.5;

      tooltip.style("transform", `translate(${tooltipX}px, ${tooltipY}px)`);
    }
  }
  const handleTickerChange = (index, value) => {
    const newTickers = [...tickers];
    newTickers[index] = value;
    setTickers(newTickers);
  };

  return (
    <div className="dashboard">
      <h1>Stock Price Visualization</h1>
      <div className="input-container">
        {tickers.map((ticker, index) => (
          <div key={index} className="ticker-input">
            <label htmlFor={`ticker-${index}`}>Ticker {index + 1}:</label>
            <input
              type="text"
              id={`ticker-${index}`}
              value={ticker}
              onChange={(e) => handleTickerChange(index, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div className="date-input-container">
        <div className="date-input">
          <label htmlFor="startDate">Start Date:</label>
          <input type="date" id="startDate" />
        </div>
        <div className="date-input">
          <label htmlFor="endDate">End Date:</label>
          <input type="date" id="endDate" />
        </div>
      </div>
      <button onClick={fetchData}>Fetch Data</button>
      <div id="chart"></div>
      <div id="chart"></div>
      <div className="financial-info-container">
        {data.map((result) => (
          <div key={result.ticker} className="financial-info">
            <h3>{result.ticker}</h3>
            {financialData[result.ticker] ? (
              <div>
                <p>Market Cap: {financialData[result.ticker].market_cap}</p>
                <p>P/E Ratio: {financialData[result.ticker].price_to_earnings_ratio}</p>
                <p>P/B Ratio: {financialData[result.ticker].price_to_book_ratio}</p>
                <p>EPS: {financialData[result.ticker].earnings_per_share}</p>
                {/* Display other financial information as needed */}
              </div>
            ) : (
              <p>Loading financial data...</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;