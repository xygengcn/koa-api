/**
 * inversify唯一key
 */
export const API_INVERSIFY_KEY = {
    CONTROLLER_CLASS_KEY: Symbol.for('CONTROLLER_CLASS_KEY'), // 自定义控制器
    MIDDLEWARE_CLASS_KEY: Symbol.for('MIDDLEWARE_CLASS_KEY'), // 自定义中间件

    API_LOGGER_KEY: Symbol.for('API_LOGGER_KEY') // 日志
};

/**
 * 路由装饰器
 */
export const API_METADATA_KEY = {
    CONTROLLER_PREFIX: Symbol.for('CONTROLLER_PREFIX'), // 控制器
    CONTROLLER_FILE_PATH: Symbol.for('CONTROLLER_FILE_PATH'),
    ROUTRE_MIDDLEWARE: Symbol.for('ROUTRE_MIDDLEWARE'), // 路由引用中间件
    ROUTER_PATH: Symbol.for('ROUTER_PATH'), // 路由方法
    ROUTER_METHOD: Symbol.for('ROUTER_METHOD'), // 路由路径
    ROUTER_PARAMS: Symbol.for('ROUTER_PARAMS'), // 路由函数参数
    ROUTER_HEADERS: Symbol.for('ROUTER_HEADERS') // 路由头部
};
