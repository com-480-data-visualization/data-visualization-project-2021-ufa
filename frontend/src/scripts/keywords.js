import * as d3 from 'd3';
import * as d3cloud from 'd3-cloud';
import * as seedrandom from 'seedrandom';
import { ALL, color } from './common';

export class Keywords {
  constructor(papersKeywords) {
    this.papersKeywords = papersKeywords;
    this.container = d3.select('#keywords');
    this.placeholder = d3.select('#keywords-placeholder');

    const containerDom = this.container.node();
    const aspect = containerDom.clientWidth / containerDom.clientHeight;
    this.width = 1000;
    this.height = this.width / aspect;

    this.year = ALL;
    this.category = ALL;
    this.selected = null;
  }

  initialize(cloud) {
    this.cloud = cloud;
  }

  setYear(year) {
    if (this.year !== year) {
      this.year = year;
      this.update();
    }
  }

  setCategory(category) {
    if (this.category !== category) {
      this.category = category;
      this.update();
    }
  }

  update() {
    this.container.selectAll('*').remove();
    const tooltip = d3.select('#keywords-tooltip');

    const keywordsData = this.papersKeywords.keywords;
    const yearData = keywordsData[this.year];
    const data = yearData && yearData[this.category];
    let shown;
    if (data && data.keywords.length) {
      const keywordsData = data.keywords.slice(0, 50); // Looks good on most screens
      // eslint-disable-next-line no-unused-vars
      const total = data.total;
      const counts = keywordsData.map(array => array[1]);
      // eslint-disable-next-line no-unused-vars
      const minCount = Math.min(...counts), maxCount = Math.max(...counts);

      const bestCategoryMatchForKeyword = keyword => {
        let max = 0;
        let bestCategory = null;
        Object.entries(yearData).filter(t => t[0] !== ALL).map(([category, data]) =>
          data.keywords.forEach(([thatKeyword, count]) => {
            if (keyword === thatKeyword && count > max) {
              max = count;
              bestCategory = category;
            }
          }));
        return bestCategory;
      };

      const draw = words => {
        const svg = this.container.append('svg')
          .attr('viewBox', [0, 0, this.width, this.height].join(' '))
          .attr('class', 'max-w-full max-h-full overflow-visible')
          .on('click', () => {
            this.selected = null;
            this.update();
            this.cloud.update();
          });

        svg
          .append('g')
          .attr('transform', 'translate(' + layout.size()[0] / 2 + ',' + layout.size()[1] / 2 + ')')
          .attr('text-anchor', 'middle')
          .attr('font-weight', 'bold')
          .selectAll('text')
          .data(words)
          .enter().append('text')
          .style('font-size', d => d.size)
          .attr('transform', d => 'translate(' + [d.x, d.y] + ')')
          .classed('cursor-pointer', true).classed('select-none', true)
          .attr('fill', d => {
            const match = bestCategoryMatchForKeyword(d.text);
            // Due to the `ALL` selector, this can happen. In this case fall back to the default color
            return color({ id: match !== null ? match : '' });
          })
          .text(d => d.text)
          .classed('opacity-20', d => this.selected !== null && d.text !== this.selected)
          .on('click', (e, d) => {
            e.stopPropagation();
            this.selected = d.text;
            this.update();
            this.cloud.update();
          });
      };

      const minSize = 10, maxSize = 50;
      const layout = d3cloud()
        .size([this.width, this.height])
        .words(keywordsData.map(([keyword, count]) => ({
          text: keyword,
          size: minSize + (maxSize - minSize) * count / maxCount,
        })))
        .padding(5)
        .rotate(false)
        .font('Poppins')
        .fontSize(d => d.size)
        .random(seedrandom(1))
        .on('end', draw);

      layout.start();
      shown = true;
    } else {
      shown = false;
    }

    this.placeholder.classed('hidden', shown);

    let hoveredWord = null;
    const keywords = this.container.select('svg').selectAll('text');
    keywords
      .on('mouseover', (_, d) => {
        hoveredWord = d;
        updateTooltip();
      })
      .on('mouseout', () => {
        hoveredWord = null;
        updateTooltip();
      });

    const updateTooltipPosition = () => {
      const word = hoveredWord;
      if (word) {
        tooltip
          .style('top', (word.y / this.height * this.container.node().clientHeight) + 'px')
          .style('left', (word.x / this.width * this.container.node().clientWidth) + 'px');
      }
    };

    const updateTooltip = () => {
      updateTooltipPosition();
      let count;
      for (let i = 0; i < data.keywords.length; i++)
        if (data.keywords[i][0] === hoveredWord.text)
          count = data.keywords[i][1];

      //d3.select('#keywords-tooltip-id').text(hoveredBar && hoveredBar.id).style('color', hoveredBar && color(hoveredBar));
      d3.select('#keywords-tooltip-category').text(hoveredWord && this.category);
      d3.select('#keywords-tooltip-year').text(hoveredWord && this.year);
      d3.select('#keywords-tooltip-count').text(hoveredWord && count);

      tooltip.classed('hidden', !hoveredWord);
    };

  }
}
