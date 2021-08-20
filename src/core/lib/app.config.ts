import AppConfigCore from './app.core.config';
export class AppConfig extends AppConfigCore {
    constructor() {
        super();
    }
    /**
     * 设置对象值
     * @param property  属性字段 a.b.c
     * @param data 值
     * @param force 是否写入本地，默认true
     */
    public set(property: string, data: any, force: boolean = true): void {
        this.setValue(property, data, force);
    }

    /**
     * 获取对象值
     * @param property 属性字段 a.b.c
     * @returns
     */
    public get(property?: string): any {
        return this.getValue(property);
    }

    /**
     * 重载本地配置
     */
    public reset() {
        return this.resetConfig();
    }
}

export default new AppConfig();
