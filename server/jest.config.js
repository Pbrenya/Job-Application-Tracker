module.exports = {
    // The root directory that Jest should scan for tests and modules within
    rootDir: '.',

    // A list of paths to directories that Jest should use to search for files in
    roots: ['<rootDir>'],

    // The test environment that will be used for testing
    testEnvironment: 'node',

    // The glob patterns Jest uses to detect test files
    testMatch: [
        '**/__tests__/**/*.test.js'
    ],

    // A path to a module which exports an async function that is triggered once before all test suites
    setupFilesAfterEnv: ['../jest.setup.js'],
};
