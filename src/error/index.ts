export default class ApiError extends Error {
    public _code: number;

    constructor(code: number, message: string) {
        super();
        this._code = code;
        this.message = message;
    }
}
