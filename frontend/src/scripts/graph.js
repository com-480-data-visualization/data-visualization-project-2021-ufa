import * as d3 from 'd3';
import variables from '../styles/_export.scss';
import { SIMILARITY_BAR_N } from './bar';
import { CATEGORIES, categoriesColors, color, getCategoryIndexAndLabel } from './common';


export class Graph {

  constructor(categoriesNames) {
    this.container = d3.select('#categories-graph');

    const containerDom = this.container.node();
    this.aspect = containerDom.clientWidth / containerDom.clientHeight;
    this.width = 1000;
    this.height = this.width / this.aspect;

    this.categoriesNames = categoriesNames;

    this.simulation = null;
  }

  initialize(barPlot, linePlot) {
    this.linePlot = linePlot;
    this.barPlot = barPlot;
  }

  update(graph, categoriesCounts, paperCounts, paperCountsDate) {
    if (this.simulation) { // Cancel previous simulation, if any
      this.simulation.stop();
    }

    this.container.selectAll('*').remove();

    this.svg = d3.create('svg')
      .attr('viewBox', [0, 0, this.width, this.height].join(' '))
      .attr('class', 'max-w-full max-h-full overflow-visible');

    const links = graph.links;
    const nodes = graph.nodes;

    const force = 0.1;
    const charge = 150;
    this.simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-charge))
      .force('forceX', d3.forceX().strength(force / this.aspect))
      .force('forceY', d3.forceY().strength(force * this.aspect))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2));

    let selectedNode = null;
    let hoveredNode = null;

    const tooltip = d3.select('#graph-tooltip');

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

        const items = paperCounts[node.id][paperCountsDate]['count'];
        const date = paperCounts[node.id][paperCountsDate]['date'];
        items.forEach((item, i) => (dataLine.push({ date: new Date(date[i]), value: item })));
      }
      const weightSum = connectedWeights.map(({ weight }) => weight).reduce((a, b) => a + b, 0);
      const connectedWeightRatios = connectedWeights
        .map(obj => ({ ...obj, weightRatio: obj.weight / weightSum }))
        .sort((x, y) => d3.descending(x.weightRatio, y.weightRatio))
        .slice(0, SIMILARITY_BAR_N);

      gNodes.classed('opacity-10', node ? d => !connectedSet.has(d.id) : false);
      gLinks.classed('hidden', node ? d => d.source.id !== node.id && d.target.id !== node.id : false);
      d3.select('#categories-selected-category').text(node && node.id).style('color', node && color(node));
      d3.select('#categories-selected-field').text(node &&
        (this.categoriesNames[node.id] || getCategoryIndexAndLabel(node.id).label));
      d3.select('#categories-selected-count').text(node && categoriesCounts[node.id].toLocaleString());

      tooltip.classed('hidden', !node);

      this.barPlot.update(connectedWeightRatios);
      this.linePlot.update(dataLine, node ? color(node) : '');
    };

    // eslint-disable-next-line no-unused-vars
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



    const gClusters = this.svg.append('g')
      .attr('font-weight', 'bold')
      .style('cursor', 'default')
      .style('user-select', 'none')
      .attr('text-anchor', 'middle')
      .selectAll('text')
      .data(CATEGORIES)
      .join('text')
      .attr('fill', d => categoriesColors[d.index])
      .text(d => d.label);

    const gLinks = this.svg.append('g')
      .attr('stroke', 'black')
      .attr('stroke-opacity', 0.5)
      .selectAll('line')
      .data(links.filter(d => d.weight >= 100)) // Only display relevant edges
      .join('line')
      // Don't apply transition on already transparent objects, this is a serious bottleneck!
      //.attr('class', 'transition-opacity duration-250')
      .attr('stroke-width', d => 0.00025 * d.weight + 0.05);

    const gNodes = this.svg.append('g')
      .attr('stroke', variables['background-color'])
      .attr('stroke-width', 2.5)
      .style('cursor', 'pointer')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('class', 'transition-opacity duration-250')
      .attr('r', d => Math.log(categoriesCounts[d.id]) * 0.9)
      .attr('fill', color)
      ;//.call(drag(this.simulation));

    const updateTooltipPosition = () => {
      const node = hoveredNode;
      if (node) {
        const containerDom = this.container.node();
        tooltip
          .style('top', (node.y / this.height * containerDom.clientHeight) + 'px')
          .style('left', (node.x / this.width * containerDom.clientWidth) + 'px');
      }
    };

    this.simulation.on('tick', () => {
      const clampX = x => Math.max(0, Math.min(this.width, x));
      const clampY = y => Math.max(0, Math.min(this.height, y));

      gLinks
        .attr('x1', d => clampX(d.source.x))
        .attr('y1', d => clampY(d.source.y))
        .attr('x2', d => clampX(d.target.x))
        .attr('y2', d => clampY(d.target.y));

      gNodes
        .attr('cx', d => clampX(Math.max(0, Math.min(this.width, d.x))))
        .attr('cy', d => clampY(Math.max(0, Math.min(this.height, d.y))));

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
        .classed('hidden', d => !aggregated[d.index])
        .attr('x', d => aggregated[d.index] && aggregated[d.index].x)
        .attr('y', d => aggregated[d.index] && aggregated[d.index].y);

      // Tooltip
      updateTooltipPosition();
    });

    gNodes
      .on('mouseover', (_, d) => {
        hoveredNode = d;
        updateTooltipPosition();
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

    this.container.node().append(this.svg.node());

    //invalidation.then(() => simulation.stop());

  }
}






