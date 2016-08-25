import prop = require('movian/prop');

function logData(data, logFunction) {
    if (data === null) logFunction("NULL");
    else if (data === undefined) logFunction("UNDEFINED");
    else if (typeof (data) === 'boolean') logFunction(data);
    else if (typeof (data) === 'number') logFunction(data);
    else if (typeof (data) === 'string') logFunction(data);
    else if (Array.isArray(data)) logFunction(JSON.stringify(data, null, 4));
    else if (typeof (data) === 'object') {
        if (data.__Proxy) {
            prop.print(data);
        }
        else if (data instanceof Error) {
            // print info related to error
            logFunction(data.stack);
        } else {
            logFunction("KEYS");
            logFunction(Object.getOwnPropertyNames(data));
            logFunction("JSON");
            logFunction(JSON.stringify(data, null, 4));
        }
    } else if (typeof (data) === 'function') {
        logFunction(data.toString());
    } else logFunction("Unknown data type");
}

class Log {
    static print(data: any, type: LogType = LogType.DEBUG): void {
        var logger;
        switch (type) {
            case LogType.DEBUG:
                logger = console.log;
                break;

            case LogType.ERROR:
                logger = console.error;
                break;
        }

        logData(data, logger);
    }

    /*
    * Print the stacktrace of function calls.
    * Useful when we want to know the stacktrace but we are not handling an exception.
    */
    static stacktrace(type: LogType = LogType.DEBUG): void {
        this.print("Stacktrace:", type);

        var e = new Error();
        // slice 2 so to not print the line with "Error" and the line of current function
        var stack = e.stack.split("\n").slice(2).join("\n");
        this.print(stack, type);
    }
}

export var log = Log;

export enum LogType {
    DEBUG,
    ERROR
}