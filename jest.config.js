module.exports = {
    displayName: 'test',
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/test/*.spec.ts'],
    setupFiles: ['<rootDir>/test/jest.setup.ts'],
};