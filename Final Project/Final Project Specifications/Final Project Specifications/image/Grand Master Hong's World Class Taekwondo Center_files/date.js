PerfectMind.Ajax.Control.DateBuilder = function () {

    // implementation of interface IControlBuilder

    this.BuildElementForPagelet = function (element, root, secondRoot) {
        BuildDate(element, root, secondRoot);
    }

    this.BuildElementForPage = function (element) {
        BuildDate(element, null);
    }

    this.GetCompatible = function () {
        return "pmdatepicker";
    }

    PerfectMind.Ajax.Util.Reflection.FirstIsImplementationOfSecond(this, PerfectMind.Ajax.Control.IControlBuilder, true);

    // end of implementation of interface IControlBuilder
    $.fn.selectRange = function (start, end) {
        return this.each(function () {
            if (this.setSelectionRange) {
                this.focus();
                this.setSelectionRange(start, end);
            } else if (this.createTextRange) {
                var range = this.createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', start);
                range.select();
            }
        });
    };
    BuildDate = function (ele, root, secondRoot) {
        var id, theText, theFormat, theButton, constrainInput;
        id = ele.id;
        theText = $(ele);

        if (root) {
            theFormat = IfNotFirstSecond(root, secondRoot, "#" + id + "-format").val();
        }
        else {
            theFormat = $("#" + id + "-format").val();
        }

        if (root) {
            theButton = IfNotFirstSecond(root, secondRoot, "#" + id + "-Button");
        }
        else {
            theButton = $("#" + id + "-Button");
        }

        constrainInput = theText.closest(".template-layout-cell").length == 0;

        theText.datepicker({
            changeMonth: true,
            changeYear: true,
            gotoCurrent: true,
            showOtherMonths: true,
            yearRange: '1900:2100',
            shortYearCutoff: 99,
            dateFormat: theFormat,
            constrainInput: constrainInput,
            onClose: function () {
                // Only auto format if we have a valid date
                if (isValidDate(theText)) {
                    $(this).datepicker("option", "dateFormat", theFormat);
                }
            }
        });

        var thePopup;
        if (root) {
            thePopup = IfNotFirstSecond(root, secondRoot, "#" + id + "-popup");
        }
        else {
            thePopup = $("#" + id + "-popup");
        }
        thePopup.hide().attr('tabindex', '-1').addClass('pm-datepicker-popup');
        theButton.click(function () {
            thePopup.show().focus();
        });

        thePopup.on('blur', function () {
            thePopup.hide();
        });

        var thePopupContent;
        if (root) {
            thePopupContent = IfNotFirstSecond(root, secondRoot, "#" + id + "-popup-content");
        }
        else {
            thePopupContent = $("#" + id + "-popup-content");
        }

        // This is the popup for tags such as TODAY, TOMORROW, LAST WEEK, etc
        // Do not change theResult here, only set the text in the textbox
        thePopupContent.children().click(function () {
            var value = (this).innerHTML;
            value = value.replace('<hr>', '');
            theText.val(value);
            var starter = theText.val().indexOf('n');
            if (starter > -1) {
                theText.selectRange(starter, starter + 1);
            }
            $("#ui-datepicker-div").hide();
            thePopup.hide();
        });

    }

};

