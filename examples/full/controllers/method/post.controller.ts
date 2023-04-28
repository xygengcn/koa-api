import { Controller, Param, Post } from '@src/index';

@Controller()
export default class PostController {
    @Post('/json')
    public json(@Param.Body('user.id') id, @Param.Body('keyword') keyword) {
        if (id && keyword) {
            return {
                id,
                keyword
            };
        }

        throw Error('参数不对');
    }

    @Post('/form')
    public form(@Param.Body('id') id, @Param.Body('keyword') keyword) {
        if (id && keyword) {
            return {
                id,
                keyword
            };
        }
        throw Error('参数不对');
    }

    @Post('/file')
    public file(@Param.Body('id') id, @Param.Files() file) {
        if (id && file) {
            return {
                id
            };
        }
        throw Error('参数不对');
    }
}
