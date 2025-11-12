export default {
  displayName: 'cart',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/cart',
  testMatch: [
    '<rootDir>/**/__test__/**/*.(spec|test).ts',
    '<rootDir>/**/core/**/*.(spec|test).ts',
  ],
};