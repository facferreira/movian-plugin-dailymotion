var tnp = require('../libs/torrent-name-parser/index');

exports.init = function() {
    itemhook.create({
        title: "Open in Trakt",
        icon: plugin.getLogoPath(),
        itemtype: 'video',
        handler: function(obj, nav) {
            var config = {
                title: obj.metadata.title.toString(),
                year: obj.metadata.year.toString(),
                play: {
                    url: obj.url.toString()
                }
            };

            if (obj.url && obj.url.toString().match(/^videoparams:/)) {
                var videoparams = JSON.parse(obj.url.toString().replace("videoparams:", ""));
                config.imdbid = videoparams.imdbid;
                config.season = videoparams.season;
                config.episode = videoparams.episode;
            }

            nav.openURL(PREFIX + ":open:list:" + escape(JSON.stringify(config)));
        }
    });


    if (Core.currentVersionInt >= 50000241) {
        itemhook.create({
            title: "Scrobble",
            icon: plugin.getLogoPath(),
            itemtype: 'video',
            handler: function(obj, nav) {
                if (!auth.isAuthenticated()) {
                    popup.notify("Feature only available for authenticated users", 3);
                    return;
                }

                var config = {
                    title: obj.metadata.title.toString(),
                    year: obj.metadata.year.toString(),
                    play: {
                        url: obj.url.toString()
                    }
                };

                if (obj.url && obj.url.toString().match(/^videoparams:/)) {
                    var videoparams = JSON.parse(obj.url.toString().replace("videoparams:", ""));
                    config.imdbid = videoparams.imdbid;
                    config.season = videoparams.season;
                    config.episode = videoparams.episode;
                }

                nav.openURL(PREFIX + ":scrobble:list:" + escape(JSON.stringify(config)));
            }
        });
    }
};
