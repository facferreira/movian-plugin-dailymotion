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

var PLUGIN_NAME = "Dailymotion";
var PREFIX = "dailymotion";
var PLUGIN_DESCRIPTOR = plugin.getDescriptor();

var s = service.create(PLUGIN_NAME, PREFIX + ":start", PLUGIN_DESCRIPTOR.category, true, plugin.getIconPath());

settings.globalSettings(PREFIX, PLUGIN_NAME, plugin.getIconPath(), PLUGIN_DESCRIPTOR.synopsis);

settings.createDivider("Video Playback");

settings.createMultiOpt('maxQuality', "Maximum quality", general.availableQualities, function (quality) {
    general.pluginConfig.maxQuality = quality;
}, true);

new page.Route(PREFIX + ":start", function (page) {
    page.type = "directory";
});

new page.Route(PREFIX + ":video:(.*)", function (page, id) {
    page.type = "video";
    page.loading = true;
    var html = playback.getVideoEmbedPage(id);

    var videoparams = {
        sources: playback.getVideoSources(html)
    }
    log.print(videoparams);

    page.source = "videoparams:" + JSON.stringify(videoparams);
});