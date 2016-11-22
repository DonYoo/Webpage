
/*******************************************************************************/
/*******************************************************************************/
/******** The jQuery dialog is depricated in favour of the kendoWindow. ********/
/*** Some of the functions in this class are lazily pointed at kendoWindow.  ***/
/*******************************************************************************/
/*******************************************************************************/

(function ($) {

    var template;

    template = '<div class="pm-dialog">';
    template += '	<div class="pm-dialog-close"><div class="colors-main-content"><span>&times;</span></div></div>';
    template += '	<div class="pm-dialog-inner colors-main-content" style="margin: 12px 15px 0px 15px;">';
    template += '		<div class="pm-dialog-overflow"><div class="pm-dialog-content"></div></div>';
    template += '		<div class="pm-dialog-footer">';
    template += '			<div>';
    template += '				<div class="pm-dialog-footer-background"></div>';
    template += '				<div class="pm-jquery-dialog pm-dialog-buttonpane"></div>';
    template += '			</div>';
    template += '		</div>';
    template += '	</div>';
    template += '</div>';

    function updateDialogPosition(dialog, xPos, yPos) {
        var dialogPos, verticalShift, horizontalShift;

        horizontalShift = Math.round(dialog.width() / 2);
        verticalShift = Math.round(dialog.height() / 2) - $(window).scrollTop();

        dialogPos = dialog.position();
        if (dialog.height() > $(window).height()) {
            dialog
                .css("top", "10px")
                .css("margin-top", 0);
        }
        else {
            if (yPos) {
                dialog
                //.css("top", "50%")
                    .css("top", yPos)
                    .css("margin-top", -verticalShift);
            } else {
                dialog
                .css("top", "50%")
                    .css("margin-top", -verticalShift);
                if ($(window).prop("0") != $(window.parent).prop("0")) {
                    if ($(window.parent).scrollTop() > 0)
                        dialog.css("top", "50%").css("margin-top", -verticalShift);
                    else
                        dialog.css("top", "20px").css("margin-top", 0);
                }
            }
        }

        if (dialog.width() > $(window).width()) {
            dialog.css("left", 0);
        } else {
            if (xPos) {
                dialog.css("left", xPos);
            }
            dialog.css("margin-left", -horizontalShift);
        }
    }

    var methods = {
        init: function (options) {            
            var self, body, settings, dialog, overlay, dialogInner, buttonpane, i, button, buttonOnClick;

            self = this;

            settings = $.extend({
                autoOpen: false,
                modal: false,
                destroyOnClose: false
            }, options);

            overlay = $('<div class="pm-dialog-overlay"></div>').hide();
            dialog = $(template).hide();

            self.data("pmDialog", {
                settings: settings,
                dialog: dialog,
                overlay: overlay
            });

            $(".pm-dialog-close", dialog).click(function () {
                methods.close.apply(self);
            }).css("display", settings.isHiddenCloseButton ? "none" : "block");

            if (settings.buttons) {
                buttonpane = $(".pm-dialog-buttonpane", dialog);
                buttonOnClick = function (btn) {
                    return function (event) {
                        var buttonEvent = $.Event({
                            type: btn.eventName,
                            originalEvent: event
                        });
                        if (btn.eventName) {
                            self.trigger(buttonEvent);
                            if (!buttonEvent.isDefaultPrevented()) {
                                methods.close.apply(self);
                            };
                        }
                        else {
                            methods.close.apply(self);
                        }
                    };
                };
                for (i = 0; i < settings.buttons.length; i++) {
                    button = options.buttons[i];

                    if (button.label == 'Cancel') {
                        $("<a title='" + button.label + "' class='pm-cancel-button' href='javascript: void(0)'> <span>" + button.label + "</span></a>")
                            .appendTo(buttonpane)
                            .click(buttonOnClick(button));
                    } else if (button.label == 'Save As') {
                        $("<a title='" + button.label + "' class='pm-save-button' href='javascript: void(0)'> <span>" + button.label + "</span></a>")
                            .appendTo(buttonpane)
                            .click(buttonOnClick(button));
                    } else {
                        $("<a title='" + button.label + "' class='pm-confirm-button' href='javascript: void(0)'>" + "<i class='" + (button.icon || "") + "'></i>" + "<span>" + button.label + "</span></a>")
                            .appendTo(buttonpane)
                            .click(buttonOnClick(button));
                    }
                }
            }
            else {
                $(".pm-dialog-footer", dialog).remove();
            }

            dialogInner = $(".pm-dialog-inner", dialog);
            if (settings.width) {
                dialogInner.css("width", settings.width);
            }
            if (settings.height) {
                dialogInner.css("height", settings.height);
            }

            $(".pm-dialog-content", dialog).html(self);
            body = $("body");
            if (settings.modal) {
                overlay.height($(document).height());
                body.append(overlay);
            }
            //alert("body.append(dialog);");
            body.append(dialog);

            if (settings.autoOpen) {
                methods.open.apply(self);
            }

            return self;
        },

        destroy: function () {
            var data = this.data("pmDialog");
            if (data != null) {
                data.overlay.remove();
                data.dialog.remove();
            }
        },

        open: function () {
            var data, dialog, dialogPos, verticalShift, horizontalShift;
            data = this.data("pmDialog");

            methods.updateHeaderOverlay.apply(this, [data]);

            if (data.overlay.width() < $("#content-wrapper").width()) data.overlay.width($("#content-wrapper").width());
            data.overlay.show();
            dialog = data.dialog;

            var kendeoOVerlay = $(".k-overlay:visible");
            if (kendeoOVerlay.length) {
                dialog.css("z-index", parseInt(kendeoOVerlay.css("z-index")) + 1);
            }

            if (data.settings.showSilent) {
                data.overlay.addClass("silent");
                dialog.addClass("silent");
            }

            var xPos = null;
            if (data.settings.parentArea) {

                var parentArea = $("#" + data.settings.parentArea);
                var parentWidth = parentArea.width();
                var parentOffset = parentArea.offset();
                if (parentWidth && parentOffset && parentOffset.left) {
                    xPos = parentOffset.left + parentWidth / 2;
                }
            }

            dialog.css("visibility", "hidden").show();
            var yPos = this.data("yPos");
            updateDialogPosition(dialog, xPos, yPos);
            dialog.css("visibility", "");

            this.trigger('dialogopen', null);


            $(window).on("resize scroll", updateDialogPosition(dialog, xPos));
        },

        close: function () {
            var data = this.data("pmDialog");
            if (data != null) {
                data.overlay.hide();
                data.dialog.hide();
            }
            this.trigger('dialogclose', null);
            if (data != null && data.settings.destroyOnClose) {
                methods.destroy.apply(this);
            }
            $(window).unbind('resize scroll', updateDialogPosition);
        },

        alert: function (message, width) {
            return $.pmKendoDialog("alert", message, width);
        },

        confirm: function (message, width) {
            var dialog = $('<div style="padding: 1em">' + message + "</div>");
            dialog.pmDialog({
                autoOpen: true,
                modal: true,
                destroyOnClose: true,
                width: width,
                buttons: [
    				{ label: "OK", eventName: "ok" },
    				{ label: "Cancel" }
                ]
            });
            return dialog;
        },

        updateHeaderOverlay: function (data) {
            function getHeaderTopPosition() {
                var headerTop = 0;
                if (data.settings.isHeaderEneabled) {
                    var headerHeight = $("#header-wrapper:visible").height();
                    headerTop = (headerHeight - $(document).scrollTop());
                }

                return headerTop > 0 ? headerTop : 0;
            }

            function updateHeaderTopOvelay() {
                var headerTop = getHeaderTopPosition();
                data.overlay.css("top", headerTop + "px");
            }

            $(document).unbind("scroll.headerOverlay").bind("scroll.headerOverlay", function () {
                updateHeaderTopOvelay();
            });

            updateHeaderTopOvelay();
        }
    };

    $.fn.pmDialog = function (method) {

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.enhancedSelect');
        }
    };

    $.extend({
        pmDialog: $.fn.pmDialog
    });

})(jQuery);
