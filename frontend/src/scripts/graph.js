import * as d3 from 'd3';
import variables from '../styles/_export.scss';
import { SIMILARITY_BAR_N } from './bar';
import { ALL, CATEGORIES, categoriesColors, color, getCategoryIndexAndLabel } from './common';


export class Graph {

  constructor(categoriesNames, graphData, categoriesCounts, paperCounts) {
    this.container = d3.select('#categories-graph');

    const containerDom = this.container.node();
    this.aspect = containerDom.clientWidth / containerDom.clientHeight;
    this.width = 1000;
    this.height = this.width / this.aspect;

    this.year = ALL;

    this.categoriesNames = categoriesNames;
    this.graphData = graphData;
    this.categoriesCounts = categoriesCounts;
    this.paperCounts = paperCounts;

    this.simulation = null;

    this.selectedCategory = null;
  }

  initialize(cloud, barPlot, linePlot, keywords) {
    this.cloud = cloud;
    this.linePlot = linePlot;
    this.barPlot = barPlot;
    this.keywords = keywords;
  }

  setYear(year) {
    this.year = year;
    this.update();
  }

  update() {
    if (this.simulation) { // Cancel previous simulation, if any
      this.simulation.stop();
    }

    this.container.selectAll('*').remove();

    this.svg = d3.create('svg')
      .attr('viewBox', [0, 0, this.width, this.height].join(' '))
      .attr('class', 'max-w-full max-h-full overflow-visible');

    const links = this.graphData[this.year].links;
    const nodes = this.graphData[this.year].nodes;

    const force = 0.1;
    const charge = 150;
    this.simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-charge))
      .force('forceX', d3.forceX().strength(force / this.aspect))
      .force('forceY', d3.forceY().strength(force * this.aspect))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2));

    let hoveredNode = null;

    const tooltip = d3.select('#graph-tooltip');

    let sameYearDate = (date, selectedDate) => {
      let currDate = new Date(date);
      if (selectedDate !== ALL) {
        return new Date(2000, currDate.getMonth() + 1, 0);
      }
      return currDate;
    };
    const updateTooltipPosition = () => {
      const node = hoveredNode;
      if (node) {
        const containerDom = this.container.node();
        tooltip
          .style('top', (node.y / this.height * containerDom.clientHeight) + 'px')
          .style('left', (node.x / this.width * containerDom.clientWidth) + 'px');
      }
    };

    const updateTooltip = () => {
      updateTooltipPosition();

      d3.select('#categories-selected-category').text(hoveredNode && hoveredNode.id).style('color', hoveredNode && color(hoveredNode));
      d3.select('#categories-selected-field').text(hoveredNode &&
        (this.categoriesNames[hoveredNode.id] || getCategoryIndexAndLabel(hoveredNode.id).label));
      d3.select('#categories-selected-count').text(hoveredNode && this.categoriesCounts[this.year][hoveredNode.id].toLocaleString());

      tooltip.classed('hidden', !hoveredNode);
    };

    const updateHighlights = () => {
      const category = this.selectedCategory;
      const connectedSet = new Set();
      const connectedWeights = [];
      const dataLine = [];
      if (category) {
        connectedSet.add(category);
        links.forEach(l => {
          let neighbour = null;
          if (l.source.id === category) {
            neighbour = l.target.id;
          } else if (l.target.id === category) {
            neighbour = l.source.id;
          }
          if (neighbour) {
            connectedSet.add(neighbour);
            connectedWeights.push({ id: neighbour, weight: l.weight });
          }
        });
        let items = this.paperCounts[category][this.year]['count'];
        let date = this.paperCounts[category][this.year]['date'];
        let currValues = [];
        items.forEach((item, i) => (currValues.push({ date: sameYearDate(date[i], this.year), value: item })));
        dataLine.push({ 'time': this.year, 'values': currValues });

        if (this.year !== ALL) {
          items = this.paperCounts[category]['mean']['count'];
          date = this.paperCounts[category]['mean']['date'];
          currValues = [];
          items.forEach((item, i) => (currValues.push({ date: new Date(2000, date[i], 0), value: item })));
          dataLine.push({ 'time': 'mean', 'values': currValues });
        }
      }
      const weightSum = connectedWeights.map(({ weight }) => weight).reduce((a, b) => a + b, 0);
      const connectedWeightRatios = connectedWeights
        .map(obj => ({ ...obj, weightRatio: obj.weight / weightSum }))
        .sort((x, y) => d3.descending(x.weightRatio, y.weightRatio))
        .slice(0, SIMILARITY_BAR_N);

      gNodes.classed('opacity-10', category ? d => !connectedSet.has(d.id) : false);
      gNodes.attr('stroke', d => this.selectedCategory !== null && this.selectedCategory === d.id ? 'black' : variables['background-color']);
      gLinks.classed('hidden', category ? d => d.source.id !== category && d.target.id !== category : false);

      this.barPlot.setData(connectedWeightRatios, this.categoriesNames, this.categoriesCounts[this.year]);
      this.linePlot.setData(dataLine, category ? color({ id: category }) : '');

      this.cloud.update();
      this.keywords.setCategory(this.selectedCategory ? this.selectedCategory : ALL);
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
      .attr('r', d => Math.log(this.categoriesCounts[this.year][d.id]) * 0.9)
      .attr('fill', color);

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
        updateTooltip();
      })
      .on('mouseout', () => {
        hoveredNode = null;
        updateTooltip();
      })
      .on('click', (event, d) => {
        if (d.id !== this.selectedCategory) {
          this.selectedCategory = d.id;
        } else {
          this.selectedCategory = null;
        }
        updateHighlights();
        event.stopPropagation(); // The event won't trigger on parent elements
      });

    this.svg.on('click', () => {
      this.selectedCategory = null;
      updateHighlights();
    });

    updateHighlights(); // Initial update

    this.container.node().append(this.svg.node());

    //invalidation.then(() => simulation.stop());

  }
}






