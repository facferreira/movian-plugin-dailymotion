/*
Dailymotion plugin for Movian Media Center Copyright (C) 2016 Fábio Ferreira

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

This program is also available under a commercial proprietary license.
*/

/// <reference path="libs/movian.d.ts" />

import service = require('movian/service');
import settings = require('movian/settings');
import page = require('movian/page');

import general = require('./support/general');
import { log, LogType } from './support/log';
import plugin = require('./support/plugin');
import playback = require('./support/playback');
import view = require('./support/view');

var PLUGIN_NAME = "Dailymotion";
var PLUGIN_DESCRIPTOR = plugin.getDescriptor();

var s = service.create(PLUGIN_NAME, general.PREFIX + ":start", PLUGIN_DESCRIPTOR.category, true, plugin.getIconPath());

settings.globalSettings(general.PREFIX, PLUGIN_NAME, plugin.getIconPath(), PLUGIN_DESCRIPTOR.synopsis);

settings.createDivider("Video Playback");

settings.createMultiOpt('maxQuality', "Maximum quality", general.availableQualities, function (quality) {
    general.pluginConfig.maxQuality = quality;
}, true);

new page.Route(general.PREFIX + ":start", function (page) {
    view.home(page);
});

new page.Route(general.PREFIX + ":channels", function (page) {
    view.channels(page);
});

new page.Route(general.PREFIX + ":channel:(.*)", function (page, channel) {
    view.channel(page, channel);
});

new page.Route(general.PREFIX + ":channel:(.*):topusers", function (page, channel) {
    view.channelTopUsers(page, channel);
});

new page.Route(general.PREFIX + ":channel:(.*):videos", function (page, channel) {
    view.channelVideos(page, channel);
});

new page.Route(general.PREFIX + ":video:(.*):(.*)", function (page, type, id) {
    view.video(page, type, id);
});

new page.Route(general.PREFIX + ":search:(.*)", function (page, query) {
    view.search(page, query);
});

new page.Route(general.PREFIX + ":search:users:(.*)", function (page, query) {
    view.searchUsers(page, decodeURIComponent(query));
});

new page.Route(general.PREFIX + ":search:videos:(.*)", function (page, query) {
    view.searchVideos(page, decodeURIComponent(query));
});

new page.Route(general.PREFIX + ":user:(.*):(.*)", function (page, user, screenname) {
    view.user(page, user, screenname);
});

new page.Route(general.PREFIX + ":user:(.*):(.*):videos", function (page, user, screenname) {
    view.userVideos(page, user, screenname);
});

new page.Searcher("Dailymotion - Search Users", plugin.getIconPath(), function (page, query) {
    view.searchUsers(page, query);
});

new page.Searcher("Dailymotion - Search Videos", plugin.getIconPath(), function (page, query) {
    view.searchVideos(page, query);
});
