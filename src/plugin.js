exports.getDescriptor = function() {
    return JSON.parse(Plugin.manifest);
};

exports.getLogoPath = function() {
    return Plugin.path + plugin.getDescriptor().icon;
};
