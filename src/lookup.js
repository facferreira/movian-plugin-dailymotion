var tnp = require('../libs/torrent-name-parser/index');

var utils = require('./utils');

exports.getItem = function(videoData, riskGuess, callback) {
    if (videoData.imdbid) {
        log.d("Lookup by IMDb ID");
        model.trakt.search.idLookup('imdb', videoData.imdbid, 1, 10, function(data, pagination) {
            if (data.length === 0) {
                log.d("Failed to detect resource");
            } else {
                var item = data[0];

                if (item.type === 'show') {
                    if (videoData.season && videoData.episode) {
                        item.type = 'episode';
                        item.episode = {
                            season: videoData.season,
                            number: videoData.episode
                        };
                    }
                }

                if (item.type === 'movie' || item.type === 'show' || item.type === 'episode') {
                    callback(item);
                } else log.d("Unknown resource type: " + item.type);
            }
        });
    } else {
        if (!riskGuess) {
            log.d("Giving up, since we would have to risk too much guessing...");
            return;
        }

        log.d("Lookup by title");
        var title = videoData.title;
        var year = videoData.year;

        log.d(videoData);

        model.trakt.search.textQuery(title, 'movie,show', year, 1, 10, function(data, pagination) {
            var item = data[0];
            if (item.type === 'show') {
                if (videoData.season && videoData.episode) {
                    var result = {
                        show: {
                            ids: {
                                trakt: item.show.ids.trakt
                            }
                        },
                        episode: {
                            season: videoData.season,
                            number: videoData.episode
                        }
                    };
                    callback(result);
                    return;
                } else log.d("Can't detect correctly which episode is this");
            }

            log.d("Can't detect metadata");
        });
    }
};

/*
 * Calls callback passing every item it could found that apparently matches the data
 * given, items with a higher score are more ideal than others.
 */
exports.getItems = function(page, data, callback) {
    var items = [];

    var totalStages = 2;
    var processedStages = 0;
    page.metadata.processedStages = processedStages;

    if (data.imdbid) {
        log.d("Lookup by IMDb ID");
        model.trakt.search.idLookup('imdb', data.imdbid, 1, 10, function(results, pagination) {
            if (results.length === 0) {
                log.d("Failed to detect resource");
            } else {
                for (var i in results) {
                    var result = results[i];
                    result.score = 100;

                    if (result.type === 'show') {
                        if (data.season && data.episode) {
                            result.type = 'episode';
                            result.episode = {
                                season: data.season,
                                number: data.episode
                            };

                            items.push(result);
                        } else items.push(result);
                    }

                    if (result.type === 'movie' || result.type === 'episode') {
                        items.push(result);
                    } else log.d("Unknown resource type: " + result.type);
                }
            }

            page.metadata.processedStages++;
        });
    } else {
        page.metadata.processedStages++;
    }

    {
        // lookup by title
        log.d("Lookup by title");
        var title = data.title.replace(/<.+?>/g, "");
        var year = data.year;
        if (year === 'null') year = null;
        var season = data.season;
        var episode = data.episode;

        if (!season || !episode) {
            var tnpResult = tnp(title);
            if (tnpResult) {
                log.d("Using torrent name model");
                log.d(tnpResult);
                title = tnpResult.title;
                season = tnpResult.season;
                episode = tnpResult.episode;
            } else {
                log.d("Not using torrent name model");
            }
        }

        var score = 90 - !(year) * 10;

        model.trakt.search.textQuery(title, 'movie,show', year, 1, 10, function(results, pagination) {
            for (var i in results) {
                var result = results[i];

                result.score = (score * result.score) / 100;

                if (result.type === 'movie') {
                    items.push(result);
                } else if (result.type === 'show') {
                    if (season && episode) {
                        result.type = 'episode';
                        result.episode = {
                            season: season,
                            number: episode
                        };

                        items.push(result);
                    } else {
                        items.push(result);
                    }
                }
            }

            page.metadata.processedStages++;
        });
    }

    prop.subscribe(page.metadata.processedStages, function(event, processedStages) {
        if (event === 'set' && processedStages === totalStages) {
            for (var i in items) {
                if (data.excludeTypes && data.excludeTypes.indexOf(items[i].type) != -1) {
                    items.splice(i, 1);
                }
            }

            utils.sortByField(items, 'score', false);
            for (var i = 0; i < items.length; i++) {
                for (var j = i + 1; j < items.length; j++) {
                    var item1 = items[i];
                    var item2 = items[j];

                    if (JSON.stringify(item1[item1.type]) === JSON.stringify(item2[item2.type])) {
                        items.splice(j, 1);
                        j--;
                    }
                }
            }

            callback(items);
        }
    });
};
