import '../styles/index.scss';
import 'tailwindcss/tailwind.css';
import '@fontsource/poppins';
import * as d3 from 'd3';
// import * as THREE from 'three';

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

const fetchJson = filename => fetch(`public/data/${filename}`).then(response => response.json());

// set the dimensions and margins of the bar plot
let margin = { top: 10, right: 30, bottom: 90, left: 40 },
  width_bar = 360 - margin.left - margin.right,
  height_bar = 350 - margin.top - margin.bottom;

//Category Similarity Bar

function bar_plot(dataBar){
  
  
  d3.select('#similar-bar').select('svg').remove();

  // append the svg object to the body of the page

  let svg_bar = d3.select('#similar-bar')
    .append('svg')
    .attr('width', width_bar + margin.left + margin.right)
    .attr('height', height_bar + margin.top + margin.bottom)
    .append('g')
    .attr('transform',
      'translate(' + margin.left + ',' + margin.top + ')');
  // X axis
  let x = d3.scaleBand()
    .range([ 0, width_bar ])
    .domain(dataBar.map(function(d) { return d.id; }))
    .padding(0.2);
  svg_bar.append('g')
    .attr('transform', 'translate(0,' + height_bar + ')')
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('transform', 'translate(-10,0)rotate(-45)')
    .style('text-anchor', 'end');

  // Add Y axis
  let y = d3.scaleLinear()
    .domain([0, 100])
    .range([ height_bar, 0]);
  svg_bar.append('g')
    .call(d3.axisLeft(y));

  // Bars
  svg_bar.selectAll('mybar')
    .data(dataBar)
    .enter()
    .append('rect')
    .attr('x', function(d) { return x(d.id); })
    .attr('width', x.bandwidth())
    .attr('fill', '#69b3a2')
  // no bar at the beginning thus:
    .attr('height', ()=> height_bar - y(0)) // always equal to 0
    .attr('y', ()=>  y(0));

  // Animation
  svg_bar.selectAll('rect')
    .transition()
    .duration(800)
    .attr('y', function(d) { return y(d.weightPercentage); })
    .attr('height', function(d) { return height_bar - y(d.weightPercentage); })
    .delay(function(d,i){return(i*100);});

}


Promise.all([
  fetchJson('categories_graph.json'),
  fetchJson('categories_counts.json'),
]).then(([graph, categoriesCounts]) => {

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

  const width = 1000;
  const height = 1000;

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

  const drag = simulation => {

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  };

  const svg = d3.create('svg')
    //.attr('width', width).attr('height', height)
    .attr('viewBox', [0, 0, width, height]);

  const clusters = svg.append('g')
    .attr('font-weight', 'bold')
    .style('cursor', 'default')
    .style('user-select', 'none')
    .attr('text-anchor', 'middle')
    .selectAll('text')
    .data(categories)
    .join('text')
    .attr('fill', d => categoriesColors[d.index])
    .text(d => d.label);

  const link = svg.append('g')
    .attr('stroke', 'black')
    .attr('stroke-opacity', 0.5)
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke-width', d => 0.00025 * d.weight);

  const node = svg.append('g')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .style('cursor', 'pointer')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', d => Math.log(categoriesCounts[d.id]) * 0.7)
    .attr('fill', color)
    .call(drag(simulation));

  node.append('title')
    .text(d => {
      const label = getCategoryIndexAndLabel(d.id).label;
      return `${d.id} (${label})`;
    });

  simulation.on('tick', () => {
    const clampX = x => Math.max(0, Math.min(width, x));
    const clampY = y => Math.max(0, Math.min(height, y));

    link
      .attr('x1', d => clampX(d.source.x))
      .attr('y1', d => clampY(d.source.y))
      .attr('x2', d => clampX(d.target.x))
      .attr('y2', d => clampY(d.target.y));

    node
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
    clusters
      .attr('x', d => aggregated[d.index].x)
      .attr('y', d => aggregated[d.index].y);
  });

  node.on('mouseover', function (_, d) {
    const thisNode = d.id;
    const connected = links.filter(function (e) {
      return e.source.id === thisNode || e.target.id === thisNode;
    });

    node.attr('opacity', function (d) {
      return (connected.map(d => d.source.id).indexOf(d.id) > -1 || connected.map(d => d.target.id).indexOf(d.id) > -1) ? 1 : 0.1;
    });

    link.attr('opacity', function (d) {
      return (d.source.id === thisNode || d.target.id === thisNode) ? 1 : 0.1;
    });
    let weightSum = d3.sum(connected,d=>d.weight);
    let neighbourData = connected.map(e =>{
      let neighbourNode = '';
      if (e.source.id === thisNode){
        neighbourNode = e.target.id;
      } else {
        neighbourNode = e.source.id;
      }
      return { id:neighbourNode,weightPercentage:e.weight*100/weightSum };
    }).sort(function(x, y){
      return d3.descending(x.weightPercentage, y.weightPercentage);
    });
    
    bar_plot(neighbourData);
  })
    .on('mouseout', () => {
      node.attr('opacity', 1);
      link.attr('opacity', 1);
    });

  d3.select('#categories-graph').node().append(svg.node());
  //invalidation.then(() => simulation.stop());
});
