import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';
import ts from 'typescript';
import { readFileSync } from 'fs';
import ttypescript from 'ttypescript';

export default [
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
                typescript: ttypescript,
                tsconfig: './tsconfig.build.json',
                tsconfigDefaults: {
                    module: 'ESNext'
                }
            })
        ],
        external: ['http', 'http2', 'fs', 'path', 'events', 'koa-router', 'koa', 'koa-compose', 'koa-body']
    },
    {
        input: 'dist/index.d.ts',
        output: [{ file: 'dist/core.d.ts', format: 'esm' }],
        plugins: [
            dts({
                compilerOptions: {
                    baseUrl: './src',
                    paths: ts.readConfigFile('./tsconfig.build.json', (p) => readFileSync(p, 'utf8')).config.compilerOptions.paths
                }
            })
        ]
    }
];
