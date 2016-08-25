var lookup = require('./lookup');
var model = require('./model');
var utils = require('./utils');

function handleEpisodeItem(page, item, config) {
    var title = item.show.title +
        " - S" + utils.formatNumber(item.episode.season, 1) +
        "E" + utils.formatNumber(item.episode.number, 1);
    var subtitle = new Date(Date.parse(item.first_aired)).toLocaleString();

    var screenshot = utils.toImageSet(item.episode.images.screenshot, 'screenshot', false);
    if (!screenshot) screenshot = utils.toImageSet(item.show.images.thumb, 'thumb', false);
    if (!screenshot) screenshot = utils.toImageSet(item.show.images.fanart, 'fanart', true);

    var pageItem = page.appendItem(PREFIX + ":show:" + item.show.ids.trakt +
        ":season:" + item.episode.season + ":episode:" + item.episode.number, 'directory', {
            title: title,
            subtitle: subtitle,
            icon: screenshot
        });

    if (config.beforeItem)
        pageItem.moveBefore(config.beforeItem);
}

function handleMovieItem(page, item, config) {
    var id = item.ids.trakt;
    var title = item.title;
    var poster = utils.toImageSet(item.images.fanart, 'fanart', true);
    //if (!poster) poster = utils.toImageSet(item.images.thumb, 'thumb', false);
    //if (!poster) poster = utils.toImageSet(item.images.poster, 'poster');
    var pageItem = page.appendItem(PREFIX + ":movie:" + id, 'directory', {
        title: title,
        icon: poster
    });

    if (config.beforeItem)
        pageItem.moveBefore(config.beforeItem);
}

function handleShowItem(page, item, config) {
    var id = item.ids.trakt;
    var title = item.title;
    var poster = utils.toImageSet(item.images.thumb, 'thumb', false);
    if (!poster) poster = utils.toImageSet(item.images.fanart, 'fanart', true);
    //if (!poster) poster = utils.toImageSet(item.images.poster, 'poster');
    var pageItem = page.appendItem(PREFIX + ":show:" + id, 'directory', {
        title: title,
        icon: poster
    });

    if (config.beforeItem)
        pageItem.moveBefore(config.beforeItem);
}

function templateList(page, model, config) {
    if (model === null) throw 'Model has not been specified';
    config = config || {};

    var processedEntries = 0;
    var totalEntries = 0;

    var pageNum = config.pageNum ? config.pageNum : 1;
    var numberItemsPerPage = config.numberItems ? config.numberItems : 10;

    var loader = model.bind(null, function(data, pagination, error) {
        page.loading = false;

        if (error) {
            log.d("Cancelling pagination due to error:");
            log.e(error);
            page.haveMore(false);
            return;
        }

        var hadMore = false;

        if (pagination)
            totalEntries = pagination.itemCount;

        var i, item;
        for (i = 0; i < data.length; i++) {
            if (config.numberItems && processedEntries >= config.numberItems) {
                hadMore = true;
                break;
            }

            item = data[i];
            processedEntries++;

            if (item.movie)
                handleMovieItem(page, item.movie, config);
            else if (item.episode)
                handleEpisodeItem(page, item, config);
            else if (item.show)
                handleShowItem(page, item.show, config);
            else if (config.itemType === 'movie')
                handleMovieItem(page, item, config);
            else if (config.itemType === 'show')
                handleShowItem(page, item, config);
            else {
                log.e('Unknown item type.');
                continue;
                //log.e(item);
            }

            page.entries++;
        }

        if (page.entries === 0) {
            if (config.destroyIfNoElements) {
                config.destroyIfNoElements.destroy();
            } else {
                var item = page.appendPassiveItem("default", null, {
                    "title": "There are no resources available"
                });

                if (config.beforeItem) item.moveBefore(config.beforeItem);
            }
        }

        if (config.noPaginator && config.moreItemsUri && (processedEntries < totalEntries || hadMore)) {
            var item = page.appendItem(config.moreItemsUri, "directory", {
                "title": "See more"
            });

            if (config.beforeItem) item.moveBefore(config.beforeItem);
        }

        if (pagination && pagination.hasNext) {
            if (!config.noPaginator) {
                page.asyncPaginator = pagination.loadNextPage;
                page.haveMore(true);
            }
        }
    }, pageNum, numberItemsPerPage);

    if (!config.noPaginator) page.asyncPaginator = loader;
    loader();
}

/*******************************************************************************
 * Exported Functions
 ******************************************************************************/

