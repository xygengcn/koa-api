/**
 * 控制器类
 */
export type Constructor<T = any> = new (...args: any[]) => T;

/**
 * 单个或者多个可选
 */
export type Enumerable<T> = T | Array<T>;

/**
 * 对象flatten
 */
export type FlattenObjectKeys<T extends Record<string, unknown>, Key = keyof T> = Key extends string
    ? T[Key] extends Record<string, unknown>
        ? `${Key}.${FlattenObjectKeys<T[Key]>}`
        : `${Key}`
    : never;
