

var LazyLoader = function (type) {
    this.type = type;
};

$.extend(LazyLoader.prototype, {
    get: function () {
        var fileNames = Array.prototype.slice.call(arguments);
        var dfd = $.Deferred();
        var path = this.type + "/";

        fileNames = $.map(fileNames, function (fileName) {
            return path + fileName;
        });

        require(fileNames, function (result) {
            dfd.resolve.apply(dfd, arguments);
        });

        return dfd.promise();
    }
});

var App = App || {};
App.Views = new LazyLoader('views');