import '../styles/index.scss';
import 'tailwindcss/tailwind.css';
import '@fontsource/poppins';
import { Slider } from './slider';
import { barPlot } from './bar';
import { drawCloud } from './cloud';
import { drawGraph } from './graph';
import { linePlot } from './time';

if (process.env.NODE_ENV === 'development') { // Do not remove: used for hot reload
  require('../index.html');
}

const fetchJson = filename => fetch(`public/data/${filename}`).then(response => response.json());

Promise.all([
  fetchJson('categories_graph.json'),
  fetchJson('categories_counts.json'),
  fetchJson('papers.json'),
]).then(([graph, categoriesCounts, papers]) => {
  drawGraph(graph, categoriesCounts);
  drawCloud(papers);
  barPlot();
  linePlot();
  let slider = new Slider();
  slider.drawSlider();
  slider.sliderTime.on('onchange', val => {
    //here change data
  });
});
