interface IApiError {
    code?: number;
    error?: string;
    developMsg?: any;
}
export default class ApiError extends Error {
    constructor(msg: IApiError) {
        super();
        Object.assign(this, msg);
    }
}
