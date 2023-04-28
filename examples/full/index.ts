import Api from '@/app';
import path from 'path';

const api = new Api({ baseUrl: path.join(__dirname, './controllers') });

api.on('http', (...args) => {
    console.log('[http]', ...args);
});

api.on('start', () => {
    console.log('[start]');
});

api.on('error', (e) => {
    console.log(e);
});

api.start();
