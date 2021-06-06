// // 入口文件
import 'module-alias/register';
import app from '@core/lib/app';

// 请求报错回调
// app.onError((ctx,log)=>{
//     console.log(ctx,log)
// });

// 跨域设置
// app.cors({
//     origin: ['http://localhost:52330'],
// });

// 插入中间件
// app.use();

// 在路由之前插入中间件
// app.beforeRouteUse();

// 在路由之后插入中间件
// app.afterRouteUse();

// 启动程序
app.start();
