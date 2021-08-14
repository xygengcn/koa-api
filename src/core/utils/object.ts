/**
 * 对象操作工具集合
 */

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
