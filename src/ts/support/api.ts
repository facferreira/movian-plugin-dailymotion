import http = require('./http');
import { log, LogType } from './log';

const API_BASE_URL = "https://api.dailymotion.com";
const API_KEY = "6a371ca96111be56feea";

const MAX_LIMIT = 100;

export interface ApiCallbackResultSuccess {
    type: ApiCallbackResultType.SUCCESS;
    json: any;
}

export interface ApiCallbackResultError {
    type: ApiCallbackResultType.ERROR;
    message: string;
}

type ApiCallbackResult = ApiCallbackResultSuccess | ApiCallbackResultError;

export enum ApiCallbackResultType {
    SUCCESS = 0,
    ERROR = 1
}

interface ApiCallback {
    onSuccess(result: ApiCallbackResultSuccess);
    onError?(error: ApiCallbackResultError);
}


/* Filters */
export interface BaseFilters {
    limit?: number;
    page?: number;
}

export interface ChannelFilters extends BaseFilters {
    sort?: string;
}

export interface VideoFilters extends BaseFilters {
    sort?: string;
}

export function call(uri: string, fields: string[], filters: any, config: any, callback: ApiCallback) {
    var url = API_BASE_URL + uri;

    var opts = {
        args: null,
        compression: true,
        caching: true
    };

    // we need to initialize args here so typescript does not assume the type of args is simply {}
    opts.args = {};

    if (fields)
        opts.args.fields = fields.join(",");

    for (var key in filters)
        opts.args[key] = filters[key];

    if (config.disableCache)
        opts.caching = false;

    // if we don't have a sort and apparently this call can use sort then use the first that config specifies as possible (the default value)
    if (!opts.args.sort && config.sorts)
        opts.args.sort = config.sorts[0][0];

    if (!opts.args.limit)
        opts.args.limit = MAX_LIMIT;

    http.request(url, opts, {
        onSuccess: function (result) {
            var json = JSON.parse(result.response);

            var obj: ApiCallbackResultSuccess = {
                type: ApiCallbackResultType.SUCCESS,
                json: json
            };

            callback.onSuccess(obj);
        },

        onError: function (result) {
            log.print("API call failed", LogType.ERROR);
            log.print("URL: " + url, LogType.ERROR);
            log.print("Filters", LogType.ERROR);
            log.print(filters, LogType.ERROR);
            log.print("Opts:", LogType.ERROR);
            log.print(opts, LogType.ERROR);
            log.print("Result", LogType.ERROR);
            log.print(result, LogType.ERROR);
            callback.onError({
                type: ApiCallbackResultType.ERROR,
                message: result.message
            });
        }
    }, config);
}
