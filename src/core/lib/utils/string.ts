/**
 * 首字母大写
 * @param string
 * @returns
 */
export function capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * 获取对象深度
 *
 * 默认超多10层算无限大
 *
 * @param o
 * @returns
 */
export function objectDepth(o: object, depth: number = 0, limit: number = 10): number {
    try {
        if (depth > limit) return Infinity;
        return Object(o) === o ? 1 + Math.max(-1, ...Object.values(o).map((i) => objectDepth(i, depth))) : 0;
    } catch (error) {
        return Infinity;
    }
}

/**
 * 获取前几级对象
 * @param o 对象
 * @param limit 取多少级
 * @returns
 */
export function objectUpper(o: object, limit: number = 4): object {
    const copyObject = (obj: object, level: number = 0) => {
        if (level < limit) {
            level++;
            return Object.entries(obj).reduce((newObj, [key, value]) => {
                if (typeof value !== 'object' && typeof value !== 'function') {
                    newObj[key] = value;
                } else if (typeof value === 'object') {
                    if (value instanceof Array || value instanceof String || value instanceof Boolean || value === null) {
                        newObj[key] = value;
                    } else {
                        newObj[key] = copyObject(value, level);
                    }
                }
                return newObj;
            }, {});
        }
        return {};
    };
    return copyObject(o);
}
