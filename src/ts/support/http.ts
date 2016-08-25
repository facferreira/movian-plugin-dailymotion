import http = require('movian/http');

import { log } from './log';

var USER_AGENT = "Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0";

interface HttpCallbackResultSuccess {
    type: HttpCallbackResultType.SUCCESS;
    statuscode: number;
    response: string;
}

interface HttpCallbackResultError {
    type: HttpCallbackResultType.ERROR;
    statuscode: number;
    message: string;
}

type HttpCallbackResult = HttpCallbackResultSuccess | HttpCallbackResultError;

export enum HttpCallbackResultType {
    SUCCESS = 0,
    ERROR = 1
}

interface HttpCallback {
    onSuccess(result: HttpCallbackResultSuccess);
    onError?(error: HttpCallbackResultError);
}

interface HttpConfig {
    throwOnError?: boolean;
}

export function request(url: string, opts: Object, callback?: HttpCallback, config?: HttpConfig): HttpCallbackResult {
    config = config || {};

    opts["noFail"] = true;

    log.print("Parsing " + url);

    if (callback) {
        http.request(url, opts, function (err, response) {
            var result = createCallbackResult(err, response);
            switch (result.type) {
                case HttpCallbackResultType.SUCCESS:
                    callback.onSuccess(result);

                    break;

                case HttpCallbackResultType.ERROR:
                    if (callback.onError && !config.throwOnError)
                        callback.onError(result);
                    else
                        throwError(result);

                    break
            }
        });

        return;
    }
    else {
        var response = http.request(url, opts);
        var result = createCallbackResult(null, response);
        if (config.throwOnError && result.type == HttpCallbackResultType.ERROR)
            throwError(result);
        else
            return createCallbackResult(null, response);
    }
}

export function isSuccess(result: HttpCallbackResult) {
    return result.type === HttpCallbackResultType.SUCCESS;
}

function createCallbackResult(err, response): HttpCallbackResult {
    if (response) {
        var statuscode = response.statuscode;
        if (200 <= statuscode && statuscode < 400) {
            return createCallbackSuccess(statuscode, response);
        }
        else {
            return createCallbackError(statuscode, err ? err : "HTTP error");
        }
    }
    else {
        log.print(err);
        return createCallbackError(-1, err);
    }
}

function createCallbackSuccess(statuscode, response): HttpCallbackResultSuccess {
    return {
        type: HttpCallbackResultType.SUCCESS,
        statuscode: statuscode,
        response: response.toString()
    };
}

function createCallbackError(statuscode, message): HttpCallbackResultError {
    return {
        type: HttpCallbackResultType.ERROR,
        statuscode: statuscode,
        message: message
    };
}

function throwError(error: HttpCallbackResultError) {
    throw new Error(error.message + " [" + error.statuscode + "]");
}