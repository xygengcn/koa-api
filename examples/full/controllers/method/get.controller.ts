import { Controller, Get, Param } from '@src/index';

@Controller()
export default class GetController {
    @Get('/')
    public index(ctx) {
        return {
            message: '这是普通的get请求'
        };
    }

    @Get('/query')
    public test2(@Param.Query<{ id: string }>('id') id: string, @Param.Query<{ id: string; userName: string }>('userName') userName: string) {
        if (id && userName) {
            return Promise.resolve({
                id,
                userName
            });
        }
        return '';
    }
}
