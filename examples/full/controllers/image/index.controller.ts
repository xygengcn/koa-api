import { Controller, Get, Headers } from '@/index';
import { createReadStream } from 'fs';
import path from 'path';

@Controller()
export default class IndexController {
    /**
     * 预览图片
     * @returns
     */
    @Headers('content-type', 'image/jpg')
    @Get('/view')
    public test() {
        return createReadStream(path.join(__dirname, './test.jpeg'));
    }
}
