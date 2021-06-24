import KoaRouter, { ILayerOptions } from "koa-router";
import { Context, DefaultState } from "koa";
import { AppControllerExts } from "./app.controllerExts";

export default class AppController extends KoaRouter<DefaultState, Context> {
    name: string;

    opts?: ILayerOptions;

    /**
     * 用户配置
     */
    exts: AppControllerExts;

    constructor() {
        super();
        this.name = "";
        this.exts = new AppControllerExts();
    }

    /**
     * 判断是不是控制器
     */
    public isController(): boolean {
        return this.hasOwnProperty("stack");
    }
}
