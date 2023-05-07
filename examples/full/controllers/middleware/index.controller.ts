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
}
