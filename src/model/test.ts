import { AppModel, Log } from '@core/app/index';
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

/**
 * 模版测试类
 */

interface TestTable {
    id: number;
    apiName: string;
    type: string;
    total: number;
    date: Date;
}

export class Test extends Model<TestTable, Optional<TestTable, 'id'>> implements TestTable {
    public id!: number;
    public apiName!: string;
    public type!: string;
    public total!: number;
    public date!: Date;

    /**
     * 读取数据用例
     * @returns
     */
    public static getOne() {
        // 打印日志
        Log.info('查询数据库');

        // 随机查询一条消息
        return Test.findOne({
            order: [Sequelize.literal('rand()')],
        }).then((res) => res && res.toJSON());
    }

    /**
     * 其他
     */
    public static set() {
        //其他使用方法，请详细：https://www.sequelize.com.cn/
    }
}

// 创建 model，定义数据模型
Test.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
        },
        apiName: {
            type: DataTypes.STRING, // 指定值的类型
            field: 'api_name', // 指定存储在表中的键名称
        },
        type: {
            type: DataTypes.STRING,
        },
        total: {
            type: DataTypes.NUMBER,
        },
        date: {
            type: DataTypes.DATE,
        },
    },
    {
        // 【重要】挂载实例，这一步重点
        sequelize: AppModel,
        // 表名
        tableName: 'data',
    }
);

export default Test;
