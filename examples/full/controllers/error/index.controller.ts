import { Get } from '@/decorators';
import { Controller } from '@src/index';

@Controller('/')
export default class ErrorController {
    @Get('/throw/error')
    public throwError() {
        throw new Error('这是返回一个 throw error');
    }

    @Get('/throw/text')
    public throwText() {
        throw '这是返回一个 throw error';
    }

    @Get('/return/error')
    public returnError() {
        return new Error('这是返回一个 return error');
    }
}
