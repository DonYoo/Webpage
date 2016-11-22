/* USELESS FUNCTION THAT ARE STILL CALLED FROM HTML CODE EMBED IN DATABASE
* to avoid JS error that wreck the page I put them back. But a deep refactoring is needed */
function PushFooterToBottom() { }
function setTopRightMenu() { }
/* --------------------------------------------------------*/
var RegistrationFormObjectId = '9792e289-03cc-4745-9611-35f254be378e';
var registrationFormFieldId = 'bb79cc3c-dc14-471f-bf91-a433bafa5309';

(function ($) {
    $.cookie = function (key, value, options) {

        // key and at least value given, set cookie...
        if (arguments.length > 1 && String(value) !== "[object Object]") {
            options = jQuery.extend({}, options);

            if (value === null || value === undefined) {
                options.expires = -1;
            }

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setDate(t.getDate() + days);
            }

            value = String(value);

            return (document.cookie = [
                encodeURIComponent(key), '=',
                options.raw ? value : encodeURIComponent(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path ? '; path=' + options.path : '',
                options.domain ? '; domain=' + options.domain : '',
                options.secure ? '; secure' : ''
            ].join(''));
        }

        // key and possibly options given, get cookie...
        options = value || {};
        var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
        return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
    };
})(jQuery);

jQuery.fn.are = function (selector) {
    return !!selector && this.filter(selector).length == this.length;
};

jQuery.expr[':'].focus = function (elem) {
    return elem === document.activeElement && (elem.type || elem.href);
};

(function ($) {
    $.fn.formChanged = function () {
        var jqThis = $(this);

        var eventListener = function (event) {
            var modified, onchangedCallback;

            modified = jqThis.data("modified");           
            
            jqThis.data("modified", true);
            if (modified !== true) {

                //$("input textarea select", jqThis).die("change, keyup", eventListener);

                onchangedCallback = jqThis.data("onchanged");
                if (typeof window[onchangedCallback] === "function") {
                    window[onchangedCallback]();
                }
            }
        };

        this.each(function (i, elt) {            
            //var htmlFields;
            $("input,textarea:not([readonly]), select", elt).live("change keyup paste input", eventListener);            
            //if(typeof CKEDITOR != "undefined") {
            //    $(".pmhtml").each(function(editorIndex, editorElt) {
            //        CKEDITOR.instances[editorElt.id].on('focus', eventListener);
            //    });
            //}
        });
    };
})(jQuery);

if (!Array.prototype.filter) {
    Array.prototype.filter = function filter(block /*, thisp */) {
        var values = [];
        var thisp = arguments[1];
        for (var i = 0; i < this.length; i++)
            if (block.call(thisp, this[i]))
                values.push(this[i]);
        return values;
    };
}

var delay = (function () {
    var timer = 0;
    return function (callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
})();

var waitForFinalEvent = (function () {
    var timers = {};
    return function (callback, ms, uniqueId) {
        if (!uniqueId) {
            uniqueId = "Don't call this twice without a uniqueId";
        }
        if (timers[uniqueId]) {
            clearTimeout(timers[uniqueId]);
        }
        timers[uniqueId] = setTimeout(callback, ms);
    };
})();

function isTouchDevice() {
    /* More info: http://modernizr.github.com/Modernizr/touch.html */

    // False positive in Chrome > 17
    /*try {  
      document.createEvent("TouchEvent");  
      return true;  
    } catch (e) {  
      return false;  
    }*/

    return "ontouchend" in document; /* false positive in Safari 4.0.4 and false negative with iPhone 3.2 */
}

function addTooltipsForTouchScreen(selector) {
    if (isTouchDevice()) {
        $(selector).bind("click", function (event) {
            $(".help-tooltip").remove();
            var tooltip = $("<span class='help-tooltip'>" + this.title + "</span>");
            //tooltip.css("top", event.pageY).css("left", event.pageX);
            var offset = $(this).offset();
            tooltip.css("top", offset.top).css("left", offset.left);
            tooltip.click(function () {
                tooltip.remove();
            });
            delay(function () {
                tooltip.remove();
            }, 6000);

            $("body").append(tooltip);
        });
    }
}

function htmlEncode(value) {
    return $('<div/>').text(value).html();
}

function htmlDecode(value) {
    return $('<div/>').html(value).text();
}

function doAjaxSubmit(form, e, waitPanelId, targetToUpdate, additionalSuccess) {
    var isValid = true;
    if (e == null) return false;

    Sys.Mvc.AsyncForm.handleSubmit(form, new Sys.UI.DomEvent(e), {
        insertionMode: Sys.Mvc.InsertionMode.replace,
        updateTargetId: targetToUpdate,
        onBegin: Function.createDelegate(form, function (sender, args) {
            $get(waitPanelId).style.display = 'block';
        }),
        onComplete: Function.createDelegate(form, function (sender, args) {
            $get(waitPanelId).style.display = 'none';
            try {
                if (sender.get_response().get_object().success) {
                    var kWindow = $("#objectAjaxLoadingOutter").data("kendoWindow");
                    if (kWindow) kWindow.close();
                    window.status = "Record Successfully Saved";

                }
            } catch (err) {

                var timerId = setInterval(function () {
                    clearTimeout(timerId);
                    $("#sendFeedback").bind("click", function (event) {
                        var targetId = $("#myscript").text();
                        eval(targetId);
                        $("#ajaxObjectEditForm").submit();
                    });
                }, 3000);
            }

            if (additionalSuccess) {
                additionalSuccess();
            }
        })
    });
}

function getAnchor() {
    return getAnchor(false);
}

function getAnchor(removeOrgNumber) {
    if (removeOrgNumber) {
        return $("#siteAnchor").val().replace(/[0-9]{4,5}\/$/, "");
    }
    else {
        return $("#siteAnchor").val();
    }
}

function SignoutIfCookieExpires(signoutUrl) {
    // do not change the name unless you change it on the C# side too
    var attemptedCookie = ($.cookie) ? $.cookie("pmcookie") : null;

    if (attemptedCookie == null) {
        window.location = signoutUrl;
    }
}

function SetMobileFeatureAvailability(onOffSwitch) {
    // do not change the name unless you change it on the C# side too
    var attemptedCookie = $.cookie("perfectmindmobilefeature");

    if (!attemptedCookie) {
        throw "Mobile feature cookie can only be initialized on the server side, and only for mobile browsers";
    }
    var options = { path: '/' };

    if (onOffSwitch) {
        $.cookie("perfectmindmobilefeature", "1", options);
    }
    else {
        $.cookie("perfectmindmobilefeature", "0", options);
    }

    window.location.reload();
}

function GetMobileFeatureAvailability() {
    // do not change the name unless you change it on the C# side too
    var attemptedCookie = $.cookie("perfectmindmobilefeature");

    if (!attemptedCookie) {
        throw "Mobile feature cookie can only be initialized on the server side, and only for mobile browsers";
    }

    if (attemptedCookie == "0") {
        return false;
    }
    else {
        return true;
    }
}

function doSort(field, asc, islookup) {
    $('#sortAsc').val(asc);
    var viewContainer = $('#lookup-window-view-find-style');
    var sortForm = $('#sortField');
    if (islookup == "true") {
        sortForm = $('#sortField', viewContainer);
        $('#sortAsc', viewContainer).val(asc);
    }
    if (sortForm.val(field)[0].form.btnOK)
        sortForm.val(field)[0].form.btnOK.click();
    else {
        if ($('#btn-Apply').length > 0 && $('#adjustableFilterValues').length > 0) {
            var form = $('#btn-Apply').parents('form:first');
            $('#adjustableFilterValues').val($('input,select', form).serialize());
        }

        $('#sortField').val(field)[0].form.submit();
    }
}
function SetCookieCheckTimer(interval, signoutUrl) {

}

function trimTabHeaderIfNeeded(tdElement, width) {
    if ($(tdElement).outerWidth(false) <= width)
        return;

    var link = $(tdElement)[0];
    var tmp = $(link).text();
    while ($(tdElement).outerWidth(false) > width) {
        tmp = tmp.substring(0, tmp.length - 1);
        trimmed = tmp + "...";
        $(link).text(trimmed);
    }
}

function formatCurrency(num, symbol) {
    //alert(Number.parseLocale("2.75"));  
    //var num1 = Globalize.format(123456.456789, "n3");
    //alert(num1);
    // alert((2.75).localeFormat("N"));
    num = num.toString().replace(/\$|\,/g, '');
    //num = num.toString().replace(/\$/g, '');
    if (isNaN(num))
        num = "0";
    sign = (num == (num = Math.abs(num)));
    num = Math.floor(num * 100 + 0.50000000001);
    cents = num % 100;
    num = Math.floor(num / 100).toString();
    if (cents < 10)
        cents = "0" + cents;
    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3) ; i++)
        num = num.substring(0, num.length - (4 * i + 3)) + ',' +
    num.substring(num.length - (4 * i + 3));
    var value = num + '.' + cents;
    //var newvalue = Globalize.format(parseFloat(value));
    var newvalue = parseFloat(value).localeFormat("N");
    return (((sign) ? '' : '-') + symbol + newvalue);
}

function roundOfDecimalPlace(value, decimalPlace) {
    var pow = Math.pow(10, decimalPlace);
    var roundingValue = value;
    roundingValue = roundingValue * pow;
    roundingValue = Math.round(roundingValue);
    roundingValue = roundingValue / pow;
    return roundingValue;
}

function doTaxCalculationAndSetTotal(subTotalField, grandTotalField, symbol, decimalplace, event) {
    var subTotalElement = $("input[id=" + subTotalField + "]");
    var subTotal = parseFloat(subTotalElement.val().replace(',', '.'));

    if (isNaN(subTotal)) {
        subTotal = 0;
    }

    var grandTotal = 0.00;
    var totalTax = 0.00;
    var taxPickList = $('select.pmtaxpicklist');
    taxPickList.each(function () {
    var threeParts = [0, 0, -1];
    if (this.options.length > 1)
        threeParts = $(this.options[1]).val().split(";");
    var clientIndex = $(this).attr("selectedIndex");
    if (!clientIndex) {
        clientIndex = $(this).prop("selectedIndex");
    }
    // the one that came with "None" display value should not be changed
    // and it will never be taken into consideration in the calculation
    var percent = parseFloat(threeParts[1]);

    var newTaxValue = subTotal * (percent / 100);
    newTaxValue = Number(Math.round(newTaxValue + 'e2') + 'e-2'); // Round to two decimal places
    var newTaxDisplayValue = newTaxValue.localeFormat("C");
    var newCompleteValue = "1;" + percent + ";" + newTaxValue.localeFormat("N");

    var newOptionContent = '<option selected="selected" value="' + newCompleteValue + '">' + newTaxDisplayValue + '</option>';

    $(this.children[1]).remove();
    $(this).append(newOptionContent);

    if (clientIndex == 1) {
        $(this).val(newCompleteValue);
        totalTax = totalTax + newTaxValue;
    }
    else {
        $(this).val("0;0;0");
    }
});

    if ($('input.pm_taxable_number_textbox').length > 1 || $("#taxTotalValue").val() != null) {

        if ($("#taxTotalValue").val() != null
            && $("#taxTotalValue").val() != "") {            

            subTotal = memberTaxCalculation(event);
            if (isNaN(subTotal)) {
                subTotal = 0;
            }

            var taxRateVal = $("#taxTotalValue").val();
            var taxRates = $.parseJSON(taxRateVal);
            var taxVal = 0;
            for (var i = 0; i < taxRates.length; i++) {
                var taxRate = roundOfDecimalPlace(taxRates[i], 2);
                taxVal += roundOfDecimalPlace(subTotal * taxRate / 100, 2);
            }
            grandTotal = subTotal + taxVal;
            if (isNaN(grandTotal)) {
                grandTotal = 0;
            }
        }
        else {
            grandTotal = memberTaxCalculation(event);
            if (isNaN(grandTotal)) {
                grandTotal = 0;
            }
        }
    }
    else {
        grandTotal = subTotal + totalTax;
    }
    if (decimalplace) {
        // round the value 
        var pow = Math.pow(10, decimalplace);
        grandTotal = grandTotal * pow;
        grandTotal = Math.round(grandTotal);
        grandTotal = grandTotal / pow;
    }
    grandTotal = grandTotal.localeFormat("N");
    var gtf = $("#" + grandTotalField);
    if (gtf.length) {
        if (gtf.is("div")) {
            gtf.html(symbol + grandTotal);
        } else {
            gtf.val(symbol + grandTotal);
        }
    }
    setGrandTotalToHiddenField(grandTotalField, grandTotal);
}

function doTaxCalculationAndSetTotalFirstTimer(subTotalField, grandTotalField, symbol) {

    var subTotalElement = $("input[id=" + subTotalField + "]");
    var subTotal = parseFloat(subTotalElement.val());

    if (isNaN(subTotal)) {
        subTotal = 0;
    }

    var totalPercent = 0.00;

    var needRecal = false;
    $('select.pmtaxpicklist').each(function () {
    var threeParts = [0, 0, -1];
    if (this.options.length > 1)
        threeParts = $(this.options[1]).val().split(";");
    serverIndex = threeParts[0];
    var oldValue = parseFloat(threeParts[2]);
    var clientIndex = $(this).attr("selectedIndex");
    if (!clientIndex) {
        clientIndex = $(this).prop("selectedIndex");
    }

    // the one that came with "None" display value should not be changed
    // and it will never be taken into consideration in the calculation
    var percent = parseFloat(threeParts[1]);

    if (oldValue == 0) {

        var newTaxValue = subTotal * (percent / 100);
        var newTaxDisplayValue = formatCurrency(newTaxValue, symbol);
        var newCompleteValue = "1;" + percent + ";" + newTaxValue;

        var newOptionContent = '<option selected="selected" value="' + newCompleteValue + '">'
+ newTaxDisplayValue + '</option>';

        $(this.children[1]).remove();
        $(this).append(newOptionContent);

        if (clientIndex == 1) {
            $(this).val(newCompleteValue);
            totalPercent = totalPercent + percent;
        }
        else {
            $(this).val("0;0;0");
        }

        needRecal = true;
    }

}
);  //Note: the calculation result might not be the same as the original total (it happens when not all taxes are selected and there is a validation error on the page layout when saving the record).
    //         if (needRecal) {
    //             var grandTotal = subTotal * ((100 + totalPercent) / 100);
    //             if ($("#" + grandTotalField))
    //                 $("#" + grandTotalField).html(formatCurrency(grandTotal, symbol));
    //             setGrandTotalToHiddenField(grandTotalField, grandTotal);
    //         }
}
function setGrandTotalToHiddenField(grandTotalFieldId, grandTotalAmount) {
    var grandTotalHiddenFieldSelector = 'input#' + grandTotalFieldId + '-hidden';
    if ($(grandTotalHiddenFieldSelector))
        $(grandTotalHiddenFieldSelector).val(grandTotalAmount);
}

function GetDecimalSeparator() {
    var n = Sys.CultureInfo.CurrentCulture.numberFormat.CurrencyDecimalSeparator;
    var charValue = n.charCodeAt(0);
    return charValue;
}

function isNumericKeyPress(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    var value = $(evt.target).val();
    if (!value) //IE is evil, let's beat up Gates
        value = $(evt.srcElement).val();

    // For Home, End and Delete key in mozilla
    if ($.browser.mozilla) {
        if (evt.which == 0 && (evt.keyCode == 46 || evt.keyCode == 36
            || evt.keyCode == 35)) {
            return true;
        }
    }

    var rightArrow = 39;
    if (charCode > 31 && (charCode < 48 || charCode > 57) && (charCode != 46) &&
        (evt.keyCode != 37) &&
        (evt.keyCode != rightArrow) &&
        (evt.keyCode != 46) && (charCode != GetDecimalSeparator()))
        return false;

    //allowing one decimal thing
    if (charCode == 46 && value != null) {
        if (value.indexOf('.') != -1) {
            return false;
        }
    }

    if (charCode == GetDecimalSeparator() && value != null) {

        if (value.indexOf(Sys.CultureInfo.CurrentCulture.numberFormat.CurrencyDecimalSeparator) != -1) {
            return false;
        }
    }

    if (charCode == 44 || charCode == 46) {
        if (charCode == 44) {
            if (Sys.CultureInfo.CurrentCulture.numberFormat.CurrencyDecimalSeparator == ".")
                return false;
        }
        else if (charCode == 46) {
            if (Sys.CultureInfo.CurrentCulture.numberFormat.CurrencyDecimalSeparator == ",")
                return false;
        }
    }

    return true;
}

//Load You Tube Video
function LoadVideo(video, width, videoDivID) {
    //check if the browser is able to access youtube
    if (getYouTubeCookie() == 'not set') {
        checkYouTubeAccess(video, width, videoDivID);
    }
    else if (getYouTubeCookie() == 'true') {
        // Lets Flash from another domain call JavaScript
        var params = { allowScriptAccess: "always" };
        //calculate video width and length
        var length = Math.floor(width / 1.6);
        // The element id of the Flash embed
        var atts = { id: "ytPlayer" };
        var params;
        if (width > 300)
            params = { allowScriptAccess: "always", allowfullscreen: "true", wmode: "transparent" };
        else
            params = { allowScriptAccess: "always", allowfullscreen: "true" };
        // All of the magic handled by SWFObject (http://code.google.com/p/swfobject/)
        swfobject.embedSWF("http://www.youtube.com/v/" + video + "&enablejsapi=1&version=3&playerapiid=player1",
videoDivID, width, length, "8", null, null, params, atts);
    }
}

//Get YouTube Cookie to see if you can access cookie
function getYouTubeCookie() {
    if (document.cookie.length > 0) {
        var c_start = document.cookie.indexOf('AccessYouTube');
        if (c_start != -1) {
            c_start = document.cookie.indexOf('AccessYouTube=True');
            if (c_start != -1) {
                return 'true';
            }
            else {
                return 'false';
            }
        }
        else {
            return 'not set';
        }
    }
    else {
        return 'not set';
    }
}

//check youtube accessible
function checkYouTubeAccess(video, width, videoDivID) {

    try {
        if (getYouTubeCookie() == 'not set') {
            $.ajax({
                url: 'http://www.youtube.com/',
                complete: function (data) {

                    if (data) {
                        try {
                            if (parseInt(data.status) === 0) {
                                setYouTubeCookie('OK', video, width, videoDivID);
                            }
                            else {
                                if (data.statusText == 'OK') {
                                    setYouTubeCookie('OK', video, width, videoDivID);
                                }
                                else {
                                    setYouTubeCookie('Cannot Access', video, width, videoDivID);
                                }
                            }
                        }
                        catch (e) {
                            setYouTubeCookie('Cannot Access', video, width, videoDivID);
                        }
                    }
                    else {
                        setYouTubeCookie('Cannot Access', video, width, videoDivID);
                    }
                }
            });
        }
    }
    catch (ex) {
        setYouTubeCookie('OK', video, width, videoDivID);
    }
}
//set cookie for youtube
function setYouTubeCookie(enableAccess, video, width, videoDivID) {
    if (enableAccess == 'OK') {
        document.cookie = 'AccessYouTube=True';
        LoadVideo(video, width, videoDivID);
    }
    else {
        document.cookie = 'AccessYouTube=False';
    }
}
function makeLabelsEllipsis() {
    $('.label-text:visible').ThreeDots(
    {
        max_rows: 1,
        ellipsis_string: '&hellip;',
        text_span_class: 'label-text-ellipsis'
    });
    addTooltipsForTouchScreen(".label-text-ellipsis");
}

function EndcodeThePickIconGroup() {
    //  can not show icon correct in grouping row look like a grid bug, we have to replace the tag for now
    var controls = $(".t-grouping-row");
    if (controls != null) {
        for (i = 0; i < controls.length; i++) {
            var control = controls[i];

            var value = $(control).html();
            if (value != null) {
                value = value.replace(/&lt;/gi, "<");
                value = value.replace(/&gt;/gi, ">");
                var startIndex = value.indexOf("<span");
                var endIndex = value.indexOf(":");
                var strNeedRemoved = "";
                if (startIndex > 0 && endIndex > 0) {
                    strNeedRemoved = value.substring(startIndex, endIndex + 1);
                }
                else if (endIndex > 0) {
                    var tempValue = value.substring(0, endIndex);
                    var startIndex = tempValue.lastIndexOf(">");
                    strNeedRemoved = value.substring(startIndex + 1, endIndex + 1);
                    //                    value = value.replace(strNeedRemoved, "");
                }
                value = value.replace(strNeedRemoved, "");
                $(control).html(value);
                //if (updateGroupIconTimeId) {
                //on some pages updateGroupIconTimeId is undefined so the previous line throw an exception
                if (typeof (updateGroupIconTimeId) != 'undefined' && updateGroupIconTimeId != null) {
                    window.clearInterval(updateGroupIconTimeId);
                }
            }
        }
    }
}

