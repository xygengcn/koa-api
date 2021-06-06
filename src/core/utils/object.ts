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
