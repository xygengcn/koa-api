import { ApiError, ApiRequestMethod, ApiResponseType, ApiRouteParams, Controller, Get, Log, Post, Redirect, Request } from '@/core';
import { createReadStream } from 'fs';
import path from 'path';
@Controller('/', { name: '测试接口', description: '下面是测试一堆实例' })
export default class IndexController {
    private age = 111;
    private test() {
        this.age = 333;
        return 2222;
    }

    @Get('/get', { name: '测试Get请求的接口', description: '这是描述' })
    public get({ ctx }: ApiRouteParams) {
        console.error('IndexController.get', this, this?.age);
        Log('测试日志');
        return this.test();
    }

    @Get('/log', { name: '测试日志的接口' })
    public log({ ctx }: ApiRouteParams) {
        Log('测试日志');
        return {
            msg: '测试日志'
        };
    }

    @Request({ url: '/error', method: [ApiRequestMethod.GET, ApiRequestMethod.POST, ApiRequestMethod.PUT], name: '测试错误请求的接口', description: '这是描述' })
    public error({ ctx }) {
        throw new ApiError({
            code: 10001,
            error: 'error报错'
        });
    }

    @Post('/post', { name: '测试Post请求的接口', description: '这是描述' })
    public post({ body }: ApiRouteParams) {
        return {
            body
        };
    }

    /**
     * 图片测试
     * @param param0
     * @returns
     */
    @Get('/img', { responseType: ApiResponseType.DEFAULT, name: '测试图片预览的接口', description: '这是描述' })
    public showTodayImage({ ctx }: ApiRouteParams) {
        ctx.set('content-type', 'image/jpeg');
        return createReadStream(path.join(__dirname, '../../temp/test.jpeg'));
    }

    /**
     * 重定向测试
     * @param param0
     * @returns
     */
    @Redirect('/redirect', { name: '重定向接口', description: '可以在直接重定向到其他页面' })
    public redirect({ ctx }: ApiRouteParams) {
        return 'https://baidu.com';
    }

    /**
     * 空测试
     * @returns
     */
    @Get('/nocontent')
    public noContent() {
        return null;
    }

    /**
     * 跨域测试
     * @returns
     */
    @Get('/origin', { origin: ['xygeng.cn'] })
    public origin() {
        return '11';
    }
}
