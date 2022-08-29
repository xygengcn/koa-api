# 基于 Typescript + KOA 开发的 Restful APi 接口

## 官网

[网站 api.xygeng.cn](https://api.xygeng.cn)

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

-   生产环境运行命令

```
yarn run prd
```

-   测试环境运行命令

```
yarn run sit
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

> 文件：src/controller/index.controller

### 通用函数

#### 日志打印

```js
import { Log } from '@xygengcn/koa-api';

Log('日志');
```

#### 日志监听

```js
import { onLog } from '@xygengcn/koa-api';

onLog((log) => {
    console.error(log);
});
```

### 实例函数

```js
// koa默认中间件
use();

// 前插koa默认中间件
unshiftUse();

// 装饰器中间件
useMiddleware();

// 前插装饰器中间件
unshiftUseMiddleware();

// 返回koa 的callback

callback();

// 日志模块

logger;

// 默认启动服务
start();
```

### 打包流程

1、自动加载控制器

直接打包即可

```
tsc
```

2、导入控制器打包

> 配置参考 index.ts 文件，打包流程在 gulpfile.ts

先新建 transform 文件，引入默认配置 transform 属性，默认输出[],开发环境不用理会，先 tsc 编译，
然后使用 transformController 函数生成 transform 文件替换掉刚刚生成的，再使用 rollup 打包即可
