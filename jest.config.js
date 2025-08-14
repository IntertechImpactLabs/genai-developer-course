/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['.venv'],
  testPathIgnorePatterns: ['/node_modules/', '/.venv/'],
  projects: [
    {
      displayName: 'currency-formatter',
      preset: 'ts-jest',
      testMatch: ['<rootDir>/section1/03_currency_formatter_exercise/**/*.test.ts'],
      transform: {
        '^.+\\.tsx?$': 'ts-jest'
      }
    },
    {
      displayName: 'cache-helper',
      preset: 'ts-jest',
      testMatch: ['<rootDir>/section2/02_cache_helper_exercise/**/*.test.ts'],
      transform: {
        '^.+\\.tsx?$': 'ts-jest'
      }
    },
    {
      displayName: 'refactoring-demo',
      testMatch: ['<rootDir>/section3/01_refactoring_demo/**/*.test.js'],
      testEnvironment: 'node'
    },
    {
      displayName: 'validation-library',
      testMatch: ['<rootDir>/section2/04_validation_library/**/*.test.js'],
      testEnvironment: 'node'
    }
  ],
  collectCoverageFrom: [
    'section*/**/*.{js,ts}',
    '!section*/**/*.d.ts',
    '!section*/**/node_modules/**',
    '!section*/**/dist/**'
  ]
};