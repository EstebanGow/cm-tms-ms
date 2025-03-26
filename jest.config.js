const { resolve } = require('path')

module.exports = {
    preset: 'ts-jest',
    // setupFilesAfterEnv: ['<rootDir>/test/mocks/jest.setup.ts'],
    testEnvironment: 'node',
    testMatch: ['**/*.steps.ts', '**/*.test.ts'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/index.ts',
        '!src/**/*/index.ts',
        '!src/**/*/Server.ts',
        '!src/infrastructure/**/*.ts',
        '!src/common/**/*.ts',
        '!src/modules/**/domain/**/*.ts',
        '!src/modules/**/*Module.ts',
        '!src/modules/**/schemas/*.ts',
        '!src/modules/**/dependencies/*.ts',
        'src/modules/**/controllers/schemas/*.ts',
    ],
    coverageDirectory: './coverage/',
    collectCoverage: true,
    moduleNameMapper: {
        '^@application/(.*)$': resolve(__dirname, './src/application/$1'),
        '^@domain/(.*)$': resolve(__dirname, './src/domain/$1'),
        '^@infrastructure/(.*)$': resolve(__dirname, './src/infrastructure/$1'),
        '^@configuration/(.*)$': resolve(__dirname, './src/configuration/$1'),
        '^@common/(.*)$': resolve(__dirname, './src/common/$1'),
        '^@modules/(.*)$': resolve(__dirname, './src/modules/$1'),
        '^@configuration': resolve(__dirname, './src/configuration/index'),
        '^@util': resolve(__dirname, './src/util/index'),
        '^axios$': require.resolve('axios'),
        '^@modules': resolve(__dirname, './src/modules/index'),
        '^@common': resolve(__dirname, './src/common/index'),
    },
    maxWorkers: 1,
    globals: {
        'ts-jest': {
            isolatedModules: true,
        },
    },
    reporters: ['default', ['jest-junit', { outputDirectory: 'test-results', outputName: 'test-report.xml' }]],
}
