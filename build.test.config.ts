import commonjs from '@rollup/plugin-commonjs';
export default {
    input: './test/tsc/index.js',
    output: {
        file: './test/index.js',
        format: 'cjs',
        exports: 'default'
    },
    plugins: [commonjs({ transformMixedEsModules: true })],
    external: ['http', 'http2', 'fs', 'path', 'events', 'koa-router', 'koa', 'koa-compose', 'koa-body']
};
