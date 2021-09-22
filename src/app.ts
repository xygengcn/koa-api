// // 入口文件
import 'module-alias/register';
import App from '@lib/app';
import { AppDocs } from '@plugin/docs';
import Log from '@plugin/logs';

const app = new App();

// 请求报错回调
// app.onError((content, ctx) => {
//     console.log('错误回调', content);
//     AppLog.log(content);
// });

// 日志监听
// 自定义日志插件，可以自行使用log4等插件
app.onLog((content) => {
    Log.w(content);
});

// 请求回调
app.onHttp((content, ctx) => {
    // console.log('请求回调', ctx);
    // Log.w(content);
});

// 跨域设置
// app.cors(['http://localhost:52331']);

// 插入中间件
// app.use();

// 在路由之前插入中间件
// app.beforeRouteUse();

// 在路由之后插入中间件
// app.afterRouteUse();

// 生成文档插件
app.plugin((server, controllers) => {
    if (process.env.NODE_ENV === 'development') {
        const doc = new AppDocs(controllers);
        doc.write('./docs');
    }
});

// 启动程序
app.start();
