const typescript = require('@rollup/plugin-typescript');
const commonjs = require('@rollup/plugin-commonjs');
const dts = require('rollup-plugin-dts');
const ts = require('typescript');
const { readFileSync, readdirSync, statSync, rmdirSync } = require('fs');
const tscAlias = require('rollup-plugin-tsc-alias');
const resolve = require('@rollup/plugin-node-resolve');
const json = require('@rollup/plugin-json');
const { join } = require('path');

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
            tscAlias(),
            json(),
            commonjs({ transformMixedEsModules: true }),
            resolve({ preferBuiltins: true }),
            typescript({
                tsconfig: './tsconfig.build.json'
            })
        ]
    },
    {
        input: './dist/index.d.ts',
        output: [{ file: 'dist/index.d.ts', format: 'esm' }],
        plugins: [
            dts.default({
                compilerOptions: {
                    baseUrl: './src',
                    paths: ts.readConfigFile('./tsconfig.build.json', (p) => readFileSync(p, 'utf8')).config.compilerOptions.paths
                }
            }),
            {
                name: 'delete',
                buildEnd: async () => {
                    const files = readdirSync('./dist/');
                    files.forEach((file) => {
                        const dir = join('./dist/', file);
                        const stat = statSync(dir);
                        if (stat.isDirectory()) {
                            rmdirSync(dir, { recursive: true });
                        }
                    });
                }
            }
        ]
    }
];
