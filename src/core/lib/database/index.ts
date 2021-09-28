/**
 * 数据库基础类
 */

import { Sequelize, Dialect, PoolOptions } from 'sequelize';
import config from '@lib/config';
import appEventBus from '../event';

class AppDatabaseCore {
    /**
     * 域名
     */
    private host: string = 'localhost';

    /**
     * 用户
     */
    private user: string = 'root';

    /**
     * 用户密码
     */
    private password: string = 'root';

    /**
     * 数据库类型
     */
    private sqlDialect: Dialect = 'mysql';

    /**
     * 链接池
     */
    private pool: PoolOptions;

    /**
     * 数据库名
     */
    private database: string = 'user';

    constructor() {
        this.host = config.get('database.host') || 'localhost';
        this.user = config.get('database.user') || 'root';
        this.password = config.get('database.password') || 'root';
        this.sqlDialect = config.get('database.type') || 'mysql';
        this.database = config.get('database.database') || 'user';
        this.pool = config.get('database.pool') || {};
    }

    // 实例化
    instance(): Sequelize {
        return new Sequelize(this.database, this.user, this.password, {
            host: this.host, // 数据库地址
            dialect: this.sqlDialect, // 指定连接的数据库类型
            pool: {
                max: 5, // 连接池中最大连接数量
                min: 0, // 连接池中最小连接数量
                idle: 10000, // 如果一个线程 10 秒钟内没有被使用过的话，那么就释放线程
                ...this.pool
            },
            define: {
                // 如果为 true 则表的名称和 model 相同，即 user
                // 为 false MySQL创建的表名称会是复数 users
                // 如果指定的表名称本就是复数形式则不变
                freezeTableName: true,
                // sequelize默认会自动为其添加 createdAt 和updatedAt
                timestamps: false
            },
            logging: (sql, timing) => {
                appEventBus.emitLog({
                    type: 'info',
                    subType: 'sql',
                    content: {
                        sql
                    }
                });
            }
        });
    }
}

export default new AppDatabaseCore().instance();
