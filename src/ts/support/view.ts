import page = require('movian/page');

import general = require('./general');
import { log } from './log';
import model = require('./model');
import plugin = require('./plugin');

interface Config {
    beforeItem?: Item;
    moreItemsUri?: string;
    noPaginator?: boolean;
    numberItems?: number;
    sorts?: MultiOptOption[];
}

function addChannelItemToPage(page: Page, item): Item {
    return page.appendItem(general.PREFIX + ":channel:" + item.id + ":videos", 'directory', {
        title: item.name
    });
}

function addVideoItemToPage(page: Page, item): Item {
    var metadata = {
        title: item.title,
        description: item.description.replace(/<br ?\/?>/g, "\n").trim(),
        duration: item.duration,
        icon: item.thumbnail_480_url,
        views: item.views_total

    }

    switch (item.mode) {
        case "vod":
            return page.appendItem(general.PREFIX + ":video:vod:" + item.id, 'video', metadata);

        case "live":
            return page.appendItem(general.PREFIX + ":video:live:" + item.id, 'video', metadata);

        default:
            throw new Error("Unsupported video mode: " + item.mode);
    }
}

function addUserItemToPage(page: Page, item): Item {
    return page.appendItem(general.PREFIX + ":user:" + item.id, 'directory', {
        title: item.screenname,
        icon: item.avatar_360_url
    });
}

function addItemToPage(page: Page, item): Item {
    switch (item.item_type) {
        case "channel":
            return addChannelItemToPage(page, item);

        case "video":
            return addVideoItemToPage(page, item);

        case "user":
            return addUserItemToPage(page, item);

        default:
            throw new Error("Unsupported item type: " + item.item_type);
    }
}

function resetList(page: Page, model, filters, config) {
    page.flush();
    page.haveMore(false);
    page.asyncPaginator = null;
    createAndExecuteLoader(page, model, filters, config);
}

function initializePageMenu(page: Page, model: Function, filters, config: Config) {
    if (page.options) {
        if (config.sorts) {
            page.options.createMultiOpt("sort", "Sort by", config.sorts, function (sort) {
                var original = filters.sort;
                filters.sort = sort;

                // if we had a value for this filter then this is not the inital initialization
                if (original)
                    resetList(page, model, filters, config);
            }, true);
        }
    }
}

function createAndExecuteLoader(page: Page, model: Function, filters, config: Config) {
    var modelCallback: model.ModelCallback = {
        onSuccess: function (result) {
            page.loading = false;

            for (var i in result.json.list) {
                if (config.numberItems && page.entries >= config.numberItems)
                    break;

                var item = result.json.list[i];

                var pageItem = addItemToPage(page, item);
                if (config.beforeItem) pageItem.moveBefore(config.beforeItem);

                page.entries++;
            }

            if (page.entries === 0) {
                page.appendPassiveItem("default", null, {
                    "title": "There are no resources available"
                });
                page.haveMore(false);
                return;
            }

            if (config.noPaginator) {
                if (config.moreItemsUri && result.pagination.hasNext) {
                    var pageItem = page.appendItem(config.moreItemsUri, "directory", {
                        "title": "See more"
                    });

                    if (config.beforeItem) pageItem.moveBefore(config.beforeItem);
                }
                page.haveMore(false);
            }
            else {
                if (result.pagination.hasNext) {
                    // more pages!
                    page.asyncPaginator = result.pagination.next.bind(null, config, modelCallback);
                    page.haveMore(true);
                }
            }
        },

        onError: function (err) {
            log.print("Cancelling pagination due to error:");
            page.error(err.message);
            page.haveMore(false);
        }
    };

    var loader = model.bind(null, filters, config, modelCallback);
    if (!config.noPaginator) page.asyncPaginator = loader;
    loader();
}

function templateList(page: Page, model: Function, filters, config: Config) {
    if (model === null) throw 'Model has not been specified';
    config = config || {};

    page.type = 'directory';
    page.entries = 0;
    page.loading = true;

    filters = filters || {};

    if (config.numberItems)
        filters['limit'] = config.numberItems;

    initializePageMenu(page, model, filters, config);

    createAndExecuteLoader(page, model, filters, config);
}

export function home(page: Page) {
    page.metadata.title = "Dailymotion";
    page.metadata.icon = plugin.getIconPath();

    // search
    page.appendItem(general.PREFIX + ":search:", 'search', {
        title: "Search: "
    });

    // channels
    templateList(page, model.getChannels, {}, {});
}

export function channels(page: Page) {
    page.metadata.title = "Channels";
    page.metadata.icon = plugin.getIconPath();

    templateList(page, model.getChannels, {}, {});
}

export function channel(page: Page, channel: string) {
    page.metadata.title = "Channel " + channel;
    page.metadata.icon = plugin.getIconPath();

    // separators
    var separatorVideos = page.appendPassiveItem('separator', null, {
        title: "Videos"
    });

    templateList(page, model.getChannelVideos.bind(null, channel), {}, {});
}

export function channelTopUsers(page: Page, channel: string) {
    page.metadata.title = "Channel " + channel + " - Top Users";
    page.metadata.icon = plugin.getIconPath();

    templateList(page, model.getChannelTopUsers.bind(null, channel), {}, {});
}

export function channelVideos(page: Page, channel: string) {
    page.metadata.title = "Channel " + channel + " - Videos";
    page.metadata.icon = plugin.getIconPath();

    templateList(page, model.getChannelVideos.bind(null, channel), {}, {
        sorts: model.getAvailableVideoSorts(false)
    });
}

export function video(page: Page, type: string, id: string) {
    page.type = "video";
    page.loading = true;

    page.source = "videoparams:" + JSON.stringify(model.getVideoPlaybackData(type, id));
}

export function search(page: Page, query: string) {
    page.metadata.title = "Dailymotion - " + query;
    page.metadata.icon = plugin.getIconPath();

    var filters = {
        search: query
    };
    templateList(page, model.searchVideos, filters, {
        sorts: model.getAvailableVideoSorts(true)
    });
}