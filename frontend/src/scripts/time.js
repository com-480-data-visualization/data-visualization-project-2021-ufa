import * as d3 from 'd3';
import { heightChart, margin, widthChart } from './common';
/*
const statsOf = values => {
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.map(v => (v - mean)).map(x => x * x).reduce((a, b) => a + b, 0) / (n - 1);
  const deviation = Math.sqrt(variance);
  return { mean, variance, deviation };
};
*/
export class LinePlot {

  constructor() {
  }

  update(dataLine = [], lineColor = '') {

    console.log(dataLine);
    let mainLine = dataLine.length != 0 ? dataLine[0]['values'] : [];

    //const { mean, deviation } = statsOf(mainLine.map(o => o.value));

    d3.select('#published-line').select('svg').remove();

    this.svg = d3.select('#published-line')
      .append('svg')
      .attr('viewBox', [0, 0, widthChart + margin.left + margin.right, heightChart + margin.top + margin.bottom].join(' '))
      .attr('class', 'max-w-full max-h-full');

    this.svg.classed('opacity-20', !dataLine.length);

    let line = d3.line()
      .defined(d => !isNaN(d.value))
      .x(d => x(d.date))
      .y(d => y(d.value) + margin.top);

    let yAxis = g => g
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .call(d3.axisLeft(y))
      .call(g => g.select('.tick:last-of-type text')
        .clone()
        .attr('x', 3)
        .attr('text-anchor', 'start')
        .attr('font-weight', 'bold')
        .text(mainLine.y));

    let y = d3.scaleLinear()
      .domain([0, d3.max(dataLine, d => d3.max(d.values, l => l.value))]).nice()
      .range([heightChart, 0]);

    let x = d3.scaleTime()
      .domain(d3.extent(mainLine, d => d.date))
      .range([margin.left, widthChart + margin.left]);

    let xAxis = g => g
      .attr('transform', `translate(0,${heightChart + margin.top})`)
      .call(d3.axisBottom(x).ticks(widthChart / 80));

    this.svg.append('g')
      .call(xAxis);

    this.svg.append('text')
      .attr('transform', 'translate(' + (widthChart / 2 + margin.left) + ' , ' + (heightChart + margin.top + margin.bottom / 2) + ')')
      .style('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .style('font-size', '70%')
      .text('date');

    this.svg.append('g')
      .call(yAxis);

    this.svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', 0 - (heightChart / 2))
      .attr('y', 0)
      .style('font-weight', 'bold')
      .style('font-size', '70%')
      .style('text-anchor', 'middle')
      .text('#papers');

    this.svg
      .selectAll('.line')
      .append('g')
      .attr('class', 'line')
      .data(dataLine)
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', d => d['time'] != 'mean' ? lineColor : 'gray')
      .attr('stroke-width', 1.5)
      .attr('d', d => line(d['values']));
    //.attr('stroke-dasharray', xAxis.node().getTotalLength())
    //.attr('stroke-dashoffset', xAxis.node().getTotalLength())
    //.transition()
    //.duration(500)
    //.attr('stroke-dashoffset', 0);

    d3.select('#published-line').node().append(this.svg.node());


  }
}



