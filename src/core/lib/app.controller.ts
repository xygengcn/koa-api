import KoaRouter, { ILayerOptions } from 'koa-router';
import { Context, DefaultState } from 'koa';
import { AppControllerExts } from './app.controllerExts';

export default class AppController extends KoaRouter<DefaultState, Context> {
    name: string;

    opts?: ILayerOptions;

    /**
     * 用户配置
     */
    exts: AppControllerExts;

    constructor(name?: string, prefix?: string) {
        super();
        this.name = name || '';
        this.setPrefix(prefix);
        this.exts = new AppControllerExts();
    }

    /**
     * 设置前缀
     * @returns
     */
    public setPrefix(prefix?: string) {
        if (prefix) {
            prefix = prefix.includes('/') ? prefix : `/${prefix}`;
            this.prefix(prefix);
        }
    }

    /**
     * 判断是不是控制器
     */
    public isController(): boolean {
        return this.hasOwnProperty('stack');
    }
}
