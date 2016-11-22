define("PlannerUtility", [],
    function () {
        var settings = {};

        function RGB2Color(r, g, b) {
            return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
        }

        function byte2Hex(n) {
            var nybHexString = "0123456789ABCDEF";
            return String(nybHexString.substr((n >> 4) & 0x0F, 1)) + nybHexString.substr(n & 0x0F, 1);
        }

        function intToRgb(c) {
            var r = (c >> 16) & 0xff;
            var g = (c >> 8) & 0xff;
            var b = c & 0xff;
            return RGB2Color(r, g, b);
        }

        function getColorDistance(c1, c2) {
            var r1 = (c1 >> 16) & 0xff;
            var g1 = (c1 >> 8) & 0xff;
            var b1 = c1 & 0xff;
            var r2 = (c2 >> 16) & 0xff;
            var g2 = (c2 >> 8) & 0xff;
            var b2 = c2 & 0xff;
            // Algorithm: http://www.compuphase.com/cmetric.htm
            var rMean = (r1 + r2) / 2;
            var rDif = r1 - r2;
            var gDif = g1 - g2;
            var bDif = b1 - b2;
            return Math.sqrt((((512 + rMean) * rDif * rDif) >> 8) + 4 * gDif * gDif + (((767 - rMean) * bDif * bDif) >> 8));
        }

        function formatDateTime(date, format, utc) {
            var MMMM = ["\x00", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            var MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            var dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            var ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            function ii(i, len) { var s = i + ""; len = len || 2; while (s.length < len) s = "0" + s; return s; }

            var y = utc ? date.getUTCFullYear() : date.getFullYear();
            format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
            format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
            format = format.replace(/(^|[^\\])y/g, "$1" + y);

            var M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
            format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
            format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
            format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
            format = format.replace(/(^|[^\\])M/g, "$1" + M);

            var d = utc ? date.getUTCDate() : date.getDate();
            format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
            format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
            format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
            format = format.replace(/(^|[^\\])d/g, "$1" + d);

            var H = utc ? date.getUTCHours() : date.getHours();
            format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
            format = format.replace(/(^|[^\\])H/g, "$1" + H);

            var h = H > 12 ? H - 12 : H == 0 ? 12 : H;
            format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
            format = format.replace(/(^|[^\\])h/g, "$1" + h);

            var m = utc ? date.getUTCMinutes() : date.getMinutes();
            format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
            format = format.replace(/(^|[^\\])m/g, "$1" + m);

            var s = utc ? date.getUTCSeconds() : date.getSeconds();
            format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
            format = format.replace(/(^|[^\\])s/g, "$1" + s);

            var f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
            format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
            f = Math.round(f / 10);
            format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
            f = Math.round(f / 10);
            format = format.replace(/(^|[^\\])f/g, "$1" + f);

            var T = H < 12 ? "AM" : "PM";
            format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
            format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));

            var t = T.toLowerCase();
            format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
            format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));

            var tz = -date.getTimezoneOffset();
            var K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
            if (!utc) {
                tz = Math.abs(tz);
                var tzHrs = Math.floor(tz / 60);
                var tzMin = tz % 60;
                K += ii(tzHrs) + ":" + ii(tzMin);
            }
            format = format.replace(/(^|[^\\])K/g, "$1" + K);

            var day = (utc ? date.getUTCDay() : date.getDay()) + 1;
            format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
            format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);

            format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
            format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);

            format = format.replace(/\\(.)/g, "$1");

            return format;
        }

        function formatDate(date) {
            return formatDateTime(date, settings.dateFormat);
        }

        function formatTime(date) {
            return formatDateTime(date, settings.timeFormat);
        }

        function formatFullDateTime(date) {
            return formatDateTime(date, settings.dateFormat + " " + settings.timeFormat);
        }

        function getMinutes(date) {
            return date.getHours() * 60 + date.getMinutes();
        }

        function observer() {

            var instance = { subscribers: [] };

            instance.bind = function (subscriber) {
                instance.subscribers.push(subscriber);
            };

            instance.notify = function () {
                for (var i = 0; i < instance.subscribers.length; i++) {
                    instance.subscribers[i]();
                }

                return instance;
            };

            return instance.notify;
        }

        function isoDate(date) {

            if (!date) {
                return "";
            }

            var offset = date.getTimezoneOffset();
            var result = new Date(date.getTime());
            result.setMinutes(date.getMinutes() - offset);
            return result.toJSON();
        }

        function getNextEventTime(eventDay) {
            
            var now = new Date();
            eventDay = eventDay || now;
            eventDay = new Date(eventDay.getFullYear(), eventDay.getMonth(), eventDay.getDate(), now.getHours(), now.getMinutes(), 0);
            var duration = 30 * 60 * 1000;
            var start = eventDay - (eventDay % duration) + duration;
            return { startDate: new Date(start), endDate: new Date(start + duration) };
        }
        function getNewEventStartEndTime(calSettingduration) {
            var now = new Date();
            var    eventDay = now;
            eventDay = new Date(eventDay.getFullYear(), eventDay.getMonth(), eventDay.getDate(), now.getHours(), now.getMinutes(), 0);
            var duration = calSettingduration * 60 * 1000;
            var start = eventDay - (eventDay % duration) + duration;
            return { startDate: new Date(start), endDate: new Date(start + duration) };
        }
        function parseServerDate(date) {
            if (typeof date != "string") {
                return date;
            }

            var milli = date.replace(/\/Date\((-?\d+)\)\//, '$1');
            var d = new Date(parseInt(milli));
            return d;
        }

        function createMultilookupData(valueField, nameField, objectType, objectId, value, settings) {

            return $.extend( settings || {}, {
                createText: "Create " + objectType,
                createUrl: "/Contacts/Object/Create/" + objectType + "?objectId=" + objectId + "&embed=True",
                dataSourceUrl: "/Contacts/Object/GetData?objectId=" + objectId,
                nameField: nameField,
                valueField: valueField,
                objectType: objectType,
                value: value
            });
        }

        function createLookupData(valueField, nameField, objectType, objectId, value, settings) {
            settings = $.extend({ maxSelectedItems: 1 }, settings);
            return createMultilookupData(valueField, nameField, objectType, objectId, value, settings);
        }

        function getEventOccurrences(startDate, endDate, recurrenceRule, recurrenceExceptions, timezone) {
            if (!timezone) {
                timezone = "Etc/UTC";
            }
            var currentEvent = new kendo.data.SchedulerEvent({
                start: new Date(startDate),
                end: new Date(endDate),
                recurrenceRule: recurrenceRule,
                recurrenceException: recurrenceExceptions
            });

            var endPeriodDate = new Date(startDate.getFullYear() + 100, startDate.getMonth(), startDate.getDate());
            return currentEvent.expand(startDate, endPeriodDate, timezone);
        }

        var plannerUtility = {
            init: function (opt) { settings = opt; },
            intToRgb: intToRgb,
            getColorDistance: getColorDistance,
            formatDateTime: formatDateTime,
            formatDate: formatDate,
            formatTime: formatTime,
            formatFullDateTime: formatFullDateTime,
            getMinutes: getMinutes,
            observer: observer,
            isoDate: isoDate,
            getNextEventTime: getNextEventTime,
            getNewEventStartEndTime: getNewEventStartEndTime,
            parseServerDate: parseServerDate,            
            isSmsReminderSupported: function () { return settings.isSmsReminderSupported; },
            getEventOccurrences: getEventOccurrences
        };

        return plannerUtility;
    }
);

