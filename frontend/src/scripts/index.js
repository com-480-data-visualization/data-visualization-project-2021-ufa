import '../styles/index.scss';
import 'tailwindcss/tailwind.css';
import '@fontsource/poppins';
import { BarPlot } from './bar';
import { Cloud } from './cloud';
import { Graph } from './graph';
import { LinePlot } from './time';
import { Slider } from './slider';
import { makeBodyVisible } from './visibleBody';

if (process.env.NODE_ENV === 'development') { // Do not remove: used for hot reload
  require('../index.html');
}

const fetchJson = filename => fetch(`public/data/${filename}`).then(response => response.json());

Promise.all([
  'categories_names.json',
  'categories_graph.json',
  'categories_counts.json',
  'papers.json',
  'paper_counts.json',
].map(fetchJson)).then(([categoriesNames, graph, categoriesCounts, papers, paperCounts]) => {
  makeBodyVisible();

  let minYear = null, maxYear = null;
  Object.keys(categoriesCounts).forEach(year => { // Represented as strings + contains "all"
    if (year !== 'all') {
      const yearInt = parseInt(year);
      if (minYear === null || yearInt < minYear) {
        minYear = yearInt;
      }
      if (maxYear === null || yearInt > maxYear) {
        maxYear = yearInt;
      }
    }
  });

  // Instantiate visualizations
  const slider = new Slider(minYear, maxYear);
  const catGraph = new Graph(categoriesNames, graph, categoriesCounts, paperCounts);
  const cloud = new Cloud(papers);
  const barPlot = new BarPlot();
  const linePlot = new LinePlot();

  // Set back references
  catGraph.initialize(cloud, barPlot, linePlot);
  cloud.initialize(catGraph);
  slider.initialize(catGraph, cloud, barPlot, linePlot);

  // Initial update (required)
  slider.update();
  catGraph.update();
  cloud.update();
  barPlot.update();
  linePlot.update();

});

