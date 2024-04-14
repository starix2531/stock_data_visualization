import React from "react";
import * as d3 from "d3";
import "./Dashboard.css";

const Dashboard = () => {
  const fetchData = () => {
    const ticker = document.getElementById("ticker").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    const url = `/api/stock_data?ticker=${ticker}&start_date=${startDate}&end_date=${endDate}`;

    d3.json(url).then((data) => {
      // Process the fetched data and create the visualization
      // Here, we are creating a line chart
      
      // using D3.js
      // ...

      // Example code to create a line chart
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
      data.forEach((d) => {
        d.Date = parseDate(d.Date);
        d.Close = +d.Close;
      });

      const x = d3
        .scaleTime()
        .domain(d3.extent(data, (d) => d.Date))
        .range([0, width]);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.Close)])
        .range([height, 0]);

      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

      svg.append("g").call(d3.axisLeft(y));

      svg
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr(
          "d",
          d3
            .line()
            .x((d) => x(d.Date))
            .y((d) => y(d.Close))
        );
    });
  };

  return (
    <div>
      <h1>Stock Price Visualization</h1>

      <label htmlFor="ticker">Select Ticker:</label>
      <select id="ticker">
        <option value="AAPL">AAPL</option>
        <option value="GOOGL">GOOGL</option>
        <option value="MSFT">MSFT</option>
        {/* Add more options for available tickers */}
      </select>

      <label htmlFor="startDate">Start Date:</label>
      <input type="date" id="startDate" />

      <label htmlFor="endDate">End Date:</label>
      <input type="date" id="endDate" />

      <button onClick={fetchData}>Fetch Data</button>

      <div id="chart"></div>
    </div>
  );
};

export default Dashboard;