/*
Used to replace the Ajax.ActionLink from Microsoft. 
The reason is: if the Ajax response html contains javascripts, Ajax.ActionLink does not run them after updating the target element.
*/
(function ($) {
    if (typeof $.widget === 'undefined') {
        return;
    }
    $.widget("ui.pmAjaxLink", {
        options: {
            url: null,
            data: null,
            type: 'GET',
            loadingElementId: null,
            updateTargetId: "customButtonNotification",
            onBegin: null,
            onComplete: null,
            onSucess: null,
            onFailure: null
        },
        doRequest: function () {
            $(".print").each(function () {
                $(this).addClass("disabled");
            });
            this._onBegin();
            var options = this.options;
            var data = null;
            if (options.data) {
                data = options.data;
            }
            var selectRecords = $("body").data("selectedRecordIds");
            if (selectRecords) {
                if (data != null) {
                    data = data + "&selectedrecordids=" + selectRecords;
                } else {
                    data = "selectedrecordids=" + selectRecords;
                }
            }
            // Pass current record id, if viewing a Contact
            var currentRecord = $("#currentRecordId");
            if (currentRecord.length > 0) {
                if ($("#currentObjectId").val() == "88f18a02-bbdd-45b6-9b44-de9ae0ff6500") {
                    if (data != null) {
                        data = data + "&currentrecordid=" + currentRecord.val();
                    } else {
                        data = "currentrecordid=" + currentRecord.val();
                    }
                }
            }
            var currentUrl = window.location;

            var a = $('<a>', { href: options.url })[0];

            var getOriginWithPort = function (url) {
                var result = url.origin;
                if (!result) {
                    result = url.protocol + "//" + url.hostname + (url.port ? ':' + url.port : '');
                }
                return result;
            };

            var getOriginWithNoPort = function (url) {
                var result = url.origin;
                if (!result) {
                    result = url.protocol + "//" + url.hostname;
                }
                return result;
            };

            var getUrlObject = function (href) {
                var l = document.createElement("a");
                l.href = href;
                return l;
            };
            a = getUrlObject(a.href);

            var crossDomainRequest = true;
            if (getOriginWithPort(currentUrl) == getOriginWithPort(a) ||
                //added due to IE exception for same origin policy and origin header exception
               (typeof a.origin === 'undefined' && getOriginWithNoPort(currentUrl) == getOriginWithNoPort(a))) {
                crossDomainRequest = false;
            }

            $.ajax({
                url: options.url,
                data: data,
                type: options.type,
                dataType: 'html',
                crossDomain: crossDomainRequest,
                xhrFields: {
                    withCredentials: crossDomainRequest
                },
                complete: function (request, statusCode) {
                    // enable the buttons again  
                    $(".pm-button").each(function () {
                        $(this).removeClass("disabled");
                        $(this).removeClass("ajax-loading");
                    });
                    // and the drop down memu item pm-button-list-item
                    $(".pm-button-list-item").each(function () {
                        //                    $(this).removeClass("disabled");
                    });

                    $(".print").each(function () {
                        $(this).removeClass("disabled");
                    });

                    if (statusCode == 'success') {
                        var contentType = request.getResponseHeader('Content-Type');
                        if ((contentType) && (contentType.indexOf('application/x-javascript') !== -1)) {
                            var fixedText = request.responseText.replace(/\/\/<!\[CDATA\[/g, '');
                            fixedText = fixedText.replace(/\/\/\]\]>/g, '');
                            eval(fixedText);
                        }
                        else {
                            if (options.updateTargetId) {
                                $('#' + options.updateTargetId).html(request.responseText).show();
                            }
                        }
                        if (options.loadingElementId)
                            $('#' + options.loadingElementId).hide();
                        if ($.isFunction(options.onSucess))
                            options.onSucess(request);
                    }
                    else {
                        if ($.isFunction(options.onFailure))
                            options.onFailure(request);
                    }
                    if ($.isFunction(options.onComplete))
                        options.onComplete(request);
                } //complete
            }); //$.ajax
        },
        _create: function () {
        },
        _init: function () {
            if (this.options.url == null) {
                this.options.url = this.element.attr('href');
            }
            this.element.unbind('click', this._click);
            this.element.unbind('touchstart', this._click);
            this.element.bind('click', this._click);
            this.element.bind('touchstart', this._click);
        },
        _onBegin: function () {
            if (this.options.loadingElementId)
                $('#' + this.options.loadingElementId).show();
            if (this.options.onBegin && $.isFunction(this.options.onBegin))
                this.options.onBegin(this);
        },
        _click: function (evt) {
            var jqThis = $(this);
            var isDefaultPrevented = evt.isDefaultPrevented();
            evt.preventDefault();
            if (!jqThis.is(".disabled") && !isDefaultPrevented) {
                var instance = jqThis.data('uiPmAjaxLink');
                instance.doRequest();
            }
        },
        destroy: function () {
            $.Widget.prototype.destroy.apply(this, arguments); // default destroy
            this.element.unbind('click', this._click);
        }
    });
})(jQuery);
/*
end pmAjaxLink
*/

function initVirtualCodeNotification(options) {
    var settings = {
        title: 'Notification',
        autoOpen: true,
        close: function () {
            if (typeof (updateButtonsAndMenus) == 'function') {
                updateButtonsAndMenus();
            }
        }
    };
    $.extend(settings, options);
    if (!settings.preventDefaultPopup) {
        var dialog = $("#virtualCodeNotification").pmKendoDialog(settings);
        if (typeof(dialog.center) == 'function') {
            dialog.center();
        }
    }
}

function hideVirtualCodeNotification() {
    $("#virtualCodeNotification").pmKendoDialog("close");
}


function allowNumberKeysOnly(e, decimal) {
    var key;
    var keychar;

    if (window.event) {
        key = window.event.keyCode;
    }
    else if (e) {
        key = e.which;
    }
    else {
        return true;
    }
    keychar = String.fromCharCode(key);
    var currencySeparator = Sys.CultureInfo.CurrentCulture.numberFormat.CurrencyDecimalSeparator;

    if ((key == null) || (key == 0) || (key == 8) || (key == 9) || (key == 13) || (key == 27)) {
        return true;
    }
    else if ((("0123456789").indexOf(keychar) > -1)) {
        return true;
    }
    else if (decimal && (keychar == currencySeparator)) {
        var value = $(e.currentTarget).val();
        if (value.indexOf(currencySeparator) != -1) {
            return false;
        }
        return true;
    }
    else
        return false;
}
var pmInlineActionsLink = function () {
    var containerDivId = '#inlineActionsContainer';

    var handleMouseOver = function (ev, objectId, recordId) {
        var ev = ev ? ev : window.event;
        var pageX = mouseX(ev);
        var pageY = mouseY(ev);

        //check disabled.
        if ($('#inlineActionLink' + recordId).hasClass('inlineActionLinkTextDisabled'))
            return;
        //already visible.
        if ($(containerDivId).data('recordId') == recordId)
            return;

        //if the popup div does not exist then created it.
        if ($(containerDivId).length == 0) {
            var containerHtml = '<div id="inlineActionsContainer" class="inlineActionsContainer popup-panel">';
            containerHtml += '<img src="' + getAnchor()
            + 'Content/Images/ControlIcons/running-green-transparent.gif" style="display: none;" id="loadingIcon" />';
            containerHtml += '<div id="buttonContainer"></div>';
            containerHtml += '</div>';
            $(containerHtml).appendTo(document.body);
        }
        else {
            $(containerDivId + ' #buttonContainer').empty();
            $(containerDivId + ' #loadingIcon').show();
        }

        $('body').bind('mousemove', { recordId: recordId }, onMouseMove);

        $(containerDivId).css('left', pageX);
        $(containerDivId).css('top', pageY);
        $(containerDivId).data('recordId', recordId);
        $(containerDivId).show();

        $.ajax({
            url: getAnchor() + 'DummyApp/Object/GetCustomButtonsJson?objectId=' + objectId + '&recordId=' + recordId,
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                $(containerDivId + ' #loadingIcon').hide();
                //No available actions.
                if (data.length == 0) {
                    var html = '<div style="padding:6px 8px;">No actions available.</div>';
                    $(containerDivId + ' #buttonContainer').html(html);
                    adjustPosition();
                    return;
                }
                //add buttons to the popup
                var buttonsHtml = '';
                var urls = {};
                for (var i = 0; i < data.length; i++) {
                    var buttonId = data[i].ID;
                    var url = getAnchor() + 'DummyApp/CustomButton/RunButton?buttonId=' + buttonId;
                    url += '&objectId=' + data[i].CustomButtonRouteValues[1].Value;
                    url += '&recordId=' + recordId;
                    urls['inlineButton-' + buttonId] = url;

                    oneButtonHtml = '<div class="oneButtonContainer">';
                    if (data[i].IsHidden || !data[i].IsEnabled) {
                        oneButtonHtml += '<div class="inlineActionItemDisabled">' + data[i].Caption + '</div>';
                        buttonsHtml += oneButtonHtml + '</div>';
                        continue;
                    }
                    oneButtonHtml += '<div id="inlineButton-' + buttonId + '" class="inlineActionItem"';
                    if (data[i].Style != '')
                        oneButtonHtml += ' style="' + data[i].Style + '"';
                    oneButtonHtml += '>' + data[i].Caption + '</div></div>';
                    buttonsHtml += oneButtonHtml;
                }
                $(containerDivId + ' #buttonContainer').html(buttonsHtml);
                $('#buttonContainer .inlineActionItem').bind('click', handleActionClick);
                $('#buttonContainer .inlineActionItem').each(function (index) {
                    $(this).data('url', urls[this.id]);
                });
                adjustPosition();
                $('#buttonContainer .inlineActionItem').hover(function () {
                    $(this).addClass('inlineActionItemHover');
                }, function () {
                    $(this).removeClass('inlineActionItemHover');
                });
            }, //success
            complete: function () {
                $(containerDivId + ' #loadingIcon').hide();
            }
        }); //$.ajax
    }; //handleMouseOver
    var adjustPosition = function () {
        $(containerDivId).css('left', $(containerDivId).offset().left - 60);
    };
    var onMouseMove = function (e) {
        var eleId = 'inlineActionLink' + e.data.recordId;
        //hide the popup when the mouse is not inside the popup or the actions link.
        if (e.target.id != eleId &&
            e.target.id != 'inlineActionsContainer' &&
            $('a#' + eleId).parent() != e.target &&
            $(containerDivId).has(e.target).length == 0) {
            $(containerDivId).data('recordId', '');
            $(containerDivId).hide();
            $('body').unbind('mousemove');
        }
    };
    var handleActionClick = function (e) {
        e.preventDefault();
        $(containerDivId).hide();
        //scroll to the top in order to let the user see the notification.
        scroll(0, 0);

        $.ajax({
            url: $(this).data('url'),
            dataType: 'html',
            complete: function (request, statusCode) {
                if (statusCode == 'success') {
                    var contentType = request.getResponseHeader('Content-Type');
                    if ((contentType) && (contentType.indexOf('application/x-javascript') !== -1)) {
                        eval(request.responseText);
                    }
                    else {
                        $('#customButtonNotification').html(request.responseText);
                        $('#customButtonNotification').show();
                    }
                }
            } //complete
        }); //$.ajax
    };

    var mouseX = function (evt) {
        if (evt.pageX) return evt.pageX;
        return evt.clientX + (document.documentElement.scrollLeft
            ? document.documentElement.scrollLeft : document.body.scrollLeft);
    };
    var mouseY = function (evt) {
        if (evt.pageY) return evt.pageY;
        return evt.clientY + (document.documentElement.scrollTop
            ? document.documentElement.scrollTop : document.body.scrollTop);
    };

    return { handleMouseOver: handleMouseOver };
}();

/*
* Simplified version of jQuery SmoothDivScroll
* Also changed the resize event handling code.
*/
(function ($) {
    if (typeof $.widget === 'undefined') {
        return;
    }
    $.widget("PM.mouseOverScrollDiv", {
        // Default options
        options: {
            scrollingHotSpotLeft: "div.scrollingHotSpotLeft",
            scrollingHotSpotRight: "div.scrollingHotSpotRight",
            scrollableArea: ".scrollableArea",
            scrollWrapper: "div.scrollWrapper",
            scrollStep: 2,
            scrollInterval: 10,
            mouseDownSpeedBooster: 2,
            resizeCallback: null
        },
        _create: function () {

            // Set variables
            var self = this, o = this.options, el = this.element;

            el.data("scrollWrapper", el.find(o.scrollWrapper));
            el.data("scrollingHotSpotRight", el.find(o.scrollingHotSpotRight));
            el.data("scrollingHotSpotLeft", el.find(o.scrollingHotSpotLeft));
            el.data("scrollableArea", el.find(o.scrollableArea));
            el.data("speedBooster", 1);
            el.data("scrollableAreaWidth", 0);
            el.data("rightScrollInterval", null);
            el.data("leftScrollInterval", null);

            // Set the starting position of the scrollable area. 
            el.data("scrollWrapper").scrollLeft(0);
            /*****************************************
            SET UP EVENTS FOR SCROLLING RIGHT
            *****************************************/

            var startEvent = "mouseover";
            var endEvent = "mouseout";
            var touchDevice = isTouchDevice();
            if (touchDevice) {
                startEvent = "touchstart";
                endEvent = "touchend";
                o.scrollStep = o.scrollStep * 2;
            }

            el.data("scrollingHotSpotRight").bind(startEvent, function (event) {
                el.data("speedBooster", 1);
                event.preventDefault ? event.preventDefault() : event.returnValue = false;
                event.stopPropagation();
                // Start the scrolling interval
                el.data("rightScrollInterval", setInterval(function () {
                    el.data("scrollWrapper").scrollLeft(el.data("scrollWrapper").scrollLeft() + o.scrollStep * el.data("speedBooster"));
                    self._showHideHotSpots(touchDevice);
                }, o.scrollInterval));
            });

            el.data("scrollingHotSpotRight").bind(endEvent, function (event) {
                event.preventDefault ? event.preventDefault() : event.returnValue = false;
                event.stopPropagation();
                clearInterval(el.data("rightScrollInterval"));
                self._showHideHotSpots();
            });

            el.data("scrollingHotSpotRight").bind("mousedown", function (event) {
                el.data("speedBooster", o.mouseDownSpeedBooster);
            });

            /*$("body").bind("mouseup touchend", function () {
                el.data("speedBooster", 1);
            });*/

            /*****************************************
            SET UP EVENTS FOR SCROLLING LEFT
            *****************************************/

            el.data("scrollingHotSpotLeft").bind(startEvent, function (event) {
                el.data("speedBooster", 1);
                event.preventDefault ? event.preventDefault() : event.returnValue = false;
                event.stopPropagation();
                el.data("leftScrollInterval", setInterval(function () {
                    el.data("scrollWrapper").scrollLeft(el.data("scrollWrapper").scrollLeft() - o.scrollStep * el.data("speedBooster"));
                    self._showHideHotSpots(touchDevice);
                }, o.scrollInterval));
            });

            el.data("scrollingHotSpotLeft").bind(endEvent, function (event) {
                event.preventDefault ? event.preventDefault() : event.returnValue = false;
                event.stopPropagation();
                clearInterval(el.data("leftScrollInterval"));
                self._showHideHotSpots();
            });

            el.data("scrollingHotSpotLeft").bind("mousedown", function (event) {
                el.data("speedBooster", o.mouseDownSpeedBooster);
            });

            /*****************************************
            SET UP EVENT FOR RESIZING THE BROWSER WINDOW
            *****************************************/
            $("#content-wrapper").bind("resize", function () {
                el.data("scrollWrapper").scrollLeft(0);

                if (o.resizeCallback && $.isFunction(o.resizeCallback))
                    o.resizeCallback();
                self._showHideHotSpots();
            });

            self.recalculateScrollableArea();
            self._showHideHotSpots();
        },
        /**********************************************************
        Hotspot functions
        **********************************************************/
        // Function for showing and hiding hotspots depending on the
        // offset of the scrolling
        _showHideHotSpots: function (showOnly) {
            var self = this, el = this.element, o = this.options;

            // If the scrollable area is shorter than the scroll wrapper, both hotspots
            // should be hidden
            if (!showOnly
                && (el.data("scrollableAreaWidth") <= (el.data("scrollWrapper").innerWidth())
                    || el.data("scrollWrapper").innerWidth() < 1 /* IE8 bug workaround */)) {

                el.data("scrollingHotSpotLeft").hide();
                el.data("scrollingHotSpotRight").hide();
            }
                // When you can't scroll further left the left scroll hotspot should be hidden
                // and the right hotspot visible.
            else if (el.data("scrollWrapper").scrollLeft() === 0) {

                el.data("scrollingHotSpotRight").show();
                if (!showOnly) {
                    // Clear interval
                    el.data("scrollingHotSpotLeft").hide();
                    clearInterval(el.data("leftScrollInterval"));
                    el.data("leftScrollInterval", null);
                }
            }
                // When you can't scroll further right
                // the right scroll hotspot should be hidden
                // and the left hotspot visible
            else if (el.data("scrollableAreaWidth") <= (el.data("scrollWrapper").innerWidth() + el.data("scrollWrapper").scrollLeft() + 3)) {
                el.data("scrollingHotSpotLeft").show();
                if (!showOnly) {
                    el.data("scrollingHotSpotRight").hide();
                    // Clear interval
                    clearInterval(el.data("rightScrollInterval"));
                    el.data("rightScrollInterval", null);
                    //el.data("scrollWrapper").scrollLeft(el.data("scrollWrapper").innerWidth());
                }
            }
                // If you are somewhere in the middle of your
                // scrolling, both hotspots should be visible
            else {
                el.data("scrollingHotSpotLeft").show();
                el.data("scrollingHotSpotRight").show();
            }
        },
        /**********************************************************
        Recalculate the scrollable area
        **********************************************************/
        recalculateScrollableArea: function () {

            var tempScrollableAreaWidth = 0, el = this.element;

            // Add up the total width of all the items inside the scrollable area
            el.data("scrollableArea").children().each(function () {
                tempScrollableAreaWidth = tempScrollableAreaWidth + $(this).outerWidth(true);
            });

            // Set the width of the scrollable area
            el.data("scrollableAreaWidth", tempScrollableAreaWidth);
            el.data("scrollableArea").width(el.data("scrollableAreaWidth"));
        },
        destroy: function () {
            var el = this.element;

            // Clear all running intervals
            clearInterval(el.data("rightScrollInterval"));
            clearInterval(el.data("leftScrollInterval"));

            // Remove all element specific events
            el.data("scrollingHotSpotRight").unbind("mouseover");
            el.data("scrollingHotSpotRight").unbind("mouseout");
            el.data("scrollingHotSpotRight").unbind("mousedown");

            el.data("scrollingHotSpotLeft").unbind("mouseover");
            el.data("scrollingHotSpotLeft").unbind("mouseout");
            el.data("scrollingHotSpotLeft").unbind("mousedown");

            // Restore the original content of the scrollable area
            el.data("scrollableArea").html(el.data("originalElements"));

            // Remove the width of the scrollable area
            el.data("scrollableArea").removeAttr("style");
            el.data("scrollingHotSpotRight").removeAttr("style");
            el.data("scrollingHotSpotLeft").removeAttr("style");

            el.data("scrollWrapper").scrollLeft(0);
            el.data("scrollingHotSpotRight").hide();
            el.data("scrollingHotSpotLeft").hide();

            // Call the base destroy function
            $.Widget.prototype.destroy.apply(this, arguments);
        }
    });
})(jQuery);

registerNS("PerfectMind.UrlHelper");
PerfectMind.UrlHelper = {
    getQuerystring: function (key) {
        key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + key + "=([^&#]*)", "i");
        var qs = regex.exec(window.location.href);
        if (qs == null)
            return "";
        else
            return qs[1];
    }
};

function getDocHeight() {
    var D = document;
    return Math.max(
        Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
        Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
        Math.max(D.body.clientHeight, D.documentElement.clientHeight)
    );
}

