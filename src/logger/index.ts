// import { EventEmitter } from 'events';
import { Events } from '@/typings';
import EventEmitter from 'events';
import { injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export default class ApiLogger<E extends Events = Events> {
    private events = new EventEmitter();
    /**
     * 构造函数
     * @param options
     */
    constructor() {}

    /**
     * 日志
     * @param args
     */
    public log(...args: any[]) {
        const prefix = args.shift();
        return this.emit(typeof prefix === 'string' ? prefix : 'log', ...args);
    }

    /**
     * 监听
     * @param key 事件名称
     * @param callback 回调
     */
    public on<K extends keyof E>(type: K, callback: E[K]);
    public on(type: string, callback: (...args: any) => void);
    public on(type, callback) {
        this.events.on(type as any, callback);
        return this;
    }

    /**
     * 触发
     * @param key 事件名称
     */
    public emit<K extends keyof E>(type: K, ...args: Parameters<E[K]>);
    public emit<K extends string>(type: K, ...args: any);
    public emit(type, ...args: any) {
        this.events.emit(type, ...args);
        return this;
    }
}