exports.landingPage = function(page) {
    page.type = 'directory';
    page.model.contents = 'grid';
    page.metadata.title = "Trakt - Home Page";
    page.metadata.icon = plugin.getLogoPath();
    page.loading = true;

    page.entries = 0;

    page.appendItem(PREFIX + ":search:", 'search', {
        title: 'Search'
    });

    // separators
    var firstSeparator = null;
    /*if (auth.isAuthenticated()) {
        var separatorMoviesRecommended = page.appendPassiveItem('separator', null, {
            title: 'Movies - Recommended'
        });
    }*/
    if (auth.isAuthenticated()) {
        var separatorUpcomingEpisodes = page.appendPassiveItem('separator', null, {
            title: 'Upcoming Episodes'
        });
        firstSeparator = separatorUpcomingEpisodes;

        var separatorMoviesInWatchlist = page.appendPassiveItem('separator', null, {
            title: 'Movies in my Watchlist'
        });

        var separatorTvShowsInWatchlist = page.appendPassiveItem('separator', null, {
            title: 'TV Shows in my Watchlist'
        });
    }
    var separatorMoviesTrending = page.appendPassiveItem('separator', null, {
        title: 'Movies - Trending'
    });
    if (!firstSeparator) firstSeparator = separatorMoviesTrending;
    /*var separatorMoviesPopular = page.appendPassiveItem('separator', null, {
        title: 'Movies - Popular'
    });*/
    /*var separatorMoviesMostPlayed = page.appendPassiveItem('separator', null, {
        title: 'Movies - Most Played (Week)'
    });*/
    var separatorMoviesMostAnticipated = page.appendPassiveItem('separator', null, {
        title: 'Movies - Most Anticipated'
    });
    var separatorShowsTrending = page.appendPassiveItem('separator', null, {
        title: 'TV Shows - Trending'
    });
    /*var separatorShowsPopular = page.appendPassiveItem('separator', null, {
        title: 'TV Shows - Popular'
    });*/
    /*var separatorShowsMostPlayed = page.appendPassiveItem('separator', null, {
        title: 'TV Shows - Most Played (Week)'
    });*/
    var separatorShowsMostAnticipated = page.appendPassiveItem('separator', null, {
        title: 'TV Shows - Most Anticipated'
    });
    var separatorOtherLists = page.appendPassiveItem('separator', null, {
        title: 'Other lists'
    });

    /*if (auth.isAuthenticated()) {
        templateList(page, model.trakt.recommendations.movies.bind(null, 1, 4), {
            noPaginator: true,
            moreItemsUri: PREFIX + ":recommendations:movies",
            numberItems: 4,
            itemType: 'movie',
            beforeItem: separatorMoviesTrending
        });
    }*/

    if (auth.isAuthenticated()) {
        var startDate = new Date();
        startDate = startDate.getFullYear() + "-" + (startDate.getMonth() + 1) + "-" + startDate.getDate();
        templateList(page, model.trakt.calendars.myShows.bind(null, startDate, 31), {
            noPaginator: true,
            moreItemsUri: PREFIX + ":calendars:myshows",
            numberItems: 4,
            beforeItem: separatorMoviesInWatchlist
        });

        templateList(page, model.trakt.sync.getWatchlist.bind(null, 'movies'), {
            noPaginator: true,
            moreItemsUri: PREFIX + ":my:watchlist:movies",
            numberItems: 4,
            beforeItem: separatorTvShowsInWatchlist
        });

        templateList(page, model.trakt.sync.getWatchlist.bind(null, 'shows'), {
            noPaginator: true,
            moreItemsUri: PREFIX + ":my:watchlist:shows",
            numberItems: 4,
            beforeItem: separatorMoviesTrending
        });
    }

    templateList(page, model.trakt.movies.trending.bind(null, 1, 4), {
        noPaginator: true,
        moreItemsUri: PREFIX + ":movies:trending",
        numberItems: 4,
        beforeItem: separatorMoviesMostAnticipated
    });

    /*templateList(page, model.trakt.movies.popular.bind(null, 1, 4), {
        noPaginator: true,
        moreItemsUri: PREFIX + ":movies:popular",
        numberItems: 4,
        itemType: 'movie',
        beforeItem: separatorMoviesMostAnticipated
    });*/

    /*templateList(page, model.trakt.movies.played.bind(null, 1, 4), {
        noPaginator: true,
        moreItemsUri: PREFIX + ":movies:played",
        numberItems: 4,
        beforeItem: separatorMoviesMostAnticipated
    });*/

    templateList(page, model.trakt.movies.anticipated.bind(null, 1, 4), {
        noPaginator: true,
        moreItemsUri: PREFIX + ":movies:anticipated",
        numberItems: 4,
        beforeItem: separatorShowsTrending
    });

    templateList(page, model.trakt.shows.trending.bind(null, 1, 4), {
        noPaginator: true,
        moreItemsUri: PREFIX + ":shows:trending",
        numberItems: 4,
        beforeItem: separatorShowsMostAnticipated
    });

    /*templateList(page, model.trakt.shows.popular.bind(null, 1, 4), {
        noPaginator: true,
        moreItemsUri: PREFIX + ":shows:popular",
        numberItems: 4,
        itemType: 'show',
        beforeItem: separatorShowsMostAnticipated
    });*/

    /*templateList(page, model.trakt.shows.played.bind(null, 1, 4), {
        noPaginator: true,
        moreItemsUri: PREFIX + ":shows:played",
        numberItems: 4,
        beforeItem: separatorShowsMostAnticipated
    });*/

    templateList(page, model.trakt.shows.anticipated.bind(null, 1, 4), {
        noPaginator: true,
        moreItemsUri: PREFIX + ":shows:anticipated",
        numberItems: 4,
        beforeItem: separatorOtherLists
    });


    //log.d(page.entries);
    var processedFirstMove = false;
    prop.subscribe(page.model.nodes, function(event, data) {
        if (event === "movechild" && !processedFirstMove) {
            // we only have movechilds when adding actual items
            processedFirstMove = true;

            // Other lists
            page.appendItem(PREFIX + ":movies:popular", 'directory', {
                title: 'Movies - Most Popular'
            });
            page.appendItem(PREFIX + ":movies:played", 'directory', {
                title: 'Movies - Most Played'
            });
            page.appendItem(PREFIX + ":shows:popular", 'directory', {
                title: 'TV Shows - Most Popular'
            });
            page.appendItem(PREFIX + ":shows:played", 'directory', {
                title: 'TV Shows - Most Played'
            });
        }
    });
};

