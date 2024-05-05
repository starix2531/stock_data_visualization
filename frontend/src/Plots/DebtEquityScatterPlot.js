// DebtEquityScatterPlot.js
import React, { useEffect } from "react";
import * as d3 from "d3";

const DebtEquityScatterPlot = ({ data, financialData }) => {
  useEffect(() => {
    if (data.length > 0) {
      renderDebtEquityScatterPlot();
    }
  }, [data, financialData]);

  const renderDebtEquityScatterPlot = () => {
    // Clear existing chart
    d3.select("#debt-equity-scatter-plot").selectAll("*").remove();

    // Set up dimensions and margins
    const margin = { top: 30, right: 20, bottom: 40, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3
      .select("#debt-equity-scatter-plot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scalePoint().range([0, width]).padding(0.5);
    const y = d3.scaleLinear().range([height, 0]);

    // Set domains
    x.domain(data.map((d) => d.ticker));
    y.domain([0, d3.max(data, (d) => financialData[d.ticker].total_debt_to_equity)]).nice();

    // Add x-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    // Add y-axis
    svg.append("g").call(d3.axisLeft(y));

    // Add grid lines
    svg
      .append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).tickSize(-width).tickFormat(""));

    // Add data points
    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.ticker))
      .attr("cy", (d) => y(financialData[d.ticker].total_debt_to_equity))
      .attr("r", 6)
      .style("fill", "#69b3a2")
      .style("opacity", 0.7)
      .attr("stroke", "black")
      .style("stroke-width", "1px");

    // Add labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -height / 2)
      .attr("dy", "1em")
      .attr("text-anchor", "middle")
      .text("Debt to Equity Ratio");

    // Add tooltip
    const tooltip = d3
      .select("#debt-equity-scatter-plot")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    svg
      .selectAll("circle")
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `Ticker: ${d.ticker}<br/>Debt to Equity Ratio: ${financialData[d.ticker].total_debt_to_equity.toFixed(2)}`
          )
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      });
  };

  return <div id="debt-equity-scatter-plot"></div>;
};

export default DebtEquityScatterPlot;