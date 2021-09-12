/**
 * 每一个接口封装一个类
 */

export default class AppControllerMethod implements ControllerMethod {
    // 函数名 + 类名
    public routeName: string = '';

    // 自定义名字
    public name: string = '';

    // 函数体
    public value: Function = () => {};

    // 路由
    public url: string = '';

    // 请求头要求
    public headers: ControllerMethod['headers'] = {};

    // 请求方法
    public method: ControllerMethod['method'] = 'GET';

    // auth
    public auth: ControllerMethod['auth'];

    // 跨域属性
    public origin: ControllerMethod['origin'] = [];

    // 返回类型标明
    public returns: ControllerMethod['returns'] = {};

    // get请求参数
    public query: ControllerMethod<any, Type<String>>['query'] = {};

    // post参数的content
    public content: ControllerMethod['content'] = {};

    // post参数的exts
    public exts: ControllerMethod['exts'] = {};

    // 返回配置
    public response: ResponseOptions = {};

    // 接口描述
    public description: string = '';

    // 默认值
    public defaultValue: any = '';

    constructor(target?) {
        Object.assign(this, target);
    }

    // 合并属性
    public merge(options: ControllerMethod) {
        Object.assign(this, options);
    }
}