exports.calendars = {
    myshows: function(page) {
        page.type = 'directory';
        page.model.contents = 'grid';
        page.metadata.title = "Upcoming Episodes (Next 31 days)";
        page.metadata.icon = plugin.getLogoPath();
        page.loading = true;

        var startDate = new Date();
        startDate = startDate.getFullYear() + "-" + (startDate.getMonth() + 1) + "-" + startDate.getDate();
        templateList(page, model.trakt.calendars.myShows.bind(null, startDate, 31), {});
    }
};

exports.episode = function(page, show, season, episode, config) {
    season = parseInt(season);
    episode = parseInt(episode);
    config = config || {};

    page.type = "raw";
    page.metadata.glwview = Plugin.path + "views/episode.view";

    page.loading = 0;

    page.loading++;
    model.trakt.getSeasonEpisodes(show, season, function(data, pagination) {
        data = utils.getChild(data, 'number', episode);
        //log.d(data);

        page.metadata.imdbid = data.ids.imdb;

        page.metadata.title = data.title;
        if (data.images.screenshot.medium)
            page.metadata.screenshot = data.images.screenshot.medium;
        page.metadata.description = data.overview;
        page.metadata.trakt.rating = Math.round(data.rating * 10) + "%";
        if (data.first_aired)
            page.metadata.firstAired = new Date(data.first_aired).toLocaleString();

        if (auth.isAuthenticated()) {
            // watch history
            page.loading++;
            model.trakt.sync.getHistory('episodes', data.ids.trakt, function(data, pagination, error) {
                //log.d(data);

                if (data && data.length > 0) {
                    page.metadata.seen = true;
                    page.metadata.lastSeen = new Date(Date.parse(data[0].watched_at)).toLocaleString();
                }

                page.loading--;
            });

            page.appendAction("Check in", function() {
                var postdata = {
                    episode: data
                };
                model.trakt.checkin(postdata, function(response, pagination, error) {
                    if (response) popup.notify("Successfully checked in", 3);
                    else if (error.statuscode === 409) popup.notify("Already checked in", 3);
                    else popup.notify("Failed to check in", 3);
                });
            });

            page.appendAction("Mark as seen", function() {
                var postdata = {
                    episodes: [data]
                };
                model.trakt.sync.addToHistory(postdata, function(response, pagination, error) {
                    if (response) {
                        popup.notify("Successfully added to history", 3);
                        page.metadata.lastSeen = new Date().toLocaleString();
                    } else popup.notify("Failed to add to history", 3);
                });
            });
        }

        page.loading--;
    });

    page.loading++;
    model.trakt.getShowInfo(show, function(data, pagination) {
        page.metadata.show.title = data.title;
        if (page.metadata.screenshot.toString() === "null")
            page.metadata.screenshot = utils.toImageSet(data.images.poster, 'poster');
        page.metadata.background = utils.toImageSet(data.images.fanart, 'fanart');

        page.loading--;
    });

    page.loading++;
    model.trakt.getEpisodeStats(show, season, episode, function(data, pagination) {
        //log.d(data);

        page.metadata.watchers = data.watchers;
        page.metadata.plays = data.plays;

        page.loading--;
    });

    prop.subscribe(page.metadata.imdbid, function(event, data) {
        if (event === "set" && data !== null) {
            var imdbid = data;
            log.d("IMDB ID: " + imdbid);

            page.loading++;
            model.imdb.getMovieInfo(imdbid, function(data) {
                if (data.Response === "True") {
                    //log.d(data);
                    page.metadata.director = data.Director;
                    page.metadata.rated = data.Rated;
                    page.metadata.runtime = data.Runtime;

                    page.metadata.rt = {};
                    page.metadata.rt.image = data.tomatoImage;
                    page.metadata.rt.criticsMeter = data.tomatoMeter + "%";

                    page.metadata.metacritic = data.Metascore + "%";
                }

                page.loading--;
            });
        }
    }, {
        autoDestroy: true
    });

    prop.subscribe(page.metadata.show.title, function(event, data) {
        if (event === 'set' && data !== null) {
            page.appendItem("search:" + page.metadata.show.title +
                " S" + utils.formatNumber(season, 2) +
                "E" + utils.formatNumber(episode, 2), 'directory', {
                    title: 'Search',
                    icon: Plugin.path + "views/img/search.png"
                });
        }
    });

    if (config.play) {
        page.appendItem(config.play.url, 'video', {
            title: 'Continue',
            icon: Plugin.path + "views/img/play.png"
        });
    }
};

exports.movies = {};

exports.movies.anticipated = function(page) {
    page.type = 'directory';
    page.model.contents = 'grid';
    page.loading = true;
    page.metadata.title = "Movies - Most Anticipated";
    page.metadata.icon = plugin.getLogoPath();

    templateList(page, model.trakt.movies.anticipated.bind(null, 1, 20));
};

exports.movies.played = function(page) {
    page.type = 'directory';
    page.model.contents = 'grid';
    page.loading = true;
    page.metadata.title = "Movies - Most Played (Week)";
    page.metadata.icon = plugin.getLogoPath();

    templateList(page, model.trakt.movies.played.bind(null, 1, 20));
};

exports.movies.popular = function(page) {
    page.type = 'directory';
    page.model.contents = 'grid';
    page.loading = true;
    page.metadata.title = "Movies - Most Popular";
    page.metadata.icon = plugin.getLogoPath();

    templateList(page, model.trakt.movies.popular.bind(null, 1, 20), {
        itemType: 'movie'
    });
};

exports.movies.trending = function(page) {
    page.type = 'directory';
    page.model.contents = 'grid';
    page.loading = true;
    page.metadata.title = "Movies - Trending";
    page.metadata.icon = plugin.getLogoPath();

    templateList(page, model.trakt.movies.trending.bind(null, 1, 20));
};

