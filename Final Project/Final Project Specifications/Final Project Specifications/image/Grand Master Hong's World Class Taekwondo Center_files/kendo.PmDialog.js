(function ($) {

    var template = '<div class="pm-kendo-dialog pm-dialog-buttonpane"></div>';
    var loadingContainerTemplate = '<div class="loading-container" style="display: none"><i class="small spinner"></i></div>';
    var modals = 0;
    var methods = {
        init: function (options) {
            var self = this;
            var settings, overlay, dialog, dialogInner, buttonpane, i, button, buttonOnClick;
            var existingOpenFunction;
            settings = $.extend({
                modal: true,
                resizable: false,
                draggable: true,
                destroyOnClose: true,
                autoOpen: true,
                addLoadingContainer: false
            }, options);

            var open = false;
            existingOpenFunction = settings.open;
            settings.open = function () {
                if (settings.modal && !open) {
                    modals++;
                    $("body").addClass('overflowHidden');
                }

                open = true;

                if (typeof existingOpenFunction == 'function') {
                    existingOpenFunction.apply(this, arguments);
                }
            };
            
            settings.close = function() {

                if (open && settings.modal && ! --modals) {
                    $("body").removeClass('overflowHidden');
                }

                open = false;

                options.dialogclose ? options.dialogclose() : options.close ? options.close() : null;

                if (settings.destroyOnClose) {
                    methods.destroy.apply(this, [self]);
                }
            };

            self.kendoWindow(settings);

            dialog = self.parent();
            self.data("pmDialog", {
                settings: settings,
                dialog: dialog
            });

            if (settings.buttons) {

                dialog.append(template);

                buttonpane = $(".pm-dialog-buttonpane", dialog);
                buttonOnClick = function (btn) {
                    return function (event) {
                        var buttonEvent = $.Event({
                            type: btn.eventName || event.type,
                            originalEvent: event
                        });

                        if (typeof btn.clickHandler == "function") {
                            btn.clickHandler.call(btn, buttonEvent);
                        }

                        if (btn.eventName) {
                            self.trigger(buttonEvent);
                        }
                        if (!buttonEvent.isDefaultPrevented() && !btn.isDefaultPrevented) {
                            methods.close.apply(self);
                        };
                    };
                };
                for (i = 0; i < settings.buttons.length; i++) {
                    button = options.buttons[i];

                    if (button.label == 'Cancel') {
                        button.style = 'pm-cancel-button';
                    } else if (button.label == 'Save As') {
                        button.style = 'pm-save-button';
                    }
                    
                    var iconHtml = button.icon ? "<i class='" + (button.icon || "") + "'></i>" : "";

                    $("<a title='" + button.label + "' class='" +
                           (button.style || "pm-confirm-button") + "' href='javascript: void(0)'>" + iconHtml + "<span>" + button.label + "</span></a>")
                           .appendTo(buttonpane)
                           .click(buttonOnClick(button));
                }
            }

            if (settings.addLoadingContainer) {
                dialog.append(loadingContainerTemplate);
            }
            
            if (settings.autoOpen) {
                methods.open.apply(self);
            }

            
            var documentWidth = $(document).width();
            if ($(document).width() > $("body").width()) {
                dialog.css("left", parseInt((documentWidth - dialog.outerWidth()) / 2));
            }

            return self;
        },

        destroy: function (self) {
            var data = self.data("pmDialog");
            $('.k-overlay').remove();

            if (data != null) {
                data.dialog.remove();
            }
        },

        open: function () {
            this.data("kendoWindow").center().open();
        },

        close: function () {
            if (this.data("kendoWindow")) {
                this.data("kendoWindow").close();
            }
        },

        alert: function (message, width) {

            var modal = $('<div style="padding: 1em">' + message + "</div>").pmKendoDialog({
                width: width,
                destroyOnClose: true,
                modal: true,
                buttons: [{ label: "Ok", clickHandler: function () { modal.close(); } }]
            })
                .data("kendoWindow")
                .open()
                .center();

            return modal;
        },

        confirm: function (message, width) {

        }
    };

    $.fn.pmKendoDialog = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.pmKendoDialog');
        }
    };

    $.extend({
        pmKendoDialog: $.fn.pmKendoDialog
    });

})(jQuery);
