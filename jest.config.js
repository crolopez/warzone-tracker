module.exports = {
  globals: {
    'ts-jest': {
      'tsConfig': 'tsconfig.json',
    },
  },

  testEnvironment: 'node',

  moduleFileExtensions: [
    'ts',
    'js',
  ],

  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
  },

  transform: {
    '^.+\\.(ts)$': 'ts-jest',
  },

  // Coverage
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/handler.ts',
    '!<rootDir>/src/utils/messages.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 70,
      lines: 80,
      statements: -10,
    },
  },
}