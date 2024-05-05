// LineChart.js
import React, { useEffect } from "react";
import * as d3 from "d3";

const LineChart = ({ data }) => {
  useEffect(() => {
    if (data.length > 0) {
      renderChart();
    }
  }, [data]);

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
      const tooltipX = event.pageX  - tooltipWidth - 550;
      const tooltipY = event.pageY/2 - tooltipHeight*1.5 - 2400;

      tooltip.style("transform", `translate(${tooltipX}px, ${tooltipY}px)`);
    }
  };

  return <div id="chart"></div>;
};

export default LineChart;