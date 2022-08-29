import { Controller, Get, Post } from '@/core';

/**
 * 测试控制器中间件
 */

const controllerMiddleware = async (ctx, next) => {
    console.log('这是控制器中间件');
    return await next();
};

/**
 * 测试函数中间件
 */
const methodMiddleware = async (ctx, next) => {
    console.log('这是函数中间件');
    return await next();
};

@Controller('/', { name: '测试文档接口', description: '测试接口' }, [controllerMiddleware])
export default class TestController {
    @Get('/get', { name: '测试控制器中间件接口' })
    public get() {
        return '测试控制器中间件接口';
    }

    @Post('/post', { name: '测试函数中间件接口', middlewares: [methodMiddleware], description: '这是描述' })
    doc() {
        return {
            msg: '测试函数中间件接口'
        };
    }
}
