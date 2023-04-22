const typescript = require('@rollup/plugin-typescript');
const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');
const dts = require('rollup-plugin-dts');
const ts = require('typescript');
const { readFileSync } = require('fs');

module.exports = [
    {
        input: './src/core/index.ts',
        output: {
            file: './dist/index.js',
            format: 'cjs',
            exports: 'named'
        },
        plugins: [
            commonjs({ transformMixedEsModules: true }),
            resolve(),
            typescript({
                tsconfig: './tsconfig.build.json'
            })
        ],
        external: ['http', 'http2', 'fs', 'path', 'events', 'koa-router', 'koa', 'koa-compose', 'koa-body']
    },
    {
        input: 'dist/index.d.ts',
        output: [{ file: 'dist/core.d.ts', format: 'esm' }],
        plugins: [
            dts.default({
                compilerOptions: {
                    baseUrl: './src',
                    paths: ts.readConfigFile('./tsconfig.build.json', (p) => readFileSync(p, 'utf8')).config.compilerOptions.paths
                }
            })
        ]
    }
];
