const path = require('path');
const rootDir = path.resolve(__dirname);
require('dotenv').config({ path: path.join(rootDir, '.env') });

module.exports = {
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: false,
      tsconfig: './tsconfig.test.json',
    }],
  },
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '#app/database/schema/core.js': path.join(rootDir, 'packages/database/src/schema/core.ts'),
    '#app/database/schema/auth.js': path.join(rootDir, 'packages/database/src/schema/auth.ts'),
    '#app/database/schema/index.js': path.join(rootDir, 'packages/database/src/schema/index.ts'),
    '#app/core/(.*)': path.join(rootDir, 'src/core/$1'),
    '#app/auth/(.*)': path.join(rootDir, 'src/auth/$1'),
    '#app/common/(.*)': path.join(rootDir, 'src/common/$1'),
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',
};