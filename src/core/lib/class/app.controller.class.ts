import KoaRouter, { ILayerOptions } from 'koa-router';
import AppControllerMethod from './app.controller.method.class';
/**
 * 综合接口封装成一个类
 */

export default class AppControllerClass extends KoaRouter {
    /**
     * 类名
     */
    public readonly className: string = '';

    /**
     * 前缀
     */
    public path: string = '';
    /**
     * doc标题
     */
    public readonly name?: string = '';

    /**
     * 接口描述
     */
    public readonly description?: string = '';

    /**
     * 是否置顶导航栏
     */
    public readonly isTop?: boolean = false;

    /**
     * 路由配置
     */
    public opts?: ILayerOptions;

    /**
     * 自定义配置
     */
    public controllers: {
        [key: string]: AppControllerMethod;
    } = {};

    /**
     * 设置前缀
     * @returns
     */
    public setPrefix(prefix?: string) {
        if (prefix) {
            prefix = prefix.indexOf('/') === 0 ? prefix : `/${prefix}`;
            this.path = prefix;
            this.prefix(prefix);
        }
    }

    /**
     * 保存自定义配置
     * @param methodName
     * @param controller
     */
    public setController(methodName: string, controller: AppControllerMethod) {
        this.controllers[methodName] = controller;
    }

    constructor(options?: ControllerOptions & { className?: string; path?: string }) {
        super();
        Object.assign(this, options);
        this.setPrefix(options?.path);
    }
}
