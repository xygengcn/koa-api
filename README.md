# 基于Typescript + KOA 开发的 Restful APi 接口


## 版本支持

mysql>=5.7

## 官网

[网站 api.xygeng.cn](https://api.xygeng.cn)

## 特点

---

-   ts 开发
-   支持装饰器和 控制器 创建接口
-   具有日志记录功能
-   具有全局配置管理
-   具有集成数据库操作 orm

## 安装

---

-   克隆代码
-   安装依赖

```
yarn
```

-   开发运行项目

```
yarn run dev
```

-   打包命令

```
yarn run build
```

-   生产环境运行命令

```
yarn run prd
```

-   测试环境运行命令

```
yarn run sit
```

## 框架结构

---

-   config -> 配置文件
-   controller -> 控制器
-   model -> 模版
-   database -> 数据库
-   plugins -> 插件
-   core -> 框架核心
    -   controller -> 控制器处理类
    -   lib -> 核心代码
    -   util -> 工具类
    -   type -> 类型文件
-   app.ts -> 入口文件

## 配置文件

---

> 存放配置文件的目录，主文件为 index.json,其他文件将会作为主文件的对象，对象属性为文件名。使用 config 函数获取配置。

```js
//index.json
{
    "name":"openApi"
}
//log.json
{
    "enble":true;
}
```

### 设置配置

```tsx
const { Config } = require('app');

/**
 * set(对象属性,对象值，是否写入本地文件)
 */
Config.set('data.name', 'zhangsan', true);

// 结果：{data:{name:"zhangsan"}}

/**
 * 控制器使用
 */
this.$config.set('data.name', 'zhangsan', true);

// 结果：{data:{name:"zhangsan"}}
```

### 获取配置

```tsx
const { Config } = require('app');

/**
 * set(对象属性,对象值，是否写入本地文件)
 */
const age = Config.get('data.age'); //12

// 原始配置：{data:{name:"zhangsan",age:12}}   结果： 12
```

## 控制器（重点）

---

> 存放控制器的目录，防止路由重复，文件名将默认为路由前缀。路由规则：/`文件夹名`/`类装饰器(文件名，index文件为斜杠)`/`方法装饰器(方法名)`，支持不断嵌套


### 装饰器

-   Controller()装饰器，在类前面使用：@Controller(路由前缀)，默认文件名就是前缀

    > @Controller('user')

-   GET/POST，请求方法，在类方法前面使用：@函数(路由)

    > @GET('/login') 对应的路由就是 /user/login

### 使用方法

```ts
// index.js
import { Controller, Get, Post } from 'app';
@Controller()
export default class IndexController{
    @GET('/test')
    async hello() {
        return {
            title: 'haha',
        };
    }
}
// [Get] /test => {}

// user/index.js
import { Controller, Get, Post } from 'app';
@Controller()
export default class IndexController {
    @POST('/test')
    async hello() {
        return {
            title: 'haha',
        };
    }
}

// 【Post】 /user/test =>{}
```

### 更多用例请看测试用例

> 测试用例在 src 的 controller 文件夹下

- 常规get请求测试用例
- 常规post请求测试用例
- 跨域测试用例
- 配置文件测试用例
- 数据库测试用例
- 返回字符串测试用例
- 验证成功测试用例
- 验证失败测试用例



## 日志操作

---

系统已配置每一条请求写入日志，不需要独自配置，主要是提供方法方便收集其他日志，比如数据库操作和方法操作等

### 日志配置

> 请求日志系统自带，可以在配置文件自行修改属性，配置文件（config.json)

```json
{
    "enble": true, //是否开启
    "target": [
        //开启目标
        "local", //本地文件日志，写入本地文件
        "console", //调试开发日志，终端显示
        "online" //在线网页日志，待实现
    ]
}
```

### 控制器写日志

> 使用 Log 方法，显示查看测试用例

```js
import { Controller, Get, Log } from 'app';
 @Get('/test')
    async hello(ctx) {
        Log({type:"log",content:"hahah"}); //打印开发日志
        return {
            title: "haha"
        }
    }

// 结果：[Success] 34567890
```

### 自定义日志

> 使用 Log.w 方法，详细方法请看测试用例

#### 测试用例

```js
import { Log } from 'app';
const logContent = {
    type: 'info',
    content: {
        type: 'sql',
        content: "",
    },
};
Log.w(logContent);
```

## 数据库操作

### 基于 Sequelize

详细文档链接 https://www.sequelize.com.cn/

### 实例(详细看代码实例)

```ts
// 数据库配置，具体在配置文件夹
{
  database:{
    host://域名
    user：//用户名
    ...
  }
}

// model/test.js

import { AppDatabase, Log } from 'app';
import { DataTypes, Model, Optional } from 'sequelize';

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
    public static getOne() {
        // 打印日志
        Log.info('查询数据库');

        // 查询id为80的数据
        return Test.findOne({ where: { id: 80 } }).then((res) => res && res.toJSON());
    }
}

// 创建 model，定义数据模型
Test.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, unique: true },
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
        // 挂载实例，重要
        sequelize: AppDatabase,
        // 表名
        tableName: 'data',
    }
);

export default Test;


// user.ts

@GET('/yes')
    async user1(ctx, next) {
        // 调用其他路由的数据
        const data = await Test.getOne();

        // 获取其他配置信息
        const name = Config.get('name');

        // 返回结果
        return {
            name: this.name,
            method: ctx.methodName,
            class: ctx.controllerName,
            ok: data,
            config: name,
     };
}
```

## 错误代码

---

| 代码  | 类型                  | 说明                 |
| ----- | --------------------- | -------------------- |
| 200   | success               | 成功                 |
| 404   | Not Found             | 没有此路由接口       |
| 403   | Access Not Allowed    | 不允许访问，接口关闭 |
| 500   | 内部服务器报错        | 代码逻辑错误         |
| 10403 | CORS Forbidden        | 不允许跨域访问       |
| 10405 | Authentication Failed | 验证失败             |
| 10601 | Content TypeError     | content参数验证失败  |
| 10602 | Exts TypeError        | Exts参数验证失败     |
|       |                       |                      |
