import path from 'path';
// @ts-ignore
import Api, { Controller, Param, Post } from '../../dist';

@Controller('/post')
export class PostController {
    @Post('/form')
    public form(@Param.Files() files) {
        return {
            file: files.file
        };
    }
}

// 创建实例
const api = new Api({
    koaBody: {
        multipart: true,
        formidable: {
            maxFileSize: 1 * 1024 * 1024,
            // 缓存目录
            uploadDir: path.join(__dirname, './tmp'),
            filename(name, ext, part, form) {
                return `${Date.now()}_${part.originalFilename}`.replace(/\s+/g, '_');
            }
        },
        onError(error, ctx, next) {
            // 错误处理
            ctx.body = {
                code: (error as any).code,
                message: 'Upload Fail'
            };
        }
    }
});

api.on('http', (...args) => {
    console.log('[http]', ...args);
});

api.on('log', (...args) => {
    console.log('[log]', ...args);
});
api.on('start', () => {
    console.log('[start]');
});

api.on('error', (e) => {
    console.error('[error]', e);
});

// 启动
api.start();
