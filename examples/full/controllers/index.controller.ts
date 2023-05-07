import { Get } from '@/decorators';
import { Controller } from '../../../src';

@Controller()
export default class IndexController {
    @Get()
    public test() {
        return 'hello world';
    }
}
