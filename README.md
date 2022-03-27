# 基于Typescript + KOA 开发的 Restful APi 接口


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
import { Controller, Get, Post } from '@/core';
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

// user/index.controller.ts
import { Controller, Get, Post } from '@/core';
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


### 详细用例

> 文件：src/controller/index.controller


### 通用函数

#### 日志打印

```js

import { Log } from '@/core';

 Log("日志")

```

#### 日志监听

```js

import { onLog } from '@/core';

 onLog((log)=>{
     console.error(log)
 })

```


### 实例函数

```js

// koa默认中间件
use()

// 前插koa默认中间件
unshiftUse()

// 装饰器中间件
useMiddleware()

// 前插装饰器中间件
unshiftUseMiddleware()

// 返回koa 的callback

callback()

// 日志监听
onLog()

// 错误监听
onError()

// 获取配置，可用于实现插件，不启动http服务
run()

// 默认启动服务
start()


```