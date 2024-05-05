// SpotPlot.js
import React, { useEffect } from "react";
import * as d3 from "d3";

const SpotPlot = ({ data, financialData }) => {
  useEffect(() => {
    if (data.length > 0 && Object.keys(financialData).length === data.length) {
      renderChart();
    }
  }, [data, financialData]);

  const renderChart = () => {
    // Remove existing chart elements
    d3.select("#spot-plot").selectAll("*").remove();

    // Create the spot plot using D3.js
    const margin = { top: 30, right: 20, bottom: 40, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select("#spot-plot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales and axes
    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleBand().range([0, height]).padding(0.1);
    const size = d3.scaleLinear().range([5, 20]);

    const xAxis = d3.axisBottom(x).ticks(5);
    const yAxis = d3.axisLeft(y);

    x.domain([0, d3.max(data, (d) => financialData[d.ticker].price_to_earnings_ratio)]).nice();
    y.domain(data.map((d) => d.ticker));
    size.domain([0, d3.max(data, (d) => financialData[d.ticker].price_to_earnings_ratio)]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    svg.append("g").call(yAxis);

    // Render data points
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", (d) => size(financialData[d.ticker].price_to_earnings_ratio))
      .attr("cx", (d) => x(financialData[d.ticker].price_to_earnings_ratio))
      .attr("cy", (d) => y(d.ticker) + y.bandwidth() / 2)
      .style("fill", (d, i) => d3.color(color(i)).copy({ opacity: 0.7 }).formatRgb());

    // Add labels and tooltips
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .text("Price to Earnings Ratio");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -height / 2)
      .attr("dy", "1em")
      .attr("text-anchor", "middle");

    const tooltip = d3.select("#spot-plot").append("div").attr("class", "tooltip").style("opacity", 0);

    svg
      .selectAll(".dot")
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(`Ticker: ${d.ticker}<br/>P/E Ratio: ${financialData[d.ticker].price_to_earnings_ratio.toFixed(2)}`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      });
  };

  return <div id="spot-plot"></div>;
};

export default SpotPlot;