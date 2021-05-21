import '../styles/index.scss';
import 'tailwindcss/tailwind.css';
import '@fontsource/poppins';
import { Slider } from './slider';
import { barPlot } from './bar';
import { drawCloud } from './cloud';
import { drawGraph } from './graph';
import { linePlot } from './time';
import { makeBodyVisible } from './visibleBody';

if (process.env.NODE_ENV === 'development') { // Do not remove: used for hot reload
  require('../index.html');
}

const fetchJson = filename => fetch(`public/data/${filename}`).then(response => response.json());

Promise.all([
  fetchJson('categories_graph.json'),
  fetchJson('categories_counts.json'),
  fetchJson('papers.json'),
  fetchJson('paper_counts.json'),
]).then(([graph, categoriesCounts, papers, paperCounts]) => {
  makeBodyVisible();
  Object.keys(papers).forEach(key => {
    papers[key]['date'] = new Date(papers[key]['date']);
  });
  drawGraph(graph['all'], categoriesCounts['all'], paperCounts, 'all');
  drawCloud(papers);
  barPlot.draw();
  linePlot();


  let slider = new Slider();
  slider.drawSlider();
  slider.sliderTime.on('end', val => {
    //document.querySelector('g.parameter-value text').innerHTML = val + 2007;
    let currValue = 'all';
    let filteredPapers = papers;
    if (val != 14) {
      currValue = val + 2007;
      filteredPapers = Object.keys(papers)
        .filter(key => papers[key]['date'].getFullYear() == currValue)
        .reduce((obj, key) => {
          obj[key] = papers[key];
          return obj;
        }, {});
    }
    document.getElementById('papers-cloud').innerHTML = '';
    document.getElementById('categories-graph').innerHTML = '';
    drawGraph(graph[currValue], categoriesCounts[currValue], paperCounts, currValue);
    drawCloud(filteredPapers);

  });
});

