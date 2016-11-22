(function ($) {

    function removeUnit(value) {
        return parseInt(value.replace(/[^0-9|-]/g, ""), 10);
    }

    function getItemData(item) {
        var selectOption = item.is(".pm-enhanced-select-option")
			? item
			: item.closest(".pm-enhanced-select-option");

        if (selectOption.length > 0) {
            return selectOption.data();
        }
        return null;
    }

    function setClickBlockerDiv(select, dropdown) {
        /* https://bugzilla.mozilla.org/show_bug.cgi?id=392863  
        Opera and IE8 have the same problem. But IE8 also need a transparent background image to block clicks */
        var clickBlocker, wrapper;

        clickBlocker = $("<div class='pm-enhanced-select-click-blocker'></div>")
			.css("position", "absolute")
			.css("top", 0)
            .css("left", 0)
			.css("width", "100%")
			.css("height", select.outerHeight())
			.on("mousedown", function () {
			    dropdown.toggle();
			    return false;
			});

        wrapper = $("<div class='pm-enhanced-select-click-blocker-wrapper'></div>")
			.css("display", "inline")
			.css("position", "relative");

        select.after(wrapper);
        wrapper
			.append(select)
			.append(clickBlocker);
    }

    function removeClickBlockerDiv(select) {
        select
			.closest(".pm-enhanced-select-click-blocker-wrapper")
			.replaceWith(select);
    }

    var methods = {
        init: function (options) {
            var select = this,
				dropdown = options.template.clone(),
				templatesOption = $(".pm-enhanced-select-option", dropdown),
				selectPosition = select.position(),
				top = selectPosition.top + select.outerHeight() + removeUnit(select.css("margin-bottom")),
				left = selectPosition.left + removeUnit(select.css("margin-left"));

            var settings = $.extend({
                'useSelectFont': true
            }, options);

            select.data("enhancedSelect", {
                settings: settings,
                dropdown: dropdown
            });

            if (settings.useSelectFont) {
                dropdown.css("font", select.css("font"));
            }

            dropdown
				.addClass("pm-enhanced-select-dropdown")
				.css("top", top)
				.css("left", left)
				.css("min-width", this.width());

            // clone all the option tags
            $("option", select).each(function () {
                var option, optionClone, templateOption, text;

                option = $(this);

                if (option.data("type")) {
                    templateOption = templatesOption.filter("[data-type='" + option.data("type") + "']");
                }
                else {
                    templateOption = templatesOption.not("[data-type]");
                }

                optionClone = templateOption.clone();
                text = option.text();

                $("*[data-bind='label']", optionClone).text(text);
                optionClone.data("value", option.val());
                optionClone.data("text", text);
                templateOption.parent().append(optionClone);
            });

            templatesOption.remove();
            $(".pm-enhanced-select-option", dropdown).click(function () {
                select.val(getItemData($(this)).value).change();
                dropdown.hide();
            });

            // Trigger Actions
            $("*[data-action]", dropdown).bind("click", function (event) {
                var $this = $(this),
					action = $this.data("action");

                dropdown.hide();
                select.trigger(action, getItemData($this));
                return false;
            });

            // Show the dropdown
            select.on("mousedown.enhancedSelect", function (event) {
                dropdown.toggle();
                return false;
            });

            // Hide the dropdown if click outside
            $(document).on("mousedown.enhancedSelect", function (event) {
                var $target = $(event.target);
                if ($target.closest(".pm-enhanced-select-dropdown").length == 0) {
                    dropdown.hide();
                }
            });

            select.after(dropdown);

            if ($.browser.mozilla || $.browser.opera || ($.browser.msie && $.browser.version < 9)) {
                setClickBlockerDiv(select, dropdown);
            }

            return this;
        },

        destroy: function () {
            var select, data, dropdown;
            select = this,
            data = select.data("enhancedSelect");

            if (data) {
                dropdown = data.dropdown;
                removeClickBlockerDiv(select);
                select.unbind("mousedown.enhancedSelect");
                $(document).unbind("mousedown.enhancedSelect");
                dropdown.remove();
                select.removeData('enhancedSelect');
            }

            return this;
        }
    };

    $.fn.enhancedSelect = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.enhancedSelect');
        }
    };
})(jQuery);