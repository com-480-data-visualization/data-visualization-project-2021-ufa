import * as d3 from 'd3';
import { sliderBottom } from 'd3-simple-slider';

export class Slider {
  constructor() {
    this.dataTime = d3.range(0, 14).map(d => new Date(2007 + d, 10, 3));
    this.sliderTime = sliderBottom()
      .min(d3.min(this.dataTime))
      .max(d3.max(this.dataTime))
      .step(1000 * 60 * 60 * 24 * 365)
      .width(700)
      .tickFormat(d3.timeFormat('%Y'))
      .tickValues(this.dataTime)
      .default(new Date(2007, 10, 3));


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
  }
}
