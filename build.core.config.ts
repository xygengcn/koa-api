import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import tscAlias from 'rollup-plugin-tsc-alias';
import resolve from '@rollup/plugin-node-resolve';

export default {
    input: './src/core/index.ts',
    output: {
        file: './dist/index.js',
        format: 'cjs',
        exports: 'named'
    },
    plugins: [
        resolve(),
        typescript({
            tsconfig: './tsconfig.build.json',
            tsconfigDefaults: {
                module: 'ESNext'
            }
        }),
        commonjs({ transformMixedEsModules: true }),
        tscAlias()
    ],
    external: ['http', 'http2', 'fs', 'path', 'events', 'koa-router', 'koa', 'koa-compose', 'koa-body']
};
