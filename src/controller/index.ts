/**
 * 测试用例
 */

import AppController, { Context, Controller, GET, Next, Params, POST } from '@core/app';

@Controller('/')
export default class IndexController extends AppController {
    /**
     * 1、常规get请求测试用例
     *
     * /get
     *
     * @param ctx
     * @param next
     * @param params
     * @returns
     */
    @GET('/get')
    async index(ctx: Context, next: Next, params: Params) {
        this.console();
        return {
            msg: '这是常规的get请求',
            className: this.name,
            name: ctx.routerName,
            mode: process.env.NODE_ENV
        };
    }

    /**
     * 2、常规post请求测试用例
     *
     * /post
     *
     * @param ctx
     * @returns
     */
    @POST('/post')
    async hello(ctx: Context, next: Next, params: Params) {
        console.log(this.name);
        return {
            msg: '这是常规的post请求',
            mode: process.env.NODE_ENV
        };
    }

    /**
     * 3. 普通函数
     */
    private console() {
        console.log(this.name);
    }
}
