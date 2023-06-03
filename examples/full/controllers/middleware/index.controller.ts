import { Get, Controller, Middleware } from '@/decorators';
import { TestStringMiddleware, TestNumberMiddleware } from 'examples/full/middlewares';

@Middleware(TestNumberMiddleware)
@Controller()
export default class MiddlewareController {
    /**
     * 测试路由中间件
     * @returns
     */
    @Middleware(TestStringMiddleware)
    @Get('/test')
    public testRouteMiddle() {
        return 'result is hello world';
    }

    /**
     * 测试控制器中间件
     * @returns
     */
    @Get('/test2')
    public testClassMiddle() {
        return 'result is hello world2';
    }

    /**
     * 测试异步中间件
     * @returns
     */
    @Get('/test3')
    public testAsyncMiddle() {
        const sleep = () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve('hello world');
                }, 500);
            });
        };
        return sleep().then((result) => {
            console.log('[GlobalLogMiddleware] middle');
            return result;
        });
    }
}
