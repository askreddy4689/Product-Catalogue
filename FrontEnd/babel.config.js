/**
 * Babel is used only by Jest: it turns JSX and import/export into code that Node can run.
 * Vite does not use this file; it compiles the app on its own.
 */
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
};
