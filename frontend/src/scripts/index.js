import '../styles/index.scss';
import 'tailwindcss/tailwind.css';
import '@fontsource/poppins';
//import * as THREE from 'three';
import * as d3 from 'd3';

if (process.env.NODE_ENV === 'development') { // Do not remove: used for hot reload
  require('../index.html');
}

const categories = [
  {
    label: 'Quantum Physics',
    keywords: ['quant-ph'],
  },
  {
    label: 'Astrophysics',
    keywords: ['astro-ph'],
  },
  {
    label: 'High Energy Physics',
    keywords: ['hep-ph', 'hep-th', 'hep-lat'],
  },
  {
    label: 'Condensed Matter Physics',
    keywords: ['cond-mat'],
  },
  {
    label: 'General Physics',
    keywords: ['physics'],
  },
  {
    label: 'Computer Science',
    keywords: ['cs'],
  },
  {
    label: 'Mathematics',
    keywords: ['math', 'stat', 'nlin'],
  },
  {
    label: 'Biology',
    keywords: ['bio'],
  },
  {
    label: 'Economics',
    keywords: ['q-fin'],
  },
  {
    label: 'Other',
    keywords: null,
  },
].map((obj, idx) => ({ ...obj, index: idx }));

const SIMILARITY_BAR_N = 5;

const fetchJson = filename => fetch(`public/data/${filename}`).then(response => response.json());

// Set the dimensions and margins of the bar plot
let margin = { top: 10, right: 30, bottom: 90, left: 40 },
  widthChart = 260 - margin.left - margin.right,
  heightChart = 250 - margin.top - margin.bottom;

const getCategoryIndexAndLabel = name => {
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    if (category.keywords === null) {
      return { index: i, label: category.label };
    }
    for (let j = 0; j < category.keywords.length; j++) {
      if (name.includes(category.keywords[j])) {
        return { index: i, label: category.label };
      }
    }
  }
};

const categoriesColors = d3.schemeCategory10;

const color = d => {
  const { index } = getCategoryIndexAndLabel(d.id);
  return categoriesColors[index];
};

// Category Similarity Bar

function barPlot(dataBar) {

  d3.select('#similar-bar').select('svg').remove();

  let svgBar = d3.select('#similar-bar')
    .append('svg')
    .attr('width', widthChart + margin.left + margin.right)
    .attr('height', heightChart + margin.top + margin.bottom)
    .append('g')
    .attr('transform',
      'translate(' + margin.left + ',' + margin.top + ')');
  // X axis
  let x = d3.scaleBand()
    .range([0, widthChart])
    .domain(dataBar.map(d => d.id))
    .padding(0.2);
  svgBar.append('g')
    .attr('transform', 'translate(0,' + heightChart + ')')
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('transform', 'translate(-10,0)rotate(-45)')
    .style('text-anchor', 'end');

  // Add Y axis
  let y = d3.scaleLinear()
    .domain([0, 100])
    .range([heightChart, 0]);
  svgBar.append('g')
    .call(d3.axisLeft(y));

  // Bars
  svgBar.selectAll('mybar')
    .data(dataBar)
    .enter()
    .append('rect')
    .attr('x', d => x(d.id))
    .attr('width', x.bandwidth())
    .attr('fill', color)
  // no bar at the beginning thus:
    .attr('height', () => heightChart - y(0)) // always equal to 0
    .attr('y', () =>  y(0));

  const hundred = 100;

  // Animation
  svgBar.selectAll('rect')
    .transition()
    .duration(200)
    .attr('y', d => y(d.weightRatio * hundred))
    .attr('height', d => heightChart - y(d.weightRatio * hundred))
    .delay((d, i) => (i * 50));

}

function linePlot(dataLine, lineColor) {

  d3.select('#published-line').select('svg').remove();

  let line = d3.line()
    .defined(d => !isNaN(d.value))
    .x(d => x(d.date))
    .y(d => y(d.value));


  let yAxis = g => g
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    //.call(g => g.select(".domain").remove())
    .call(g => g.select('.tick:last-of-type text').clone()
      .attr('x', 3)
      .attr('text-anchor', 'start')
      .attr('font-weight', 'bold')
      .text(dataLine.y));

  let xAxis = g => g
    .attr('transform', `translate(0,${heightChart})`)
    .call(d3.axisBottom(x).ticks(widthChart / 80));


  let y = d3.scaleLinear()
    .domain([0, d3.max(dataLine, d => d.value)]).nice()
    .range([heightChart, margin.top]);

  let x = d3.scaleTime()
    .domain(d3.extent(dataLine, d => d.date))
    .range([margin.left, widthChart + margin.left]);


  const svg = d3.select('#published-line')
    .append('svg')
    .attr('width', widthChart + margin.left + margin.right)
    .attr('height', heightChart + margin.top + margin.bottom);

  svg.append('g')
    .call(xAxis);

  svg.append('g')
    .call(yAxis);

  let path = svg.append('path')
    .datum(dataLine)
    .attr('fill', 'none')
    .attr('stroke', lineColor)
    .attr('stroke-width', 1.5)
    .attr('d', line);


  let totalLength = path.node().getTotalLength();

  path.attr('stroke-dasharray', totalLength)
    .attr('stroke-dashoffset', totalLength)
    .transition()
    .duration(2000)
    .attr('stroke-dashoffset', 0);

  d3.select('#published-line').node().append(svg.node());
}


