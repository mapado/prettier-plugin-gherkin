export default {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!<rootDir>/node_modules/',
    '!src/prettier-comments/**/*.js',
  ],
  coverageDirectory: './coverage/',
  setupFiles: ['<rootDir>/tests_config/run_spec.mjs'],
  snapshotSerializers: ['<rootDir>/tests_config/raw-serializer.cjs'],
  testEnvironment: 'node',
  testRegex: 'jsfmt\\.spec\\.[cm]?js$|__tests__/.*\\.[cm]?js$',
  transform: {},
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};
