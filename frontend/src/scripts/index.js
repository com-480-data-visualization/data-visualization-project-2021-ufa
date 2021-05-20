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

makeBodyVisible();
const fetchJson = filename => fetch(`public/data/${filename}`).then(response => response.json());

Promise.all([
  fetchJson('categories_graph.json'),
  fetchJson('categories_counts.json'),
  fetchJson('papers.json'),
]).then(([graph, categoriesCounts, papers]) => {
  Object.keys(papers).forEach(key => {
    papers[key]['date'] = new Date(papers[key]['date']);
  });
  drawGraph(graph['all'], categoriesCounts['all']);
  drawCloud(papers);
  barPlot();
  linePlot();


  let slider = new Slider();
  slider.drawSlider();
  slider.sliderTime.on('end', val => {
    //document.querySelector('g.parameter-value text').innerHTML = val + 2007;
    let filteredPapers = papers;
    if (val != 14) {
      filteredPapers = Object.keys(papers)
        .filter(key => papers[key]['date'].getFullYear() == val + 2007)
        .reduce((obj, key) => {
          obj[key] = papers[key];
          return obj;
        }, {});
    }
    //console.log(val.getFullYear());
    document.getElementById('papers-cloud').innerHTML = '';
    //drawGraph(graph[val.getFullYear()], categoriesCounts[val.getFullYear()]);
    drawCloud(filteredPapers);

  });
});