Promise.all([
  fetchJson('categories_graph.json'),
  fetchJson('categories_counts.json'),
]).then(([graph, categoriesCounts]) => {

  const width = 1000;
  const height = 800;

  const filterEdges = (data, minEdge) => {
    let links = data.links.filter(f => f.weight >= minEdge).map(d => Object.create(d));
    let nodeSet = new Set();
    links.forEach(item => {
      nodeSet.add(item.source);
      nodeSet.add(item.target);
    });
    return { links: links, nodes: [...nodeSet].map(d => Object.create({ id: d })) };
  };
  const filteredData = filterEdges(graph, 100);

  const links = filteredData.links;
  const nodes = filteredData.nodes;

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id))
    .force('charge', d3.forceManyBody().strength(-100))
    .force('center', d3.forceCenter(width / 2, height / 2));

  let selectedNode = null;
  let hoveredNode = null;

  const updateHighlights = () => {

    const node = selectedNode || hoveredNode;
    const connectedSet = new Set();
    const connectedWeights = [];
    const dataLine = [];
    if (node) {
      connectedSet.add(node.id);
      links.forEach(l => {
        let neighbour = null;
        if (l.source.id === node.id) {
          neighbour = l.target.id;
        } else if (l.target.id === node.id) {
          neighbour = l.source.id;
        }
        if (neighbour) {
          connectedSet.add(neighbour);
          connectedWeights.push({ id: neighbour, weight: l.weight });
        }
      });

      //Line data(MOCK)
      const items = [0, 10, 40, 50, 80, 99.47];
      const date = [[2007, 3, 23], [2007, 3, 24], [2007, 3, 25], [2007, 3, 26], [2007, 3, 29], [2007, 4, 1]];
      items.forEach((item, i) => (dataLine.push({ date: new Date(date[i][0], date[i][1], date[i][2]), value: item })));

    }
    const weightSum = connectedWeights.map(({ weight }) => weight).reduce((a, b) => a + b, 0);
    const connectedWeightRatios = connectedWeights
      .map(obj => ({ ...obj, weightRatio: obj.weight / weightSum }))
      .sort((x, y) => d3.descending(x.weightRatio, y.weightRatio))
      .slice(0, SIMILARITY_BAR_N);

    gNodes.classed('opacity-10', node ? d => !connectedSet.has(d.id) : false);
    gLinks.classed('opacity-25', node ? d => d.source.id !== node.id && d.target.id !== node.id : false);
    d3.select('#categories-selected-category').text(node ? node.id : '-');
    d3.select('#categories-selected-field').text(node ? getCategoryIndexAndLabel(node.id).label : '-');
    d3.select('#categories-selected-count').text(node ? categoriesCounts[node.id].toLocaleString() : '-');

    barPlot(connectedWeightRatios);
    linePlot(dataLine, node ? color(node) : '');
  };

  const drag = simulation => {

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;

      selectedNode = event.subject;
      updateHighlights();
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;

      selectedNode = null;
      updateHighlights();
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  };

  const svg = d3.create('svg')
    //.attr('width', width).attr('height', height)
    .attr('viewBox', [0, 0, width, height].join(' '));

  const gClusters = svg.append('g')
    .attr('font-weight', 'bold')
    .style('cursor', 'default')
    .style('user-select', 'none')
    .attr('text-anchor', 'middle')
    .selectAll('text')
    .data(categories)
    .join('text')
    .attr('fill', d => categoriesColors[d.index])
    .text(d => d.label);

  const gLinks = svg.append('g')
    .attr('stroke', 'black')
    .attr('stroke-opacity', 0.5)
    .selectAll('line')
    .data(links)
    .join('line')
    // Don't apply transition on already transparent objects, this is a serious bottleneck!
    //.attr('class', 'transition-opacity duration-250')
    .attr('stroke-width', d => 0.00025 * d.weight);

  const gNodes = svg.append('g')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .style('cursor', 'pointer')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('class', 'transition-opacity duration-250')
    .attr('r', d => Math.log(categoriesCounts[d.id]) * 0.7)
    .attr('fill', color)
    .call(drag(simulation));

  gNodes.append('title')
    .text(d => {
      const label = getCategoryIndexAndLabel(d.id).label;
      return `${d.id} (${label})`;
    });

  simulation.on('tick', () => {
    const clampX = x => Math.max(0, Math.min(width, x));
    const clampY = y => Math.max(0, Math.min(height, y));

    gLinks
      .attr('x1', d => clampX(d.source.x))
      .attr('y1', d => clampY(d.source.y))
      .attr('x2', d => clampX(d.target.x))
      .attr('y2', d => clampY(d.target.y));

    gNodes
      .attr('cx', d => clampX(Math.max(0, Math.min(width, d.x))))
      .attr('cy', d => clampY(Math.max(0, Math.min(height, d.y))));

    const groups = {};
    nodes.forEach(node => {
      const index = getCategoryIndexAndLabel(node.id).index;
      if (!groups[index]) {
        groups[index] = [];
      }
      groups[index].push(node);
    });
    const mean = nodes => {
      const xs = nodes.map(d => d.x).reduce((a, b) => a + b);
      const ys = nodes.map(d => d.y).reduce((a, b) => a + b);
      return { x: xs / nodes.length, y: ys / nodes.length - 10 };
    };
    const aggregated = Object.fromEntries(Object.entries(groups).map(([index, nodesIn]) => [index, mean(nodesIn)]));
    gClusters
      .attr('x', d => aggregated[d.index].x)
      .attr('y', d => aggregated[d.index].y);
  });

  gNodes
    .on('mouseover', (_, d) => {
      hoveredNode = d;
      if (!selectedNode) { // Avoid expensive updates
        updateHighlights();
      }
    })
    .on('mouseout', () => {
      hoveredNode = null;
      if (!selectedNode) {
        updateHighlights();
      }
    });
  // Disabled for now, future use case
  /*.on('click', (_, d) => {
      selectedNode = d;
      updateHighlights();
    });*/

  d3.select('#categories-graph').node().append(svg.node());
  //invalidation.then(() => simulation.stop());
});
