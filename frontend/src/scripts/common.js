import * as d3 from 'd3';

export const CATEGORIES = Object.freeze([
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
    keywords: ['hep-ph', 'hep-th', 'hep-lat', 'hep-ex'],
  },
  {
    label: 'Condensed Matter Physics',
    keywords: ['cond-mat'],
  },
  {
    label: 'General Physics',
    keywords: ['physics', 'nucl-ex'],
  },
  {
    label: 'Computer Science',
    keywords: ['cs'],
  },
  {
    label: 'Mathematics',
    keywords: ['math', 'stat', 'nlin', 'q-alg'],
  },
  {
    label: 'Biology',
    keywords: ['bio'],
  },
  {
    label: 'Economics',
    keywords: ['econ', 'q-fin'],
  },
  {
    label: 'Other',
    keywords: null,
  },
].map((obj, idx) => ({ ...obj, index: idx })));

export const getCategoryIndexAndLabel = name => {
  for (let i = 0; i < CATEGORIES.length; i++) {
    const category = CATEGORIES[i];
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

// TODO rename/clean that
export const margin = { top: 5, right: 30, bottom: 70, left: 40 };
export const widthChart = 260 - margin.left - margin.right;
export const heightChart = 200 - margin.top - margin.bottom;

export const categoriesColors = d3.schemeTableau10;

export const color = d => {
  const { index } = getCategoryIndexAndLabel(d.id);
  return categoriesColors[index];
};

export const ALL = 'all';