registerNS("PerfectMind.View.Object.ActionMenu");
PerfectMind.View.Object.ActionMenu = {
    processingAction: false,

    Init: function (rootElement) {
        rootElement = rootElement || '';
        // return;
        if (rootElement === '') {
            $("body").append("<div id='activeInlineActionmenuContainer'class='actionmenu inline-actionmenu'></div>");
        } else {
            rootElement += ' ';
        }
        $(rootElement + ".inline-actionmenu .popup-panel").each(function () {
            this.realparent = $(this).parent();
            this.hideAndAppendToParent = function () {
                $(this).hide();
                this.realparent.append(this);
            };
        });

        $(rootElement + " .popup-panel").bind("mouseleave", function (e) {
            $(this).hide();
        });
        $(rootElement + " .inline-actionmenu").bind("mouseleave", function (e) {
            $(this).find('.popup-panel').hide();
        });

        var menuTitleMouseEnter = function (event) {
            var parent, parentOffset,
                popup = $(this).siblings(".popup-panel");

            if ((getDocHeight() - event.pageY) < $(".popup-panel").height() + 40) {
                $(".inline-actionmenu .popup-panel").css("top", "auto").css("bottom", "15px");
            }
            else {
                $(".inline-actionmenu .popup-panel").css("bottom", "auto").css("top", "15px");
            }

            $(".popup-panel:visible").hide();

            //IPad fix
            setTimeout(function () {
                if (popup.css("display") == "none" && !PerfectMind.View.Object.ActionMenu.processingAction) {
                    $(document).unbind("touchend.ActionsMenu").bind("touchend.ActionsMenu", function () {
                        $(this).unbind("touchend.ActionsMenu");
                        setTimeout(function () { $(".popup-panel:visible").hide(); }, 500);
                    });

                    popup.show();
                }
            }, 0);

        };

        $(rootElement + ".inline-actionmenu .menu-item:not(.disabled)").unbind("click").bind("click", PerfectMind.View.Object.ActionMenu.ItemClick);
        $(rootElement + ".inline-actionmenu .menu-title").hoverIntent({ over: menuTitleMouseEnter, out: function () { } });
    },

    ItemClick: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var sender = $(e.currentTarget);
        if (!sender.attr("data-buttonId")) {
            return;
        }

        PerfectMind.View.Object.ActionMenu.processingAction = true;
        var actionmenu, realparent, url, closestPopupPanel;

        closestPopupPanel = sender.closest(".popup-panel");
        if (closestPopupPanel.length) {
            realparent = sender.closest(".popup-panel").get(0).realparent;
        }

        if (realparent != undefined) {
            actionmenu = realparent.closest(".actionmenu");
        }
        else {
            actionmenu = sender.closest(".actionmenu");
        }
        $(".popup-panel").each(function () {
            $(this).hide();
        });
        $("#activeInlineActionmenuContainer > .popup-panel").each(function () {
            this.hideAndAppendToParent();
        });
        //scroll to the top in order to let the user see the notification.
        //BUG-032012
        //scroll(0, 0);

        var objectId = actionmenu.attr("data-objectId");
        var recordId = actionmenu.attr("data-recordId");
        var buttonId = sender.attr("data-buttonId");

        if (buttonId == App.Common.Store.AddCartToCartButtonId || buttonId == App.Common.Store.BuyNowButtonId || buttonId == App.Common.Store.CheckoutButtonId) {
            showRegistrationFormPriorAction({ objectId: objectId, recordId: recordId, callback: buttonAction });
        }
        else {
            buttonAction();
        }

        function buttonAction() {
            url = actionmenu.attr("data-url") + "?buttonId=" + buttonId + "&objectId=" + objectId + "&recordId=" + recordId;

        $.ajax({
            url: url, //sender.attr('data-url'),
            dataType: 'html',
            complete: function (request, statusCode) {
                if (statusCode == 'success') {
                    try {
                        var contentType = request.getResponseHeader('Content-Type');
                        if ((contentType) && (contentType.indexOf('application/x-javascript') !== -1)) {
                            eval(request.responseText);
                        }
                        else {
                            jQuery('#customButtonNotification').html(request.responseText);
                            if (jQuery('#customButtonNotification').text().trim() != "") {
                                jQuery('#customButtonNotification').show();
                            }
                            else {
                                jQuery('#customButtonNotification').hide();
                            }
                        }
                    } finally {
                        PerfectMind.View.Object.ActionMenu.processingAction = false;
                    }
                }
            }
        });
    }
    }
};

registerNS("PerfectMind.CustomButtons");

function showRegistrationFormPriorAction(options) {

    loadRegForm(App.Common.RegistrationForm.TemporaryId,
        options.contactId || App.Common.RegistrationForm.TemporaryContactId,
        options.recordId,
        options.objectId, null, options.completedFormObjectId);

    $(document).off("registration-form-successfuly-completed").off("registration-form-is-empty")
        .on("registration-form-successfuly-completed registration-form-is-empty", options.callback);
}

function showPopupActionResult(msg) {
    if (msg) {
        $("<div>", { "class": "notification", css: { "min-width": "200px" }, html: msg }).pmKendoDialog({ title: "Action completed", modal: true, resizable: false });
    }
}

PerfectMind.CustomButtons = {
    reloadMode: "page", // or "telerikGrid" or "cardView"
    telerikGridId: "#gridRecords",
    reload: function (forcePageMode, msg) {
        if (!forcePageMode && PerfectMind.CustomButtons.reloadMode == "telerikGrid") {
            var grid = $(PerfectMind.CustomButtons.telerikGridId).data('tGrid');
            if (grid !== undefined) {
                grid.ajaxRequest();
            }

            $("#overlayToPreventButtonClick").remove();
            showPopupActionResult(msg);
            return false;
        }
        else if (!forcePageMode && PerfectMind.CustomButtons.reloadMode == "cardView") {
            PerfectMind.CardView.ajaxRequest();
        }
        else if (PerfectMind.CustomButtons.reloadMode == "selectedTransactionID") {

            showPopupActionResult(msg);
            if (typeof (updateInvoices) === 'function') {
                updateInvoices();
            }
            return true;
        } else if (PerfectMind.CustomButtons.reloadMode == "BookedAndAttended") {
            $(".event-row.active").click();
            $("#customButtonNotification").html(msg).show();
            $(document).trigger("customButtonsReload");
            return true;
        }
        else {
            location.reload(true);
        }
        $('#customButtonNotification').empty().hide();
        return false;
    }
};

function insertAtCaret(areaId, text) {
    var txtarea = document.getElementById(areaId);
    var scrollPos = txtarea.scrollTop;
    var strPos = 0;
    var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ?
        "ff" : (document.selection ? "ie" : false));
    if (br == "ie") {
        txtarea.focus();
        var range = document.selection.createRange();
        range.moveStart('character', -txtarea.value.length);
        strPos = range.text.length;
    }
    else if (br == "ff") strPos = txtarea.selectionStart;

    var front = (txtarea.value).substring(0, strPos);
    var back = (txtarea.value).substring(strPos, txtarea.value.length);
    txtarea.value = front + text + back;
    strPos = strPos + text.length;
    if (br == "ie") {
        txtarea.focus();
        var range = document.selection.createRange();
        range.moveStart('character', -txtarea.value.length);
        range.moveStart('character', strPos);
        range.moveEnd('character', 0);
        range.select();
    }
    else if (br == "ff") {
        txtarea.selectionStart = strPos;
        txtarea.selectionEnd = strPos;
        txtarea.focus();
    }
    txtarea.scrollTop = scrollPos;
}

registerNS("PerfectMind.UglyHacks");
PerfectMind.UglyHacks.ExecuteONESTEPcustomButton = function (event, sender) {
    if (event.stopPropagation) {
        event.preventDefault();
        event.stopPropagation();
    }
    else {
        event.cancelBubble = true;
    }

    $.ajax({
        url: sender.href,
        dataType: 'html',
        success: function (data, statusCode, XMLHttpRequest) {
            var contentType = XMLHttpRequest.getResponseHeader('Content-Type');
            if ((contentType) && (contentType.indexOf('application/x-javascript') !== -1)) {
                eval(data);
            }
        }
    });
    return false;
};
registerNS("PerfectMind.TelerikGrid");
PerfectMind.TelerikGrid = function () {

    var gridRecordSelectionLastRowIndex = -1;

    function setRowSelectedState(row, selected, doUpdate) {
        var grid, checkboxes;

        row = $(row);
        grid = row.closest(".k-grid");
        grid = grid.length ? grid : row.closest(".t-grid");
        checkboxes = $(".row-checkbox", grid);


        if (selected === undefined) { // toggle
            selected = !row.is(".selected");
        }
        if (doUpdate === undefined) doUpdate = true;
        if (selected) {
            if (doUpdate) {
                $("tr", grid).not(".t-grid-header tr").removeClass("last-selected");
                row.addClass("last-selected");
                gridRecordSelectionLastRowIndex = -1;
            }
            row.addClass("selected");
            $(".row-checkbox", row).attr("checked", true);
            if (checkboxes.are(":checked")) {
                $(".header-checkbox", grid).attr('checked', true);
            }
        }
        else {
            row.removeClass("selected last-selected");
            $(".row-checkbox", row).attr("checked", false);
            $(".header-checkbox", grid).attr('checked', false);
        }
        if (doUpdate) {
            updateInlineGridButtonsAndMenus(grid);
        }
    }

    function gridRowClickedHandler(sender, event, dataRows) {
        var jqSender, fromCheckbox, grid, row, lastSelected, lastSelectedIndex, clickedIndex, i, wasUpward, isUpward, firstSelection;

        jqSender = $(sender);
        fromCheckbox = jqSender.is(".row-checkbox");

        event.stopPropagation();
        if (fromCheckbox) {
            row = jqSender.closest("tr");
        }
        else {
            row = jqSender;
            event.preventDefault();
        }

        grid = row.closest(".t-grid");
        grid = grid.length ? grid : row.closest(".k-grid");

        if (event.ctrlKey) {
            setRowSelectedState(row);
        }
        else if (event.shiftKey) {
            clickedIndex = dataRows.index(row);
            lastSelected = $(".last-selected");

            if (lastSelected.length > 0) {
                lastSelectedIndex = dataRows.index(lastSelected);
            }
            else {
                lastSelectedIndex = 0;
            }

            firstSelection = gridRecordSelectionLastRowIndex == -1;
            wasUpward = gridRecordSelectionLastRowIndex < lastSelectedIndex;
            isUpward = clickedIndex < lastSelectedIndex;

            if (!firstSelection) {
                if (wasUpward && !isUpward) {
                    for (i = gridRecordSelectionLastRowIndex; i < lastSelectedIndex; i++) {
                        setRowSelectedState(dataRows[i], false, false);
                    }
                }
                else if (!wasUpward && isUpward) {
                    for (i = gridRecordSelectionLastRowIndex; i > lastSelectedIndex; i--) {
                        setRowSelectedState(dataRows[i], false, false);
                    }
                }
                else if (isUpward && clickedIndex > gridRecordSelectionLastRowIndex) {
                    for (i = gridRecordSelectionLastRowIndex; i <= clickedIndex; i++) {
                        setRowSelectedState(dataRows[i], false, false);
                    }
                }
                else if (!isUpward && clickedIndex < gridRecordSelectionLastRowIndex) {
                    for (i = clickedIndex; i <= gridRecordSelectionLastRowIndex; i++) {
                        setRowSelectedState(dataRows[i], false, false);
                    }
                }
            }

            for (i = Math.min(lastSelectedIndex, clickedIndex) ; i <= Math.max(lastSelectedIndex, clickedIndex) ; i++) {
                setRowSelectedState(dataRows[i], true, false);
            }
            gridRecordSelectionLastRowIndex = clickedIndex;

            updateInlineGridButtonsAndMenus(grid);

        }
        else if (!fromCheckbox) {
            publicInterface.goToOne(grid, $("td:last a", row).attr("href"));
        }
        else {
            setRowSelectedState(row);
        }
    }

    function initGridMenuAndSelection(grid) {
        var dataRows = $("tr:not(.t-grouping-row)", grid).not(".t-grid-header tr").not(".k-grid-header tr");
        var isNotClickable = grid.is(".not-clickable");
        EndcodeThePickIconGroup();
        updateInlineGridButtonsAndMenus(grid);

        if (!grid.is(".inline-telerik-grid")) {
            $("#customButtonsContainerDiv .action-button, #customButtonsContainerDiv .toggle-button, #customButtonsContainerDiv .pm-button, #customButtonsContainerDiv .pm-button-list-item, #customButtonContextMenu .menu-item, .button-delete-icon").addClass("disabled");
        }
        $(".header-checkbox", grid).click(function () {
            var checkboxes = $(".row-checkbox", grid),
                checked = $(this).is(":checked");
            checkboxes.attr('checked', checked);
            $("tr", grid).not(".t-grid-header tr").removeClass("last-selected");
            if (checked) {
                checkboxes.closest("tr").addClass("selected");
            }
            else {
                checkboxes.closest("tr").removeClass("selected");
            }
            updateInlineGridButtonsAndMenus(grid);
        });
        $(".row-checkbox", grid).unbind("click");
        $(".row-checkbox", grid).click(function (event) {
            //event.stopPropagation();
            //event.preventDefault();
            gridRowClickedHandler(this, event, dataRows);
        });

        dataRows.click(function (event) {
            //event.stopPropagation();
            //event.preventDefault();
            if (isNotClickable) return;
            gridRowClickedHandler(this, event, dataRows);
        }).hover(
            function () {
                $(this).addClass("t-state-hover");
            },
            function () {
                $(this).removeClass("t-state-hover");
            }
        ).mousedown(function (event) {
            //Disable text selection when we are doing a row selection
            if (event.ctrlKey || event.shiftKey) return false;
        }).each(function () {
            //For IE: Disable text selection when we are doing a row selection
            this.onselectstart = function () { if (event.ctrlKey || event.shiftKey) return false; };
        }).bind("contextmenu", function (event) {
            var contextMenu;
            if ($(this).is(".selected")) {
                event.preventDefault();
                contextMenu = $("#customButtonContextMenu");
                contextMenu.css("top", event.pageY);
                contextMenu.css("left", event.pageX);
                contextMenu.mouseleave(function () {
                    $(this).hide();
                });
                contextMenu.show();
            }
        });
    }

    function updateInlineGridButtonsAndMenus(grid) {
        var buttons, selected;

        if (grid.is(".inline-telerik-grid")) {
            buttons = $(".button-delete-icon[data-relgrid=" + grid.get(0).id + "], .toggle-button[data-relgrid=" + grid.get(0).id + "]");
        }
        else {
            buttons = $("#customButtonsContainerDiv .action-button, #customButtonsContainerDiv .toggle-button, #customButtonsContainerDiv .pm-button, #customButtonsContainerDiv .pm-button-list-item, #customButtonContextMenu .menu-item, .button-delete-icon, .support-multi");
        }
        selected = $("tr.selected", grid);

        if (selected.length > 0) {
            if (selected.length > 1) {
                buttons.filter(":not(.support-multi)").addClass("disabled");
                buttons = buttons.filter(".support-multi");
                $(".inline-actionmenu", selected).hide();
                $("tr:not(.selected) .inline-actionmenu", grid).show();
            }
            else {
                $(".inline-actionmenu").show();
            }

            buttons.each(function () {
                var jqButton, buttonId,
                    button = this,
                    enabled = false;

                jqButton = $(button);
                buttonId = jqButton.is(".menu-item") ? jqButton.attr("data-buttonId") : button.id;

                $(".row-checkbox", selected).each(function () {
                    var recordId = this.value,
                        inlineMenu = $(".inline-actionmenu[data-recordId='" + recordId + "']"),
                        menuItem = $(".menu-item[data-buttonId='" + buttonId + "']", inlineMenu);

                    if (!menuItem.is(".disabled")) {
                        enabled = true;
                        return false;
                    }
                });

                if (enabled) {
                    jqButton.removeClass("disabled");
                }
                else {
                    jqButton.addClass("disabled");
                }
            });
        }
        else {
            buttons.addClass("disabled");
            gridRecordSelectionLastRowIndex = -1;
            $(".inline-actionmenu", grid).show();
        }

        publicInterface.generateCookie(grid);
    }

    function cleanTempDataHttpCookieNameCookie() {
        myOptions = { expires: 1, path: '/' };
        var cookies = {};
        var cookieNameBase = "TempDataHttpCookieName";
        if (document.cookie && document.cookie != '') {
            var split = document.cookie.split(';');
            for (var i = 0; i < split.length; i++) {
                var name_value = split[i].split("=")[0].replace(/^ /, '');
                if (name_value.indexOf(cookieNameBase) == 0) {
                    $.cookie(name_value, "", myOptions);
                }
            }
        }
    }

    var publicInterface = {
        initGrid: function (grids) {
            grids.each(function () {
                initGridMenuAndSelection($(this));
            });
        },

        onLoad: function (event) {
            var grid = $(this).data('tGrid');
        },

        onDataBinding: function (event) {
            var grid = $(this).data('tGrid');
        },

        onDataBound: function (event) {
            var grid = $(this).data('tGrid');
        },

        onError: function (event) {
            var grid = $(this).data('tGrid');
        },

        generateCookie: function (grid) {
            var myOptions = { expires: 1, path: '/' },
            i = 0,
            cookieId = 0,
            cookieData = [""],
            cookieBaseName = "TempDataHttpCookieName";
            var selectRecordIds = "";
            //            $("tr.selected", grid).each(function () {
            //                cookieData[cookieId] += $(".row-checkbox", this).val() + ";";
            //                i++;
            //                if (i % 50 == 0) {
            //                    cookieId++;
            //                    cookieData[cookieId] = "";
            //                }
            //            });

            $("tr.selected", grid).each(function () {
                selectRecordIds += $(".row-checkbox", this).val() + ";";
            });
            $("body").data("selectedRecordIds", selectRecordIds);
            cleanTempDataHttpCookieNameCookie();

            for (i = 1; i <= cookieData.length; i++) {
                //var cookieName = i==0 ? cookieBaseName : cookieBaseName + i;
                if (cookieData[i - 1] != "") {
                    $.cookie(cookieBaseName + i, cookieData[i - 1], myOptions);
                }
            }
        },

        confirmAndRunAction: function (element, deleteUrl) {
            if ($(element).is('.disabled')) {
                return false;
            }

            var msg = 'Are you sure you would like to delete the selected record\r\n'
            + 'and ALL related records from ALL child objects?';

            var confirmDeleteRecordsWindow = [
                "<div id='kendoDeleteRecordsConfirmationWindow' class='pm-kendo-dialog'>" + msg,
                    "<div class='pm-dialog-buttonpane'>",
                        "<a id='confirmDeleteRecordsButton' class='pm-confirm-button' href='#' title='Yes'><span>Yes</span></a>",
                        "<a id='cancelDeleteRecordsButton' class='pm-cancel-button' href='#' title='No'><span>No</span></a>",
                        "<img id='loadingIcon' alt='Loading...' style='visibility: hidden;' src='/Content/Images/Site/ProgressAnimation.gif' class='processing-status-image' /></div></div>"
            ].join("");


            var onCloseRecordDelete = function () {
                $("body").removeClass('overflowHidden');
                $('#kendoDeleteRecordsConfirmationWindow').data("kendoWindow").destroy();
            };

            $(confirmDeleteRecordsWindow).kendoWindow({
                width: 450,
                height: 145,
                close: onCloseRecordDelete,
                title: "Delete Confirmation",
                //pinned: true,
                resizable: false,
                actions: ["Close"],
                modal: true,
                deactivate: function () {
                    this.destroy();
                },
                open: function () {
                    $("body").addClass('overflowHidden');
                },
            }).data("kendoWindow").center().open();


            $("#cancelDeleteRecordsButton").click(function () {
                onCloseRecordDelete();
            });

            $("#confirmDeleteRecordsButton").click(function () {
                setTimeout(function () { $(".k-widget.k-window").css("top", "350px"); }, 100);
                $("#loadingIcon").css("visibility", "visible");
                var selectRecords = $("body").data("selectedRecordIds");
                var data = "selectedrecordids=" + selectRecords;
                $.ajax({
                    type: "POST",
                    url: deleteUrl,
                    dataType: "json",
                    data: data,
                    success: function (msg) {
                        if (msg.success) {
                            var values = window["DeleteButtonReturnUrl"];
                            if (values) {
                                var returnUrl = values["returnUrl"];
                                window.top.location = returnUrl.toString();
                            } else {
                                window.top.location = window.top.location;
                                window.location.reload();
                            }
                        }
                    }
                });
            });
            return false;
        },

        confirmAndRunActionForMultiReocrds: function (element, deleteUrl) {
            if ($(element).is('.disabled')) {
                return false;
            }
            var data = null;
            var selectRecords = $("body").data("selectedRecordIds");
            data = "selectedrecordids=" + selectRecords;

            var currentUrl = window.location.href;
            var page = $('.t-numeric .t-state-active').html();
            var size = $('.t-page-size .t-input').html();

            if (page && size) {
                currentUrl = updateQueryStringParameter(currentUrl, 'page', page);
                currentUrl = updateQueryStringParameter(currentUrl, 'size', size);
                currentUrl = currentUrl.replace("#", "");
                window["DeleteButtonReturnUrl"] = { returnUrl: currentUrl };
            }
            
            $.ajax({
                type: "POST",
                url: deleteUrl,
                dataType: "json",
                data: data,
                success: function (msg) {
                    if (msg.success) {
                        var values = window["DeleteButtonReturnUrl"];
                        if (values) {
                            var returnUrl = values["returnUrl"];
                            window.top.location = returnUrl.toString();
                        }
                        else {
                            window.top.location = window.top.location;
                        }
                    }
                }
            });

            return false;
        },

        updateInlineGridButtonsAndMenus: updateInlineGridButtonsAndMenus,

        goToOne: null,
        onKendoDataBound: function (e) {
            PerfectMind.View.Object.ActionMenu.Init();
            PerfectMind.TelerikGrid.initGrid(e.sender.wrapper);
            $(".k-reset", e.sender.wrapper).each(function () {
                $(this).html($(this).html().replace("undefined:", ""));
            });
        }
    };

    return publicInterface;
}();

