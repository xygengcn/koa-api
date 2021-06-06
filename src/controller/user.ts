/**
 * 测试用例
 */

import AppController, { AuthCallback, AuthContext, Context, Controller, GET, Next, Params } from '@core/app';
import Test from '@model/test';

/**
 * 验证成功
 * 使用静态方法，方法内部的this指向类本身
 *
 * 验证方法
 * @param ctx
 * @param next
 * @param params
 */
function auth(context: AuthContext): boolean {
    return true; //验证通过
}

/**
 * 验证失败,callback可以自定义失败返回
 *
 * 使用静态方法，方法内部的this指向类本身
 *
 * 验证方法
 * @param ctx
 * @param next
 * @param params
 */
function authError(context: AuthContext, callback: AuthCallback): boolean {
    callback({
        code: 10405,
        error: '验证失败测试用例',
    });
    return false; //验证通过
}
@Controller('/user')
export default class UserController extends AppController {
    /**
     * 1、跨域测试用例
     *
     * origin：允许的域名数组，请携带http或者https，后缀请不要带/
     *
     * 协议://域名:端口
     *
     * @returns
     */
    @GET({
        url: '/',
        origin: ['http://localhost:5330', 'http://localhost:523300'],
    })
    get() {
        return {
            name: this.name,
        };
    }

    /**
     * 2、配置文件测试用例：读取配置和写入配置
     *
     * @param ctx
     * @param next
     * @param params
     * @returns
     */
    @GET('/config')
    setConfig(ctx: Context, next: Next, params: Params) {
        // 读取配置的name，格式为a.b.c => {a:{b:{c:123}}} 结果为123
        const oldName = this.$config.get('name');
        // 修改配置，默认写入配置文件，第三个参数false则不修改文件仅修改内存
        this.$config.set('name', 'new openApi');
        return {
            database: this.$config.get('database.host'), // 读取数据库配置的database的host
            oldName,
            newName: 'new openApi',
            configs: this.$config.get(),
        };
    }

    /**
     * 3、数据库测试用例
     *
     *
     * @param ctx
     * @returns
     */
    @GET('/get')
    async ok(ctx: Context, next: Next, params: Params) {
        // 调用模版数据
        const data: any = await Test.getOne();
        return {
            name: this.name,
            data: data,
        };
    }

    /**
     *
     * 4、返回字符串测试用例
     *
     * 默认返回json
     *
     * type 返回类型：json｜html
     *
     * @returns
     */
    @GET({ url: '/user2', type: 'html' })
    user2(ctx: Context, next: Next, params: Params) {
        return '这是一条字符串';
    }

    /**
     *
     * 5、验证成功测试用例
     *
     * 用处：可以验证是否有token、跨域等问题
     *
     * 参数auth 为验证是否可以访问这个接口，方法内部的this指向类本身
     *
     * auth ：(context: { ctx: Context; next: Next; params: Object | undefined | null },callback?: (error: { code: number; msg: string; developMsg?: string }) => any) => boolean | Promise<boolean>
     *
     * 参数error：可以设置没有权限时返回的数据
     *
     * error： {code: number; msg: string;developMsg?: string;}
     *
     * auth返回false将不会执行下面的操作
     *
     * @returns
     */
    @GET({ url: '/auth', auth: auth })
    userauth(ctx: Context, next: Next, params: Params) {
        console.log('验证路由');
        return {
            name: this.name,
        };
    }

    /**
     * 6、验证失败测试用例
     */
    @GET({ url: '/authError', auth: authError })
    userauthError(ctx: Context, next: Next, params: Params) {
        return {
            name: this.name,
        };
    }
}
