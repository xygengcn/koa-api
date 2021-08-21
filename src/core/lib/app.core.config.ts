/**
 * 自动加载配置
 */

import { getFilePath, getPackage, readJson, writeJson } from '@core/utils/file';
import * as lodash from 'lodash';
export default class AppConfigCore {
    constructor(path: string = './config') {
        const configName = {
            development: 'index.dev.json',
            sit: 'index.sit.json',
            production: 'index.json'
        };
        this.configDefaultFile = getFilePath(path, configName[process.env.NODE_ENV || 'development']);
        this.init(this.configDefaultFile);
    }

    /**
     * 配置路径
     */
    private configDefaultFile: string = '';

    /**
     * 配置数据
     */
    private configs: object = {};

    /**
     * 获取对象值
     * @param property 属性字段 a.b.c
     * @returns
     */
    protected getValue(property?: string): any {
        if (!property) return this.configs;
        return lodash.get(this.configs, property);
    }

    /**
     * 设置对象值
     * @param property  属性字段 a.b.c
     * @param data 值
     * @param force 是否写入本地，默认true
     */
    protected setValue(property: string, data: any, force: boolean = true) {
        if (!property) return false;
        lodash.set(this.configs, property, data);
        return force && this.writeConfig();
    }

    /**
     * 初始化配置
     * @returns
     */
    protected resetConfig() {
        return this.init(this.configDefaultFile);
    }

    /**
     * 分文件写入本地配置
     */
    private writeConfig() {
        writeJson(this.configDefaultFile, this.configs);
    }

    /**
     * 初始化
     * @param dir 文件夹名
     */
    private init(dir: string) {
        this.configs = readJson(dir);
        const packageJson = getPackage();
        lodash.set(this.configs, 'mode', process.env.NODE_ENV || 'development');
        lodash.set(this.configs, 'version', packageJson.version);
        lodash.set(this.configs, 'author', packageJson.author);
    }
}
