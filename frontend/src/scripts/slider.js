import * as d3 from 'd3';
import { sliderBottom } from 'd3-simple-slider';

export class Slider {
  constructor() {
    this.dataTime = d3.range(0, 15).map(d => new Date(2007 + d, 10, 3));
    let dataTimeTicks = this.dataTime.map(d => d.getFullYear().toString());
    dataTimeTicks[dataTimeTicks.length - 1] = 'All Time';
    console.log(dataTimeTicks);
    this.sliderTime = sliderBottom()
      .min(0)
      .max(14)
      .step(1)
      .width(700)
      .tickFormat((d, i) => dataTimeTicks[i])
      .ticks(15)
      .default(14);
    //.tickValues(this.dataTime)
    //.default(new Date(2021, 10, 3));

    this.svg = d3
      .create('svg')
      .attr('viewBox', [0, 0, 750, 100].join(' '));


    this.gTime = this.svg
      .append('g')
      .attr('transform', 'translate(30,30)');

    this.gTime.call(this.sliderTime);
  }
  drawSlider() {
    d3.select('#slider-time').node().append(this.svg.node());
    d3.select('p#value-time').text(d3.timeFormat('%Y')(this.sliderTime.value()));
    d3.select('g.parameter-value text').text('All Time');
  }
}
