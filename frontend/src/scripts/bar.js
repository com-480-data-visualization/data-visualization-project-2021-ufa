import * as d3 from 'd3';
import { color, heightChart, margin, widthChart, getCategoryIndexAndLabel } from './common';

export const SIMILARITY_BAR_N = 5;


export class BarPlot {

  constructor() {
    this.dataBar = [];

    this.container = d3.select('#similar-bar');
    this.svg = this.container.append('svg');

    this.svgBar = this.svg
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
      .style('font-size', '50%')
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
      .style('font-size', '50%')
      .style('text-anchor', 'middle')
      .text('weight ratios');
  }

  setData(dataBar, categoriesNames, categoriesCounts) {
    this.dataBar = dataBar;
    this.categoriesNames = categoriesNames;
    this.categoriesCounts = categoriesCounts;
    this.update();
  }

  update() {
    this.svgBar.classed('opacity-20', !this.dataBar.length);

    this.svgBar.selectAll('mybar').remove();
    this.svgBar.selectAll('rect').remove();
    this.svgBar.selectAll('.axis-bottom-text').remove();
    this.svgBar.selectAll('.tick').remove();

    const tooltip = d3.select('#bar-tooltip');

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
      .attr('y', () =>  this.y(0))
      .attr('class', d => d3.select('#catGraph-' + d.id).empty() ? 'cursor-default' : 'cursor-pointer');

    const hundred = 100;

    // Animation


    this.svgBar.selectAll('rect')
      .transition()
      .duration(200)
      .attr('y', d => this.y(d.weightRatio * hundred))
      .attr('height', d => heightChart - this.y(d.weightRatio * hundred))
      .delay((d, i) => (i * 50));

    let hoveredBar = null;
    const bars = this.svgBar.selectAll('rect');
    bars
      .on('mouseover', (e, d) => {
        hoveredBar = d;
        const barRect = e.target.getBoundingClientRect();
        const containerRect = this.container.node().getBoundingClientRect();

        tooltip
          .style('top', (barRect.top - containerRect.top) + 'px')
          .style('left', (barRect.left - containerRect.left + barRect.width / 2) + 'px');

        updateTooltip();
      })
      .on('mouseout', () => {
        hoveredBar = null;
        updateTooltip();
      }).on('click', (event, d) => {
        const selectedBar = d3.select('#catGraph-' + d.id);
        if (!selectedBar.empty()) {
          selectedBar.on('click')(event, d);
          hoveredBar = null;
          updateTooltip();
        }
      });

    const updateTooltip = () => {
      d3.select('#bar-tooltip-id').text(hoveredBar && hoveredBar.id).style('color', hoveredBar && color(hoveredBar));
      d3.select('#bar-tooltip-name').text(hoveredBar &&
          (this.categoriesNames[hoveredBar.id] || getCategoryIndexAndLabel(hoveredBar.id).label));
      d3.select('#bar-tooltip-percent').text(hoveredBar &&
            (hoveredBar.weightRatio * hundred).toFixed(2) + '%');
      d3.select('#bar-tooltip-count').text(hoveredBar && this.categoriesCounts[hoveredBar.id].toLocaleString());

      tooltip.classed('hidden', !hoveredBar);
    };

  }
}