registerNS("PerfectMind.Layout.DynamicTabs");


//Not supplying a value will remove the parameter, supplying one will add/update the parameter. 
//If no URL is supplied, it will be grabbed from window.location
function updateQueryStringParameter(url, key, value) {
    if (!url) url = window.location.href;
    var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
        hash;

    if (re.test(url)) {
        if (typeof value !== 'undefined' && value !== null)
            return url.replace(re, '$1' + key + "=" + value + '$2$3');
        else {
            hash = url.split('#');
            url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
            if (typeof hash[1] !== 'undefined' && hash[1] !== null) 
                url += '#' + hash[1];
            return url;
        }
    }
    else {
        if (typeof value !== 'undefined' && value !== null) {
            var separator = url.indexOf('?') !== -1 ? '&' : '?';
            hash = url.split('#');
            url = hash[0] + separator + key + '=' + value;
            if (typeof hash[1] !== 'undefined' && hash[1] !== null) 
                url += '#' + hash[1];
            return url;
        }
        else
            return url;
    }
}


PerfectMind.Layout.DynamicTabs.updateMenuPosition = function (menuTab) {
    var dropDownContainer, dropDownRightPosition, windowRightPosition, shift, windowInnerWidth, windowPageXOffset, objectSelectorMenu, objectSelectorMenuRoot;

    dropDownContainer = $(".t-animation-container", menuTab);
    dropDownRightPosition = menuTab.offset().left + dropDownContainer.width();

    if (window.innerWidth !== undefined && window.pageXOffset != undefined) {
        windowRightPosition = window.innerWidth + window.pageXOffset;
    }
    else { // IE < 9
        windowInnerWidth = document.documentElement ? document.documentElement.clientWidth : document.body.clientWidth;
        windowPageXOffset = document.documentElement ? document.documentElement.scrollLeft : document.body.scrollLeft;
        windowRightPosition = windowInnerWidth + windowPageXOffset;
    }

    if (dropDownRightPosition > windowRightPosition) {
        shift = windowRightPosition - dropDownRightPosition;
        dropDownContainer.css("left", shift + "px");
    }
    else {
        dropDownContainer.css("left", "0");
    }
};
PerfectMind.Layout.DynamicTabs.objectSelectorOnOpen = function (event) {
    var menuTab, dropDownContainer;
    menuTab = $(event.currentTarget);
    dropDownContainer = $(".t-animation-container", menuTab);

    if (dropDownContainer.length < 1) {
        menuTab.css("overflow", "hidden");
        delay(function () {
            PerfectMind.Layout.DynamicTabs.updateMenuPosition(menuTab);
            menuTab.css("overflow", "");

        }, 200);
        return;
    }

    PerfectMind.Layout.DynamicTabs.updateMenuPosition(menuTab);
};

/*registerNS("PerfectMind.CustField");
PerfectMind.CustField.HtmlField = function () {
    this.SaveHtml = function() {
        $.each($(".htmlEditorId"), function(index, value) {
            var htmlfildid = "html_fld_" + value.value;
            var editor = ($find(htmlfildid));
            editor.saveContent();
        });
    };
};*/

registerNS("PerfectMind.iOSButtons");

PerfectMind.iOSButtons.init = function () {
    $('.onoffswitch label').click(function (e) {
        e.stopPropagation();
    });

    $('.onoffswitch input').click(function (e) {
        e.stopPropagation();
    });
};

PerfectMind.buildFromTemplate = function (data, template, newId, dataKey) {

    function buildRec(dataPart, templatePart) {
        var label, value, bindingElement, templateItemParent, newItem, i;

        if (typeof dataPart === "string") {
            templatePart.text(dataPart);
            return;
        }

        for (label in dataPart) {
            value = dataPart[label];

            bindingElement = $("*[data-bind='" + label + "']", templatePart);

            if (bindingElement.length == 0) continue;

            if (bindingElement.is(".template-item")) {
                templateItemParent = bindingElement.parent();
                if ($.isArray(value)) {
                    for (i in value) {
                        newItem = bindingElement.clone()
                            .removeClass("template-item")
                            .data(dataKey, value[i]);

                        buildRec(value[i], newItem);
                        templateItemParent.append(newItem);
                    }
                }
            } else {
                buildRec(value, bindingElement);
            }
        }
    }

    template = template.clone().attr("id", newId).removeClass("template-snippet");

    buildRec(data, template);

    $(".template-item", template).remove();
    $("*[data-bind]", template).removeAttr("data-bind");
    return template;
};

PerfectMind.advancedInputField = function () {

    var spacerHtml = '<span class="item spacer" contenteditable="true"></span>';

    function updateLastSpacerWidth(container) {
        var lastSpacer = $(".spacer:last", container);
        lastSpacer.width(container.width() - lastSpacer.position().left);
    }

    function resetLastSpacerWidth(container) {
        $(".spacer:last", container).width("auto");
    }

    function replaceItem(container, oldItem, newItem) {
        oldItem = $(oldItem);
        oldItem.before(spacerHtml);
        oldItem.after(spacerHtml);
        oldItem.replaceWith(newItem);
        updateLastSpacerWidth(container);
    }

    function appendItem(container, item) {
        container.append(item);
        item.after(spacerHtml);
        updateLastSpacerWidth(container);
    }

    function removeItem(container, item) {
        var jqItem;
        jqItem = $(item);
        jqItem.next(".spacer").remove();
        jqItem.remove();
        updateLastSpacerWidth(container);
    }

    function init(container, validateCallback, onchangeCallback) {

        var advancedInput = {
            container: container,
            replaceItem: function (oldItem, newItem) { replaceItem(container, oldItem, newItem); },
            appendItem: function (item) { appendItem(container, item); },
            removeItem: function (item) { removeItem(container, item); }
        };

        $(window).on("resize", function (event) {
            resetLastSpacerWidth();
            waitForFinalEvent(function () {
                updateLastSpacerWidth(container);
            }, 300, "resizeLastSpacer");
        });

        container.on("keydown", ".spacer", function (event) {
            if (event.which == 13) {
                event.stopPropagation();
                event.preventDefault();
                return false;
            }
        });

        container.on("keyup", ".spacer", function (event) {
            waitForFinalEvent(function () {
                onchangeCallback(advancedInput, event.currentTarget, $(event.currentTarget).text());
            }, 300, "advancedInputOnChange");
        });

        container.on("click", ".spacer", function (event) {
            resetLastSpacerWidth(container);
        });

        container.on("blur", ".spacer", function (event) {
            var spacer, text, callbackResult;

            spacer = $(this);
            text = spacer.text();
            if (text != "") {
                callbackResult = validateCallback(advancedInput, this, text);
                if (callbackResult) {
                    spacer.replaceWith(callbackResult);
                    callbackResult.before(spacerHtml);
                    callbackResult.after(spacerHtml);
                }
            }
            updateLastSpacerWidth(container);
        });

        container
            .empty()
            .append(spacerHtml)
            .addClass("advanced-input-field");

        updateLastSpacerWidth(container);

        return advancedInput;
    }

    return {
        init: init
    };
}();

function OnNewLookupObjectButtonClick(button) {
    var jqThis, createUrl;
    jqThis = $(button);
    createUrl = jqThis.data("createurl");

    var kendoOverlay = $(".k-overlay:visible");
    kendoOverlay = kendoOverlay.length ? kendoOverlay : $(".pm-dialog-overlay");

    var popupContainer = $("#fullContentPopup");
    var fullContentPopup = $("iframe", popupContainer).attr("src", createUrl);
    var fullContentPopupContentWindow = $("#fullContentPopup iframe")[0].contentWindow;
    popupContainer.show();
    if (kendoOverlay.length) {
        var overlayZIndex = parseInt(kendoOverlay.css("z-index"));
        var popupZIndex = overlayZIndex + 10;
        popupContainer.css("z-index", popupZIndex);
        $("#content-wrapper").css("z-index", "auto");
        $("#content-wrapper").addClass("content-wrapper-zindex");
        kendoOverlay.data('prevZIndex', overlayZIndex).css("z-index", popupZIndex - 1).show();
    }
    else {
        $("#content-wrapper").removeClass("content-wrapper-zindex");
        var plannerQuickentry = popupContainer.next('.create-event-view.active');
        if (plannerQuickentry.length > 0)
            plannerQuickentry.hide();
    }

    $(".lookup-dialog:visible, .dynamiclookup-dialog:visible, .multilookup-dialog:visible").css("visibility", "hidden");
    $(".pm-dialog").css("visibility", "hidden");
    var isOverflowAlreadyHidden = $("body").hasClass("overflowHidden");
    if (!isOverflowAlreadyHidden) {
        $("body").addClass("overflowHidden");
    }
    $(window.parent).data("isOverflowAlreadyHidden", isOverflowAlreadyHidden);
    $(window.parent).data("scrollPos", $(window.parent).scrollTop()).scrollTop(0);
    fullContentPopupContentWindow.focus();
}

window.FullContentPopup = {
    close: function (saved, params) {
        var activeLookupPopup, fieldId;
       // window.parent.FullContentPopup.customClose = null;
        $("#main-content").show();
        $("#fullContentPopup").hide();
        $("#fullContentPopup iframe").attr("src", "");
        var popupoverlay = $('.ui-widget-overlay');        
        if (popupoverlay.length > 0) {
            popupoverlay.css("height", "100%").hide();
        }
        popupoverlay = $(".pm-dialog-overlay");
        if (popupoverlay.length > 0) {
            popupoverlay.css("height", "100%").hide();
        }
        activeLookupPopup = $(".lookup-dialog:visible, .dynamiclookup-dialog:visible, .multilookup-dialog:visible");
        if (activeLookupPopup.length) {
            activeLookupPopup.css("visibility", "visible");
            $(".pm-dialog").css("visibility", "visible");
            var pmDialog = $(activeLookupPopup).closest('.pm-dialog');
            var overlay = $(pmDialog).prev('.pm-dialog-overlay');
            overlay.show();
            fieldId = $("td:first", activeLookupPopup).attr("id").replace("target-", "");   // Changed this line
        }

        var plannerQuickentry = $("#fullContentPopup").next('.create-event-view.active');
        if (plannerQuickentry.length > 0)
            plannerQuickentry.show();

        if ($(params).length > 0) {
            var displayValue = $("<div />").html(params.text).text();
            if (params) {
                if (activeLookupPopup.is(".dynamiclookup-dialog")) {
                    closeDialogForDynamicLookup(params.id, displayValue, fieldId);
                }
                else if (activeLookupPopup.is(".multilookup-dialog")) {
                    closeDialogForMultiLookup(params.id, displayValue, fieldId);
                }
                else {
                    closeDialogForLookup(params.id, displayValue, fieldId);
                }
            }
        }
        // fire the record changed event after create a new record
        if ($("#fld_" + fieldId)) {
            $("#fld_" + fieldId).trigger("recordChanged");
            }

        var kendoOverlay = $(".k-overlay:visible");
        kendoOverlay = kendoOverlay.length ? kendoOverlay : $(".pm-dialog-overlay");
        kendoOverlay.each(function () {
            var prevZIndex = $(this).data('prevZIndex');
            if (prevZIndex) {
                $(this).css("z-index", prevZIndex);
            }
        });

        if (!$(window.parent).data("isOverflowAlreadyHidden")) {
            $("body").removeClass("overflowHidden");
        }

        $(window.parent).scrollTop($(window.parent).data("scrollPos"));
        window.parent.postMessage(JSON.stringify(params), "*");
    }
};

closeDialogForLookup = function (id, text, fieldId, root, secondRoot) {
    IfNotFirstSecond(root, secondRoot, "#lookup-" + fieldId).pmDialog('close');
    IfNotFirstSecond(root, secondRoot, "#fld_" + fieldId).val(id);
    IfNotFirstSecond(root, secondRoot, "#textbox-" + fieldId).val(text).change();
    IfNotFirstSecond(root, secondRoot, "#textbox-" + fieldId).closest(".pm-dialog").show();
};

$(document).ready(function () {

    var inputButton = $("input.button-save[type='submit']").length > 0 ? $("input.button-save[type='submit']") : $("input.pm-save-button[type='submit']");
    inputButton.click(function (event) {
        var srcElt, form, formValidationFunction, valid;
        if (typeof confirmMessageInAPopup == 'function') {
            if (confirmMessageInAPopup()) {
                event.stopPropagation();
                event.preventDefault();
                return false;
            }
        }
        srcElt = $(event.target);

        if (srcElt.is(".disabled"))
            return false;

        $.each($(".htmlEditorId"), function (index, value) {
            var htmlfildid = "html_fld_" + value.value;
            var editor = ($find(htmlfildid));
            editor.saveContent();
        });

        form = srcElt.closest("form");

        formValidationFunction = form.data("validation-function");
        valid = true;
        if (typeof window[formValidationFunction] === "function") {
            valid = window[formValidationFunction]();
        }

        if (valid) {
            if (srcElt.css("visibility") == 'hidden') {
                srcElt = $("#submitLink.button-save, #submitTemplateLink.button-save");
                srcElt.css({ "visibility": 'hidden' }) //.addClass("disabled")
                .siblings(".pm-cancel-button").css({ "visibility": 'hidden' });
            }
            else {
                srcElt = $("#submitLinkVisible.button-save, #submitTemplateLinkVisible.button-save");
                srcElt.css({ "visibility": 'hidden' }) //.addClass("disabled")
                .siblings(".pm-cancel-button").css({ "visibility": 'hidden' });
                // add this overlay for finance info save, 
                if (!(typeof BILLINGADDIN === "undefined")) {
                    if (window.location.href.indexOf("FinanceInfo") != -1) {
                        if (typeof (BILLINGADDIN.addOverlayToDocument) === "function") {
                            BILLINGADDIN.addOverlayToDocument();
                        }
                    }
                }

                srcElt = srcElt.length > 0 ? srcElt : $("#submitLinkVisible.pm-save-button, #submitTemplateLinkVisible.pm-save-button");
                if (srcElt.length < 1 || srcElt.is(".disabled"))
                    $("#saveInprogress").show();
            }
            return true;
        }
        else {
            event.stopPropagation();
            event.preventDefault();
            return false;
        }
    });
});

