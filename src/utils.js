var imageDimensions = {
    banner: {
        full: {
            // 1000x185 (movie/show), 758x140 (show)
            width: 1000,
            height: 185
        }
    },

    fanart: {
        full: {
            width: 1920,
            height: 1080
        },
        medium: {
            width: 1280,
            height: 720
        },

        thumb: {
            width: 853,
            height: 480
        }
    },

    logo: {
        full: {
            width: 800,
            height: 310
        }
    },

    poster: {
        full: {
            width: 1000,
            height: 1500
        },
        medium: {
            width: 600,
            height: 900
        },

        thumb: {
            width: 300,
            height: 450
        }
    },

    screenshot: {
        full: {
            // 1920x1080, 1280x720, 400x225 (typical)
            width: 1920,
            height: 1080
        },
        medium: {
            width: 1280,
            height: 720
        },

        thumb: {
            width: 853,
            height: 480
        }
    },

    thumb: {
        full: {
            // 1000x562 (movie), 500x281 (show)
            width: 1000,
            height: 562
        }
    }
};

/*******************************************************************************
 * Exported Functions
 ******************************************************************************/

exports.formatNumber = function(num, numDigits) {
    var output = num + '';
    while (output.length < numDigits) {
        output = '0' + output;
    }
    return output;
};

exports.sortByField = function(arr, field, asc) {
    function compare(a, b) {
        if (a[field] !== b[field])
            return (a[field] < b[field] ? -1 : 1) * (asc ? 1 : -1);
        return 0;
    }

    arr.sort(compare);
};

exports.getChild = function(arr, field, value) {
    for (var i in arr) {
        var item = arr[i];
        if (item[field] === value)
            return item;
    }

    return null;
};

exports.prettyStatus = function(status) {
    return status.capitalize(status);
};

exports.toImageSet = function(items, type, useDefault) {
    if (useDefault === null || useDefault === undefined) useDefault = true;

    var images = [];
    for (var size in items) {
        var dimensions = imageDimensions[type][size];
        var image = dimensions;
        if (items[size]) {
            image.url = items[size];
            images.push(image);
        }
    }

    if (images.length === 0) {
        if (useDefault) {
            images = [{
                width: imageDimensions[type].full.width,
                height: imageDimensions[type].full.height,
                url: Plugin.path + "views/img/" + type + "_default.png"
            }];
        } else return null;
    }
    return "imageset:" + JSON.stringify(images);
};

String.prototype.capitalize = function(lower) {
    return (lower ? this.toLowerCase() : this).replace(/(?:^|\s)\S/g, function(a) {
        return a.toUpperCase();
    });
};
