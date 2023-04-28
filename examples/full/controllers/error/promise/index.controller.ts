import { Get } from '@/decorators';
import { Controller } from '@src/index';

@Controller('/')
export default class PromiseRejectController {
    @Get('/json')
    public promiseJson() {
        return Promise.reject({
            code: 3000,
            userMsg: '这是返回一个 promise reject json'
        });
    }

    @Get('/text')
    public promiseText() {
        return Promise.reject('这是返回一个 promise reject text');
    }
}
