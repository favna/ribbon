module.exports = {
    displayName: 'ts-jest',
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/test/*.test.ts'],
    setupFiles: ['<rootDir>/test/jest.setup.ts'],
};