PerfectMind.Ajax.Control.DateTimeBuilder = function () {

    // implementation of interface IControlBuilder

    this.BuildElementForPagelet = function (element, root, secondRoot) {
        BuildDateTime(element, root, secondRoot);
    };

    this.BuildElementForPage = function (element) {
        BuildDateTime(element, null);
    };

    this.GetCompatible = function () {
        return "pmdatetimepicker";
    };

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
    BuildDateTime = function (ele, root, secondRoot) {
        var id = ele.id;
        var theText = $(ele);
        //var theTextWidth = theText.width();
        var theFormat;
        var theOriginalFormat;
        var theButton;
        var theTimePicker;
        //var theTimePickerWidth;
        var theTimeFormat;
        var theResult;

        var ixId = id.indexOf('-datepicker');
        if (ixId == -1)
            return;
        id = id.substring(0, ixId);

        if (root) {
            theFormat = IfNotFirstSecond(root, secondRoot, "#" + id + "-format").val();
        }
        else {
            theFormat = $("#" + id + "-format").val();
        }

        if (root) {
            theOriginalFormat = IfNotFirstSecond(root, secondRoot, "#" + id + "-originalformat").val();
        }
        else {
            theOriginalFormat = $("#" + id + "-originalformat").val();
        }

        if (root) {
            theButton = IfNotFirstSecond(root, secondRoot, "#" + id + "-Button");
        }
        else {
            theButton = $("#" + id + "-Button");
        }

        if (root) {
            theTimePicker = IfNotFirstSecond(root, secondRoot, "#" + id + "-timepicker");
        }
        else {
            theTimePicker = $("#" + id + "-timepicker");
        }
        //theTimePickerWidth = theTimePicker.width();
        if (root) {
            theTimeFormat = IfNotFirstSecond(root, secondRoot, "#" + id + "-timeformat").val();
        }
        else {
            theTimeFormat = $("#" + id + "-timeformat").val();
        }

        if (root) {
            if (id != "") {
                theResult = IfNotFirstSecond(root, secondRoot, "#" + id);
            } else {
                return;
            }
        }
        else {
            theResult = $("#" + id);
        }

        attachDatePicker();
        //        theText.datepicker({
        //            changeMonth: true,
        //            changeYear: true,
        //            gotoCurrent: true,
        //            showOtherMonths: true,
        //            yearRange: '-100:+20',
        //            dateFormat: theFormat,
        //            onSelect: function (dateText, inst) {
        //                var midnight = new Date();
        //                midnight.setHours(0, 0, 0, 0);
        //                theTimePicker.val("12:00 AM");

        //                theResult.val(dateText + " " + midnight.format(theTimeFormat.val()));

        //                if (isDateValid())
        //                    theTimePicker.show();
        //                var mainContent = document.getElementById("main-content");
        //                if (mainContent) {
        //                    mainContent.className = mainContent.className; //BUG-024460 in IE8
        //                }

        //            }
        //        });

        theTimeFormat = theTimeFormat || "hh:mm p";
        theTimePicker.timepicker({
            timeFormat: theTimeFormat,
            startHour: 8,
            interval: 30,
            startMinutes: 0,
            change: function (time) {
                
                if (theText.val() == '') {
                    theResult.val('');
                } else {
                    var thedate = theText.datepicker("getDate");
                    var thetime = new Date();

                    thetime.setTime(time.getTime());
                    thetime.setFullYear(thedate.getFullYear(), thedate.getMonth(), thedate.getDate());

                    theResult.val(theText.val() + " " + thetime.format(theTimeFormat));
                }
                $(document.body).trigger('PerfectMind.Ajax.Control.DateTimeBuilder.timePicker_change', { sender: this });
            }
        });

        if (theText.val() != '' && theTimePicker.val() != '') {
            theResult.val(theText.val() + " " + theTimePicker.val());
        }
        else {
            theResult.val('');
            theTimePicker.val('');
            theText.val('');
        }

        theText.change(function () {

            if (theText.val() == '') {

                theResult.val('');
                theTimePicker.val('');
            }
        });

        theText.blur(function () {
            setTimeout(function () {
                if (isDateValid()) {
                    theText.closest(".date-time-picker").removeClass("time-hidden");
                }
            }, 300);
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
                if ($.browser.msie) {
                    theText.datepicker('destroy');
                }
                theText.selectRange(starter, starter + 1);
            }
            else if ($.browser.msie) {
                attachDatePicker();
            }
      
            //$("#ui-datepicker-div").hide();
            //theTimePicker.hide();
            theText.closest(".date-time-picker").addClass("time-hidden");
            //BUG-032431
            //theText.removeClass('pmdatetimepicker hasDatepicker');
            if (theTimePicker.css("display") != "none") {
                //$(theText).width(theTextWidth + theTimePickerWidth);
                theTimePicker.css('display', '');
            }
            thePopup.hide();
        });
        function isDateValid() {
            try {
                $.datepicker.parseDate(theText.data('datepicker').settings.dateFormat, theText.val(), theText.data('datepicker').settings);
            }
            catch (e) {
                return false;
            }
            return true;
        }

        function attachDatePicker() {
            theText.datepicker({
                changeMonth: true,
                changeYear: true,
                gotoCurrent: true,
                showOtherMonths: true,
                shortYearCutoff: 99,
                yearRange: '1900:2100',
                dateFormat: theFormat,
                autoSize: true,
                onClose: function () {
                    // Only auto format if there is a valid date
                    if (isValidDate(theText)) {
                        $(this).datepicker("option", "dateFormat", theFormat);
                        var time1 = theTimePicker.timepicker('getTime');
                        if (time1.getTime() != null) {
                            theResult.val(theText.val() + " " + theTimePicker.val());
                        }
                    } else {
                        theResult.val(theText.val());
                    }
                },
                onSelect: function (dateText, inst) {
                    // Keep the currntly selected time, the onClose method will update resultInput                  
                    if (theTimePicker.val() == "") {
                        var midnight = new Date();
                        midnight.setHours(0, 0, 0, 0);
                        theTimePicker.val(midnight.format(theTimeFormat));
                        theResult.val(dateText + " " + midnight.format(theTimeFormat));
                    }

                    var selectedOperandId = $('select#operandId').val();

                    if (isDateValid()) {
                        theText.addClass('pmdatetimepicker hasDatepicker');

                        if (selectedOperandId == '0' || selectedOperandId == '1') {
                            theTimePicker.hide();
                        }
                        else if (theText.closest(".date-time-picker").is(".time-hidden")) {
                            theText.closest(".date-time-picker").removeClass("time-hidden");
                            theTimePicker.show();
                        }
                        
                    }
                    var mainContent = document.getElementById("main-content");
                    if (mainContent) {
                        mainContent.className = mainContent.className; //BUG-024460 in IE8
                    }
                    $(document.body).trigger('PerfectMind.Ajax.Control.DateTimeBuilder.datePicker_onSelect', { sender: this });
                }
            });
        }
    };

};

