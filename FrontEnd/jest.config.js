/**
 * Jest test settings for the web app.
 * Tests live in tests/: "acceptance" follows each acceptance criterion through the
 * whole app, "components" checks single components, "unit" checks plain functions.
 */
module.exports = {
  // Run tests in a simulated browser (jsdom), so React components can render
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  // Runs before each test file: adds checks such as toBeInTheDocument()
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  // Reset every mock before each test, so one test can't affect another
  resetMocks: true,
  // Whole-app tests type into forms in a simulated browser, which takes a few seconds,
  // and longer when all test files run at once. Jest's default limit is 5 seconds.
  testTimeout: 20000,
  // Print every test's name, so the output reads like a checklist of behaviours
  verbose: true,
};