exports.movie = function(page, id, config) {
    config = config || {};

    page.type = "raw";
    page.metadata.glwview = Plugin.path + "views/movie.view";

    page.loading = 0;

    var movie = null;

    page.loading++;
    model.trakt.getMovieInfo(id, function(data, pagination) {
        //log.d(data);
        movie = data;

        page.metadata.imdbid = data.ids.imdb;
        page.metadata.ids.trakt = data.ids.trakt;
        page.metadata.title = data.title;
        page.metadata.poster = utils.toImageSet(data.images.poster, 'poster');
        page.metadata.logo = utils.toImageSet(data.images.logo, 'logo', false);
        page.metadata.background = utils.toImageSet(data.images.fanart, 'fanart');
        page.metadata.year = data.year;
        page.metadata.tagline = data.tagline;
        page.metadata.description = data.overview;
        if (data.runtime)
            page.metadata.runtime = data.runtime + " minutes";
        page.metadata.trakt.rating = Math.round(data.rating * 10) + "%";
        page.metadata.certification = data.certification;

        if (auth.isAuthenticated()) {
            page.appendAction("Check in", function() {
                var postdata = {
                    movie: data
                };
                model.trakt.checkin(postdata, function(response, pagination, error) {
                    if (response) popup.notify("Successfully checked in", 3);
                    else if (error.statuscode === 409) popup.notify("Already checked in", 3);
                    else popup.notify("Failed to check in", 3);
                });
            }).moveBefore(itemSimilar);

            page.appendAction("Mark as seen", function() {
                var postdata = {
                    movies: [data]
                };
                model.trakt.sync.addToHistory(postdata, function(response, pagination, error) {
                    if (response) {
                        popup.notify("Successfully added to history", 3);
                        page.metadata.lastSeen = new Date().toLocaleString();
                    } else popup.notify("Failed to add to history", 3);
                });
            }).moveBefore(itemSimilar);
        }

        if (data.trailer) {
            if (data.trailer)
                data.trailer = data.trailer.replace("youtube.com", "www.youtube.com");
            var itemTrailer = page.appendItem(data.trailer, 'video', {
                title: 'Trailer',
                icon: Plugin.path + "views/img/play.png"
            });
        }

        page.appendItem("search:" + page.metadata.title, 'directory', {
            title: 'Search',
            icon: Plugin.path + "views/img/search.png"
        });

        page.loading--;
    });

    if (auth.isAuthenticated()) {
        // watch history
        page.loading++;
        model.trakt.sync.getHistory('movies', id, function(data, pagination, error) {
            //log.d(data);

            if (data && data.length > 0) {
                page.metadata.seen = true;
                page.metadata.lastSeen = new Date(Date.parse(data[0].watched_at)).toLocaleString();
            }

            page.loading--;
        });

        prop.subscribe(page.metadata.ids.trakt, function(event, data) {
            if (event === "set" && data !== null) {
                model.trakt.sync.getWatchlist('movies', function(data, pagination, error) {
                    if (data) {
                        var inWatchlist = false;
                        for (var i in data) {
                            var item = data[i];
                            if (item.movie.ids.trakt === parseInt(page.metadata.ids.trakt.toString())) {
                                inWatchlist = true;
                                log.d("Movie is in watchlist!");
                            }
                        }

                        if (!inWatchlist) {
                            log.d("Movie is not in watchlist!");
                        }

                        page.metadata.inWatchlist = inWatchlist;
                    }
                });
            }
        });

        prop.subscribe(page.metadata.inWatchlist, function(event, data) {
            if (event === "set" && data !== null) {
                if (data) {
                    // in watchlist
                    var newItemManipulateWatchlist = page.appendAction('Remove from Watchlist', function(v) {
                        log.d('Removing from watchlist');
                        if (movie) {
                            var postdata = {
                                movies: [{
                                    ids: {
                                        trakt: movie.ids.trakt,
                                    }
                                }]
                            };
                            model.trakt.sync.removeFromWatchlist(postdata, function(data, pagination, error) {
                                if (data) {
                                    if (data.deleted.movies > 0) {
                                        page.metadata.inWatchlist = false;
                                        popup.notify("Removed successfully movie from watchlist", 4);
                                    } else if (data.not_found.movies > 0) popup.notify("Trakt couldn't find the movie...", 4);
                                } else
                                    popup.notify("Failed to remove from watchlist", 3);
                            });
                        } else popup.notify("Operation not yet available", 3);
                    });

                    newItemManipulateWatchlist.moveBefore(itemManipulateWatchlist);

                    itemManipulateWatchlist.destroy();
                    itemManipulateWatchlist = newItemManipulateWatchlist;

                } else {
                    // not in watchlist
                    var newItemManipulateWatchlist = page.appendAction('Add to Watchlist', function(v) {
                        log.d('Adding to watchlist');
                        if (movie) {
                            var postdata = {
                                movies: [{
                                    ids: {
                                        trakt: movie.ids.trakt,
                                    }
                                }]
                            };
                            model.trakt.sync.addToWatchlist(postdata, function(data, pagination, error) {
                                if (data) {
                                    if (data.added.movies > 0) {
                                        page.metadata.inWatchlist = true;
                                        popup.notify("Added successfully movie to watchlist", 4);
                                    } else if (data.existing.movies > 0) popup.notify("Movie was already in watchlist", 4);
                                    else if (data.not_found.movies > 0) popup.notify("Trakt couldn't find the movie...", 4);
                                } else
                                    popup.notify("Failed to add to watchlist", 3);
                            });
                        } else popup.notify("Operation not yet available", 3);
                    });

                    newItemManipulateWatchlist.moveBefore(itemManipulateWatchlist);

                    itemManipulateWatchlist.destroy();
                    itemManipulateWatchlist = newItemManipulateWatchlist;
                }
            }
        });
    }

    prop.subscribe(page.metadata.imdbid, function(event, data) {
        if (event === "set" && data !== null) {
            var imdbid = data;
            log.d("IMDB ID: " + imdbid);

            page.loading++;
            model.imdb.getMovieInfo(imdbid, function(data) {
                if (data.Response === "True") {
                    //log.d(data);
                    page.metadata.director = data.Director;
                    page.metadata.genre = data.Genre;
                    page.metadata.released = data.Released;

                    page.metadata.rt = {};
                    page.metadata.rt.image = data.tomatoImage;
                    page.metadata.rt.criticsMeter = data.tomatoMeter + "%";

                    page.metadata.metacritic = data.Metascore + "%";
                }

                page.loading--;
            });
        }
    }, {
        autoDestroy: true
    });

    /*page.loading++;
    model.trakt.movies.stats(id, function(data, pagination) {
        //log.d(data);

        page.metadata.plays = data.plays;

        page.loading--;
    });*/

    if (config.play) {
        page.appendItem(config.play.url, 'video', {
            title: 'Continue',
            icon: Plugin.path + "views/img/play.png"
        });
    }

    if (auth.isAuthenticated()) {
        var itemManipulateWatchlist = page.appendAction('Manipulate watchlist (not available)', function(v) {
            popup.notify("Operation not available right now", 3);
        });
    }

    var itemSimilar = page.appendItem(PREFIX + ":movie:" + id + ":similar", 'directory', {
        title: 'Similar',
        icon: Plugin.path + "views/img/movie.png"
    });
};

