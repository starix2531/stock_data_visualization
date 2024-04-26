// EPSBarChart.js
import React, { useEffect } from "react";
import * as d3 from "d3";

const EPSBarChart = ({ data, financialData }) => {
    useEffect(() => {
      if (data.length > 0) {
        renderEPSBarChart();
      }
    }, [financialData]);

    const renderEPSBarChart = () => {
        // ... (move the earnings per share bar chart rendering code here)
            // Clear existing chart
    d3.select("#eps-bar-chart").selectAll("*").remove();
  
    // Set up dimensions and margins
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
  
    // Create SVG element
    const svg = d3
      .select("#eps-bar-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // Create scales
    const x = d3.scaleBand().range([0, width]).padding(0.1);
    const y = d3.scaleLinear().range([height, 0]);
  
    // Set domains
    x.domain(data.map((d) => d.ticker));
    y.domain([0, d3.max(data, (d) => financialData[d.ticker].earnings_per_share)]);
  
    // Add x-axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
  
    // Add y-axis
    svg.append("g")
      .call(d3.axisLeft(y));
  
    // Add bars
    svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.ticker))
      .attr("width", x.bandwidth())
      .attr("y", (d) => y(financialData[d.ticker].earnings_per_share))
      .attr("height", (d) => height - y(financialData[d.ticker].earnings_per_share))
      .style("fill", "steelblue");
  
    // Add tooltip
    const tooltip = d3.select("#eps-bar-chart")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
  
    svg.selectAll(".bar")
      .on("mouseover", (event, d) => {
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip.html(`Ticker: ${d.ticker}<br/>Earnings Per Share: ${financialData[d.ticker].earnings_per_share}`)
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", () => {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
    };

    return <div id="eps-bar-chart"></div>;
    };

export default EPSBarChart;