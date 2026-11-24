const js = require('@eslint/js');
const globals = require('globals');

/**
 * Code-quality rules for the backend. Run with: npm run lint
 * (Layout such as spaces, quotes and line length is handled separately by Prettier.)
 */
module.exports = [
  { ignores: ['node_modules/', 'coverage/'] },

  // ESLint's recommended rules catch common mistakes, such as unused variables or typos in names
  js.configs.recommended,

  // The backend runs on Node.js and uses require / module.exports
  {
    files: ['**/*.js'],
    languageOptions: { sourceType: 'commonjs', globals: { ...globals.node } },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: { globals: { ...globals.node, ...globals.jest } },
  },
];
