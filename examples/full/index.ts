import Api from '@/app';
import path from 'path';
import { GlobalLogMiddleware, GlobalLogMiddleware2 } from './middlewares';

const api = new Api({ baseUrl: path.join(__dirname, './controllers') });

api.use(GlobalLogMiddleware);

api.use(GlobalLogMiddleware2);

api.on('http', (...args) => {
    console.log('[http]', ...args);
});

api.on('log', (...args) => {
    console.log('[log]', ...args);
});

api.on('start', () => {
    console.log('[start]');
});

api.on('error', (e) => {
    console.error('[error]', e);
});

api.start();
