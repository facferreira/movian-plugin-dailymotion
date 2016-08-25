export var availableQualities: MultiOptOption[] = [
    ['2160', '4K'],
    ['1440', '2K'],
    ['1080', '1080p', true],
    ['720', '720p'],
    ['480', '480p'],
    ['360', '360p'],
    ['240', '240p'],
    ['144', '144p']
];

interface PluginConfig {
    maxQuality?: string
};
export var pluginConfig: PluginConfig = {};