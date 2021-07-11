import AppController, { Controller, GET } from '@core/app';

@Controller('/user3')
export default class User2 extends AppController {
    /**
     *
     * 普通
     *
     * /user3/get2
     */
    @GET('/get2')
    get2() {
        return {
            name: this.name,
        };
    }
}
