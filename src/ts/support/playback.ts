import http = require('./http');

import general = require('./general');
import { log } from './log';

function getPlayerConfig(document: string) {
    var playConfigStr = document.match(/var config = (.*);/)[1];
    return JSON.parse(playConfigStr);
}

export function getVideoEmbedPage(id: string): string {
    var url = "http://www.dailymotion.com/embed/video/" + id;
    var result = http.request(url, {});

    switch (result.type) {
        case http.HttpCallbackResultType.SUCCESS:
            return result.response;

        case http.HttpCallbackResultType.ERROR:
            throw new Error("Failed to obtain video embed page (" + result.message + ")");
    }
}

export function getVideoSources(document: string): VideoSource[] {
    var playerConfig = getPlayerConfig(document);
    var qualitiesObj = playerConfig.metadata.qualities;

    if (playerConfig.metadata.stream_type !== "live") {
        var i = 0;

        // find the index in which the chosen (by user) maximum quality is
        while (i < general.availableQualities.length) {
            if (general.pluginConfig.maxQuality === general.availableQualities[i][0])
                break;

            i++;
        }

        // attempt to find a valid quality, going from that maximum quality to the lowest possible
        while (i < general.availableQualities.length) {
            var qualityId = general.availableQualities[i][0];
            var quality = general.availableQualities[i][1];
            var obj = qualitiesObj[qualityId];
            if (obj) {
                for (var j in obj) {
                    var videoSourceItem = obj[j];
                    if (videoSourceItem.type === "video/mp4") {
                        log.print("Found video URL with resolution " + quality);
                        return [{
                            url: videoSourceItem.url,
                            mimetype: videoSourceItem.type
                        }];
                    }
                }
            }

            i++;
        }
    }
    else {
        // var obj = qualitiesObj.auto[0];
        // return [{
        //     url: obj.url,
        //     mimetype: obj.type.replace("URL", "")
        // }]
        throw new Error("Live Streams are not yet supported by Movian");
    }

    throw new Error("I'm sorry but I can't play this video :( , please report it");
}

export function getVideoSubtitles(document: string): VideoSubtitle[] {
    var playerConfig = getPlayerConfig(document);
    var subtitlesObj = playerConfig.metadata.subtitles.data;

    var subtitles: VideoSubtitle[] = [];
    for (var language in subtitlesObj) {
        var subtitleObj = subtitlesObj[language];
        subtitles.push({
            url: subtitleObj.urls[0],
            title: subtitleObj.label,
            language: language,
            source: "Dailymotion"
        });
    }

    return subtitles;
}

export function getVideoCover(document: string): string {
    var playerConfig = getPlayerConfig(document);
    return playerConfig.metadata.poster_url;
}

export function getVideoStreamType(document: string): string {
    var playerConfig = getPlayerConfig(document);
    return playerConfig.metadata.stream_type;
}

export function getVideoTitle(document: string): string {
    var playerConfig = getPlayerConfig(document);
    return playerConfig.metadata.title;
}