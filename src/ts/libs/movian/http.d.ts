declare module "movian/http" {
    interface HttpControl {

    }

    interface HttpResponse {
        bytes: string;
        readonly headers: Object;
        readonly headers_lc: Object;
        readonly allheaders: Object;
        readonly multiheaders: Object;
        readonly multiheaders_lc: Object;
        statuscode: number;
        contenttype: string;

        toString(): string;
        convertFromEncoding(encoding: string): string;
    }

    export function request(url: string, ctrl: HttpControl): HttpResponse;
    export function request(url: string, ctrl: HttpControl, callback: (err: string, response: HttpResponse) => void);
}