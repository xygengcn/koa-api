/**
 * 对象操作工具集合
 */
import { get, isNull, isUndefined } from 'lodash';

/**
 * 判断值不存在，为空的情况
 *
 * 去除0或false的影响
 * @param arr
 * @returns
 */
export function isEmpty(value: any) {
    if (isUndefined(value) || isNull(value) || value === '') {
        return true;
    }
    return false;
}

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
export function isIllegalObjectSync(obj: Object, attrs: Array<string | { key: string; rule: (value: any) => Boolean }>): false | string[] {
    // 不是对象直接fasle
    if (!obj || !isObject(obj))
        return attrs.map((item) => {
            if (typeof item === 'object') {
                return item.key;
            }
            return item;
        });

    // 遍历
    const illegalAttrs = attrs
        .filter((attr) => {
            // 是对象
            if (typeof attr === 'object') {
                const value = get(obj, attr.key);
                if (attr.rule && attr.rule(value)) {
                    return false;
                }
                return true;
            } else {
                const value = get(obj, attr);
                if (!isEmpty(value)) {
                    return false;
                }
                return true;
            }
        })
        .map((item) => {
            if (typeof item === 'object') {
                return item.key;
            }
            return item;
        });

    // 属性为空为true
    if (illegalAttrs.length === 0) {
        return false;
    }

    return illegalAttrs;
}

/**
 * 判断是合法对象 返回回调
 * @param obj
 * @param attrs
 * @returns
 */
export function isIllegalObject(obj: Object, attrs: Array<string | { key: string; rule: (value: any) => Boolean }>): Promise<boolean> {
    // 不是对象直接fasle
    if (!obj || !isObject(obj)) {
        return Promise.reject(
            attrs.map((item) => {
                if (typeof item === 'object') {
                    return item.key;
                }
                return item;
            })
        );
    }

    // 遍历
    const illegalAttrs = attrs
        .filter((attr) => {
            // 是对象
            if (typeof attr === 'object') {
                const value = get(obj, attr.key);
                if (attr.rule && attr.rule(value)) {
                    return false;
                }
                return true;
            } else {
                const value = get(obj, attr);
                if (!isEmpty(value)) {
                    return false;
                }
                return true;
            }
        })
        .map((item) => {
            if (typeof item === 'object') {
                return item.key;
            }
            return item;
        });

    // 属性为空为true
    if (illegalAttrs.length === 0) {
        return Promise.resolve(true);
    }

    const errorText = `参数${illegalAttrs.join('、')}不规范`;
    return Promise.reject({ attr: illegalAttrs, error: errorText });
}
