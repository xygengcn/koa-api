import { join } from 'path';
import Api from './core';

const api = new Api({
    controllerPath: join(__dirname, 'controller')
});

api.onError((content) => {
    console.log('错误', content);
});
api.onLog((content) => {
    console.log('日志', content);
});

api.start();
