import { IApiError } from '../typings';

export default class ApiError extends Error {
    constructor(msg: IApiError) {
        super();
        Object.assign(this, msg);
    }
}
