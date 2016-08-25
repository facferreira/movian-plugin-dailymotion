exports.init = function() {
    if (Core.currentVersionInt < 50000241) return;

    var videoscrobbler = require('movian/videoscrobbler');

    var vs = new videoscrobbler.VideoScrobbler();

    vs.onstart = function(data, prop) {
        if (!auth.isAuthenticated()) return;

        log.d("Started playback session: " + data.id);

        var callback = function(item) {
            playbackSession = {
                id: data.id,
                item: item
            };

            var progress = prop.currenttime / data.duration * 100.0;

            model.trakt.scrobble.start(playbackSession.item, progress, function(data, pagination, error) {
                if (data) {
                    if (service.scrobbleNotifications)
                        popup.notify("Started scrobbling to Trakt", 3);
                } else {
                    log.d("Failed to start scrobbling");
                    if (service.scrobbleNotifications)
                        popup.notify("Failed to start scrobbling", 3);
                }
            });
        };

        if (playbackSession && playbackSession.url === data.canonical_url) {
            log.d("Scrobble configured by user");
            callback(playbackSession.item);
        } else if (!service.scrobble) return;
        else {
            lookup.getItem(data, false, callback);
        }
    };

    vs.onstop = function(data, prop) {
        if (!auth.isAuthenticated()) return;
        if (!playbackSession || playbackSession.id !== data.id) return;

        log.d("Stopped playback session: " + data.id);

        var progress = prop.currenttime / data.duration * 100.0;
        log.d("Progress: " + progress);

        if (playbackSession.id === data.id) {
            model.trakt.scrobble.stop(playbackSession.item, progress, function(data, pagination, error) {
                if (data) {
                    log.d("Stopped scrobbling to Trakt");
                } else {
                    if (error.statuscode === 409)
                        log.d("Media was already scrobbled");
                    else log.d("Failed to stop scrobbling");
                }
            });
        }
    };

    vs.onpause = function(data, prop) {
        if (!auth.isAuthenticated()) return;
        if (!playbackSession || playbackSession.id !== data.id) return;

        log.d("Paused playback session: " + data.id + " at position " + prop.currenttime + " (seconds)");

        var progress = prop.currenttime / data.duration * 100.0;

        if (playbackSession.id === data.id) {
            model.trakt.scrobble.pause(playbackSession.item, progress, function(data, pagination, error) {
                if (data) {
                    log.d("Paused scrobbling to Trakt");
                } else {
                    log.d("Failed to pause scrobbling");
                }
            });
        }
    };

    vs.onresume = function(data, prop) {
        if (!auth.isAuthenticated()) return;
        if (!playbackSession || playbackSession.id !== data.id) return;

        log.d("Resumed playback session: " + data.id);

        var progress = prop.currenttime / data.duration * 100.0;
        log.d("Progress: " + progress);

        if (playbackSession.id === data.id) {
            model.trakt.scrobble.start(playbackSession.item, progress, function(data, pagination, error) {
                if (data) {
                    log.d("Resumed scrobbling to Trakt");
                } else {
                    log.d("Failed to resume scrobbling");
                }
            });
        }
    };
};
