declare var console: {
    log(msg: string);
    error(msg: string);
}

declare var Plugin: {
    readonly id: string;
    readonly url: string;
    readonly manifest: string;
    readonly apiversion: number;
    readonly path: string;
}

declare interface VideoSource {
    url: string;
    bitrate?: number;
    mimetype?: string;
}