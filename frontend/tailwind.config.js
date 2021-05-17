module.exports = {
  purge: [
    './src/**/*.html',
    './src/**/*.js',
  ],
  darkMode: false,
  theme: {
    extend: {
      gridTemplateRows: {
        '12': 'repeat(12, minmax(0, 1fr))',
      },
    },
  },
  variants: {},
  plugins: [],
};
