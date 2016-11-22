var AlertManager = function () {

    var notification = null;
    var notificationStack = [];
    var shownNotificationRecords = [];
    var allNotifications = [];
    var maxAlertsToShow = 6;
    var getAlertsUrl = '';

    var alertTemplate = '<script id="alertTemplate" type="text/x-kendo-template"> \
            <div class="alert" style="background-color: #: data.rgbaColor #" data-recordId="#: data.recordId #" data-id="#: Id #"> \
                #if (data.IconUrl) {# <image class="icon" src="#: data.IconUrl #" /> #}# \
                <div class="message">#= Message #</div> \
            </div> \
        </script>';

    function hexToRgb(hex) {
        var result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    $(document).ready(function () {
        init();
        if (App.Common && App.Common.Alert) {
            $(App.Common.Alert.subscribeObjects).each(function(index, objectId) {
                $(document).on("multilookupCreated" + objectId, function(element, selectedId, lookup) {
                var records = selectedId ? [].concat(selectedId) : [];

                    $(records).each(function(index, recordId) {
                    AlertManager.showRecordAlert(recordId, objectId);
                });
            });
        });
        subscribeToLookupAlerts(App.Common.Alert.subscribeObjects);
        }
    });

    function init() {

        var notificationElement = $("<span>", { id: "alert-notification" });

        $("body").append(notificationElement);
        $("body").append(alertTemplate);

        notification = notificationElement.kendoNotification({
            autoHideAfter: 0,
            stacking: (this.options || {}).centered ? "down" : "up",
            templates: [{
                type: "alert",
                template: $("#alertTemplate").html()
            }],

            show: function (e) {
                if (this.options.centered) {
                    if (e.sender.getNotifications().length == 1) {
                        var wWidth = $(window).width();
                        var eWidth = $(e.element).width();
                        var eHeight = $(e.element).height();
                        var wHeight = $(window).height();

                        e.element.parent().css({
                            left: Math.floor(wWidth / 2 - eWidth / 2),
                            top: Math.floor(wHeight / 3 - eHeight / 3)
                        });
                    };
                };
                e.element.parent().css({ zIndex: 20000 }); //need to overlap kendo popups having z-index >10000
            },

            hide: function(e) {
                var recordId = $(e.element).data('recordId');
                shownNotificationRecords = $.grep(shownNotificationRecords, function(rec) {
                    return rec != recordId;
                });
                var id = $('.alert', e.element).data('id');
                allNotifications = Enumerable.From(allNotifications).Where('$.Id != "' + id + '"').ToArray();

                //need to redraw all alerts to keep correct stacking order
                Enumerable.From(allNotifications).ForEach(function(item) {
                    item.opened = false;
                });
                var elements = notification.getNotifications();
                elements.each(function () {
                    $(this).parent().remove();
                });
                showNextNotifications();
            }

        }).data("kendoNotification");

        $.each(notificationStack, function (index, alert) {
            showRecordAlert(alert.recordId, alert.objectId);
        });
    }

    function showRecordAlert(recordId, objectId) {

        if (recordId == null || objectId == null) {
            return;
        }        

        if (!notification) {
            return notificationStack.push({ recordId: recordId, objectId: objectId });
        }

        $.ajax({
            type: "get",
            url: getAlertsUrl || App.Common.Urls.getAlerts,
            data: { recordId: recordId, objectId: objectId },
            dataType: 'json',
            async: false,
            success: function (result) {
                if (!result.error) {
                    allNotifications = Enumerable.From(allNotifications)
                        .Concat(Enumerable.From(result.alerts)).Distinct("$.Id").ToArray();
                        showNextNotifications();
                    }
                }
        });
    }

    function showNextNotifications() {
        var openedNotificationsCount = Enumerable.From(allNotifications).Where('$.opened').Count();
        var notificationsToShow = Enumerable.From(allNotifications)
            .Where('!$.closed && !$.opened')
            .Take(maxAlertsToShow - openedNotificationsCount).ToArray();
        Enumerable.From(allNotifications).Where('!$.closed && !$.opened').ForEach(function (item) {
            item.opened = true;
        });

        var time = 0;
        $.each(notificationsToShow, function (index, alert) {
            setTimeout(function() {
                var rgbColor = hexToRgb(alert.Color) || { r: 255, g: 0, b: 0 };
                alert.rgbaColor = "rgba(" + [rgbColor.r, rgbColor.g, rgbColor.b, 0.4].toString() + ")";
                alert.opened = true;
                notification.show(alert, "alert");
            }, time);
            time += 200;
        });
    }

    function subscribeToLookupAlerts(objects) {
        var value = null;

        $('body').on('lookup-value-change', function (event, lookup) {
            if (!lookup.value.length || objects.indexOf(lookup.objectId) < 0) {
                return notification.hide();
            }

            var recordId = lookup.value[lookup.value.length - 1];
            if (shownNotificationRecords.indexOf(value) == -1) {
                notification.hide();
                init();
                showRecordAlert(recordId, lookup.objectId);
                shownNotificationRecords.push(recordId);
            }
        });
    }

    function clearAlerts() {
        allNotifications = [];
        shownNotificationRecords = [];
        if (notification) {
            notification.hide();
        }
    }

    function setNotificationPositionCentered() {
        notification.options.centered = true;
        return this;
    }

    function setGetAlertsUrl(url) {           
        getAlertsUrl = url;        
    }

    return {
        showRecordAlert: showRecordAlert,
        clearAlerts: clearAlerts,
        center: setNotificationPositionCentered,
        setUrl: setGetAlertsUrl
    };

}();
