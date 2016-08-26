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

declare interface VideoParams {
    title?: string;
    icon?: string;
    no_fs_scan?: boolean;
    no_subtitle_scan?: boolean;
    canonicalUrl?: string;
    sources?: VideoSource[];
    subtitles?: VideoSubtitle[];
    imdbid?: string;
    year?: number;
    season?: number;
    episode?: number;
}

declare interface VideoSource {
    url: string;
    bitrate?: number;
    mimetype?: string;
}

declare interface VideoSubtitle {
    title: string;
    url: string;
    language?: string;
    source?: string;
}