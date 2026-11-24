import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

/**
 * Code-quality rules for the frontend. Run with: npm run lint
 * (Layout such as spaces, quotes and line length is handled separately by Prettier.)
 */
export default [
  { ignores: ['node_modules/', 'dist/', 'coverage/'] },

  // ESLint's recommended rules catch common mistakes, such as unused variables or typos in names
  js.configs.recommended,

  // The app runs in the browser and uses import / export and JSX
  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  // React rules: hooks are used correctly, and files work with instant reloading in development
  { ...reactHooks.configs.flat.recommended, files: ['src/**/*.{js,jsx}'] },
  { ...reactRefresh.configs.vite, files: ['src/**/*.jsx'] },
  {
    files: ['tests/**/*.{js,jsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node, ...globals.jest } },
  },
  // Config files that Node runs with require / module.exports (used by Jest)
  {
    files: ['jest.config.js', 'babel.config.js'],
    languageOptions: { sourceType: 'commonjs', globals: { ...globals.node } },
  },
  {
    files: ['vite.config.mjs', 'eslint.config.mjs'],
    languageOptions: { globals: { ...globals.node } },
  },
];
