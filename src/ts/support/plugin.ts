function getRootPath() {
    return Plugin.path + "../../";
}

export function getDescriptor() {
    return JSON.parse(Plugin.manifest);
}

export function getIconPath() {
    return getRootPath() + "icon.png";
}
