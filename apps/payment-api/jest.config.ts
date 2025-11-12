export default {
  displayName: 'payment-api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/payment-api',
  testMatch: [
    '<rootDir>/**/__test__/**/*.(spec|test).ts',
  ],
};