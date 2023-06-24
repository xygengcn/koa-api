const typescript = require('@rollup/plugin-typescript');
const commonjs = require('@rollup/plugin-commonjs');
const dts = require('rollup-plugin-dts');
const tscAlias = require('rollup-plugin-tsc-alias');
const json = require('@rollup/plugin-json');
module.exports = [
    {
        input: './src/index.ts',
        output: [
            {
                file: './dist/index.js',
                format: 'cjs',
                exports: 'named'
            },
            {
                file: './dist/index.esm.js',
                format: 'esm'
            }
        ],
        plugins: [
            typescript({
                tsconfig: './tsconfig.build.json'
            }),
            tscAlias(),
            json(),
            commonjs()
        ]
    },
    {
        input: './src/index.ts',
        output: [{ file: 'dist/index.d.ts', format: 'esm' }],
        plugins: [
            dts.default({
                tsconfig: './tsconfig.build.json'
            })
        ]
    }
];
