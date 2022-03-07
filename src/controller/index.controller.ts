import { Controller, Get, Post } from '@/core';

@Controller('/')
export default class IndexController {
    private age = 111;
    private test() {
        this.age = 333;
        return 2222;
    }

    @Get('/get')
    public get(ctx) {
        console.error(111, this, this?.age);
        return this.test();
    }

    @Get('/error')
    public error(ctx) {
        throw {
            code: 10001,
            error: 'error报错'
        };
    }

    @Post('/post')
    public post(ctx) {
        return 1;
    }
}
