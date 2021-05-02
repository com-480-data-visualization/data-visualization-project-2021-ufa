import '../styles/index.scss';
import 'tailwindcss/tailwind.css';
import * as d3 from 'd3';
// eslint-disable-next-line no-unused-vars
import * as THREE from 'three';

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
    keywords: ['hep-ph', 'hep-th'],
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
    keywords: ['math'],
  },
];

const defaultLabel = 'Other';

fetch('public/data/categories_graph.json')
  .then(response => {
    response.json().then(json => {

      const getCategoryIndexAndLabel = name => {
        for (let i = 0; i < categories.length; i++) {
          const category = categories[i];
          for (let j = 0; j < category.keywords.length; j++) {
            if (name.includes(category.keywords[j])) {
              return { index: i, label: category.label };
            }
          }
        }
        return { index: categories.length, label: defaultLabel };
      };

      const color = d => {
        const { index } = getCategoryIndexAndLabel(json.nodes[d.index].id);
        return d3.schemeCategory10[index];
      };

      const width = 1920;
      const height = 800;

      const links = json.links.filter(f => f.weight >= 100).map(d => Object.create(d));
      const nodes = json.nodes.map(d => Object.create(d));

      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id))
        .force('charge', d3.forceManyBody().strength(-200))
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
        .attr('width', width).attr('height', height)
        .attr('viewBox', [0, 0, width, height]);

      const link = svg.append('g')
        .attr('stroke', '#d9d9d9')
        //.attr('stroke-opacity', 0.6)
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke-width', d => 0.001 * d.weight);

      const node = svg.append('g')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', 5)
        .attr('fill', color)
        .call(drag(simulation));

      node.append('title')
        .text(d => getCategoryIndexAndLabel(d.id).label);

      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        node
          .attr('cx', d => d.x = Math.max(0, Math.min(width, d.x)))
          .attr('cy', d => d.y = Math.max(0, Math.min(height, d.y)));
      });

      d3.select('body').node().append(svg.node());
      //invalidation.then(() => simulation.stop());
    });
  });
