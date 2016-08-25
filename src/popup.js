exports.notify = function(msg, duration) {
    if (Core.currentVersionInt >= 50000210)
        require('showtime/popup').notify(msg, duration);
    else
        require('native/popup').notify(msg, duration);
};
