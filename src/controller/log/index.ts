/**
 * 测试用例
 */

import AppController, { Context, Controller, GET, Next, Params } from '@core/app';

/**
 * 如果设置前缀默认继承文件夹，/文件夹名/前缀/方法
 */
@Controller('/')
export default class LogController extends AppController {
    /**
     * 1、自定义路由地址用例
     *
     *  实际请求地址 ： /log/ok
     *
     * this.$log.success｜info｜error｜console 都可以用来打印日志，前三者可以写入日志系统管理
     *
     * @returns
     */
    @GET({ url: '/ok' })
    log1(ctx: Context, next: Next, params: Params) {
        return {
            msg: 'hello world'
        };
    }

    /**
     * 2、增加日志测试用例
     *
     * /log/log2
     *
     * @param ctx
     * @returns
     */
    @GET()
    async log2(ctx: Context, next: Next, params: Params) {
        this.$log.success('34567890');
        return {
            mode: process.env.NODE_ENV
        };
    }

    /**
     * 3、获取日志用例
     *
     * log：local｜console  默认两个都有，空数据组则此请求不进入日志系统
     *
     * /log/read
     *
     * @param ctx
     * @param next
     * @param params
     * @returns
     */
    @GET({
        url: '/read',
        log: []
    })
    async read(ctx: Context, next: Next, params: Params) {
        const logs = await this.$log.read();
        return logs;
    }
}
