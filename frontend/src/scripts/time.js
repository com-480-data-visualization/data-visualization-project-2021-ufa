import * as d3 from 'd3';
import { heightChart, margin, widthChart } from './common';

export const linePlot = (dataLine = [], lineColor = '') => {

  d3.select('#published-line').select('svg').remove();

  let line = d3.line()
    .defined(d => !isNaN(d.value))
    .x(d => x(d.date))
    .y(d => y(d.value) + margin.top);


  let yAxis = g => g
    .attr('transform', `translate(${margin.left},${margin.top})`)
    .call(d3.axisLeft(y))
    //.call(g => g.select(".domain").remove())
    .call(g => g.select('.tick:last-of-type text').clone()
      .attr('x', 3)
      .attr('text-anchor', 'start')
      .attr('font-weight', 'bold')
      .text(dataLine.y));

  let xAxis = g => g
    .attr('transform', `translate(0,${heightChart + margin.top})`)
    .call(d3.axisBottom(x).ticks(widthChart / 80));

  let y = d3.scaleLinear()
    .domain([0, d3.max(dataLine, d => d.value)]).nice()
    .range([heightChart, 0]);

  let x = d3.scaleTime()
    .domain(d3.extent(dataLine, d => d.date))
    .range([margin.left, widthChart + margin.left]);


  const svg = d3.select('#published-line')
    .append('svg')
    .attr('viewBox', [0, 0, widthChart + margin.left + margin.right, heightChart + margin.top + margin.bottom].join(' '))
    .attr('class', 'max-w-full max-h-full');

  svg.append('g')
    .call(xAxis);

  svg.append('text')
    .attr('transform', 'translate(' + (widthChart / 2 + margin.left) + ' , ' + (heightChart + margin.top + margin.bottom / 2) + ')')
    .style('text-anchor', 'middle')
    .style('font-weight', 'bold')
    .style('font-size', '70%')
    .text('date');

  svg.append('g')
    .call(yAxis);

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', 0 - (heightChart / 2))
    .attr('y', 0)
    .style('font-weight', 'bold')
    .style('font-size', '70%')
    .style('text-anchor', 'middle')
    .text('#papers');

  let path = svg.append('path')
    .datum(dataLine)
    .attr('fill', 'none')
    .attr('stroke', lineColor)
    .attr('stroke-width', 1.5)
    .attr('d', line);


  let totalLength = path.node().getTotalLength();

  path.attr('stroke-dasharray', totalLength)
    .attr('stroke-dashoffset', totalLength)
    .transition()
    .duration(500)
    .attr('stroke-dashoffset', 0);

  d3.select('#published-line').node().append(svg.node());
};
