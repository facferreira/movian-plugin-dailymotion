var api = require('./api');

/*******************************************************************************
 * Exported Functions
 ******************************************************************************/
exports.trakt = {};

exports.trakt.calendars = {
    myShows: function(startDate, numberDays, callback) {
        api.calendars.myShows(startDate, numberDays, callback);
    }
};

exports.trakt.checkin = function(item, callback) {
    api.checkin(item, callback);
};

exports.trakt.movies = {};
exports.trakt.movies.anticipated = function(pageNum, numberItemsPerPage, callback) {
    api.movies.anticipated(pageNum, numberItemsPerPage, callback);
};

exports.trakt.movies.played = function(pageNum, numberItemsPerPage, callback) {
    api.movies.played(pageNum, numberItemsPerPage, callback);
};

exports.trakt.movies.popular = function(pageNum, numberItemsPerPage, callback) {
    api.movies.popular(pageNum, numberItemsPerPage, callback);
};

exports.trakt.movies.related = function(id, pageNum, numberItemsPerPage, callback) {
    api.movies.related(id, pageNum, numberItemsPerPage, callback);
};

exports.trakt.movies.stats = function(id, callback) {
    api.movies.stats(id, callback);
};

exports.trakt.movies.trending = function(pageNum, numberItemsPerPage, callback) {
    api.movies.trending(pageNum, numberItemsPerPage, callback);
};

exports.trakt.getEpisodeStats = function(show, season, episode, callback) {
    api.episodes.stats(show, season, episode, callback);
};

exports.trakt.getMovieInfo = function(id, callback) {
    api.movies.summary(id, callback);
};

exports.trakt.getShowInfo = function(id, callback) {
    api.shows.summary(id, callback);
};

exports.trakt.getSeasonsInfo = function(id, callback) {
    api.seasons.summary(id, callback);
};

exports.trakt.getSeasonEpisodes = function(show, number, callback) {
    api.seasons.season(show, number, callback);
};

exports.trakt.recommendations = {
    movies: function(pageNum, numberItemsPerPage, callback) {
        api.recommendations.movies(pageNum, numberItemsPerPage, callback);
    },

    shows: function(pageNum, numberItemsPerPage, callback) {
        api.recommendations.shows(pageNum, numberItemsPerPage, callback);
    }
};

exports.trakt.search = {};
exports.trakt.search.idLookup = function(type, id, pageNum, numberItemsPerPage, callback) {
    api.search.idLookup(type, id, pageNum, numberItemsPerPage, callback);
};

exports.trakt.search.textQuery = function(query, type, year, pageNum, numberItemsPerPage, callback) {
    api.search.textQuery(query, type, year, pageNum, numberItemsPerPage, callback);
};

exports.trakt.shows = {};
exports.trakt.shows.anticipated = function(pageNum, numberItemsPerPage, callback) {
    api.shows.anticipated(pageNum, numberItemsPerPage, callback);
};

exports.trakt.shows.played = function(pageNum, numberItemsPerPage, callback) {
    api.shows.played(pageNum, numberItemsPerPage, callback);
};

exports.trakt.shows.popular = function(pageNum, numberItemsPerPage, callback) {
    api.shows.popular(pageNum, numberItemsPerPage, callback);
};

exports.trakt.shows.related = function(id, pageNum, numberItemsPerPage, callback) {
    api.shows.related(id, pageNum, numberItemsPerPage, callback);
};

exports.trakt.shows.trending = function(pageNum, numberItemsPerPage, callback) {
    api.shows.trending(pageNum, numberItemsPerPage, callback);
};

exports.trakt.shows.watchedProgress = function(show, callback) {
    api.shows.watchedProgress(show, callback);
};

exports.trakt.scrobble = {};
exports.trakt.scrobble.start = function(item, progress, callback) {
    api.scrobble.start(item, progress, callback);
};

exports.trakt.scrobble.pause = function(item, progress, callback) {
    api.scrobble.pause(item, progress, callback);
};

exports.trakt.scrobble.stop = function(item, progress, callback) {
    api.scrobble.stop(item, progress, callback);
};

exports.trakt.sync = {
    addToHistory: function(postdata, callback) {
        api.sync.addToHistory(postdata, callback);
    },

    addToWatchlist: function(postdata, callback) {
        api.sync.addToWatchlist(postdata, callback);
    },

    getHistory: function(type, id, callback) {
        api.sync.getHistory(type, id, callback);
    },

    getWatchlist: function(type, callback) {
        api.sync.getWatchlist(type, callback);
    },

    removeFromWatchlist: function(postdata, callback) {
        api.sync.removeFromWatchlist(postdata, callback);
    }
};

exports.imdb = {};
exports.imdb.getMovieInfo = function(id, callback) {
    http.request("http://www.omdbapi.com", {
        args: {
            i: id,
            tomatoes: true
        }
    }, function(err, result) {
        callback(JSON.parse(result));
    });
};