exports.movie.similar = function(page, id) {
    page.type = 'directory';
    page.model.contents = 'grid';
    page.metadata.title = "Trakt - Similar Movies";
    page.metadata.icon = plugin.getLogoPath();
    page.loading = true;

    templateList(page, model.trakt.movies.related.bind(null, id, 1, 20), {
        itemType: 'movie'
    });
};

exports.my = {
    watchlist: function(page, type) {
        page.type = 'directory';
        page.model.contents = 'grid';
        page.loading = true;
        page.metadata.title = "My Watchlist";
        page.metadata.icon = plugin.getLogoPath();

        templateList(page, model.trakt.sync.getWatchlist.bind(null, type));
    }
};

exports.open = {
    list: function(page, config) {
        page.type = 'directory';
        page.metadata.title = "Choose the Movie/Episode that matches the selected item";
        page.loading = false;

        var title = config.title;

        lookup.getItems(page, config, function(items) {
            if (items.length === 0) {
                page.appendPassiveItem("default", null, {
                    title: "There are no potential matches"
                });
                return;
            }

            if (items[0].score === 100) {
                if (items[0].type === 'movie')
                    page.redirect(PREFIX + ":movie:" + items[0].movie.ids.trakt + ":config:" + escape(JSON.stringify(config)));
                else if (items[0].type === 'show')
                    page.redirect(PREFIX + ":show:" + items[0].show.ids.trakt + ":config:" + escape(JSON.stringify(config)));
                else if (items[0].type === 'episode')
                    page.redirect(PREFIX + ":show:" + items[0].show.ids.trakt +
                        ":season:" + items[0].episode.season + ":episode:" + items[0].episode.number +
                        ":config:" + escape(JSON.stringify(config)));

                return;
            }

            for (var i in items) {
                var item = items[i];
                if (item.type === 'movie')
                    page.appendItem(PREFIX + ":movie:" + item.movie.ids.trakt + ":config:" + escape(JSON.stringify(config)),
                        'video', {
                            title: '[MOVIE] ' + item.movie.title /* + " (score: " + item.score + ")"*/ ,
                            icon: utils.toImageSet(item.movie.images.poster, 'poster')
                        });
                else if (item.type === 'show')
                    page.appendItem(PREFIX + ":show:" + item.show.ids.trakt + ":config:" + escape(JSON.stringify(config)),
                        'video', {
                            title: '[TV SHOW] ' + item.show.title /* + " (score: " + item.score + ")"*/ ,
                            icon: utils.toImageSet(item.show.images.poster, 'poster')
                        });
                else if (item.type === 'episode')
                    page.appendItem(PREFIX + ":show:" + item.show.ids.trakt +
                        ":season:" + item.episode.season + ":episode:" + item.episode.number +
                        ":config:" + escape(JSON.stringify(config)),
                        'video', {
                            title: '[TV SHOW - EPISODE] ' + item.show.title +
                                " (Season #" + item.episode.season + ", Episode #" + item.episode.number + ")"
                                /* + " (score: " + item.score + ")"*/
                                ,
                            icon: utils.toImageSet(item.show.images.poster, 'poster')
                        });
            }
        });
    }
};

