/**
 * 自动加载配置
 */

import {
    getFileName,
    getFilePath,
    getPackage,
    isDirectory,
    isJsonFile,
    readDirSync,
    readJson,
    writeJson,
} from '@core/utils/file';
import * as path from 'path';
import * as lodash from 'lodash';
const DEFAULT_CONFIG_FILE_NAME = 'index.json';
export default class AppConfigCore {
    constructor() {
        this.configDefaultPath = getFilePath('./config');
        this.env = process.env.NODE_ENV;
        this.configDefaultFile = path.join(this.configDefaultPath, DEFAULT_CONFIG_FILE_NAME);
        this.init();
    }

    /**
     * 默认配置文件
     */
    private configDefaultFile: string = '';

    /**
     * 配置路径
     */
    private configDefaultPath: string = '';

    /**
     * 配置数据
     */
    private configs: object = {};

    /**
     * 配置文件夹名
     */
    private configFileNames: string[] = [];

    /**
     * 环境配置
     */
    private env: string | undefined = '';

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
    protected setValue(property: string, data: any, force: boolean = true): Boolean {
        if (!property) return false;
        lodash.set(this.configs, property, data);
        return force && this.writeConfig(property);
    }

    /**
     * 初始化配置
     * @returns
     */
    protected resetConfig() {
        return this.init();
    }

    /**
     * 写入本地配置
     * @param property 属性字段 a.b.c
     * @param data 属性值
     */
    private writeConfig(property: string): Boolean {
        const properties: string[] = this.getProperties(property);
        if (property.length > 0) {
            if (this.configFileNames.includes(properties[0])) {
                const configs = lodash.get(this.configs, properties[0]);
                writeJson(path.join(this.configDefaultPath, properties[0] + '.json'), configs);
                return true;
            } else {
                const keys = Object.keys(this.configs);
                const config: Object = keys.reduce((config, prop) => {
                    if (this.configFileNames.includes(prop)) {
                        return config;
                    }
                    return Object.assign(
                        config,
                        Object.defineProperty({}, prop, { value: this.configs[prop], enumerable: true })
                    );
                }, {});
                writeJson(this.configDefaultFile, config);
                return true;
            }
        }
        return false;
    }

    /**
     * 获取属性
     * @param property 属性字段 a.b.c
     * @returns
     */
    private getProperties(property: string): string[] {
        return property ? property.split('.') : [];
    }

    /**
     * 初始化
     * @param dir 文件夹名
     */
    private init(dir: string = this.configDefaultPath) {
        this.configFileNames = [];
        const files = readDirSync(dir); //将当前目录下 都读出来
        this.configs = files.reduce((config, file) => {
            if (file === DEFAULT_CONFIG_FILE_NAME) {
                const json = readJson(this.configDefaultFile);
                return Object.assign(config, json);
            }
            if (!isDirectory(path.join(this.configDefaultPath, file)) && isJsonFile(file)) {
                const value: object = readJson(path.join(this.configDefaultPath, file));
                const key: string = getFileName(file, '.json');
                this.configFileNames.push(key);
                const childConfig = {};
                childConfig[key] = value;
                return Object.assign(config, childConfig);
            }
            return config;
        }, {});
        const packageJson: any = getPackage();
        lodash.set(this.configs, 'mode', this.env);
        lodash.set(this.configs, 'version', packageJson.version);
    }
}
