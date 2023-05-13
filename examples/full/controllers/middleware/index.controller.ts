import { Get, Controller, Middleware } from '@/decorators';
import { TestStringMiddleware, TestNumberMiddleware } from 'examples/full/middlewares';

@Middleware(TestNumberMiddleware)
@Controller()
export default class MiddlewareController {
    @Middleware(TestStringMiddleware)
    @Get('/test')
    public testRouteMiddle() {
        return 'hello world';
    }

    @Get('/test2')
    public testClassMiddle() {
        return 'hello world';
    }

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
