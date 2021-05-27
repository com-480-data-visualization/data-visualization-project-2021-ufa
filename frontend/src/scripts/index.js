import '../styles/index.scss';
import 'tailwindcss/tailwind.css';
import '@fontsource/poppins';
import { BarPlot } from './bar';
import { Cloud } from './cloud';
import { Graph } from './graph';
import { Keywords } from './keywords';
import { LinePlot } from './time';
import { Slider } from './slider';
import { makeBodyVisible } from './page';

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
  'papers_keywords.json',
].map(fetchJson)).then(([categoriesNames, graph, categoriesCounts, papers, paperCounts, papersKeywords]) => {
  makeBodyVisible();

  // Instantiate visualizations
  const slider = new Slider(categoriesCounts);
  const catGraph = new Graph(categoriesNames, graph, categoriesCounts, paperCounts);
  const cloud = new Cloud(papers);
  const barPlot = new BarPlot();
  const linePlot = new LinePlot();
  const keywords = new Keywords(papersKeywords);

  // Set back references
  slider.initialize(catGraph, cloud, barPlot, linePlot, keywords);
  catGraph.initialize(cloud, barPlot, linePlot, keywords);
  cloud.initialize(catGraph);

  // Initial update (required)
  slider.update();
  catGraph.update();
  cloud.update();
  barPlot.update();
  linePlot.update();
  keywords.update();

});

