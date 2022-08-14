import { join } from 'path';
import Api from './core';
import OriginMiddleware from './middleware/origin.middleware';
import transform from './transform';

const api = new Api({
    transform,
    controllerPath: join(__dirname, 'controller'),
    // 自定义错误提示
    error: {
        message: {
            notFound: '找不到此接口'
        }
    }
});

api.useMiddleware(OriginMiddleware, 1);

api.logger.onError((content, options) => {
    console.log('错误', content);
});
api.logger.on('log', (content) => {
    console.log('日志', content);
});

api.start();
