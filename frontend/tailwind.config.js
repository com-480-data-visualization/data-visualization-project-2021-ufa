module.exports = {
  purge: [
    './src/**/*.html',
    './src/**/*.js',
  ],
  darkMode: false,
  theme: {
    extend: {
      gridRow: {
        'span-7': 'span 7 / span 7',
      },
      gridTemplateRows: {
        '12': 'repeat(12, minmax(0, 1fr))',
      },
    },
  },
  variants: {},
  plugins: [],
};
