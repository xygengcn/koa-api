/**
 * 对象操作工具集合
 */

import { get } from 'lodash';

/**
 * 是否是数组
 * @param arr
 * @returns
 */
export function isArray(arr: Array<any>): boolean {
    return Array.isArray(arr);
}

/**
 * 是否是对象
 * @param obj
 * @returns
 */
export function isObject(obj: Object) {
    return obj != null && typeof obj === 'object' && Array.isArray(obj) === false;
}

/**
 * isPromise
 * @param obj
 * @returns
 */
export function isPromise(obj: any) {
    return (
        !!obj && //有实际含义的变量才执行方法，变量null，undefined和''空串都为false
        (typeof obj === 'object' || typeof obj === 'function') && // 初始promise 或 promise.then返回的
        typeof obj.then === 'function'
    );
}

/**
 * 判断是合法对象
 *
 * 对象含有必要的属性且不为空
 *
 * 合法返回false，不合法返回不合法的属性
 *
 * @param obj
 * @param attrs
 * @returns
 */
export function isIllegalObject(obj, attrs: string[]): false | string[] {
    // 不是对象直接fasle
    if (!obj || !isObject(obj)) return attrs;

    // 遍历
    const illegalAttrs = attrs.filter((attr) => {
        // 如果值存在
        if (get(obj, attr)) {
            return false;
        }
        return true;
    });

    // 属性为空为true
    if (illegalAttrs.length === 0) {
        return false;
    }

    return illegalAttrs;
}
