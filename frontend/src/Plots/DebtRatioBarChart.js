// DebtRatioBarChart.js
import React, { useEffect } from "react";
import * as d3 from "d3";

const DebtRatioBarChart = ({ data, financialData }) => {
  useEffect(() => {
    if (data.length > 0) {
      renderDebtRatioBarChart();
    }
  }, [financialData]);

  const renderDebtRatioBarChart = () => {
    // Clear existing chart
    d3.select("#debt-ratio-bar-chart").selectAll("*").remove();

    // Set up dimensions and margins
    const margin = { top: 30, right: 20, bottom: 40, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3
      .select("#debt-ratio-bar-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleBand().range([0, width]).padding(0.2);
    const y = d3.scaleLinear().range([height, 0]);

    // Set domains
    x.domain(data.map((d) => d.ticker));
    y.domain([
      0,
      d3.max(data, (d) => Math.max(financialData[d.ticker].debt_ratio, financialData[d.ticker].total_debt_to_equity)),
    ]).nice();

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
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width)
          .tickFormat("")
      );

    // Add bars for debt ratio
    svg
      .selectAll(".bar-debt-ratio")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar-debt-ratio")
      .attr("x", (d) => x(d.ticker))
      .attr("width", x.bandwidth() / 2)
      .attr("y", (d) => y(financialData[d.ticker].debt_ratio))
      .attr("height", (d) => height - y(financialData[d.ticker].debt_ratio))
      .style("fill", "#69b3a2")
      .style("opacity", 0.8);

    // Add bars for total debt-to-equity ratio
    svg
      .selectAll(".bar-total-cash-to-debt")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar-total-cash-to-debt")
      .attr("x", (d) => x(d.ticker) + x.bandwidth() / 2)
      .attr("width", x.bandwidth() / 2)
      .attr("y", (d) => y(financialData[d.ticker].total_cash_to_debt))
      .attr("height", (d) => height - y(financialData[d.ticker].total_cash_to_debt))
      .style("fill", "#4e79a7")
      .style("opacity", 0.8);

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
      .text("Debt Ratio");

    // Add legend
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 120}, 10)`);

    legend
      .append("rect")
      .attr("x", 0)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", "#69b3a2");

    legend
      .append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .text("Debt Ratio");

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 20)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", "#4e79a7");

    legend
      .append("text")
      .attr("x", 24)
      .attr("y", 29)
      .attr("dy", ".35em")
      .text("Total cash to debt");

    // Add tooltip
    const tooltip = d3.select("#debt-ratio-bar-chart").append("div").attr("class", "tooltip").style("opacity", 0);

    svg
      .selectAll(".bar-debt-ratio, .bar-total-debt-to-equity")
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `Ticker: ${d.ticker}<br/>Debt Ratio: ${financialData[d.ticker].debt_ratio.toFixed(
              2
            )}<br/>Total cash to debt: ${financialData[d.ticker].total_cash_to_debt.toFixed(2)}`
          )
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      });
  };

  return <div id="debt-ratio-bar-chart"></div>;
};

export default DebtRatioBarChart;