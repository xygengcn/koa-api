import { getFilePath, readFileSync } from '@util/file';
import { Controller, Get, Post, Response, Returns, Next, Context, Request, Name, Description, Content, Query } from 'app';

@Controller('/', { name: '测试用例', isTop: true })
export default class IndexController {
    @Name('常规get请求测试用例')
    @Description('这是测试get请求接口，这里是接口描述')
    @Returns({
        msg: {
            type: String
        },
        mode: {
            type: String,
            defaultValue: 'development'
        }
    })
    @Query({
        id: {
            require: true
        }
    })
    @Get('/get')
    async index(ctx, next, params) {
        return {
            msg: '这是常规的get请求',
            mode: process.env.NODE_ENV,
            query: params.query
        };
    }
    @Description('这是测试post请求接口，这里是接口描述')
    @Name('常规post请求测试用例')
    @Content({
        'user.name': {
            type: String,
            require: true
        },
        age: {
            type: Number
        }
    })
    @Returns({
        msg: {
            type: Number
        },
        mode: {
            type: String,
            defaultValue: 'development'
        }
    })
    @Post('/post')
    async hello(ctx: Context, next: Next, params: Request) {
        return {
            msg: '这是常规的post请求',
            data: {
                ...(params?.data || {})
            }
        };
    }

    @Description('这是测试显示图片请求接口，这里是接口描述')
    @Name('图片显示')
    @Response({
        headers: {
            'content-type': 'image/jpeg'
        }
    })
    @Get('/image')
    async image() {
        const file = readFileSync(getFilePath('../test/test.jpeg'));
        return file;
    }
}
