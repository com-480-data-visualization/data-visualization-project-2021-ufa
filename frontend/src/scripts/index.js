import '../styles/index.scss';
import 'tailwindcss/tailwind.css';
import '@fontsource/poppins';
import { BarPlot } from './bar';
import { Cloud } from './cloud';
import { ALL } from './common';
import { Graph } from './graph';
import { LinePlot } from './time';
import { Slider } from './slider';
import { makeBodyVisible } from './visibleBody';

if (process.env.NODE_ENV === 'development') { // Do not remove: used for hot reload
  require('../index.html');
}

const fetchJson = filename => fetch(`public/data/${filename}`).then(response => response.json());

Promise.all([
  'categories_graph.json',
  'categories_counts.json',
  'papers.json',
  'paper_counts.json',
].map(fetchJson)).then(([graph, categoriesCounts, papers, paperCounts]) => {
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

  const catGraph = new Graph();
  const cloud = new Cloud(papers);
  const barPlot = new BarPlot();
  const linePlot = new LinePlot();

  catGraph.initialize(barPlot, linePlot);

  catGraph.update(graph['all'], categoriesCounts['all'], paperCounts, 'all');
  cloud.update();
  barPlot.update();
  linePlot.update();

  let slider = new Slider(minYear, maxYear);
  slider.update();
  slider.sliderTime.on('end', val => {
    const year = val === slider.tickAllTime ? ALL : val;

    catGraph.update(graph[year], categoriesCounts[year], paperCounts, year);
    cloud.update(year);
  });
});

