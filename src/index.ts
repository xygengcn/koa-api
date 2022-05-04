import { join } from 'path';
import Api from './core';
import OriginMiddleware from './middleware/origin.middleware';

const api = new Api({
    controllerPath: join(__dirname, 'controller'),
    // 自定义错误提示
    error: {
        message: {
            notFound: '找不到此接口'
        }
    }
});

api.unshiftUseMiddleware(OriginMiddleware);

api.onError((content) => {
    console.log('错误', content);
});
api.onLog((content) => {
    console.log('日志', content);
});

api.start();
