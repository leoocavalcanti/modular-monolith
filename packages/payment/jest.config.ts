export default {
  displayName: 'payment',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/payment',
  testMatch: [
    '<rootDir>/**/__test__/**/*.(spec|test).ts',
    '<rootDir>/**/core/**/*.(spec|test).ts',
  ],
};