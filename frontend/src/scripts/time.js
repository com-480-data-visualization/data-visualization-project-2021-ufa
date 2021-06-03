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
    this.dataLine = [];
    this.lineColor = '';
    this.year = '';
  }

  setData(dataLine, lineColor, year) {
    this.dataLine = dataLine;
    this.lineColor = lineColor;
    this.year = year;
    this.update();
  }

  update() {

    let basedLine = [];
    if (this.dataLine.length === 2) {
      basedLine =  this.dataLine[1]['values'];
    } else if (this.dataLine.length === 1) {
      basedLine = this.dataLine[0]['values'];
    }

    //const { mean, deviation } = statsOf(this.dataLine.map(o => o.value));

    d3.select('#published-line').select('svg').remove();

    this.svg = d3.select('#published-line')
      .append('svg')
      .attr('viewBox', [0, 0, widthChart + margin.left + margin.right, heightChart + margin.top + margin.bottom].join(' '))
      .attr('class', 'max-w-full max-h-full');

    this.svg.classed('opacity-20', !this.dataLine.length);

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
        .text(basedLine.y));

    let y = d3.scaleLinear()
      .domain([0, d3.max(this.dataLine, d => d3.max(d.values, l => l.value))]).nice()
      .range([heightChart, 0]);

    let x = d3.scaleTime()
      .domain(d3.extent(basedLine, d => d.date))
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
      .style('font-size', '50%')
      .text('date');

    this.svg.append('g')
      .call(yAxis);

    this.svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', 0 - (heightChart / 2))
      .attr('y', 0)
      .style('font-weight', 'bold')
      .style('font-size', '50%')
      .style('text-anchor', 'middle')
      .text('#papers');

    this.svg.selectAll('.tick').selectAll('text')
      .style('font-size', '75%');

    if (this.dataLine.length !== 0) {
      const mainPath = this.svg
        .datum(this.dataLine[0])
        .append('path')
        .attr('fill', 'none')
        .attr('stroke', this.lineColor)
        .attr('stroke-width', 1.5)
        .attr('d', d => line(d['values']));

      if (this.dataLine.length === 2) {
        this.svg
          .datum(this.dataLine[1])
          .append('path')
          .attr('fill', 'none')
          .attr('stroke', '#bab0ab')
          .attr('stroke-width', 1.5)
          .attr('d', d => line(d['values']))
          .attr('id', 'prevYearLine');

        this.svg.append('text')
          .attr('x', margin.left + widthChart - 5) // The '5' is just an extra margin
          .attr('y', y(this.dataLine[1].values[this.dataLine[1].values.length - 1].value) + margin.top)
          .style('font-size', '8px')
          .style('text-anchor', 'end')
          .attr('fill', '#bab0ab')
          .text(this.year - 1);
      }

      const totalLength = mainPath.node().getTotalLength();

      mainPath
        .attr('stroke-dasharray', totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(500)
        .attr('stroke-dashoffset', 0);
    }
    d3.select('#published-line').node().append(this.svg.node());
  }
}