exports.season = function(page, show, number, config) {
    config = config || {};

    page.type = "raw";
    page.metadata.glwview = Plugin.path + "views/season.view";

    var seasonName = number ? "Season #" + number : "Specials";

    page.loading = 0;

    var showItem = null;

    page.loading++;
    model.trakt.getShowInfo(show, function(data, pagination) {
        //log.d(data);

        showItem = data;

        page.metadata.title = data.title + " - " + seasonName;
        page.metadata.description = data.overview;
        page.metadata.certification = data.certification;
        page.metadata.network = data.network;
        page.metadata.runtime = data.runtime + " minutes";
        page.metadata.poster = utils.toImageSet(data.images.poster, 'poster');

        if (!page.metadata.background)
            page.metadata.background = utils.toImageSet(data.images.fanart, 'fanart', true);

        /*page.appendAction('navopen', "search:" + page.metadata.title, false, {
          title: 'Search',
          icon: Plugin.path + "views/img/search.png"
        });*/

        page.loading--;
    });

    var episodeMapping = {};
    prop.subscribe(page.metadata.poster, function(event, data) {
        if (event === "set" && data !== null) {
            page.loading++;
            model.trakt.getSeasonsInfo(show, function(data, pagination) {
                data = utils.getChild(data, 'number', number);

                page.metadata.background = utils.toImageSet(data.images.thumb, 'thumb', false);

                if (data.images.poster)
                    page.metadata.poster = utils.toImageSet(data.images.poster, 'poster');
                page.metadata.trakt.rating = Math.round(data.rating * 10) + "%";
                if (data.first_aired)
                    page.metadata.firstAired = new Date(data.first_aired).toLocaleString();
                page.metadata.tagline = data.tagline;
                page.metadata.description = data.overview;
                page.metadata.certification = data.certification;
                page.metadata.network = data.network;

                page.loading--;
            });

            page.loading++;
            model.trakt.getSeasonEpisodes(show, number, function(data, pagination) {
                var episodes = [];
                for (var i in data) {
                    var item = data[i];
                    episodes.push({
                        episode: item.number,
                        title: "Episode #" + item.number,
                        subtitle: item.title,
                        screenshot: item.images.screenshot.medium ?
                            utils.toImageSet(item.images.screenshot, 'screenshot', false) : utils.toImageSet(showItem.images.fanart, 'fanart', true),
                        url: PREFIX + ":show:" + show + ":season:" + number + ":episode:" + item.number
                    });

                    episodeMapping[item.number] = parseInt(i);
                }

                page.metadata.episodes = episodes;
                page.metadata.episodesReady = true;

                page.loading--;
            });
        }
    });

    if (auth.isAuthenticated()) {
        prop.subscribe(page.metadata.episodesReady, function(event, data) {
            if (event === "set" && data !== null) {
                page.loading++;
                model.trakt.shows.watchedProgress(show, function(data, pagination) {
                    data = utils.getChild(data.seasons, 'number', number);
                    if (data) {
                        data = data.episodes;

                        var watched = {};
                        for (var i = 0; i < data.length; i++) {
                            var item = data[i];
                            if (item.completed) {
                                var index = episodeMapping[item.number];
                                page.metadata.episodes[index].watched = true;
                            }
                        }
                    }

                    page.loading--;
                });
            }
        });
    }

    prop.subscribe(page.metadata.imdbid, function(event, data) {
        if (event === "set" && data !== null) {
            var imdbid = data;
            log.d("IMDB ID: " + imdbid);

            page.loading++;
            model.imdb.getMovieInfo(imdbid, function(data) {
                if (data.Response === "True") {
                    //log.d(data);
                    page.metadata.director = data.Director;
                    page.metadata.genre = data.Genre;
                    page.metadata.released = data.Released;
                    page.metadata.awards = data.Awards;

                    page.metadata.rt = {};
                    page.metadata.rt.image = data.tomatoImage;
                    page.metadata.rt.criticsMeter = data.tomatoMeter;

                    page.metadata.metacritic = data.Metascore;
                }

                page.loading--;
            });
        }
    }, {
        autoDestroy: true
    });

    /*if (config.play) {
      page.appendAction('navopen', config.play.url, false, {
        title: 'Continue',
        icon: Plugin.path + "views/img/play.png"
      });
    }*/
};

exports.scrobble = {
    list: function(page, config) {
        page.type = 'directory';
        page.metadata.title = "Choose the Movie/Episode that matches what you want to watch";
        page.loading = false;

        config.excludeTypes = ['show'];
        lookup.getItems(page, config, function(items) {
            if (items.length === 0) {
                page.appendPassiveItem("default", null, {
                    title: "There are no potential matches, scrobbling for this video is not possible"
                });
                return;
            }

            if (items[0].score === 100) {
                if (items[0].type === 'movie')
                    page.redirect(PREFIX + ":scrobble:play:movie:" + escape(config.play.url) + ":" + items[0].movie.ids.trakt);
                else if (items[0].type === 'episode')
                    page.redirect(PREFIX + ":scrobble:play:episode:" + escape(config.play.url) + ":" +
                        items[0].show.ids.trakt + ":" + items[0].episode.season + ":" + items[0].episode.number);

                return;
            }

            for (var i in items) {
                var item = items[i];
                if (item.type === 'movie') {
                    page.appendItem(PREFIX + ":scrobble:play:movie:" + escape(config.play.url) + ":" + item.movie.ids.trakt, 'video', {
                        title: '[MOVIE] ' + item.movie.title /* + " (score: " + item.score + ")"*/ ,
                        icon: utils.toImageSet(item.movie.images.poster, 'poster')
                    });
                } else if (item.type === 'episode')
                    page.appendItem(PREFIX + ":scrobble:play:episode:" + escape(config.play.url) + ":" +
                        item.show.ids.trakt + ":" + item.episode.season + ":" + item.episode.number,
                        'video', {
                            title: '[TV SHOW - EPISODE] ' + item.show.title +
                                " (Season #" + item.episode.season + ", Episode #" + item.episode.number + ")"
                                /* + " (score: " + item.score + ")"*/
                                ,
                            icon: utils.toImageSet(item.show.images.poster, 'poster')
                        });
            }
        });
    }
};

