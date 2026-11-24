/**
 * Jest test settings for the backend.
 * Tests live in tests/: "api" sends HTTP requests through the whole app,
 * "unit" checks single files.
 */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  // Test settings (instead of a .env file), applied before each test file
  setupFiles: ['<rootDir>/tests/setupEnv.js'],
  // Print every test's name, so the output reads like a checklist of behaviours
  verbose: true,
};
