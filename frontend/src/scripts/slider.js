import * as d3 from 'd3';
import { sliderBottom } from 'd3-simple-slider';
import { ALL } from './common';

export class Slider {
  constructor(minValue, maxValue) {
    this.tickAllTime = maxValue + 1;

    this.sliderTime = sliderBottom()
      .min(minValue)
      .max(maxValue + 1)
      .step(1)
      .width(700)
      .tickFormat(d => d !== maxValue + 1 ? d.toString() : 'All Time')
      .ticks(maxValue - minValue + 1)
      .default(maxValue + 1);

    this.svg = d3
      .create('svg')
      .attr('viewBox', [0, 0, 750, 50].join(' '))
      .classed('overflow-visible', true);

    this.gTime = this.svg
      .append('g')
      .attr('transform', 'translate(25,10)');

    this.gTime.call(this.sliderTime);

    d3.select('#slider-time').node().append(this.svg.node());
  }

  initialize(catGraph, cloud, barPlot, linePlot) {
    this.sliderTime.on('end', val => {
      const year = val === this.tickAllTime ? ALL : val;

      catGraph.setYear(year);
      cloud.setYear(year);
      barPlot.setData([]);
      linePlot.setData([], '');
    });
  }

  update() {

  }
}
