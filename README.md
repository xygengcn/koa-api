# 基于 Typescript + KOA 开发的 Restful APi 接口

## 测试网站

[测试网站 api.xygeng.cn](https://api.xygeng.cn)

## 特点

---

-   ts 开发
-   支持装饰器和 控制器 创建接口
-   具有日志记录功能

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

-   生产环境

```
yarn add @xygengcn/koa-api
```

## 控制器（重点）

---

> 存放控制器的目录，防止路由重复，文件名将默认为路由前缀。路由规则：/`文件夹名`/`类装饰器(文件名，index文件为斜杠)`/`方法装饰器(方法名)`，支持不断嵌套

> 控制器文件命名规则：index.controller.ts

### 装饰器

-   Controller()装饰器，在类前面使用：@Controller(路由前缀)，默认文件名就是前缀

    > @Controller('user')

-   GET/POST，请求方法，在类方法前面使用：@函数(路由)

    > @GET('/login') 对应的路由就是 /user/login

### 使用方法

```ts
// index.js
import { Controller, Get, Post } from '@xygengcn/koa-api';
@Controller()
export default class IndexController {
    @GET('/test')
    async hello() {
        return {
            title: 'haha'
        };
    }
}
// [Get] /test => {}

// user/index.controller.ts
import { Controller, Get, Post } from '@xygengcn/koa-api';
@Controller()
export default class IndexController {
    @POST('/test')
    async hello() {
        return {
            title: 'haha'
        };
    }
}

// 【Post】 /user/test =>{}
```

### 详细用例

> 文件：[完整查看例子源码](./examples/full/index.ts)

### hello-world 例子

```ts
//
import Api, { Controller, Get, Logger, Param, Post, ApiLogger } from '../../src';

type User = {
    id: number;
    name: {
        firstName: string;
        lastname: string;
    };
};

@Controller()
export class GetController {
    @Get('/get')
    // 获取query参数
    public get(@Param.Query<User>('id') id: number) {
        if (id) {
            return {
                id
            };
        }
        return null;
    }
}

@Controller('/post')
export class PostController {
    // 定义日志
    @Logger()
    private logger!: ApiLogger;
    @Post('/')
    // 获取body参数
    public post(@Param.Body<User>('id') id: number, @Param.Body<User>('name.firstName') firstName: string) {
        this.logger.log('post测试:', { id, firstName });
        if (id && firstName) {
            return {
                id,
                firstName
            };
        }
        return null;
    }
}

// 创建实例
const api = new Api();

api.on('log', (...args) => {
    console.log('[log]', ...args);
});
api.on('start', () => {
    console.log('[start]');
});

api.on('error', (e) => {
    console.log(e);
});

// 启动
api.start();
```

### 实例函数

```js
// 事件监听
app.on();
// koa默认中间件
app.use();

// 默认启动服务
app.start();
```

### 打包流程

1、自动加载控制器

直接打包即可
