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
