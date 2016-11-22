(function ($) {
    $.fn.dateTimeAutocomplete = function (options) {
        if (options == null) {
            options = { timeFormat: "hh" };
        }
        var patterns12H = ["^[1-9][a|am|p|pm]",
                           "^[1][0-2][a|am|p|pm]",
                           "^[1-9][0-5][0-9][a|am|p|pm]",
                           "^[0-1][0-9][0-5][0-9][a|am|p|pm]"];

        var patterns24H = ["^[01][0-9][0-5][0-9]|2[0-3][0-5][0-9]",
                           "^[01][0-9][0-5]|2[0-3][0-5]",
                           "^[01][0-9]|2[0-3]"];

        $(this).keydown(onKeyDownHandler);

        function onKeyDownHandler(e) {
            if (e.keyCode == 9) {
                var inputVal = $(this).val().split(" ");
                if (inputVal == null || inputVal.length <= 1) return;

                var time = options.timeFormat.indexOf("h") == 0 || options.timeFormat.indexOf("hh") == 0 ? get12HTime(inputVal[1].toLowerCase()) : get24HTime(inputVal[1].toLowerCase());
                if (time == null) return;

                $(this).val(inputVal[0] + " " + time);
            }
        }

        function get12HTime(inputVal) {
            var result;

            var timeSnippet = getTimeSnippet(patterns12H, inputVal);
            if (timeSnippet == null) return null;

            var time = timeSnippet.match("[0-9]+")[0];
            if (time > 1259 || time.indexOf("00") == 0) return null;

            switch (time.length) {
                case 1:
                    result = "0" + time;
                    break;
                case 2:
                    result = time;
                    time = "00";
                    break;
                case 3:
                    result = "0" + time.substr(0, 1);
                    break;
                case 4:
                    result = time.substr(0, 2);
                    break;
                default:
                    return null;
            }
            result += ":" + (time.length == 1 ? "00" : time.substr(time.length - 2, 2));

            var period = timeSnippet.match("[a-z]+")[0];
            result += " " + (period.indexOf("a") > -1 ? "AM" : "PM");
            return result;
        }

        function get24HTime(inputVal) {
            var result;

            if (inputVal.indexOf(":") > 0) {
                return inputVal;
            }

            var timeSnippet = getTimeSnippet(patterns24H, inputVal);
            if (timeSnippet == null) return null;

            switch (timeSnippet.length) {
                case 2:
                    result = timeSnippet + ":00";
                    break;
                case 3:
                    result = timeSnippet.substr(0, 2) + ":" + timeSnippet.substr(2, 1) + "0";
                    break;
                case 4:
                    result = timeSnippet.substr(0, 2) + ":" + timeSnippet.substr(2, 2);
                    break;
                default:
                    return null;
            }
            return result;
        }

        function getTimeSnippet(patterns, value) {
            var matches;
            for (var i = 0; i < patterns.length; i++) {
                matches = value.match(patterns[i]);
                if (matches != null) {
                    return matches[0];
                }
            }
            return null;
        }
        return this;
    };
}(jQuery));