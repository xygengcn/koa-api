import { IApiError } from '@/typings';
import { serializeError } from 'serialize-error';

/**
 * 是不是对象
 * @param obj
 * @returns
 */
export function isObject(obj: any): boolean {
    return obj && typeof obj === 'object' && !Array.isArray(obj);
}

/**
 * 是不是函数
 * @param func
 * @returns
 */
export function isFunction(func: any): boolean {
    return func && typeof func === 'function';
}

/**
 * 解析错误
 * @param error
 * @returns
 */
export function stringifyError(error: any, maxDepth: number = 3): IApiError {
    return serializeError(error, { maxDepth });
}

/**
 * 是不是class
 * @param input
 * @returns
 */
export function isClass(input: unknown) {
    if (isFunction(input)) {
        return /^class /.test(Function.prototype.toString.call(input));
    } else {
        return false;
    }
}

/**
 * 是不是字符串
 * @param str
 * @returns
 */
export function isString(str: unknown): boolean {
    return typeof str === 'string';
}

/**
 * 获取可以、
 * @param obj
 * @param path
 * @param fallback
 * @returns
 */
export function objectGet(obj: Object, path: string) {
    if (!obj || !path) return undefined;
    const paths = Array.isArray(path) ? path : path.split('.');
    let results = obj;
    let i = 0;
    while (i < paths.length && results !== undefined && results !== null) {
        results = results[paths[i]];
        i++;
    }
    if (i === paths.length) {
        return results !== undefined ? results : undefined;
    }
    return results !== undefined && results !== null ? results : undefined;
}
