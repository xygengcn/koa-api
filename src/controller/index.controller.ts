import { ApiError, ApiRequestType, ApiRouteParams, Controller, Get, Log, Post, Request } from '@/core';

@Controller('/')
export default class IndexController {
    private age = 111;
    private test() {
        this.age = 333;
        return 2222;
    }

    @Get('/get')
    public get({ ctx }: ApiRouteParams) {
        console.error('IndexController.get', this, this?.age);
        Log('测试日志');
        return this.test();
    }

    @Request({ url: '/error', type: ApiRequestType.GET })
    public error(ctx) {
        throw new ApiError({
            code: 10001,
            error: 'error报错'
        });
    }

    @Post('/post')
    public post(ctx) {
        return 1;
    }
}
