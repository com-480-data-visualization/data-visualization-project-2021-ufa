import * as d3 from 'd3';
import { color, heightChart, margin, widthChart } from './common';

export const SIMILARITY_BAR_N = 5;

export const barPlot = (dataBar = []) => {

  d3.select('#similar-bar').select('svg').remove();

  let svgBar = d3.select('#similar-bar')
    .append('svg')
    .attr('viewBox', [0, 0, widthChart + margin.left + margin.right, heightChart + margin.top + margin.bottom].join(' '))
    .attr('class', 'max-w-full max-h-full')
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  // X axis
  let x = d3.scaleBand()
    .range([0, widthChart])
    .domain(dataBar.map(d => d.id))
    .padding(0.2);
  svgBar.append('g')
    .attr('transform', 'translate(0,' + heightChart + ')')
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('transform', 'translate(-10,0)rotate(-45)')
    .style('text-anchor', 'end');

  // Add Y axis
  let y = d3.scaleLinear()
    .domain([0, 100])
    .range([heightChart, 0]);
  svgBar.append('g')
    .call(d3.axisLeft(y));

  // Bars
  svgBar.selectAll('mybar')
    .data(dataBar)
    .enter()
    .append('rect')
    .attr('x', d => x(d.id))
    .attr('width', x.bandwidth())
    .attr('fill', color)
  // no bar at the beginning thus:
    .attr('height', () => heightChart - y(0)) // always equal to 0
    .attr('y', () =>  y(0));

  const hundred = 100;

  // Animation
  svgBar.selectAll('rect')
    .transition()
    .duration(200)
    .attr('y', d => y(d.weightRatio * hundred))
    .attr('height', d => heightChart - y(d.weightRatio * hundred))
    .delay((d, i) => (i * 50));

};
