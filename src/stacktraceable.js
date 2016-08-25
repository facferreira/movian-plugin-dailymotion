var StackTraceable = function() {};
StackTraceable.prototype.trace = function() {
    log.d.trace();
};

module.exports = StackTraceable;
