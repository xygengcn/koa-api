import AppController, { Controller, GET } from '@core/app';

@Controller()
export default class User3 extends AppController {
    /**
     *
     * 普通
     *
     * /user/user3/get2
     */
    @GET('/get2')
    get2() {
        return {
            name: this.name
        };
    }
}
