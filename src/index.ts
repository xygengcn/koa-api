import { join } from 'path';
import Api, { ApiError } from './core';
import OriginMiddleware from './middleware/origin.middleware';
import transform from './transform';

const api = new Api({
    namespace: 'koa-api',
    transform,
    controllerPath: join(__dirname, 'controller'),
    errHandle: (error, msg) => {
        return new ApiError({
            code: '2323',
            userMsg: '111'
        });
    }
});

api.use(OriginMiddleware, 1);

api.logger.onError((content, options) => {
    console.log('错误', content);
});
api.logger.on('log', (content) => {
    console.log('日志', content);
});

api.start();
