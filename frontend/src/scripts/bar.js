import * as d3 from 'd3';
import { color, heightChart, margin, widthChart } from './common';

export const SIMILARITY_BAR_N = 5;


export class BarPlot {

  constructor() {
    this.dataBar = [];

    d3.select('#similar-bar').select('svg').remove();

    this.svgBar = d3.select('#similar-bar')
      .append('svg')
      .attr('viewBox', [0, 0, widthChart + margin.left + margin.right, heightChart + margin.top + margin.bottom].join(' '))
      .attr('class', 'max-w-full max-h-full')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X axis
    this.x = d3.scaleBand()
      .range([0, widthChart])
      .domain(this.dataBar.map(d => d.id))
      .padding(0.2);

    this.svgBar.append('g')
      .attr('transform', `translate(0,${heightChart})`)
      .call(d3.axisBottom(this.x));

    // X axis label
    this.svgBar.append('text')
      .attr('transform', 'translate(' + (- margin.left / 2) + ',' + (heightChart + margin.bottom / 3) + ')rotate(-45)')
      .style('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .style('font-size', '60%')
      .text('categories');

    // Add Y axis
    this.y = d3.scaleLinear()
      .domain([0, 100])
      .range([heightChart, 0]);
    this.svgBar.append('g')
      .call(d3.axisLeft(this.y));

    this.svgBar.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', 0 - (heightChart / 2))
      .attr('y', 0 - margin.left / 3)
      .style('font-weight', 'bold')
      .style('font-size', '60%')
      .style('text-anchor', 'middle')
      .text('weight ratios');
  }

  setData(dataBar) {
    this.dataBar = dataBar;
    this.update();
  }

  update() {
    this.svgBar.classed('opacity-20', !this.dataBar.length);

    this.svgBar.selectAll('mybar').remove();
    this.svgBar.selectAll('rect').remove();
    this.svgBar.selectAll('.axis-bottom-text').remove();
    this.svgBar.selectAll('.tick').remove();

    this.x = d3.scaleBand()
      .range([0, widthChart])
      .domain(this.dataBar.map(d => d.id))
      .padding(0.2);

    this.svgBar.append('g')
      .attr('transform', `translate(0,${heightChart})`)
      .call(d3.axisBottom(this.x))
      .call(g => g.select('.domain').remove())
      .selectAll('text')
      .classed('axis-bottom-text', true)
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '70%');

    // Bars
    this.svgBar.selectAll('mybar')
      .data(this.dataBar)
      .enter()
      .append('rect')
      .attr('x', d => this.x(d.id))
      .attr('width', this.x.bandwidth())
      .attr('fill', color)
      // no bar at the beginning thus:
      .attr('height', () => heightChart - this.y(0)) // always equal to 0
      .attr('y', () =>  this.y(0));

    const hundred = 100;

    // Animation
    this.svgBar.selectAll('rect')
      .transition()
      .duration(200)
      .attr('y', d => this.y(d.weightRatio * hundred))
      .attr('height', d => heightChart - this.y(d.weightRatio * hundred))
      .delay((d, i) => (i * 50));
  }
}