PerfectMind.registerTempPasswordPopup = function (element) {
    var hostChanged = false;
    var anchorUrl = getAnchor();
    var isBookMe = $("#isBookMe").val();
    var formElement = element;
    $('#buttonLogin').click(function () {
        var isButtonLoginDisabled = $('#buttonLogin').prop("disabled");
        if (!isButtonLoginDisabled) {
            $('#buttonLogin').prop("disabled", true);
        var u = $('#textBoxUsername').val();
        var p = $('#textBoxPassword').val();
        if (isBookMe == "true") {
            u = $('#bookme-login-username').val();
            p = $('#bookme-login-password').val();
            if (u == "") {                              
                showErrorMessage("You must specify a username.");
                    $('#buttonLogin').prop("disabled", false);
                return false;
            }
            if (p == "") {                 
                showErrorMessage("You must specify a password.");
                    $('#buttonLogin').prop("disabled", false);
                return false;
            }
        }
        
        $.ajax({
            url: anchorUrl + 'Office/MemberRegistration/Verify',
            type: "POST",
            dataType: "json",
            data: { userName: u, password: p },
            success: function (data) {
                if (data.host) {
                    // Convert from relative to full url
                    $('#logonform').attr('action', data.host + $('#logonform').attr('action'));
                    hostChanged = true;
                }
                if (data.success) {
                    if (isBookMe != "true") {
                        $('#logonform').submit();
                    }
                    else {
                        loginHandler(u, p);
                    }
                }
                else if (data.temp) {
                    $(".error-area").hide();
                    $('#updatePassword').pmKendoDialog({
                        width: 400,
                        height: 200,
                        title: false,
                        visible: false,
                            activate: function () {
                                $("#textBoxPassword1").focus();
                            },
                        deactivate: function () {
                            this.destroy();
                            },
                            close: formElement ? enableTabbingOnClose : "",
                            open: formElement ? disableTabbingOnOpen : "",
                    });

                    $('#updatePassword').parent().find('.k-window-actions').remove();
                }
                else {
                    if (isBookMe != "true") {
                        $('#logonform').submit();
                    }
                    else {
                        loginHandler(u, p);
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert(xhr.status);
                alert(thrownError);
                },
                complete: function () {
                    $('#buttonLogin').prop("disabled", false);
            }
        });
        return false;
        }
    });

    $("#textBoxPassword1, #textBoxPassword2").keypress(function (e) {
        var code = e.keyCode || e.which;
        if (code == 13) { //Enter keycode
            $('#buttonUpdatePassword').click();
        }
    });

    $('#buttonUpdatePassword').click(function () {
        var u = $('#textBoxUsername').val();
        var o = $('#textBoxPassword').val();
        var n1 = $('#textBoxPassword1').val();
        var n2 = $('#textBoxPassword2').val();

        if (!n1 || !n2) {
            alert('Both password and confirm password are required fields');
            return false;
        }
        if (n1 != n2) {
            alert('Confirm password did not match');
            return false;
        }
        if (n1.length < 6) {
            alert('New passwords must be at least 6 characters long.');
            return false;
        }
        var repeats = /(.)\1{2}/;
        if (repeats.test(n1)) {
            alert('Password contains too many repeating characters.');
            return false;
        }
        
        var seqCount = 1;
        var i = 1;
        for (i = 1; i < n1.length; i++) {
            if (Math.abs(n1.charAt(i).charCodeAt() - n1.charAt(i - 1).charCodeAt()) == 1) {
                seqCount = seqCount + 1;
            }
        }
        if (seqCount >= 3) {
            alert('Password can not contain a sequence of characters (pass123 or abcdefg).');
            return false;
        }

        if (n1.toLowerCase().indexOf("password") >= 0 || n1.toLowerCase().indexOf("admin") >= 0) {
            alert('Password can not contain "password" or "admin".');
            return false;
        }

        $.ajax({
            url: anchorUrl + 'Office/Setup/UpdateTemporaryPassword',
            type: "POST",
            dataType: "json",
            data: { userName: u, oldPassword: o, newPassword: n1 },
            success: function (data) {
                if (data.success) {
                    if (isBookMe != "true") {
                        $('#updatePassword').data("kendoWindow").close();
                        $('<div>', { html: "Your password was successfully changed. Please continue to login using your new password." })
                            .pmKendoDialog({ title: "Password successfully changed", buttons: [{ label: "OK", eventName: "continueToLogin" }] })
                            .on("continueToLogin", function () {
                                $("#textBoxPassword").val("");
                            });
                    }
                    else {
                        loginHandler(u, n1);
                    }
                }
                else {
                    if (data.error != null && data.error != "") {
                        alert(data.error + ".");
                    }
                    else {
                        alert('An error happened while trying to update your password.  Please try again or contact us for support.');
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert(xhr.status);
                alert(thrownError);
            }
        });
        return false;
    });

    function disableTabbingOnOpen () {
        var controls = getPageControls();
        var textFields = getPageControls(true);
        var alreadyDisabledControls = controls.find('[tabindex=-1]');
        var alreadyDisabledTextFields = getPageControls(true, true);

        if (alreadyDisabledControls.length > 0) {
            alreadyDisabledControls.attr('tabdisable', 'true');
        }
        if (alreadyDisabledTextFields.length > 0) {
            alreadyDisabledTextFields.attr('tabdisabledtext', 'true');
        }

        controls.attr('tabindex', -1);
        textFields.prop('disabled', true);
    }

    function enableTabbingOnClose () {
        var controls = getPageControls();
        var textFields = getPageControls(true);
        var alreadyDisabledTextFields = textFields.find('[tabdisabledtext=true]');
        var alreadyDisabledControls = controls.find('[tabdisable=true]');
        textFields.removeAttr('disabled');
        controls.removeAttr('tabindex');

        if (alreadyDisabledControls.length > 0) {
            alreadyDisabledControls.attr('tabindex', -1);
            alreadyDisabledControls.removeAttr('tabdisable');
        }

        if (alreadyDisabledTextFields.length > 0) {
            alreadyDisabledTextFields.prop('disabled', true);
            alreadyDisabledTextFields.removeAttr('tabdisabledtext');
        }
    }

    function getPageControls (onlyTextField, disabledText) {
        var page = formElement;
        var controls = onlyTextField ? (disabledText ? 'input[type=text]:disabled' : 'input[type=text]')
            : 'a, area, button, input, object, select, textarea, iframe';
        var pageControls = page.find(controls);
        return pageControls;
    }

}

PerfectMind.getSelectedRecordIds = function () {
    var selectedRecordIds = "";
    var cookieIndex = 2;
    var cookeName = "TempDataHttpCookieName" + cookieIndex;
    while (true) {
        var cookieTemp = $.cookie(cookeName);
        if (cookieTemp) {
            selectedRecordIds = selectedRecordIds + cookieTemp;
        }
        else {
            break;
        }
        cookieIndex++;
        cookeName = "TempDataHttpCookieName" + cookieIndex;
    }
    return selectedRecordIds;
};

PerfectMind.AddExportAndPrintToGrid = function () {
    var printAndExport = $(".t-grid-pager.t-grid-bottom div:last-child").last().find('.printandexport');
    var isPrintAndExport = $(".t-grid-pager.t-grid-bottom div:last-child").find(".printandexport").length < 1;
    if (printAndExport != null && printAndExport.length < 1 && isPrintAndExport) {
        $(".t-grid-pager.t-grid-bottom div:last-child").last().append($(".printandexport").clone().show().css("display", "block"));
    }
    $(".pm-print-plain-button").off("click").on("click", printGrid);
    $(".pm-export-plain-button").off("click").on("click", exportGrid);

    function printGrid(e) {
        //  $("#gridRecords").print();
        //        var exportUrl = $("#exportUrl").attr("data");
        //        window.location = exportUrl;
        window.print();
        e.preventDefault();
    }

    function exportGrid(e) {
        var exportUrl = $("#exportUrl").attr("data");
        var criteria = $("#criteria").val();
        var viewIdTmp = $("#viewId").val();
        var parentObjectIdTmp = $("#ParentObjectId").val();
        var parentRecordIdTmp = $("#ParentRecordId").val();
        var relatedFieldIdTmp = $("#RelatedFieldId").val();
        if (!$("#viewId").val()) {
            viewIdTmp = $("#ViewId").val();
        }
        var grid, sortedColumnTitle = "", sortAsc;
        grid = $("div#gridRecords.t-widget").data('tGrid');
        if ((grid) && (grid.sorted.length > 0)) {
            var sortedColumnTitle1 = $(grid.sorted[0].title);
            sortedColumnTitle = sortedColumnTitle1.attr("data-fullname");
            sortAsc = grid.sorted[0].order == 'asc' ? 'true' : 'false';
        }
        window.location = exportUrl + "?objectId=" + $("#exportUrlObjectId").attr("data") + "&viewId=" + viewIdTmp + "&criteria=" + criteria +
            "&sortField=" + sortedColumnTitle + "&sortAsc=" + sortAsc + "&parentObjectId=" + parentObjectIdTmp + "&parentRecordId=" + parentRecordIdTmp +
        "&relatedFieldId=" + relatedFieldIdTmp;
        e.preventDefault();
    }
};

// Validate the date in a jquery UI date picker control
function isValidDate(inputField) {
    try {
        var datePickerSettings = inputField.data('datepicker').settings;
        $.datepicker.parseDate(datePickerSettings.dateFormat, inputField.val(), datePickerSettings);
    }
    catch (e) {
        return false;
    }
    return true;
}

//Synchronous call to ClearShoppingCart
function clearShoppingCart() {
    var anchorUrl = getAnchor();
    var actionUrl = anchorUrl + "menu/StoreApplication/ClearShoppingCart";
    $.ajax({
        type: "GET",
        async: false,
        url: actionUrl,
        cache: false
    }).done(function (data) {
    }).fail(function (data) {
    }).always(function (data) {
    });
};

function getShoppingCartItemByRecordId(itemRecordId) {
    var anchorUrl = getAnchor();

    var actionUrl = anchorUrl + "menu/StoreApplication/GetShoppingCartItemByRecordId";
    var postData = { recordId: itemRecordId };
    var result = null;
    $.ajax({
        type: "POST",
        async: false,
        url: actionUrl,
        cache: false,
        data: postData
    }).done(function (data) {
        if (data && data.success === true) {
            result = data.result;
        }
    }).fail(function (data) {
    }).always(function (data) {
    });
    return result;
};

function updateShoppingCartQuantity(itemRecordId, quantity) {
    var anchorUrl = getAnchor();
    var actionUrl = anchorUrl + "menu/StoreApplication/UpdateShoppingCartItemQuantity";
    var postData = { recordId: itemRecordId, quantity: quantity };
    var oldDiscounts = null;
    $.ajax({
        type: "POST",
        async: false,
        url: actionUrl,
        cache: false,
        data: postData
    }).done(function (data) {
        if (data && data.success) {
            oldDiscounts = data.result; //discounts of old item
        }
    }).fail(function (data) {
    }).always(function (data) {
    });
    return oldDiscounts;
};

//returns object { success, [error,] [count, removedItem] } with serialized deleted item if successful.
//TODO: Currently cartItemId argument may be either CartItemId of specific item OR ParentEventId to delete multiple items.
//There should be 2 different methods for these scenarios.
function deleteShoppingCartItem(cartItemId) {
    var anchorUrl = getAnchor();
    var actionUrl = anchorUrl + "menu/StoreApplication/DeleteShoppingCartItem";
    var postData = { cartItemId: cartItemId };
    var result = null;
    $.ajax({
        type: "POST",
        async: false,
        url: actionUrl,
        cache: false,
        data: postData
    }).done(function (data) {
        if (data && data.success === true && data.result) {
            //should be shopping cart items count and serialized deleted item
            result = {
                success: true,
                count: data.result.count,
                removedItem: data.result.removedItem
            };
        } else {
            result = {
                success : false,
                error: data.error || "Unknown error"
            };
        }
    }).fail(function (data) {
        if (data && data.error) {
            result = {
                success: false,
                error: data.error
            };
        } else {
            result = {
                success: false,
                error: "Unknown error"
            };
        }
    }).always(function (data) {
    });
    return result;
};

//returns serialized deleted items if successful 
function deleteShoppingCartItemByRecordIds(itemRecordIds) {
    var anchorUrl = getAnchor();
    var actionUrl = anchorUrl + "menu/StoreApplication/DeleteShoppingCartItemByRecordIds";
    var postData = { recordIds: itemRecordIds };
    var result = null;
    $.ajax({
        type: "POST",
        async: false,
        url: actionUrl,
        cache: false,
        data: postData
    }).done(function (data) {
        if (data && data.success === true) {
            //should be serialized deleted items
            result = data.result;
        }
    }).fail(function (data) {
    }).always(function (data) {
    });
    return result;
};

function updateDiscountForAnItem(itemRecordId, discount) {

    var oldDiscounts = null;
    var anchorUrl = getAnchor();
    var actionUrl = anchorUrl + "menu/StoreApplication/GetUpdatedDiscountsStringForCookieOfAnItem";
    var postData = { recordId: itemRecordId, newDiscountId: discount };

    $.ajax({
        type: "POST",
        async: false,
        url: actionUrl,
        cache: false,
        data: postData
    }).done(function (data) {
        if (data && data.success) {
            oldDiscounts = data.result;
        }
    }).fail(function (data) {
    }).always(function (data) {
    });
    return oldDiscounts;
};

function preCreateNewObject(sender, objectId) {
    var inProgress = $("body").attr('data-templatepopupinprogress');
    if (inProgress != 'true' && inProgress != true) {
        $("body").attr('data-templatepopupinprogress', true);
        GetIfTemplatesShowInPopup(objectId);
    }
}

function GetIfTemplatesShowInPopup(objectId) {

    var postData = {
        objectId: objectId
    };

    var url = getAnchor() + 'DummyApp/Object/GetIfTemplatesShowInPopup'
    $.ajax({
        type: 'POST',
        url: url,
        async: false,
        data: postData
    })
   .done(function (resultData) {

       if (resultData == null || resultData == undefined || resultData.length == 0) {
           window.location = $('a[data-objectid="' + objectId + '"]').attr('href');
       } else {
           $('div[data-templateobjectid="' + objectId + '"]').html(resultData);
           return false;
       }
   }).fail(function (jqXHR, textStatus, errorThrown) {
       //console.log(errorThrown + " - " + textStatus);
   });
}

function GetQueryStringParams(sParam) {

    var sPageURL = window.location.href.slice(window.location.href.indexOf('?') + 1);
    var sURLVariables = sPageURL.split('&');

    for (var i = 0; i < sURLVariables.length; i++) {

        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {

            return sParameterName[1];
        }
    }
    return null;
}

var newTaxModule = function () {
    var displayNameInput = $("#fld_820db0f6-0759-4a9d-9309-02eb79193466"),
        codeNameInput = $("#fld_1639c236-840f-4601-bacb-53a4c558303c"),
        disableCodeNameInputChangeEvent = false,
        autogenerateCodeName = codeNameInput.val() === "";

    if (displayNameInput.length && codeNameInput.length) {

        displayNameInput.bind("keyup change", function (event) {
            var displayName = displayNameInput.val(),
                codeName = codeNameInput.val();

            if (autogenerateCodeName || codeName === "") {
                disableCodeNameInputChangeEvent = true;
                autogenerateCodeName = true;
                codeNameInput.val(
                    $.trim(displayName)
                        .toUpperCase()
                        //.replace(/\s/g, "_")
                        //.replace(/\W/g, "")
                        .replace(/[^A-Za-z]/g, "")
                );
                disableCodeNameInputChangeEvent = false;
            }
        });

        codeNameInput.change(function (event) {
            if (disableCodeNameInputChangeEvent) return;
            autogenerateCodeName = false;
        });
    }
}();

function initPriceSchemeField(isV2Membership) {
    var context = $('#objectAjaxPageLayout');
    // TODO: should use the field mapping's field id for price scheme insstead of hard-coded picklist values
    var priceSchemeSelector = $("select", context).filter(function () {
        return (($(this).val() == 'One-Time Fee') || ($(this).val() == 'No Fee') || ($(this).val() == 'Membership Based'));
    });
    var priceSchemeRow = priceSchemeSelector.closest("tr");
    var isPriceSchemeField = $(priceSchemeRow.children()[0]).children().filter(function () {
        return (($(this).text().trim() == '*Price Scheme:') || ($(this).text().trim() == 'Price Scheme:'));
    }).length > 0;
    if (priceSchemeSelector.length == 0) {
        priceSchemeSelector = $("div", context).filter(function () {
            return (($(this).text() == 'One-Time Fee') || ($(this).text() == 'No Fee') || ($(this).text() == 'Membership Based'));
        });
        priceSchemeRow = priceSchemeSelector.closest("tr");
        isPriceSchemeField = $(priceSchemeRow.children()[0]).children().filter(function () {
            return (($(this).text().trim() == '*Price Scheme:') || ($(this).text().trim() == 'Price Scheme:'));
        }).length > 0;
    }

    if (isV2Membership.toLowerCase() == 'true') {
        if (isPriceSchemeField && (priceSchemeSelector.length > 0)) {
            var priceSchemeSelectorOnChange = "displayPriceWithPriceScheme(true, this);" + priceSchemeSelector.attr("onchange");
            priceSchemeSelector.attr("onchange", priceSchemeSelectorOnChange);
        }
        displayPriceWithPriceScheme(false, priceSchemeSelector);
    } else {
        if (isPriceSchemeField && (priceSchemeSelector.length > 0)) {
            priceSchemeRow.hide();
        }
    }
}

function initManagePickListPriceSchemeField(isEditMode) {
    var context = $('#objectPageLayout');
    var isEdit = isEditMode != null ? isEditMode.toLowerCase() : "false";
    if (isEdit == "true") {
        var priceSchemeSelector = $("select[is-manage-PickList='true']", context).filter(function () {
            return (($(this).val() == 'One-Time Fee') || ($(this).val() == 'No Fee') || ($(this).val() == 'Membership Based'));
        });

        if (priceSchemeSelector.length > 0) {
            var kendoPriceSchemePicklist = priceSchemeSelector.data("kendoDropDownList");
            if (kendoPriceSchemePicklist != null) {
                managePickListPriceScheme(priceSchemeSelector)
                kendoPriceSchemePicklist.bind("change", function (event) {
                    var selectElement = event.sender.element;
                    if (selectElement.closest("tr.Picklist-wrapper.PriceScheme-wrapper").length > 0) {
                        managePickListPriceScheme(selectElement);
                    }
                });
            }
        }
    }
    else {
        var kendoPriceSchemePicklist = $("tr.Picklist-wrapper.PriceScheme-wrapper", context);
        if (kendoPriceSchemePicklist.length > 0) {
            var priceField = kendoPriceSchemePicklist.next('tr.Currency-wrapper.Price-wrapper');
            var kendoPriceSchemePicklistValue = kendoPriceSchemePicklist.find(".field.picklist .field-web-control.readonly").html();
            kendoPriceSchemePicklistValue = $.trim(kendoPriceSchemePicklistValue);
            hideOrShowManagePickListPriceScheme(kendoPriceSchemePicklistValue, priceField);
        }
    }
}

function managePickListPriceScheme(element) {
    var priceField = $(element).closest("tr.Picklist-wrapper.PriceScheme-wrapper").next('tr.Currency-wrapper.Price-wrapper');
    var data = $(element).data("kendoDropDownList");
    var dataValue = data._selectedValue;
    hideOrShowManagePickListPriceScheme(dataValue, priceField);
}

function hideOrShowManagePickListPriceScheme(value, field) {
    var dataValue = value;
    var dataField = field;
    if (dataValue == 'One-Time Fee') {
        dataField.show();
    }
    else if (dataValue == 'Membership Based' || dataValue == 'No Fee') {
        dataField.hide();
        var priceText = dataField.find('input[type=text]');
        if (priceText.length > 0) {
            priceText.val('0');
        }
    }
}


function displayPriceWithPriceScheme(onchange, sender) {
    var context = $(sender).closest('.objectPageLayoutSection');
    var priceFieldLabel = $("td.label div", context).filter(function () {
        //TODO: should use the field mapping's field id for price instead of hard-coded label
        return ($(this).text().toLowerCase().trim() == 'price:') ||
           ($(this).text().toLowerCase().trim() == '*price:');
    });
    //if (priceFieldLabel.length == 0) return;

    var priceFieldRow = priceFieldLabel.closest("tr");;
    var priceFieldLabelText = "Price:"; //(priceFieldLabel!=null)? priceFieldLabel.text().trim():null;

    var priceSchemeOneTimeFeeRow = $("select", context).filter(function () {
        return ($(this).css('display') != 'none') && ($(this).val() == 'One-Time Fee');
    }).closest("tr");
    if (priceSchemeOneTimeFeeRow.length == 0)
        priceSchemeOneTimeFeeRow = $("div.field-web-control", context).filter(function () {
            return ($(this).css('display') != 'none') && ($(this).text() == 'One-Time Fee');
        }).closest("tr");

    var priceSchemeNotOneTimeFeeRow = $("select", context).filter(function () {
        return ($(this).css('display') != 'none') && (($(this).val() == 'No Fee') || ($(this).val() == 'Membership Based'));
    }).closest("tr");
    if (priceSchemeNotOneTimeFeeRow.length == 0)
        priceSchemeNotOneTimeFeeRow = $("div.field-web-control", context).filter(function () {
            return ($(this).css('display') != 'none') && (($(this).text() == 'No Fee') || ($(this).text() == 'Membership Based'));
        }).closest("tr");

    if ((priceSchemeNotOneTimeFeeRow.length > 0) || (priceSchemeOneTimeFeeRow.length > 0))
        priceFieldRow.hide();

    if (priceSchemeNotOneTimeFeeRow.length > 0) {
        if (priceFieldRow.length == 0) {
            priceSchemeNotOneTimeFeeRow.hide();
            return;
        }
        if (priceFieldLabelText != null) $(priceSchemeNotOneTimeFeeRow.children()[0]).text(priceFieldLabelText);
        if (!onchange) return;
        var priceFieldValueCopy = $("select", context).filter(function () {
            return ($(this).css('display') != 'none') && (($(this).val() == 'No Fee') || ($(this).val() == 'Membership Based'));
        }).siblings();
        if (priceFieldValueCopy.length == 0)
            priceFieldValueCopy = $("div.field-web-control", context).filter(function () {
                return ($(this).css('display') != 'none') && (($(this).text() == 'No Fee') || ($(this).text() == 'Membership Based'));
            }).siblings();
        // reset value to 0
        priceFieldValueCopy.find("input").val('0');
        priceFieldValueCopy.appendTo(priceFieldRow);
    }
    else if (priceSchemeOneTimeFeeRow.length > 0) {
        if (priceFieldRow.length == 0) {
            priceSchemeOneTimeFeeRow.hide();
            return;
        }
        if (priceFieldLabelText != null) $(priceSchemeOneTimeFeeRow.children()[0]).text(priceFieldLabelText);
        var editMode = false;
        var priceSchemeSelector = $("select", context).filter(function () {
            return $(this).val() == 'One-Time Fee';
        }).parent();
        if (priceSchemeSelector.length == 0) {
            priceSchemeSelector = $("div.field-web-control", context).filter(function () {
                return $(this).text() == 'One-Time Fee';
            }).parent();
        }
        else editMode = true;

        //TODO: should use the field mapping's field id for price instead of hard-coded label
        var priceFieldValue = $($("td", context).filter(function () {
            return ($(this).text().toLowerCase().trim() == 'price:') ||
                ($(this).text().toLowerCase().trim() == '*price:');
        })[0]).parent().children()[1];

        //Get Price field value again if got the price scheme instead
        if (priceFieldValue != null) {
            priceFieldValue = $(priceFieldValue);

            if (priceFieldValue.hasClass('picklist')) {
                priceFieldValue = $($("td", context).filter(function () {
                    return ($(this).text().toLowerCase().trim() == 'price:') ||
                    ($(this).text().toLowerCase().trim() == '*price:');
                })[1]).parent().children()[1];
            }
        }

        if (priceFieldValue != null) {
            priceFieldValue = $(priceFieldValue);
            var priceFieldValueClone = priceFieldValue;
            priceFieldValueClone.appendTo(priceSchemeSelector);
        }
    }
}

function initPayRatePicker(oldPlannerInstructorObjectId) {
    var instructorObjectId = instructorObjectId || oldPlannerInstructorObjectId;

        $(document).off("multilookupCreated" + instructorObjectId).on("multilookupCreated" + instructorObjectId, function (event, instructorId) {
        var instructorMultilookup = $("[id ^='fld_'][objectId=" + instructorObjectId + "]").data("multilookup");
            if (instructorMultilookup) {
                instructorMultilookup.unbind("change").bind("change", function (sender) {
                    //Do not load default payrate value for existing event
                    if (!isNewEditEvent() && sender.isInitialLoad) {
                        return;
                    }

                    var instructorId = instructorMultilookup.value().length ? instructorMultilookup.value()[0] : null;
                    updatePayRates(instructorId);
                });
            }
        });

        function isNewEditEvent() {
            return !$("#recordIdField").val() && !$("#recurrenceId").val();
        }
    }

function updatePayRates(instructor) {
    var anchorUrl = getAnchor();

    if (instructor == null || instructor == "") {
        createPayRatePicker([])
        return;
    }

    var defaultPayRateId = $('select.pmpayratepicker').val();
    $.ajax({
        url: anchorUrl + "Menu/Planner/GetPayRateForTeacher",
        type: "GET",
        dataType: "json",
        data: { instructorId: instructor, defaultPayRateId: defaultPayRateId },
        success: function (data, textStatus) {
            createPayRatePicker(data);
        }
    });

    function createPayRatePicker(data) {
        var payRatePicker = $('select.pmpayratepicker');

        payRatePicker.empty().append('<option value="">--None--</option>');
        $.each(data, function (index, value) {
            var payRateOption = $("<option>", { value: value.Id, text: value.Name }).appendTo(payRatePicker);
            if (value.Selected) {
                payRateOption.attr("selected", "selected");
            }
        });
    }
}

registerNS('PerfectMind.Utility');

PerfectMind.Utility.preventDoubleSubmission = function () {
    var targetElements;

    function init(elements) {
        targetElements = elements;
        $(targetElements).on('click', function (e) {
            var element = $(this);

            if (element.hasClass('disabled') === true) {
                // Previously submitted - don't submit again
                    e.preventDefault();
            } else {
                // Mark it so that the next submit can be ignored
                element.addClass('disabled');
            }
        });

    }

    function enableClickSubmission() {
        $(targetElements).removeClass('disabled');
    }

    return {
        enableClickSubmission: function () {
            enableClickSubmission();
        },
        init: function (elements) {
            init(elements);
        }
    };
};
PerfectMind.Utility.disableWindowScroll = function () {    
    $('body').addClass('overflowHidden');
};

PerfectMind.Utility.enableWindowScroll = function () {
    $('body').removeClass('overflowHidden');
}

PerfectMind.Utility.initErrorLogging = function () {
    window.onerror = function (msg, errUrl, line, col, error) {
        // Note that col & error are new to the HTML 5 spec and may not be supported in every browser. 

        // Report this error via ajax
        var url = getAnchor() + "Menu/Object/LogError";
        var data = {
            Message: msg,
            Type: 'JavascriptError',
            SystemState: errUrl + ' Line: ' + line + ' Col: ' + col + "\nCurrent Page: " + window.location.href + "\nBrowser: " + navigator.userAgent
        };
        if (error !== undefined && error) {
            data.StackTrace = error.stack;
        }

        $.ajax({
            url: url,
            data: data,
            type: "POST",
            dataType: "json"
        });

        // If you return true, then error alerts (like in older versions of Internet Explorer) will be suppressed.
        return false;
    };
}

PerfectMind.Utility.showRequestErrorDetails = function (errorName, errorDetails) {
    $("<div>", {
        html: "<div style='padding: 0 10px;'><p>We're Sorry ... </br>The server encountered a temporary error and could not complete your request</p>"
            + "<p>Error : \"" + errorName + "\".</p>"
            + (errorDetails ? "<p>Details of the problem below: </br>" + errorDetails + "</p>" : "") + "</div>"
    }).pmKendoDialog({
        title: "Error",
        buttons: [{
            label: "Close",
            eventName: "onClose"
        }]
    }).on("onClose", function () { window.location.reload(); });
}

$.fn.useCustomScrollbar = function (options) {
    var defaultSettings = {
        theme: 'light',
        autoHideScrollbar: true,
        mouseWheel: { preventDefault: true, scrollAmount: 150, normalizeDelta: true }
    };
    var settings = $.extend(true, {}, defaultSettings, options);
    $(this).mCustomScrollbar(settings);
}

$('.picklist .radio-option-wrapper').click(function () {
    var inputId = $(this).attr('for');
    $(inputId).click();
});

function loadRegForm(regFormId, contactId, eventId, eventObjectId, formSubmitted, completedFormObjectId) {
    if (!regFormId) {
        throw ("regFormId is required");
    }

    $("#plannerAttendanceContainer .loading-container").show();
    var formPopup = $('#regFormWindow');
    if (formPopup.length == 0) {
        $('body').append('<div id="regFormWindow"></div>');
        formPopup = $('#regFormWindow');
    }
    var url = getAnchor() + "Office/RegForm/ShowForm?formId=" + regFormId + "&contactId=" + contactId + "&eventId=" + eventId
        + "&eventObjectId=" + eventObjectId + "&completedFormObjectId=" + completedFormObjectId;

    $.ajax({
        url: url,
        cache: false,
        success: function (data) {

            $('#regFormWindow').html("");
            $('#regFormWindow').html(data);
            $("#plannerAttendanceContainer .loading-container").hide();

            if (!data) {
                return $(document).trigger("registration-form-is-empty");
            }

            formPopup.kendoWindow({
                title: false,
                visible: false,
                actions: ["Close"],
                width: "600px",
                modal: true,
                close: function () {
                    $("body").removeClass('overflowHidden');
                    this.destroy();
                    if (formSubmitted && formSubmitted != null && typeof(formSubmitted) === "function") {
                        formSubmitted(eventId, regFormId);
                    }
                },
                open: function () {
                    // For IE
                    this.center();
                    $("body").addClass('overflowHidden');
                },
                refresh: function () { this.center(); }
            });

            formPopup.data("kendoWindow").open();
        },
        error: function () {
            $("#plannerAttendanceContainer .loading-container").hide();
        }
    });
}

function editRegForm(regFormId, picklist, pickListData, editButton, objectId) {
    var formPopup = $('#regFormWindow');
    $('.editEventContainer .loading-container').show();
    if (formPopup.length == 0) {
        $('body').append('<div id="regFormWindow" style="display:none"></div>');
        formPopup = $('#regFormWindow');
    }

    var url = getAnchor() + "Office/RegForm/SetupForm";

    function activatePopupWhenLoseFocusDuringSeveralTabPressing(e) {
        var windowElement = this.wrapper,
            windowContent = this.element;

        $(document).on("keydown.kendoWindow", function (e) {
            var focusedElement = $(document.activeElement);
            if (e.keyCode == kendo.keys.TAB && focusedElement.closest(windowElement).length == 0) {
                windowContent.focus();

                var elements = windowContent.find(':text,:radio,:checkbox,select,textarea').filter(function () {
                    return !this.readOnly &&
                           !this.disabled &&
                           $(this).parentsUntil('form', 'div').css('display') != "none";
                });
                elements.focus().select();
            }
        });
    }

    $.ajax({
        url: url,
        data: {formId: regFormId, objectId: objectId },
        success: function (data) {
            $('#regFormWindow').html("");
            $('#regFormWindow').html(data);
            $('.editEventContainer .loading-container').hide();
            var kendoWindow = formPopup.kendoWindow({
                title: false,
                autoOpen: false,
                width: "600px",
                height: "680px",
                modal: true,
                activate: activatePopupWhenLoseFocusDuringSeveralTabPressing,
                deactivate: function () {
                    var newFormId = formPopup.data("newFormId");
                    var existingFormId = formPopup.data("exsitingFormId");
                    if (pickListData) {

                    if (newFormId) {
                        switch ($('#regFormWindow').data("eventType")) {
                            case "save":
                                {
                                    var newFormName = formPopup.data("newFormName");
                                    pickListData.dataSource.add({ "text": newFormName, "value": newFormId });
                                    pickListData.setDataSource(sortRegFormPickListData(pickListData));
                                    pickListData.value(newFormId);
                                    break;
                                }
                            case "delete":
                                {
                                    var rawData = pickListData.dataSource.data();
                                    var index;
                                    for (index = rawData.length - 1; index >= 0; index--) {
                                        if (rawData[index].value === newFormId) {
                                            pickListData.dataSource.remove(rawData[index]);
                                            break;
                                        }
                                    }
                                    pickListData.select(0);
                                    break;
                                }
                        }
                        toggleEditRegistrationButton(picklist);
                    }
                    else if (existingFormId) {
                        switch ($('#regFormWindow').data("eventType")) {
                            case "save":
                                {
                                    var newFormName = formPopup.data("newFormName");
                                    var dataItem = pickListData.dataItem();
                                    var selectedIndex = pickListData.dataSource.indexOf(dataItem);
                                    pickListData.dataSource._data[selectedIndex].text = newFormName;
                                    pickListData.setDataSource(sortRegFormPickListData(pickListData));
                                    pickListData.value(existingFormId);
                                }
                        }
                    }
                    }

                    $("body").removeClass('overflowHidden');
                    this.destroy();
                },
                open: function () {
                    // For IE
                    this.center();
                    $("body").addClass('overflowHidden');
                },
                refresh: function () { this.center(); }
            });

            kendoWindow.data("kendoWindow").open().center();
        },
        error: function () {
            $('.editEventContainer .loading-container').hide();
        },
        complete: function() {
            if (editButton) {
                editButton.removeClass("disabled");
            }
        }       
    });
}

function sortRegFormPickListData(pickListData) {
    var noneDataItem = pickListData.dataSource.at(0);
    pickListData.dataSource.remove(noneDataItem);
    var newDataSourceArray = new kendo.data.DataSource();
    newDataSourceArray.data(pickListData.dataSource.data());
    newDataSourceArray.sort({ field: "text", dir: "asc" });
    pickListData.dataSource = new kendo.data.DataSource();
    pickListData.dataSource.data(newDataSourceArray.view());
    pickListData.dataSource.insert(0, noneDataItem);
    pickListData.setDataSource(pickListData.dataSource);
    return pickListData.dataSource;
}

function editPicklistClick(recordId, pickList, pickListData, event) {
    var editButton = event && event.currentTarget ? $(event.currentTarget) : null;
    if (recordId && (!editButton || !editButton.hasClass("disabled"))) {
        if (editButton)
            editButton.addClass("disabled");
        //if (objId == RegistrationFormObjectId) {
        if (pickListData === undefined) { pickListData = pickList.data("kendoDropDownList"); }
        editRegForm(recordId, pickList, pickListData, editButton);
        return;
    }
}

function toggleEditRegistrationButton(pickList) {
    var editLink = $('.pm-edit-button', pickList.closest('.field-web-control'));
    var regstrDropdownSpan = getRegstrFormKendoDropDownSpan(pickList);
    if (!pickList.val() || pickList.val() == RegistrationFormObjectId) {
        editLink.hide();
        regstrDropdownSpan.removeAttr('title');
    }
    else {
        editLink.show();
        regstrDropdownSpan.attr('title', pickList.find('option:selected').text());
    }
}

function onRegstrFormPicklistLoad(e) {
    var pickList = $(e);
    toggleEditRegistrationButton(pickList);
    pickList.kendoDropDownList({
        open: function onOpen(e) {
            e.sender.popup.element.addClass('create-button-picklist');
        },
        dataBound: function () {
            var regstrDropdownSpan = getRegstrFormKendoDropDownSpan(pickList);
            if (this.value()) {
                regstrDropdownSpan.attr('title', this.text());
            }

            $(this.items()).each(function (index, item) {
                var model = pickList.data("kendoDropDownList").dataItem(index);
                if (model.value) {
                    $(item).attr("title", model.text);
                }
            });
            
        },
        headerTemplate: '<span class="k-list createRegistrationForm"><a class="k-item mpl-button" title="Create New">Create New</a></span>'
    });
    $('.createRegistrationForm').click(function () {  
        pickList.data("kendoDropDownList").close();
        editRegForm(null, pickList, pickList.data("kendoDropDownList"), null, $("#currentObjectId").val());
    });
}

function getRegstrFormKendoDropDownSpan(pickList) {
    var regstrDropdownSpan = $('select.lookupAsPicklist', pickList.closest('.field-web-control'));
    return regstrDropdownSpan;
}

function onRegstrFormPicklistChanged(e) {
    toggleEditRegistrationButton($(e));
}

function changeRegstrFormPicklistValue(registrationFormId, registrationFormValue, lookupValue) {
    setTimeout(function () {
        var pickList = $("#editEventTabs .Picklist-wrapper.RegFormID-wrapper select");
        var registrationFormSelector = pickList.data("kendoDropDownList");

        if (registrationFormSelector) {
            pickList.val(registrationFormValue);
            registrationFormSelector.value(registrationFormValue);
            registrationFormSelector.trigger('change');
            toggleEditRegistrationButton(pickList);
            return;
        }
        if (!pickList.length) {
            pickList = $(".RegFormID-wrapper input.pmlookup");
            var pickListText = $(".RegFormID-wrapper input.lookupTexbox");
            if (pickList && pickListText) {
                pickList.val(registrationFormValue).change();
                pickListText.val(lookupValue).change();
                toggleEditRegistrationButton(pickList);
            }
        }  
    }, 100);
}

// KeyDown event for Records.ForLookup search textbox
function criteriaKeyDownForLookup(event) {
    if (event.keyCode == 13) {
        event.preventDefault();
        $("input[name=btnOK1]").click();
        return false;
    }
}

var isMobileDevice = {
    Android: function () {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iPad: function () {
        return navigator.userAgent.match(/iPad/i);
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function () {
        return (isMobileDevice.Android() || isMobileDevice.BlackBerry() || isMobileDevice.iOS() || isMobileDevice.Opera() || isMobileDevice.Windows());
    }
};

$.fn.openModalPopup = function (e, options) {
    var settings = {
        stopPropogation: true,
        triggerBodyClick: true,
        closeSelector: 'body',
        fadeAnimation: 'fast'
    };
    $.extend(settings, options);

    var $container = $(this);

    if (settings.triggerBodyClick) {
        $(settings.closeSelector).trigger('click.hideModal');
    }
    $container.fadeIn(settings.fadeAnimation, function () {
        $(this).trigger('open');
    }).click(function (event) {
        if (settings.stopPropogation) {
            event.stopPropagation();
        }
    });
    $(settings.closeSelector).one("click.hideModal", function () {
        $container.fadeOut(settings.fadeAnimation, function () {
            $(this).trigger('close');
        });
    });

    e.stopImmediatePropagation();
    return false;
}


function isSameDate(dt1, dt2) {
    return dt1.getFullYear() === dt2.getFullYear() &&
        dt1.getMonth() === dt2.getMonth() &&
        dt1.getDate() === dt2.getDate();
};

function setTimeToDate(dt1, dt2) {
    return new Date(dt1.getFullYear(), dt1.getMonth(), dt1.getDate(),
                    dt2.getHours(), dt2.getMinutes(), dt2.getSeconds());
};

function dateToAjax(ms) {
    return "\/Date(" + ms + ")\/";
};

var multiPriceVM = {};
if (typeof require === "function") {
    require(["knockout", "CommonBindings"], function (ko) {
    window.initMultiPricePicker = function (data) {
        if (data.prices) {
                $.each(data.prices, function (i, price) {
                price.ShowOnline = ko.observable(price.ShowOnline);
                handleShowOnlinePriceChange(price);
               
                if (typeof (price.Price) != "function") {
                    price.Price = ko.observable(price.Price);
                }
                if (!price.numberofoccur) {
                    price.numberofoccur = 1;
                }
                price.isValidPriceValue = ko.observable(true);

                price.Price.subscribe(function (newPrice) {
                    updateModifiedPrices(price, false);
                });
            });
        }
        if (data.modifiedPrices) {
            $.each(data.modifiedPrices, function (i, price) {
                if (price.IsDeleted) {
                    // Save the ID of this price item in case it is added back!
                        var match = Enumerable.From(data.priceTypes).Where(function (c) { return c.Id == price.PriceTypeId; }).First();
                    match.existingItemPriceId = price.ID;
                }
            });
        }
        var modifiedPrices = data.modifiedPrices || [];
        multiPriceVM = {
            prices: ko.observableArray(data.prices),
            priceTypes: data.priceTypes, // priceTypes will not change, doesn't need to be observable
            availablePriceTypes: ko.observableArray([]),
            allModifiedPrices: ko.observableArray(modifiedPrices),
            numberofoccur: ko.observable(1),            
            init: true,
            isException: ko.observable(false),
            selectedPrice: null,
            bookingtype: data.bookingType,
            isNeverRecurrenceFreq: ko.observable(false),
            updateModifiedPrices: updateModifiedPrices,
            showFeeBreakDown: data.showFeeBreakDown,
            defaultPrice: data.defaultPrice,
            feeNameAndPrices: data.feeNameAndPrices
        };

        multiPriceVM.showFeeDetails = function () {
           
            require(["FeeDetails"],
                function(feeDetails) {
                    var price = multiPriceVM.defaultPrice != null ? multiPriceVM.defaultPrice.Price : 0;
                    var feeNameAndPrices = multiPriceVM.feeNameAndPrices;
                    var customizedPriceOccurrences = multiPriceVM.defaultPrice != null
                        ? multiPriceVM.defaultPrice.CustomizedPriceOccurrences
                        : [];
                    feeDetails.show(price, feeNameAndPrices, customizedPriceOccurrences);
                });
        }

        Enumerable.From(multiPriceVM.prices()).ForEach(function (item) {
            item.IsCustomizedFee = ko.observable(item.IsCustomizedFee ? item.IsCustomizedFee : false);
        });

        multiPriceVM.CheckIsCustomizedFees = function (originalPrices) {
            Enumerable.From(multiPriceVM.prices()).ForEach(function (itemPrice) {
                Enumerable.From(originalPrices).ForEach(function (item) {
                    if (item.PriceTypeId == itemPrice.PriceTypeId) {

                        itemPrice.IsCustomizedFee(item.Price != itemPrice.Price());
                        updateModifiedPrices(itemPrice, false);
                    }
                });

            });
        };

        multiPriceVM.getCustomizedPriceItems = function () {           
            
            return Enumerable.From(multiPriceVM.prices()).Select(function (item) {
                var customizedPrices = Enumerable.From(item.CustomizedPriceOccurrences)
                    .Where(function (n) {
                        return n.isCustomized && n.isCustomized() || n.isException && !n.isExcluded;
                    }).Select(function (o) {
                        return {
                            StartTime: kendo.parseDate(o.StartTime).toJSON(),
                            EndTime: kendo.parseDate(o.EndTime).toJSON(),
                            Price: typeof o.Price === "function" ? o.Price() : o.Price
                        };
                    }).ToArray();

                return {
                    PriceTypeId: item.PriceTypeId,
                    OccurrencePriceItems: customizedPrices
                };
            }).Where(function (price) {
                return price.OccurrencePriceItems
                    && price.OccurrencePriceItems.length;
            }).ToArray();
        }

        multiPriceVM.getMyPriceTypes = function (itemPrice, addSelf) {
            var priceTypeId = itemPrice.PriceTypeId;
            var priceTypes = multiPriceVM.availablePriceTypes();
            if (addSelf) {
                var myPrice = Enumerable.From(multiPriceVM.priceTypes).Where(function (c) { return c.Id == priceTypeId; }).ToArray();
                priceTypes = priceTypes.concat(myPrice);
            }

            sortPriceTypesByName(priceTypes);
            return priceTypes;
        };

        multiPriceVM.setAvailablePriceTypes = function (updatePriceItems) {
            var currentPriceTypes = Enumerable.From(multiPriceVM.prices()).Select(function (t) { return t.PriceTypeId; }).ToArray();
            var availablePrices = Enumerable.From(multiPriceVM.priceTypes).Where(function (c) { return currentPriceTypes.indexOf(c.Id) == -1; }).ToArray();
            multiPriceVM.availablePriceTypes(availablePrices);

            if (updatePriceItems) {
                // Update the list of available prices in each price row
                    Enumerable.From(multiPriceVM.prices()).ForEach(function (itemPrice) {
                    itemPrice.myPriceTypes(multiPriceVM.getMyPriceTypes(itemPrice, true));
                });
            }
        };
        multiPriceVM.setAvailablePriceTypes(false);

        // Each price needs it's own list of available prices.  (Combine list of available prices with itself)
        Enumerable.From(multiPriceVM.prices()).ForEach(function (itemPrice) {
            var myPriceTypes = multiPriceVM.getMyPriceTypes(itemPrice, true);
            itemPrice.myPriceTypes = ko.observableArray(myPriceTypes);  // one time initialization
        });

        multiPriceVM.updateNum = function (num) {
            if (multiPriceVM.init && multiPriceVM.bookingtype &&
                multiPriceVM.bookingtype != App.Planner.Constants.BookingType.singleBooking.id) {
                for (var i = 0; i < multiPriceVM.prices().length; i++) {
                    var priceItem = multiPriceVM.prices()[i];
                    priceItem.numberofoccur = num;
                }
                multiPriceVM.init = null;
            }
        };

        multiPriceVM.onChange = function () {
            if (multiPriceVM.bookingtype != App.Planner.Constants.BookingType.singleBooking.id) {
                for (var i = 0; i < multiPriceVM.prices().length; i++) {
                    var priceItem = multiPriceVM.prices()[i];
                    var priceType = Enumerable.From(priceItem.myPriceTypes()).Where(function (type) { return type.Id == priceItem.PriceTypeId; }).FirstOrDefault();
                    if (multiPriceVM.bookingtype == App.Planner.Constants.BookingType.courses.id && !priceItem.DropinFee && priceType && priceType.FeeType == 0 /*Per Session*/
                        || multiPriceVM.bookingtype == App.Planner.Constants.BookingType.appointments.id
                        || multiPriceVM.bookingtype == App.Planner.Constants.BookingType.facilityBooking.id) {

                        if (multiPriceVM.bookingtype === App.Planner.Constants.BookingType.facilityBooking.id &&
                            priceItem.CustomizedPriceOccurrences &&
                            priceItem.CustomizedPriceOccurrences.length) {
                            var totalPrice = 0;
                            $.each(priceItem.CustomizedPriceOccurrences, function (idx, p) {
                                if (!p.isExcluded) {
                                    totalPrice += typeof p.Price == "function" ? p.Price() : p.Price;
                                }
                            });
                            priceItem.Price(Math.round(totalPrice * 100) / 100);
                            priceItem.numberofoccur = multiPriceVM.numberofoccur();
                        } else {
                            multiPriceVM.numberofoccur(multiPriceVM.numberofoccur() || 1);
                            priceItem.numberofoccur = priceItem.numberofoccur || 1;
                            priceItem.Price(Math.round((priceItem.Price() / priceItem.numberofoccur * multiPriceVM.numberofoccur()) * 100) / 100);
                            priceItem.numberofoccur = multiPriceVM.numberofoccur();
                            updateModifiedPrices(priceItem, false);
                        }
                    }
                }
            }           
        };

        multiPriceVM.onFacilityBookingChange = function (editEvent) {
            if (multiPriceVM.bookingtype !== App.Planner.Constants.BookingType.facilityBooking.id ||
                !editEvent.recordID) {
                multiPriceVM.onChange();
                return;
            }
            if (editEvent.eventsList && editEvent.eventsList.length) {
                var occurrences = [];
                $.each(editEvent.eventsList,
                    function (idx, v) {
                        occurrences.push(new Date(v));
                    });
                if (editEvent.excludedOccurrences && editEvent.excludedOccurrences.length) {
                    $.each(editEvent.excludedOccurrences,
                        function (idx, v) {
                            var dt = new Date(v);
                            for (var i = 0; i < occurrences.length; i++) {
                                if (isSameDate(occurrences[i], dt)) {
                                    occurrences.splice(i, 1);
                                    break;
                                }
                            }
                        });
                }
                if (editEvent.selectedExcludedList && editEvent.selectedExcludedList.length) {
                    $.each(editEvent.selectedExcludedList,
                        function (idx, v) {
                            var dt = new Date(v);
                            for (var i = 0; i < occurrences.length; i++) {
                                if (isSameDate(occurrences[i], dt)) {
                                    occurrences.splice(i, 1);
                                    break;
                                }
                            }
                        });
                }
                var prices = multiPriceVM.prices();
                if (prices && prices.length) {
                    var duration = editEvent.end.getTime() - editEvent.start.getTime();
                    $.each(prices,
                        function (idx, price) {
                            var totalPrice = price.Price();
                            var excNum = 0;
                            var excTotal = 0;
                            var occurPrice = 0;
                            if (price.CustomizedPriceOccurrences) {
                                $.each(price.CustomizedPriceOccurrences,
                                    function(idx2, occur) {
                                        if (occur.isException && !occur.isExcluded) {
                                            excTotal += typeof occur.Price == "function" ? occur.Price() : occur.Price;
                                            excNum++;
                                        }
                                    });
                                var occurNum = price.CustomizedPriceOccurrences.length - excNum;
                                if (occurNum) {
                                    occurPrice = (totalPrice - excTotal) / occurNum;
                                }
                                var customizedPrices = [];
                                $.each(occurrences,
                                    function(idx2, occur) {
                                        var customizedPrice = null;
                                        for (var i = 0; i < price.CustomizedPriceOccurrences.length; i++) {
                                            var p = price.CustomizedPriceOccurrences[i];
                                            var dt = new Date(parseInt(p.StartTime.substr(6)));
                                            if (isSameDate(occur, dt)) {
                                                customizedPrice = p;
                                                price.CustomizedPriceOccurrences.splice(i, 1);
                                                break;
                                            }
                                        }

                                        if (customizedPrice) {
                                            customizedPrice.isExcluded = false;
                                        } else {
                                            var st = setTimeToDate(occur, editEvent.start);
                                            customizedPrice = {
                                                StartTime: dateToAjax(st.getTime()),
                                                EndTime: dateToAjax(st.getTime() + duration),
                                                Price: occurPrice,
                                                isException: false,
                                                isExcluded: false
                                            };
                                        }
                                        customizedPrices.push(customizedPrice);
                                    });

                                if (price.CustomizedPriceOccurrences.length) {
                                    $.each(price.CustomizedPriceOccurrences,
                                        function(idx, p) {
                                            if (p.isException) {
                                                p.isExcluded = true;
                                                customizedPrices.push(p);
                                            }
                                        });
                                }

                                // recalculate new price
                                var newTotalPrice = 0;
                                $.each(customizedPrices,
                                    function(idx, p) {
                                        if (!p.isExcluded) {
                                            newTotalPrice += typeof p.Price == "function" ? p.Price() : p.Price;
                                        }
                                    });

                                price.CustomizedPriceOccurrences = customizedPrices;
                                price.Price(Math.round(newTotalPrice * 100) / 100);
                                price.numberofoccur = multiPriceVM.numberofoccur();
                                updateModifiedPrices(price, false);
                            } else {
                                multiPriceVM.numberofoccur(multiPriceVM.numberofoccur() || 1);
                                price.numberofoccur = price.numberofoccur || 1;
                                price.Price(Math.round((price.Price() / price.numberofoccur * multiPriceVM.numberofoccur()) * 100) / 100);
                                price.numberofoccur = multiPriceVM.numberofoccur();
                                updateModifiedPrices(price, false);
                            }
                        });
                }
            }           
        };
           
        multiPriceVM.onPriceChange = function (priceItem) {
              updateModifiedPrices(priceItem, false);
        };

        multiPriceVM.FocusoutCalculator = function() {
            var inputs = $("#multiPriceContainer").find('.k-input');
           
            if (inputs.length > 0) {
                $.each(inputs, function(value, key) {
                    var currVal = $(key).val();
                    if (currVal == '') {
                        if ($(key).hasClass('k-formatted-value')) {
                            $(key).val('$0.00');
                        } else {
                            $(key).val(0);
                        }
                    }
                });
            }
        };

        multiPriceVM.openFeeCalculator = function (priceItem) {
            var inputs = $("#multiPriceContainer").find('.k-input');
            if (inputs.length > 0) {
                $.each(inputs, function (value, key) {
                    if (!$(key).hasClass('k-formatted-value')) {
                        var currVal = $(key).val();
                        if (currVal == '0') {
                            $(key).val('');
                        }
                    }
                });
            }
        
        if (priceItem.DropinFee && multiPriceVM.bookingtype == App.Planner.Constants.BookingType.courses.id  || multiPriceVM.isNeverRecurrenceFreq()
            || multiPriceVM.isException()
            || multiPriceVM.bookingtype == App.Planner.Constants.BookingType.singleBooking.id
                    || multiPriceVM.numberofoccur() == 1) return;

        var priceType = Enumerable.From(priceItem.myPriceTypes()).Where(function (type) { return type.Id == priceItem.PriceTypeId; }).FirstOrDefault();
        if (!priceType || priceType && priceType.FeeType != 0  /*Per Session*/) {
            return;
        }

        multiPriceVM.selectedPrice = priceItem;
            if (multiPriceVM.bookingtype == App.Planner.Constants.BookingType.facilityBooking.id) { //todo: check for price type
                require(["PlannerFacilityFeeCalculator"], function (calc) {

                    var options = {
                        title: priceType.Name + " Fee Calculator",
                        sessions: priceItem.CustomizedPriceOccurrences,
                        saveCallback: function (calculatedPrice, sessions, feePerSession) {                            
                            if (sessions.length) {
                                multiPriceVM.selectedPrice.CustomizedPriceOccurrences = sessions;
                                multiPriceVM.selectedPrice.feePerSession = feePerSession;
                            }
                            multiPriceVM.selectedPrice.Price(calculatedPrice);
                            updateModifiedPrices(multiPriceVM.selectedPrice, false);
                        }
                    }
                    calc.open(options);
                });
            } else {
                require(["PlannerFeeCalculator"],
                    function(feeCalc) {
                        var options = {
                            countOfOccurrences: priceItem.numberofoccur,
                            calculatedPrice: priceItem.Price(),
                            onSave: function(calculatedPrice) {
                                multiPriceVM.selectedPrice.Price(calculatedPrice);
                                updateModifiedPrices(multiPriceVM.selectedPrice, false);
                            }
                        };
                        feeCalc.open(options);
                    });
            }
        }

         
        multiPriceVM.onShowOnlineChange = function (priceItem) {
            // Ensure only one show online checkbox is checked -- Uncomment the following to ensure that only one show online checkbox is check
            //if (priceItem.ShowOnline() === true) {
            //    var otherPrice = Enumerable.From(multiPriceVM.prices()).Where(function (o) { return o != priceItem && o.ShowOnline() === true; }).FirstOrDefault();
            //    if (otherPrice) {
            //        otherPrice.ShowOnline(false);
            //        updateModifiedPrices(otherPrice, false);
            //    }
            //}
            updateModifiedPrices(priceItem, false);
        }
        multiPriceVM.onPriceTypeChange = function (priceItem) {
            
            var priceType = Enumerable.From(priceItem.myPriceTypes()).Where(function (type) { return type.Id == priceItem.PriceTypeId; }).FirstOrDefault();
            priceItem.DropinFee = priceType.DropinFee;
            priceItem.FeeType = priceType.FeeType;
            // Recreate the list of available price types
            multiPriceVM.setAvailablePriceTypes(true);
            updateModifiedPrices(priceItem, false);
        }
        
        multiPriceVM.addItem = function (priceItem) {
            var myPriceTypes = multiPriceVM.getMyPriceTypes(priceItem, false);
            if (!Enumerable.From(multiPriceVM.availablePriceTypes()).Any(function (price) { return price.Id == priceItem.PriceTypeId })) {
                return;
            }
            priceItem.myPriceTypes = ko.observableArray(myPriceTypes);
            var priceType = Enumerable.From(priceItem.myPriceTypes()).Where(function (type) {return type.Id == priceItem.PriceTypeId; }).FirstOrDefault();
            if (priceType) {
                priceItem.FeeType = priceType.FeeType;
                priceItem.DropinFee = priceType.DropinFee;
            }
            priceItem.Price(kendo.parseFloat(priceItem.Price().toFixed(2)));

            if (!priceItem.IsCustomizedFee) {
                priceItem.IsCustomizedFee = ko.observable(false);
            }

            if (multiPriceVM.bookingtype != App.Planner.Constants.BookingType.singleBooking.id) {
                if (!priceItem.numberofoccur) {
                    priceItem.numberofoccur = 1;
                }
               
                if (priceItem.FeeType == 0 &&
                    !(multiPriceVM.bookingtype == App.Planner.Constants.BookingType.courses.id && priceItem.DropinFee)) {
                   
                    priceItem.Price(priceItem.Price() / priceItem.numberofoccur * multiPriceVM.numberofoccur());
                }
                priceItem.numberofoccur = multiPriceVM.numberofoccur();
            }

            priceItem.Price.subscribe(function (newPrice) {
                updateModifiedPrices(priceItem, false);
            });

            multiPriceVM.prices.push(priceItem);
            multiPriceVM.setAvailablePriceTypes(true);
            updateModifiedPrices(priceItem, false);
            plannerFilter.disableEnter();
            if (multiPriceVM.isException() && multiPriceVM.bookingtype == App.Planner.Constants.BookingType.facilityBooking.id) {
                var priceContainer = $("#multiPriceContainer .multi-items-wrapper");
                priceContainer.find("select").attr("disabled", true).css("color", "grey");
            }
        }

        multiPriceVM.addPriceItem = function () {
            var firstAvailablePriceType = multiPriceVM.availablePriceTypes()[0];
            var priceItem = createPriceItem(firstAvailablePriceType.existingItemPriceId, null, firstAvailablePriceType);
            multiPriceVM.addItem(priceItem);
        }

            multiPriceVM.setDefaultPrice = function (price) {
            var generalPriceType = Enumerable.From(multiPriceVM.availablePriceTypes()).Where(function (p) {
                return p.Id === '0e90c3e1-d078-e411-80d2-06dbdd3a4071';
            }).FirstOrDefault();
            if (generalPriceType) {
                var priceItem = createPriceItem(null, price, generalPriceType);
                multiPriceVM.addItem(priceItem);
            }
        }

            multiPriceVM.removePrice = function (priceItem) {
            var removedPriceTypeId = priceItem.PriceTypeId;

            // Save the ID of this price item in case it is added back!
            if (priceItem.ID) {
                var match = Enumerable.From(multiPriceVM.priceTypes).Where(function (c) { return c.Id == removedPriceTypeId; }).First();
                match.existingItemPriceId = priceItem.ID;
            }

            multiPriceVM.prices.remove(priceItem);
            multiPriceVM.setAvailablePriceTypes(true);
            updateModifiedPrices(priceItem, true);
        }

            multiPriceVM.validate = function () {
                    var showToOptions = ['Public', 'Member', 'Members'];
                    var showTo = $('.Picklist-wrapper.ShowTo-wrapper select, .Picklist-wrapper.ShowTo-wrapper input:checked');
                    if (multiPriceVM.prices().length && (showToOptions.indexOf(showTo.val()) >= 0)) {
                        var hasShowOnline = Enumerable.From(multiPriceVM.prices()).Any(function(o) { return o.ShowOnline(); });
                        if (!hasShowOnline) {
                            alert('For events shown online you will need to set price to show online.');
                            return false;
                        }
                    }
                    // Also make sure each price has a value
                    var hasValidPriceValue = true;
                    for (var intemIndex in multiPriceVM.prices()) {
                        var priceItem = multiPriceVM.prices()[intemIndex];
                        if (typeof (priceItem.Price) != "function") {
                            priceItem.Price = ko.observable(price.Price);
                        }
                        priceItem.isValidPriceValue(kendo.parseFloat(priceItem.Price()) >= 0);
                        hasValidPriceValue = hasValidPriceValue && !!priceItem.isValidPriceValue();
                    }

                    return hasValidPriceValue;
            }

        multiPriceVM.clearPrices = function () {
            multiPriceVM.prices = ko.observableArray([]);
        }

        multiPriceVM.saveAllPrices = function (settings) {
            settings = settings || {};
            var prices = !settings.isClone ? multiPriceVM.prices() :
                Enumerable.From(multiPriceVM.prices()).Where(function (price) {
                    return !price.IsDeleted && price.PriceTypeId;
                }).ToArray();

            var lookup = $("#multi-dynamic-lookup-itemprice");
            if ((prices.length > 0 || settings.isClone) && lookup.length > 0) {
                lookup.val(ko.toJSON(prices));
            }
        }

        multiPriceVM.cloneAllPrices = function () {
            $(multiPriceVM.prices()).each(function (index) {
                var price = multiPriceVM.prices()[index];
                price.ID = null;
            });

            multiPriceVM.saveAllPrices();
        }

        multiPriceVM.canAddPrice = function () {
            return (multiPriceVM.bookingtype ==2 || !multiPriceVM.isException()) && multiPriceVM.availablePriceTypes().length > 0;
        };

        multiPriceVM.IsVisibleShowOnline = function () {
            if (multiPriceVM.isException() && multiPriceVM.bookingtype == App.Planner.Constants.BookingType.facilityBooking.id) {
                return false;
            }
            return true;
        };

        function createPriceItem(id, price, priceType) {
            if (!price) {
                price = 0;
            }
            var priceItem = {
                ID: id,
                Price:  ko.observable(price),
                DropinFee: priceType.DropinFee,
                PriceTypeId: priceType.Id,
                ShowOnline: ko.observable(false),
                isValidPriceValue: ko.observable(true),
                numberofoccur: 1
            };

            handleShowOnlinePriceChange(priceItem);
            return priceItem;
        }

        function handleShowOnlinePriceChange(priceItem) {
            priceItem.ShowOnline.subscribe(function (showOnline) {
                multiPriceVM.onShowOnlineChange(priceItem);
            });
        }

        function sortPriceTypesByName(priceTypes) {
            priceTypes.sort(function (l, r) {
                var firstName = l.Name.toLowerCase().trim();
                var lastName = r.Name.toLowerCase().trim();
                return firstName == lastName ? 0 : (firstName < lastName ? -1 : 1);
            });
        }

        function saveModifiedPrices() {
            var dataCopy = ko.toJS(multiPriceVM.allModifiedPrices());
            // Convert prices back to standard json format
                $.each(dataCopy, function (i, p) {
                p.Price = kendo.parseFloat(p.Price) || 0;
            });
            $("#multi-dynamic-lookup-itemprice").val(ko.toJSON(dataCopy));
       }

        function updateModifiedPrices(itemPrice, isDeleted) {
            var match = null;
            if (typeof itemPrice.ID == 'undefined' || itemPrice.ID == null) {
                match = Enumerable.From(multiPriceVM.allModifiedPrices()).Where(function (o) { return o.PriceTypeId == itemPrice.PriceTypeId; }).FirstOrDefault();
            } else {
                match = Enumerable.From(multiPriceVM.allModifiedPrices()).Where(function (o) { return o.ID == itemPrice.ID; }).FirstOrDefault();
            }
            if (match) {
                if (isDeleted) {
                    match.IsDeleted = true;
                    // Also remove from allModifiedPrices if this record doesn't exist in the database
                    if (typeof match.ID == 'undefined' || match.ID == null) {
                        multiPriceVM.allModifiedPrices.remove(match);
                    }
                } else {
                    match.IsDeleted = false;
                    match.Price(itemPrice.Price());
                    match.IsCustomizedFee(itemPrice.IsCustomizedFee());
                }
            } else {
                if (isDeleted) {
                    itemPrice.IsDeleted = true;
                }
                multiPriceVM.allModifiedPrices.push(itemPrice);
            }
            saveModifiedPrices();
        }

        var multiPriceContainer = document.getElementById("multiPriceContainer");
        ko.cleanNode(multiPriceContainer);
        ko.applyBindings(multiPriceVM, multiPriceContainer);
        saveModifiedPrices();
    }
 });
}

var multiLocationGLAccountVM = {};
if (typeof require === "function") {
    require(["knockout"], function (ko) {
        window.initMultiLocationGLAccountPicker = function (data) {

            if (data.modifiedAccountAssignments) {
                $.each(data.modifiedAccountAssignments, function (i, accountAssignment) {
                    if (accountAssignment.IsDeleted) {
                        // Save the ID of this accountAssignment item in case it is added back!
                        var match = Enumerable.From(data.availableGLAccounts).Where(function (c) { return c.ID == accountAssignment.GLAccountId; }).First();
                        match.existingAccountAssignmentId = accountAssignment.ID;
                    }
                });
            }
            var modifiedAccountAssignments = data.modifiedAccountAssignments || [];
            multiLocationGLAccountVM = {
                accountAssignments: ko.observableArray(data.accountAssignments),
                allModifiedGLAccountAssignments: ko.observableArray(modifiedAccountAssignments)
            };

            multiLocationGLAccountVM.onGLAccountChange = function (glAssignment) {                
                var isDeleted = glAssignment.GLAccountId === '00000000-0000-0000-0000-000000000000';
                updateModifiedAccountAssignments(glAssignment, isDeleted);
            }

            function saveModifiedAccountAssignments() {
                var dataCopy = ko.toJS(multiLocationGLAccountVM.allModifiedGLAccountAssignments());
                $.each(dataCopy, function (i, p) {
                    delete p.myGLAccounts; // Don't send pick lists to server
                });
                $("#multi-dynamic-lookup-glaccountassignment").val(ko.toJSON(dataCopy));
            }

            function updateModifiedAccountAssignments(glAssignment, isDeleted) {
                var match;
                if (!(glAssignment.ID) || glAssignment.ID == '00000000-0000-0000-0000-000000000000') {
                    match = Enumerable.From(multiLocationGLAccountVM.allModifiedGLAccountAssignments()).Where(function (o) { return o.LocationId == glAssignment.LocationId; }).FirstOrDefault();
                } else {
                    match = Enumerable.From(multiLocationGLAccountVM.allModifiedGLAccountAssignments()).Where(function (o) { return o.ID == glAssignment.ID; }).FirstOrDefault();
                }
                if (match) {
                    if (isDeleted) {
                        match.IsDeleted = true;
                        // Also remove from allModifiedGLAccountAssignments if this record doesn't exist in the database
                        if (typeof match.ID == 'undefined' || match.ID == null) {
                            multiLocationGLAccountVM.allModifiedGLAccountAssignments.remove(match);
                        }
                    } else {
                        multiLocationGLAccountVM.allModifiedGLAccountAssignments.remove(match);
                        multiLocationGLAccountVM.allModifiedGLAccountAssignments.push(glAssignment);
                    }
                } else {
                    if (isDeleted) {
                        glAssignment.IsDeleted = true;
                    }
                    multiLocationGLAccountVM.allModifiedGLAccountAssignments.push(glAssignment);
                }
                saveModifiedAccountAssignments();
            }

            var multiLocationGLAccountContainer = document.getElementById("multiLocationGLAccountContainer");
            ko.cleanNode(multiLocationGLAccountContainer);
            ko.applyBindings(multiLocationGLAccountVM, multiLocationGLAccountContainer);
            if ($('#currentRecordId').val() === '') {
                // Mark default assignments as new
                $.each(multiLocationGLAccountVM.accountAssignments(), function (i, p) {
                    if (p.GLAccountId != '00000000-0000-0000-0000-000000000000') 
                        multiLocationGLAccountVM.allModifiedGLAccountAssignments.push(p);
                });
            }
            saveModifiedAccountAssignments();
        }
    });
}



var multiGLAccountVM = {};
if (typeof require === "function") {
    require(['knockout', 'CommonBindings'], function (ko) {
        window.initMultiGLAccountPicker = function (data, locationFilter) {

            if (data.serviceEventDeferredAccountId == undefined) {
                data.serviceEventDeferredAccountId = null;
                data.serviceEventDeferredAccountName = null;
            }

            if (data.serviceEventDeferredAccountId && data.serviceEventDeferredAccountId != null){
                $("#textbox-738ee80a-979a-4ad0-952d-10f14fffe5d3").val(data.serviceEventDeferredAccountName);
                $("#fld_738ee80a-979a-4ad0-952d-10f14fffe5d3").val(data.serviceEventDeferredAccountId);
            }
            
            if (data.modifiedAccountAssignments) {
                $.each(data.modifiedAccountAssignments, function (i, accountAssignment) {
                    if(accountAssignment.GLAccountId == '00000000-0000-0000-0000-000000000000') {
                        accountAssignment.GLAccountId = null;
                    }
                    if (accountAssignment.IsDeleted) {
                        // Save the ID of this accountAssignment item in case it is added back!
                        var match = Enumerable.From(data.availableGLAccounts).Where(function (c) { return c.ID == accountAssignment.GLAccountId; }).First();
                        match.existingAccountAssignmentId = accountAssignment.ID;
                    }
                    if (data.accountAssignments) {
                        // Share the same assignment object between modifiedAccountAssignments and accountAssignments
                        var uiAssignment = Enumerable.From(data.accountAssignments).Where(function (c) {
                            return c.GLAccountId == (accountAssignment.GLAccountId == '00000000-0000-0000-0000-000000000000' ? null : accountAssignment.GLAccountId);

                    }).FirstOrDefault();
                        if (uiAssignment) {
                            var index = data.accountAssignments.indexOf(uiAssignment);
                            data.accountAssignments[index] = accountAssignment;
                        }
                    }
                });
            }

            if (data.accountAssignments) {               
                $.each(data.accountAssignments, function (i, accountAssignment) {
                    if (accountAssignment.GLAccountId == '00000000-0000-0000-0000-000000000000') {
                        accountAssignment.GLAccountId = null;
                    }
                    // Convert decimal percent to formatted percent (expected by kendo controls)
                    accountAssignment.Percent = ko.observable(kendo.toString(accountAssignment.Percent, "n"));
                    accountAssignment.isValidGLAccountAssignmentValue = ko.observable(true);
                });
            }

            var modifiedAccountAssignments = data.modifiedAccountAssignments || [];

            multiGLAccountVM = {
                accountAssignments: ko.observableArray(data.accountAssignments),
                allGLAccounts: data.availableGLAccounts,// allGLAccounts will not change, doesn't need to be observable
                availableGLAccounts:ko.observableArray(data.availableGLAccounts), 
                variableAvailableGLAccounts: ko.observableArray([]),
                allModifiedGLAccountAssignments: ko.observableArray(modifiedAccountAssignments),
                isValidPercentage: ko.observable(true),
                maxAssignedAccount: data.maxAssignedAccount,
                showAddButton: ko.observable(true),
                locationFilter: locationFilter,
                isValidAccount: ko.observable(true),
                importMode :false
            };

            if (locationFilter) {
                multiGLAccountVM.availableGLAccounts = locationFilter == "" ? data.availableGLAccounts : Enumerable.From(data.availableGLAccounts).Where(function (c) { return c.Location == locationFilter || c.Location ==''; }).ToArray();;
            } else {
                multiGLAccountVM.availableGLAccounts = data.availableGLAccounts;
            }
          
            multiGLAccountVM.setFilterLocation = function (locationFilter) {              
                multiGLAccountVM.availableGLAccounts = locationFilter == undefined ? multiGLAccountVM.allGLAccounts : Enumerable.From(multiGLAccountVM.allGLAccounts).Where(function (c) { return c.Location == locationFilter || c.Location == ''; }).ToArray();;
                multiGLAccountVM.setAvailableGLAccounts(true);
           }

            multiGLAccountVM.getMyAvailableGLAccounts = function (ItemGLAccount, addSelf) {
                var GLAccountId = ItemGLAccount.GLAccountId;
                var availableGLAccounts = multiGLAccountVM.variableAvailableGLAccounts();
                if (addSelf) {
                    var myPrice = Enumerable.From(multiGLAccountVM.availableGLAccounts).Where(function (c) { return c.ID == GLAccountId; }).ToArray();
                    availableGLAccounts = availableGLAccounts.concat(myPrice);
                }
                multiGLAccountVMSortMyGLAccounts(availableGLAccounts);               
                return availableGLAccounts;
            }

            multiGLAccountVM.setAvailableGLAccounts = function (updateGLAccountAssignments) {
                var currentAvailableGLAccounts = Enumerable.From(multiGLAccountVM.accountAssignments()).Select(function (t) { return t.GLAccountId; }).ToArray();
                var availableGLAccounts = Enumerable.From(multiGLAccountVM.availableGLAccounts).Where(function (c) { return currentAvailableGLAccounts.indexOf(c.ID) == -1;}).ToArray();
                multiGLAccountVM.variableAvailableGLAccounts(availableGLAccounts);

                if (updateGLAccountAssignments) {
                    // Update the list of available accountAssignments in each accountAssignment row
                    Enumerable.From(multiGLAccountVM.accountAssignments()).ForEach(function (itemGLAccount) {
                        itemGLAccount.myGLAccounts(multiGLAccountVM.getMyAvailableGLAccounts(itemGLAccount, true));
                    });
                }                
                multiGLAccountVM.showAddButton((currentAvailableGLAccounts.length < multiGLAccountVM.maxAssignedAccount) || multiGLAccountVM.maxAssignedAccount==0);
            };
            multiGLAccountVM.setAvailableGLAccounts(false);

            // Each GLAccountAssignment needs it's own list of available GLAccountAssignments.  (Combine list of available GLAccountAssignments with itself)
            Enumerable.From(multiGLAccountVM.accountAssignments()).ForEach(function (itemGLAccount) {
                var myGLAccounts = multiGLAccountVM.getMyAvailableGLAccounts(itemGLAccount, true);
                itemGLAccount.myGLAccounts = ko.observableArray(myGLAccounts);  // one time initialization
            });

            multiGLAccountVM.onPercentChange = function (ItemGLAccount) {

                try {
                    if (!(ItemGLAccount === null || ItemGLAccount === undefined)) {

                        var percent = kendo.parseFloat(ItemGLAccount.Percent());

                        if (percent > 0 && percent <= 100) {
                            ItemGLAccount.isValidGLAccountAssignmentValue(true);
                        } else {
                            ItemGLAccount.isValidGLAccountAssignmentValue(false);
                        }
                    }
                }
                catch (err) {
                }

                updateModifiedAccountAssignments(ItemGLAccount, false);
            }

            multiGLAccountVM.removeOldAccountAssignments = function (editData) {

                $("#textbox-738ee80a-979a-4ad0-952d-10f14fffe5d3").val(editData.serviceEventDeferredAccountName);
                $("#fld_738ee80a-979a-4ad0-952d-10f14fffe5d3").val(editData.serviceEventDeferredAccountId);
              
                var allObjects = multiGLAccountVM.accountAssignments();
                var maxrecordCount = multiGLAccountVM.accountAssignments().length;
                var count = 0;
               
                while (count < maxrecordCount) {
                    maxrecordCount--;
                    var item = allObjects[maxrecordCount];
                    
                    multiGLAccountVM.removeAccountAssignment(item);
                   
                }
            
                count = 0;

                maxrecordCount = editData.accountAssignments == null ? 0 : editData.accountAssignments.length;
                multiGLAccountVM.importMode = true;
                while (count < maxrecordCount) {
                    var selectedGLAccount = Enumerable.From(multiGLAccountVM.availableGLAccounts).Where(function (c) {
                        return c.ID == editData.accountAssignments[count].GLAccountId;
                    }).First();

                    var accountAssignment = createAccountAssignment(selectedGLAccount.existingAccountAssignmentId, (maxrecordCount == 1) ? 100 : editData.accountAssignments[count].Percent, selectedGLAccount);
                    multiGLAccountVM.addItem(accountAssignment);
                    count++;
                }  
                multiGLAccountVM.importMode = false;
        }

            multiGLAccountVM.onGLAccountChange = function (ItemGLAccount) {
                // Recreate the list of available GLAccount types
                var oldId = ItemGLAccount.sender._initial;
                var newID = ItemGLAccount.sender.value();
                var checkNewIDExists = Enumerable.From(multiGLAccountVM.availableGLAccounts).Where(function(c) {
                    return c.ID == newID;
                }).ToArray();
                if (checkNewIDExists.length == 0) {
                    alert("Please select Valid GL Accounts");
                    if (oldId !=null && oldId !=""){
                        var removeAccount = Enumerable.From(multiGLAccountVM.accountAssignments()).Where(function (c) {
                            return c.GLAccountId == oldId;
                        }).First();
                    
                    var percentValue = removeAccount.Percent();
                    multiGLAccountVM.removeAccountAssignment(removeAccount)
                    var selectedGLAccount = Enumerable.From(multiGLAccountVM.variableAvailableGLAccounts()).Where(function (c) {
                        return c.ID == oldId; }).First();
                    var accountAssignment = null;
                    accountAssignment = createAccountAssignment(selectedGLAccount.existingAccountAssignmentId, (multiGLAccountVM.accountAssignments().length == 0) ? 100: percentValue, selectedGLAccount);
                    multiGLAccountVM.addItem(accountAssignment);
                    }

                    //ItemGLAccount.sender._initial = null;
                    return false;
                }

                if (oldId == null ||oldId == "") {
                    var removeNullAccount = Enumerable.From(multiGLAccountVM.accountAssignments()).Where(function (c) {
                    return c.GLAccountId == null;
                    }).First();
                    multiGLAccountVM.removeAccountAssignment(removeNullAccount)
                    var selectedGLAccount = Enumerable.From(multiGLAccountVM.variableAvailableGLAccounts()).Where(function (c) {
                        return c.ID == newID;
                    }).First();
                    var accountAssignment = null;
                    accountAssignment = createAccountAssignment(selectedGLAccount.existingAccountAssignmentId, (multiGLAccountVM.accountAssignments().length == 0) ? 100: null, selectedGLAccount);
                    multiGLAccountVM.addItem(accountAssignment);
                }
                else if (newID != '') {
                     var actualGLAccount = Enumerable.From(multiGLAccountVM.allModifiedGLAccountAssignments()).Where(function (c) { return c.GLAccountId == oldId;
                }).First();
                    actualGLAccount.GLAccountId = newID;
                    multiGLAccountVM.setAvailableGLAccounts(true);
                    updateModifiedAccountAssignments(actualGLAccount, false);
               }
                    ItemGLAccount.sender._initial = newID;
                }

            multiGLAccountVM.addItem = function (ItemGLAccount) {
                var myGLAccounts = multiGLAccountVM.getMyAvailableGLAccounts(ItemGLAccount, false);
                ItemGLAccount.myGLAccounts = ko.observableArray(myGLAccounts);

                multiGLAccountVM.accountAssignments.push(ItemGLAccount);
                multiGLAccountVM.setAvailableGLAccounts(true);
                updateModifiedAccountAssignments(ItemGLAccount, false);
            }

            multiGLAccountVM.resetAll = function () {
                var allObjects = multiGLAccountVM.accountAssignments();
                var maxrecordCount = multiGLAccountVM.accountAssignments().length;
                var count = 0;
                var index = 0;
                while (count < maxrecordCount) {
                    count++;
                    var item = allObjects[index];
                    var glObject = Enumerable.From(multiGLAccountVM.allGLAccounts).Where(function (c) { return c.ID == item.GLAccountId; }).FirstOrDefault();
                    if (glObject !=undefined && glObject.Location != "") {
                        multiGLAccountVM.removeAccountAssignment(item);
                    }
                    else {
                        index++;
                    }
                }               
            }

            multiGLAccountVM.addGLAccountItem = function () {
                if (multiGLAccountVM.validateGLAccount()) {
                    accountAssignment = createAccountAssignment(null, (multiGLAccountVM.accountAssignments().length == 0 ? 100 : null), null);
                multiGLAccountVM.addItem(accountAssignment);
            }
                else {
                    alert("You need to pick GL Account first before adding others");
                    return false;
                }
                $('#multiGLdropdown-list .k-textbox').attr('placeholder', 'Search By Name');
            }

            multiGLAccountVM.removeAccountAssignment = function (accountAssignment) {
                var removedGLAccountId = accountAssignment.GLAccountId;

                // Save the ID of this price item in case it is added back!
                if (accountAssignment.ID) {
                    var match = Enumerable.From(multiGLAccountVM.availableGLAccounts).FirstOrDefault(null,function (c) { return c.ID == removedGLAccountId;
                    });
                    if (match) {
                        match.existingAccountAssignmentId = accountAssignment.ID;
                    }
                }

                multiGLAccountVM.accountAssignments.remove(accountAssignment);
                if (multiGLAccountVM.accountAssignments().length == 1) {
                    multiGLAccountVM.accountAssignments()[0].Percent(100);
                    multiGLAccountVM.onPercentChange(multiGLAccountVM.accountAssignments()[0]);
                    updateModifiedAccountAssignments(multiGLAccountVM.accountAssignments()[0], false);
                    saveModifiedAccountAssignments();
                }
                multiGLAccountVM.setAvailableGLAccounts(true);
                updateModifiedAccountAssignments(accountAssignment, true);
            }

            multiGLAccountVM.validate = function () {

                var totalPercentage = 0;
                var length = multiGLAccountVM.accountAssignments().length;

                if (length == 1) {
                    multiGLAccountVM.accountAssignments()[0].Percent(100);
                    return true;
                }

                for (var intemIndex in multiGLAccountVM.accountAssignments()) {

                    var accountAssignmentItem = multiGLAccountVM.accountAssignments()[intemIndex];
                    totalPercentage += kendo.parseFloat(accountAssignmentItem.Percent());
                }

                return (length == 0 || Math.round(totalPercentage * 100) === 10000);
            }

            multiGLAccountVM.validateGLAccount = function () {                
                for (var intemIndex in multiGLAccountVM.accountAssignments()) {
                    var accountAssignmentItem = multiGLAccountVM.accountAssignments()[intemIndex];
                    if (accountAssignmentItem.GLAccountId == null) {
                        return false;
                    }
                }
                return true;
            }

            multiGLAccountVM.checkMaxAccountAssigned = function () {
                try {
                    var checkAccount = multiGLAccountVM.variableAvailableGLAccounts().length;
                    if (checkAccount > 0) {
                        if (multiGLAccountVM.maxAssignedAccount == 0) {
                            return true;
                        }
                        else {
                            return (multiGLAccountVM.accountAssignments().length < multiGLAccountVM.maxAssignedAccount);
                            
                        }
                    }                   
                    return false;
                }
                catch (err) {
                    alert(err +err.message);
                }
            }

            function createAccountAssignment(id, percent, availableGLAccount) {

                var accountAssignment = {
                    ID: id,
                    Percent: ko.observable(percent),
                        GLAccountId : availableGLAccount == null ? null: availableGLAccount.ID,
                    isValidGLAccountAssignmentValue: ko.observable(true)
                };

                return accountAssignment;
            }

            function multiGLAccountVMSortMyGLAccounts(myGLAccounts) {
                myGLAccounts.sort(function (l, r) {
                    return l.RecordName.toLowerCase() == r.RecordName.toLowerCase() ? 0: (l.RecordName.toLowerCase() < r.RecordName.toLowerCase() ? -1: 1);
                });
            }

            function saveModifiedAccountAssignments() {
                    var dataCopy = ko.toJS(multiGLAccountVM.allModifiedGLAccountAssignments());
                    // Convert AccountAssignments back to standard json format
                    $.each(dataCopy, function (i, p) {
                        p.Percent = kendo.parseFloat(p.Percent) || 0;
                        p.GLAccountId = p.GLAccountId == null ? "00000000-0000-0000-0000-000000000000" : p.GLAccountId;
                        delete p.myGLAccounts; // Don't send pick lists to server
                    });
                    $("#multi-dynamic-lookup-glaccountassignment").val(ko.toJSON(dataCopy));
                }

            function updateModifiedAccountAssignments(itemGLAccount, isDeleted) {

                var match;
                if (!(itemGLAccount.ID) || itemGLAccount.ID == '00000000-0000-0000-0000-000000000000') {
                        match = Enumerable.From(multiGLAccountVM.allModifiedGLAccountAssignments()).Where(function (o) { return o.GLAccountId == itemGLAccount.GLAccountId;
                    }).FirstOrDefault();
                } else {
                        match = Enumerable.From(multiGLAccountVM.allModifiedGLAccountAssignments()).Where(function (o) { return o.ID == itemGLAccount.ID;
                    }).FirstOrDefault();
                }
                if (match) {
                    if (isDeleted) {
                        match.IsDeleted = true;
                        // Also remove from allModifiedGLAccountAssignments if this record doesn't exist in the database
                        if (typeof match.ID == 'undefined' || match.ID == null) {
                            multiGLAccountVM.allModifiedGLAccountAssignments.remove(match);
                        }
                    } else {
                        multiGLAccountVM.allModifiedGLAccountAssignments.remove(match);
                        multiGLAccountVM.allModifiedGLAccountAssignments.push(itemGLAccount);
                    }
                } else {
                    if (isDeleted) {
                        itemGLAccount.IsDeleted = true;
                    }
                    multiGLAccountVM.allModifiedGLAccountAssignments.push(itemGLAccount);
                }
                if (!multiGLAccountVM.importMode) {

                    multiGLAccountVM.isValidAccount(multiGLAccountVM.validateGLAccount());
                    multiGLAccountVM.isValidPercentage(multiGLAccountVM.validate());
                }
                multiGLAccountVM.showAddButton(multiGLAccountVM.checkMaxAccountAssigned());
                saveModifiedAccountAssignments();
            }

            multiGLAccountVM.cloneAssignments = function () {
                $(multiGLAccountVM.accountAssignments()).each(function (index, item) {
                    item.ID = null;
                    item.RecordName = null;
                });

                saveModifiedAccountAssignments();
            }
            var multiGLAccountContainer = document.getElementById("multiGLAccountContainer");
            if (!multiGLAccountContainer) {
                return;
            }

            $(multiGLAccountContainer).closest('tr').removeClass('NoneSelected-wrapper -wrapper').addClass('multi-items-cell-wrapper');

            ko.cleanNode(multiGLAccountContainer);
            ko.applyBindings(multiGLAccountVM, multiGLAccountContainer);
            saveModifiedAccountAssignments();
        }
    });
}

if (!Date.prototype.getWeekOfMonth) {
    Date.prototype.getWeekOfMonth = function () {
        var firstDay = new Date(this.getFullYear(), this.getMonth(), 1).getDay();
        var week = 1 + Math.floor((this.getDate() + firstDay - 1) / 7);
        return this.getDay() < firstDay ? week - 1 : week;
    }
}