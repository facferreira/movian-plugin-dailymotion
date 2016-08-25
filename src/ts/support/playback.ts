import http = require('./http');

import general = require('./general');
import { log } from './log';

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
    var playConfigStr = document.match("window.playerV5 = dmp.create(.*)")[1].replace("(document.getElementById('player'), ", "");
    playConfigStr = playConfigStr.substring(0, playConfigStr.length - 2);
    var playerConfig = JSON.parse(playConfigStr);

    var qualitiesObj = playerConfig.metadata.qualities;

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
            obj = obj[0];
            log.print("Found video URL with resolution " + quality);
            return [{
                url: obj.url,
                mimetype: obj.type.replace("URL", "")
            }];
        }

        i++;
    }

    throw new Error("I'm sorry but I can't play this video :( , please report it");
}