exports.search = function(page, query) {
    page.type = 'directory';
    page.model.contents = 'grid';
    page.metadata.title = "Trakt - Search";
    page.metadata.icon = plugin.getLogoPath();
    page.loading = true;

    templateList(page, model.trakt.search.textQuery.bind(null, query, null, null, 1, 20));
};

exports.show = function(page, id, config) {
    config = config || {};

    page.type = "raw";
    page.metadata.glwview = Plugin.path + "views/show.view";

    page.metadata.ids.trakt = {};

    var show = null;

    if (config.play) {
        page.appendItem(config.play.url, 'video', {
            title: 'Continue',
            icon: Plugin.path + "views/img/play.png"
        });
    }

    if (auth.isAuthenticated()) {
        var itemManipulateWatchlist = page.appendAction('Manipulate watchlist (not available)', function(v) {
            popup.notify("Operation not available right now", 3);
        });
    }

    page.appendItem(PREFIX + ":show:" + id + ":similar", 'directory', {
        title: 'Similar',
        icon: Plugin.path + "views/img/tv.png"
    });

    page.loading++;
    model.trakt.getShowInfo(id, function(data, pagination) {
        //log.d(data);

        show = data;

        page.metadata.ids.trakt = data.ids.trakt;
        page.metadata.imdbid = data.ids.imdb;

        page.metadata.title = data.title;
        page.metadata.logo = utils.toImageSet(data.images.logo, 'logo', false);
        page.metadata.icon = page.metadata.logo;
        page.metadata.poster = utils.toImageSet(data.images.poster, 'poster');
        page.metadata.background = utils.toImageSet(data.images.fanart, 'fanart');
        page.metadata.year = data.year;
        page.metadata.tagline = data.tagline;
        page.metadata.description = data.overview;
        page.metadata.runtime = data.runtime + " minutes";
        page.metadata.trakt.rating = Math.round(data.rating * 10) + "%";
        page.metadata.certification = data.certification;
        page.metadata.network = data.network;
        page.metadata.airedEpisodes = data.aired_episodes;
        page.metadata.status = utils.prettyStatus(data.status);

        if (data.trailer) {
            if (data.trailer)
                data.trailer = data.trailer.replace("youtube.com", "www.youtube.com");
            var itemTrailer = page.appendItem(data.trailer, 'video', {
                title: 'Trailer',
                icon: Plugin.path + "views/img/play.png"
            });
        }

        page.appendItem("search:" + page.metadata.title, 'directory', {
            title: 'Search',
            icon: Plugin.path + "views/img/search.png"
        });

        page.loading--;
    });

    if (auth.isAuthenticated()) {
        page.loading++;
        model.trakt.shows.watchedProgress(id, function(data, pagination, error) {
            //log.d(data);

            if (data && data.next_episode) {
                var nextEpisode = data.next_episode;
                page.metadata.nextEpisode = {
                    title: 'Next to Watch: Season #' + nextEpisode.season + ', Episode #' + nextEpisode.number,
                    subtitle: nextEpisode.title,
                    screenshot: utils.toImageSet(nextEpisode.images.screenshot, 'screenshot'),
                    url: PREFIX + ":show:" + id + ":season:" + nextEpisode.season + ":episode:" + nextEpisode.number
                };
            }

            page.loading--;
        });
    }

    if (auth.isAuthenticated()) {
        prop.subscribe(page.metadata.ids.trakt, function(event, data) {
            if (event === "set" && data !== null) {
                model.trakt.sync.getWatchlist('shows', function(data, pagination, error) {
                    if (data) {
                        var inWatchlist = false;
                        for (var i in data) {
                            var item = data[i];
                            if (item.show.ids.trakt === parseInt(page.metadata.ids.trakt.toString())) {
                                inWatchlist = true;
                                log.d("TV show is in watchlist!");
                            }
                        }

                        if (!inWatchlist) {
                            log.d("TV show is not in watchlist!");
                        }

                        page.metadata.inWatchlist = inWatchlist;
                    }
                });
            }
        });

        prop.subscribe(page.metadata.inWatchlist, function(event, data) {
            if (event === "set" && data !== null) {
                if (data) {
                    // in watchlist
                    var newItemManipulateWatchlist = page.appendAction('Remove from Watchlist', function(v) {
                        log.d('Removing from watchlist');
                        if (show) {
                            var postdata = {
                                shows: [{
                                    title: show.title,
                                    year: show.year,
                                    ids: {
                                        trakt: show.ids.trakt,
                                        slug: show.ids.slug,
                                        tvdb: show.ids.tvdb,
                                        imdb: show.ids.imdb,
                                        tmdb: show.ids.tmdb,
                                        tvrage: show.ids.tvrage
                                    }
                                }]
                            };
                            model.trakt.sync.removeFromWatchlist(postdata, function(data, pagination, error) {
                                if (data) {
                                    if (data.deleted.shows > 0) {
                                        page.metadata.inWatchlist = false;
                                        popup.notify("Removed successfully TV show from watchlist", 4);
                                    } else if (data.not_found.shows > 0) popup.notify("Trakt couldn't find the TV show...", 4);
                                } else
                                    popup.notify("Failed to remove from watchlist", 3);
                            });
                        } else popup.notify("Operation not yet available", 3);
                    });

                    newItemManipulateWatchlist.moveBefore(itemManipulateWatchlist);

                    itemManipulateWatchlist.destroy();
                    itemManipulateWatchlist = newItemManipulateWatchlist;

                } else {
                    // not in watchlist
                    var newItemManipulateWatchlist = page.appendAction('Add to Watchlist', function(v) {
                        log.d('Adding to watchlist');
                        if (show) {
                            var postdata = {
                                shows: [{
                                    title: show.title,
                                    year: show.year,
                                    ids: {
                                        trakt: show.ids.trakt,
                                        slug: show.ids.slug,
                                        tvdb: show.ids.tvdb,
                                        imdb: show.ids.imdb,
                                        tmdb: show.ids.tmdb,
                                        tvrage: show.ids.tvrage
                                    }
                                }]
                            };
                            model.trakt.sync.addToWatchlist(postdata, function(data, pagination, error) {
                                if (data) {
                                    if (data.added.shows > 0) {
                                        page.metadata.inWatchlist = true;
                                        popup.notify("Added successfully TV show to watchlist", 4);
                                    } else if (data.existing.shows > 0) popup.notify("TV show was already in watchlist", 4);
                                    else if (data.not_found.shows > 0) popup.notify("Trakt couldn't find the TV show...", 4);
                                } else
                                    popup.notify("Failed to add to watchlist", 3);
                            });
                        } else popup.notify("Operation not yet available", 3);
                    });

                    newItemManipulateWatchlist.moveBefore(itemManipulateWatchlist);

                    itemManipulateWatchlist.destroy();
                    itemManipulateWatchlist = newItemManipulateWatchlist;
                }
            }
        });
    }

    prop.subscribe(page.metadata.poster, function(event, data) {
        if (event === "set" && data !== null) {
            page.loading++;
            model.trakt.getSeasonsInfo(id, function(data, pagination) {
                utils.sortByField(data, 'number', false);
                //log.d(data);

                var seasons = [];
                for (var i in data) {
                    var item = data[i];

                    var image = utils.toImageSet(item.images.thumb, 'thumb', false);
                    if (!image) image = utils.toImageSet(item.images.fanart, 'fanart', false);
                    if (!image) image = utils.toImageSet(item.images.poster, 'poster', false);
                    if (!image) image = page.metadata.poster;

                    var metadata = {
                        title: item.number ? "Season #" + item.number : "Specials",
                        subtitle: item.episode_count + " episodes",
                        url: PREFIX + ":show:" + id + ":season:" + item.number,
                        poster: image
                    };
                    seasons.push(metadata);
                }

                page.metadata.seasons = seasons;

                page.loading--;
            });
        }
    });

    prop.subscribe(page.metadata.imdbid, function(event, data) {
        if (event === "set" && data !== null) {
            var imdbid = data;
            log.d("IMDB ID: " + imdbid);

            page.loading++;
            model.imdb.getMovieInfo(imdbid, function(data) {
                if (data.Response === "True") {
                    //log.d(data);
                    page.metadata.director = data.Director;
                    page.metadata.genre = data.Genre;
                    page.metadata.released = data.Released;
                    page.metadata.awards = data.Awards;

                    page.metadata.numberAwardsWins = 0;
                    if (data.Awards) {
                        // check for golden globes
                        var match = data.Awards.match(/Won (\d+) Golden Globes?/);
                        if (match) {
                            page.metadata.numberAwardsWins += parseInt(match[1]);
                        }

                        match = data.Awards.match(/(\d+) wins?/);
                        if (match) {
                            page.metadata.numberAwardsWins += parseInt(match[1]);
                        }

                        match = data.Awards.match(/(\d+) nominations?/);
                        if (match) {
                            page.metadata.numberAwardsNominations += parseInt(match[1]);
                        }
                    }

                    page.metadata.rt = {};
                    page.metadata.rt.image = data.tomatoImage;
                    page.metadata.rt.criticsMeter = data.tomatoMeter + "%";

                    page.metadata.metacritic = data.Metascore + "%";
                }

                page.loading--;
            });
        }
    }, {
        autoDestroy: true
    });
};

