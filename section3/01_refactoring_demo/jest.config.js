module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/init-db.js',
    '!src/server.js'
  ],
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: true
};