exports.show.similar = function(page, id) {
    page.type = 'directory';
    page.model.contents = 'grid';
    page.metadata.title = "Trakt - Similar TV Shows";
    page.metadata.icon = plugin.getLogoPath();
    page.loading = true;

    templateList(page, model.trakt.shows.related.bind(null, id, 1, 20), {
        itemType: 'show'
    });
};

exports.shows = {
    anticipated: function(page) {
        page.type = 'directory';
        page.model.contents = 'grid';
        page.loading = true;
        page.metadata.title = "TV Shows - Most Anticipated";
        page.metadata.icon = plugin.getLogoPath();

        templateList(page, model.trakt.shows.anticipated.bind(null, 1, 20));
    },

    played: function(page) {
        page.type = 'directory';
        page.model.contents = 'grid';
        page.loading = true;
        page.metadata.title = "TV Shows - Most Played (Week)";
        page.metadata.icon = plugin.getLogoPath();

        templateList(page, model.trakt.shows.played.bind(null, 1, 20));
    },

    popular: function(page) {
        page.type = 'directory';
        page.model.contents = 'grid';
        page.loading = true;
        page.metadata.title = "TV Shows - Most Popular";
        page.metadata.icon = plugin.getLogoPath();

        templateList(page, model.trakt.shows.popular.bind(null, 1, 20), {
            itemType: 'show'
        });
    },

    trending: function(page) {
        page.type = 'directory';
        page.model.contents = 'grid';
        page.loading = true;
        page.metadata.title = "TV Shows - Trending";
        page.metadata.icon = plugin.getLogoPath();

        templateList(page, model.trakt.shows.trending.bind(null, 1, 20));
    }
};
