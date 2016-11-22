var ViewEdit = {};
ViewEdit.searchTextPlaceHolder = "Find...";

ViewEdit.criteriaKeyDown = function () {
    if (event.keyCode == 13)
        $(event.srcElement).closest('form').submit();
};
ViewEdit.criteriaKeyDown2 = function (e, applyCriteriaCallback) {
    if (e.keyCode == 13)
        applyCriteriaCallback();
};
ViewEdit.criteriaGotFocused = function () {
    if ($("#criteria").val() == ViewEdit.searchTextPlaceHolder) {
        $("#criteria").val('');
    }
};
ViewEdit.criteriaOnBlur = function () {
    if ($("#criteria").val() == "") {
        $("#criteria").val(ViewEdit.searchTextPlaceHolder);
    }
};

ViewEdit.stringContainsMergeField = function (text) {
    var re = new RegExp('(\{.+\})');
    var m = re.exec(text);
    return (m != null);
};

ViewEdit.openViewPopup = function (requestUrl, viewEditorPopupContainerId, loadingElementId, dialogTitle, isSystemView, isAllView, cellValueUrl) {
    var dialog, html;
    if (loadingElementId) {
        $('#' + loadingElementId).css("visibility", "visible");
    }
    showPageLoader();
    html = "<div id='filterEditorPopup' style='overflow: hidden;'></div>";
    $('#' + viewEditorPopupContainerId).append(html);

    var onCloseDialog = function () {
        $('body').removeClass('overflowHidden');
    };

    var onOpenDialog = function () {
        $("body").addClass('overflowHidden');
    };

    dialog = $('#filterEditorPopup');
    dialog.css("overflow", "auto");

    if (isSystemView && !isAllView) {
        $('.pm-dialog-buttonpane', dialog.parent().parent().parent()).prepend("<div style='float:left;margin-top:10px;font-weight:bold'><img src='/Content/Images/Site/LoginIcon.gif' style='vertical-align:top' /> This is a system view that can't be modified or deleted</div>");
    }

    $.ajax({
        url: requestUrl,
        dataType: 'html',
        async: false,
        complete: function (request, statusCode) {
            hidePageLoader();
            if (statusCode == 'success') {
                if (loadingElementId) {
                    $('#' + loadingElementId).css("visibility", "hidden");
                }

                dialog.html(request.responseText).kendoWindow({
                    title: "View Editor",
                    maxHeight: "100%",
                    width: "80%",
                    maxWidth: "1000px",
                    modal: true,
                    visible: false,
                    pinned: false,
                    draggable: false,
                    resizable: false,
                    actions: ["Close"],
                    close: onCloseDialog,
                    open: onOpenDialog,
                    activate: function (e) {
                        if (e && e.sender) {
                            // the kendoWindow must have a fixed height in order to 
                            // potentially render a scroll bar
                            e.sender.wrapper.css("height", (e.sender.wrapper.height() + 5) + "px"); // + 5 for padding
                            e.sender.center();
                        }
                    },
                    deactivate: function () {
                        this.destroy();
                    }
                });

                //hide the value cell if the operant is 'Is Empty' or 'Is Not Empty'
                //var operantOptionSelector = $('option[selected]', 'select#operandId');
                var operantOptionSelector = $('#operandId option:selected');
                var selectedOperantValue = parseInt(operantOptionSelector.val(), 10);

                if (selectedOperantValue === 11 || selectedOperantValue === 12) {
                    //hide the value cell
                    $('#filterValueCell', '#valueEditorContainer').hide();
                } else {

                    ViewEdit.disableEnter($('input:text', '#filterValueCell'));
                }

                $(".Checkbox-wrapper .field.checkbox label", "#criteriaListContainer").removeAttr('for');

                //Timout the opening to allow CSS to take effect
                setTimeout(function () {
                    dialog.data("kendoWindow").center().open();
                }, 150);

                //$('body').addClass('overflowHidden');
                $('#cancelFilterButton').focus();

                //no handler is required if filter is not editable, e.g. for (All) view
                if ($('select#selectedFieldInfoKey').val()) {
                    ViewEdit.onFilterFieldChanged(cellValueUrl, $('select#selectedFieldInfoKey').val(),
                        'operandSelectorContainer', 'valueEditorContainer', 'filterEditorLoadingImg');
                }
            }
            else {
                //failed
                if (loadingElementId) {
                    $('#' + loadingElementId).css("visibility", "hidden");
                }
                window.location.reload();
            }
        }, //complete
        error: function () {
            hidePageLoader();
        }
    }); //$.ajax

    return dialog;
};

function showPageLoader() {

    if ($('#pageLoaderWrap').length == 1 && $('#pageLoaderWrap:visible').length == 0) {
        if ($('#gridRecords').length == 1) {
            $('#gridRecords').append($('#pageLoaderWrap'));

            //  $('#pageLoaderWrap').siblings().addClass("visibilityHidden");
            $('#gridRecords').addClass("positionRelative");
            $('#pageLoaderWrap').fadeIn(100, "linear");
        }
        else {
            $('#pageLoaderWrap').fadeIn(100, "linear");
        }
    }
}

function hidePageLoader() {

    if ($('#pageLoaderWrap').length == 1 && $('#pageLoaderWrap:visible').length == 1) {
        if ($('#gridRecords').length == 1) {
            $('#gridRecords').removeClass("positionRelative");
            // $('#pageLoaderWrap').siblings().removeClass("visibilityHidden");
            // $('#pageLoaderWrap').hide();
            $('#pageLoaderWrap').fadeOut(100, "linear");
        }
        else {
            $('#pageLoaderWrap').fadeOut(100, "linear");
        }
    }
}


ViewEdit.onFilterObjectChanged = function (url, selectedObjectKey, primaryObjectId, fieldSelectorContainerId,
             operandSelectorContainerId, valueEditorContainerId, loadingImageId) {
    if (loadingImageId) {
        $('#' + loadingImageId).show();
    }
    var selectedObjectId = $('#ObjectKey option:selected').attr('data-objectId');
    var relatedFieldId = $('#ObjectKey option:selected').attr('data-relatedFieldId');
    $.ajax({
        url: url,
        data: { objectId: selectedObjectId, relatedFieldId: relatedFieldId, primaryObjectId: primaryObjectId },
        dataType: 'json',
        type: 'POST',
        success: function (data) {
            $('#' + fieldSelectorContainerId).html(data.FieldListHtml);
            $('#' + operandSelectorContainerId).html(data.OperandListHtml);
            //$('#' + valueEditorContainerId).html(data.ValueCellHtml);
            var valueEditorContainer = $('#' + valueEditorContainerId);
            valueEditorContainer.html(data.ValueCellHtml);
            ViewEdit.resizeTextArea(valueEditorContainer);
            ViewEdit.disableEnter($('input:text', $(valueEditorContainer)));

            //if operant list only contains Is Empty or Is Not Empty then hide the value control
            var options = $('option', '#' + operandSelectorContainerId);
            if (options.length == 2 && $(options[0]).attr('value') == '11' && $(options[1]).attr('value') == '12') {
                $('#filterValueCell', '#' + valueEditorContainerId).hide();
            }
            if ($(data.DialogId).length == 0) {
                $('body').append(data.TailHtmlDialog);
            }
        }, //success
        complete: function (request, statusCode) {
            if (loadingImageId) {
                $('#' + loadingImageId).hide();
            }
        }
    }); //$.ajax
};

ViewEdit.resizeTextArea = function (valueEditorContainer) {
    if ($('textarea', $(valueEditorContainer)).attr('rows') != undefined) {
        $('textarea', $(valueEditorContainer)).attr('rows', '2');
    }
};

ViewEdit.onFilterFieldChanged = function (url, selectedFieldKey,
             operandSelectorContainerId, valueEditorContainerId, loadingImageId) {
    var option = $('option[value="' + selectedFieldKey + '"]', '#selectedFieldInfoKey');
    var customData = option.attr('data-custom');
    if (loadingImageId) {
        $('#' + loadingImageId).show();
    }

    $.ajax({
        url: url,
        data: { filterFieldInfoJson: customData },
        dataType: 'json',
        type: 'POST',
        success: function (data) {            
            var valueEditorContainer = $('#' + valueEditorContainerId);
            valueEditorContainer.html(data.ValueCellHtml);
            $('#' + operandSelectorContainerId).html(data.OperandListHtml);
            ViewEdit.resizeTextArea(valueEditorContainer);
            ViewEdit.disableEnter($('input:text', $(valueEditorContainer)));
            //if operant list only contains Is Empty or Is Not Empty then hide the value control
            var options = $('option', '#' + operandSelectorContainerId);
            if (options.length == 2 && $(options[0]).attr('value') == '11' && $(options[1]).attr('value') == '12') {
                $('#filterValueCell', '#' + valueEditorContainerId).hide();
            }
            if ($(data.DialogId).length == 0) {
                $('body').append(data.TailHtmlDialog);
            }
                        
        }, //success
        complete: function (request, statusCode) {
            if (loadingImageId) {
                $('#' + loadingImageId).hide();
            }
        }
    }); //$.ajax
};
var setDefaultDateTime = function (value, element) {

    var filterValue = $('#filterValueCell .date-time-picker');
    if (filterValue.length) {
        var dateTime = $('.pmdatetimepicker', filterValue).val() + " " + value;
        var fieldValue = $('.pmdatetimepicker', filterValue);

        var fieldId = fieldValue.attr('name').split('-datepicker')[0];
        if (!dateTime.match("^[a-zA-Z]")) {
            $('#filterValueCell .date-time-picker input[id="' + fieldId + '"]').val(dateTime);
        }
    }
    element.val(value);
};
ViewEdit.onOperantChanged = function (selectedOperandId, valueEditorContainerId) {
    if (selectedOperandId == '11' || selectedOperandId == '12') {
        $('#filterValueCell', '#' + valueEditorContainerId).hide();
    }
    else {
        $('#filterValueCell', '#' + valueEditorContainerId).show();
    }

    if ($('#' + valueEditorContainerId + " .date-time-picker").length > 0) {
        var timepicker = $('#filterValueCell input.timePicker');
        var dateTime = timepicker.val();
        var is24HrFormat = timepicker.val().toLowerCase().indexOf("am") < 0 && timepicker.val().toLowerCase().indexOf("pm") < 0;

        if (selectedOperandId == '0' || selectedOperandId == '1') {
            timepicker.hide();

            // Set time to 12 pm (noon) by default, better match for what day the filter is on for multi-locations in different timezones
            if (is24HrFormat) {
                setDefaultDateTime('12:00',timepicker);
            } else {
                setDefaultDateTime('12:00 PM', timepicker);
            }
        } else if (!timepicker.is(':visible')) {
            if (is24HrFormat) {
                setDefaultDateTime('00:00', timepicker);
            } else {
                setDefaultDateTime('12:00 AM', timepicker);
            } // Reset back to midnight

          

            if (!$('#' + valueEditorContainerId + " .date-time-picker").is(".time-hidden")) {
                timepicker.show();
            }
            //else
            //{
            //    setDefaultDateTime('', timepicker);
            //}
        }
    } 
};
ViewEdit.addCriterionToList = function (url, criteriaListContainerId, loadingImageId) {
    var needEscape = false;
    var valueInput = $('#filterValueCell input[type=text]');
    var value = "";
    //if (valueInput.size() == 1) {
        //var inputClass = valueInput.attr('class');
        //needEscape = inputClass == undefined;
    //}
    var dataToPost = $('#filterValueCell').serializeArray();
    dataToPost[0].value = htmlEncode(dataToPost[0].value);
//    if (needEscape) {
//        var inputValue = dataToPost[0].value;
//        dataToPost[0].value = escape(inputValue);
//    }

    var selectedObjectOption = $('#ObjectKey option:selected');
    var selectedFieldOption = $('#selectedFieldInfoKey option:selected');
    var selectedOperantOption = $('#operandId option:selected');
    var customData = selectedFieldOption.attr('data-custom');
    var operantId = $('select#operandId').val();
    dataToPost.push({ name: "filterFieldInfoJson", value: customData });
    dataToPost.push({ name: "operantId", value: operantId });
    dataToPost.push({name:"IsAddFilterToList",value:true });
    if (loadingImageId) {
        $('#' + loadingImageId).show();
    }

        $.ajax({
            url: url,
            data: dataToPost,
            dataType: 'json',
            type: 'POST',
            async: false,
            success: function(data) {
                var filterFieldValue = data.FilterFieldValue;
                var filterFieldDisplayValue = data.FilterFieldDisplayValue;
                var valueCellHtml = data.ValueCellHtml;
                if (filterFieldValue.indexOf('<[error]>') >= 0) {
                    alert(filterFieldValue.replace('<[error]>', ''));
                    return;
                }
                if (filterFieldValue.indexOf('VemProperValueIsRequired') >= 0) {
                    alert('Proper value is required.');
                    return;
                }

                if (ViewEdit.isCriterionAlreadyAdded(criteriaListContainerId, filterFieldValue, filterFieldDisplayValue, selectedObjectOption, selectedFieldOption, selectedOperantOption, valueCellHtml)) {
                    alert('This criteria has already been added.');
                    return;
                }
                if ($('#criteriaListContainer > table > tbody > tr').length > 12) {
                    alert('The maximum criteria count is 12.');
                    return;
                }
                ViewEdit.AddCriterionToList(criteriaListContainerId, filterFieldValue, selectedObjectOption, selectedFieldOption, selectedOperantOption, valueCellHtml);
                
    }, //success
        complete: function (request, statusCode) {
            if (loadingImageId) {
                $('#' + loadingImageId).hide();
            }
        }
    }); //$.ajax
};
ViewEdit.isCriterionAlreadyAdded = function (criteriaListContainerId, filterFieldValue, filterFieldDisplayValue, selectedObjectOption, selectedFieldOption, selectedOperantOption, valueCellHtml) {
    var isAdded = false;
    var newObjDisplay = $.trim(selectedObjectOption.html());
    var newFieldDisplay = $.trim(selectedFieldOption.html());
    var newOperantDisplay = $.trim(selectedOperantOption.html());
    var newValueData = $.trim(filterFieldValue.replace(/'/g, "\\'"));
    var newDisplayValueData = $.trim((filterFieldDisplayValue == null) ? "" : filterFieldDisplayValue);
    var tempNewDisplayValueData = newDisplayValueData;
    var newValueCellDataDiv = $(valueCellHtml).find('div');

    if (newValueCellDataDiv.length > 1) {
        newValueCellDataDiv = newValueCellDataDiv.find('div');
    }
    else if (newValueCellDataDiv.length == 0) {
        newValueCellDataDiv = $(valueCellHtml).find('td.field');
    }

    var newValueCellData = $.trim(newValueCellDataDiv.text());

    $('#criteriaListContainer > table > tbody > tr').each(function (index) {
        var tds = $('td', $(this));
        var objDisplay = $.trim($(tds[1]).html());
        if (!objDisplay)
            return;
        var fieldDisplay = $.trim($(tds[2]).html());
        var operantDisplay = $.trim($(tds[3]).html());
        var valueData = $.trim($(tds[4]).attr('data-custom'));
        var existValueData = $(tds[4]).text().trim();
        var existValueDataWithoutLineBreaks = $(tds[4]).text().trim().replace(/(\r\n|\n|\r)/gm, "");      
        var existValueDataWithoutSpace = $(tds[4]).text().trim().replace(/\s+\(/, "(");
        if (valueData == "") {
            //BUG-031131
            if ((objDisplay == "Transaction" || objDisplay == "Transactions") && newFieldDisplay == "Subtotal" && operantDisplay == "equals") {
                valueData = tds.find('input:hidden').val();
            }
            else {
                var hiddenvalue = tds.find('input:hidden').val();
                if (hiddenvalue != "" && typeof hiddenvalue != 'undefined') {
                    valueData = hiddenvalue;
                }
            }

            if (objDisplay == "Attendance" && newFieldDisplay == "Attendee Type" && operantDisplay == "equals") {
                tempNewDisplayValueData = $('#fld_1613c104-98d3-49da-98d4-9c1c8431843d_ObjectID').text().trim();
            }
        }

        if (tempNewDisplayValueData.indexOf("^^^,") > -1) {
            tempNewDisplayValueData = $.trim(htmlDecode(tempNewDisplayValueData).replace(/\^\^\^,/g, " "));
        }

        if (newDisplayValueData.indexOf("^^^,") > -1) {
            valueData = unescape(valueData);
            valueData = $.trim(valueData).replace(/'/g, "\\'");
            valueData = valueData.replace(/&#/g, "&amp;#");
            existValueDataWithoutLineBreaks = $(tds[4]).text().trim().replace(/(\r\n|\n|\r)/gm, " ").replace("&gt;", ">").replace("&lt;", "<");
        }

        //BUG-032385
        if (objDisplay == "Contact" && newFieldDisplay == "Quick Note" && operantDisplay == "equals") {
            if (valueData != '') {
                valueData = $.trim(htmlDecode(decodeURIComponent((valueData))));
            }
        }

        //if (existValueData == "") existValueData = ($.trim($('input', tds[4]).val()) == "on") ? "True" : "False";
        if (existValueData == "" && newValueData != "") existValueData = ($('input', tds[4]).attr("checked") == "checked") ? "True" : "False";
        if (objDisplay == newObjDisplay && fieldDisplay == newFieldDisplay && operantDisplay == newOperantDisplay &&
            (
                (valueData == escape(newValueData) || valueData == newValueData ||
                    existValueData == escape(newValueData) || existValueData == newValueData ||
                    existValueDataWithoutLineBreaks == escape(newValueData) || existValueDataWithoutLineBreaks == newValueData ||
                    valueData == escape(newDisplayValueData) || valueData == newDisplayValueData ||
                    existValueData == escape(newDisplayValueData) || existValueData == newDisplayValueData ||
                    existValueDataWithoutLineBreaks == escape(newDisplayValueData) || existValueDataWithoutLineBreaks == newDisplayValueData ||
                    existValueDataWithoutSpace == escape(newDisplayValueData) || existValueDataWithoutSpace == newDisplayValueData ||
                    valueData == escape(tempNewDisplayValueData) || valueData == tempNewDisplayValueData ||
                    existValueData == escape(tempNewDisplayValueData) || existValueData == tempNewDisplayValueData ||
                    existValueDataWithoutLineBreaks == escape(tempNewDisplayValueData) || existValueDataWithoutLineBreaks == tempNewDisplayValueData ||
                    existValueDataWithoutSpace == escape(tempNewDisplayValueData) || existValueDataWithoutSpace == tempNewDisplayValueData ||
                    valueData == newValueCellData || newValueCellData == existValueData)
                ||
                ($('#filterValueCell .datetime').length > 0 && existValueData == newDisplayValueData.split(' ')[0]
                    && newDisplayValueData.indexOf("(Ignore Year)") < 0) //exception case for datetime fields
            )) {
            isAdded = true;
            return false;
        }


    });
    return isAdded;
};

ViewEdit.AddCriterionToList = function (criteriaListContainerId, filterFieldValue, selectedObjectOption, selectedFieldOption, selectedOperantOption, valueCellHtml) {
    var newObjDisplay = selectedObjectOption.html();
    var newFieldDisplay = selectedFieldOption.html();
    var newOperantDisplay = selectedOperantOption.html();
    var newValueData = filterFieldValue.replace(/'/g, "&#39;");
    var html = '<tr style="border-bottom:1px solid gray;">';
    var valueCellElem = $(valueCellHtml);
    var multipleSelectElem = valueCellElem.find('.multipleselectpicklist');
    if (multipleSelectElem.length) {
        var valueCellText = valueCellElem.find('.field-control-wrapper div').find('input').val().replace(/\^\^\^/g, " ");
        valueCellElem.find('.field-control-wrapper div').text(valueCellText);
    }
    else {
        var valueCellDiv = valueCellElem.find('.field-control-wrapper div');
        while (valueCellDiv.length > 1) {
            valueCellDiv = valueCellDiv.find('div');
        }
        valueCellElem.find('.field-control-wrapper div').text(htmlDecode(valueCellDiv.text()));
    }
    
    var checkboxElemField = $(".Checkbox-wrapper .field.checkbox", valueCellElem);
    if (checkboxElemField.length) {
        var checkboxElemLabel = checkboxElemField.find('label');
        if (checkboxElemLabel.length)
            checkboxElemLabel.removeAttr('for');
    }

    var getValueCellElementHtml = valueCellElem.html() != null ? valueCellElem.html() : "";
    html += "<td>aa</td>";
    html += "<td>" + newObjDisplay + "</td>";
    html += "<td data-custom='" + selectedFieldOption.attr('data-custom') + "'>" + newFieldDisplay + "</td>";
    html += "<td data-custom='" + selectedOperantOption.attr('value') + "'>" + newOperantDisplay + "</td>";
    html += "<td data-custom='" + escape(newValueData) + "' style='white-space:nowrap;' class='criterionValueContainer'>" + getValueCellElementHtml + "</td>";
    html += '<td align="center"><button class="delete-criterion-button pm-plain-button" type="button"><i class="fa fa-times"></i></button></td>';
    html += '<td></td></tr>';
    $('#criteriaListContainer > table > tbody > tr:last').after(html);

    resetCriteriaTableRowNumber(false);
};

ViewEdit.removeCriterionFromList = function (button) {
    $(button).parents("tr:first").remove();
    resetCriteriaTableRowNumber(true);
    if ($('#criteriaListContainer > table > tbody > tr').length > 2) {
        alert('Please check the advanced filter settings.');
    }
};

function resetCriteriaTableRowNumber(isDelete) {
    var rowCount = $('#criteriaListContainer > table > tbody > tr').length;
    if (rowCount > 2) {
        $('#advancedFilteringContainer').css("visibility", "visible");
        $('#divCriteriaNumberSign').css("visibility", "visible");
        if ($.trim($('input#advancedFilteringFormular').val()) == '') {
            $('input#advancedFilteringFormular').val("1 And 2");
        }
        else if(!isDelete) {
            $('input#advancedFilteringFormular').val($('input#advancedFilteringFormular').val() + " And " + (rowCount - 1).toString());
        }
    }
    else {
        $('#advancedFilteringContainer').css("visibility", "hidden");
        $('#divCriteriaNumberSign').css("visibility", "hidden");
        $('input#advancedFilteringFormular').val("");
    }
    var rowNumber = 0;
    $('#lstCriterionNumbers').html('');
    $('#criteriaListContainer > table > tbody > tr').each(function () {
        if ($(this).find("td:first").html() != null) {
            rowNumber++;
            $(this).find("td:first").text(rowNumber.toString());
            $('#lstCriterionNumbers').append('<option value="0">' + rowNumber.toString() + '</option>');
        }
    });
}

ViewEdit.editFormularTextBox = function (theText) {
    theText = theText.trim() + " ";
    insertAtCaret("advancedFilteringFormular", theText);
};

ViewEdit.viewDropDownItemOnMouseOver = function (theTr, selectedItemId) {
    var selectedId = "tr" + $("#viewId").val();
    if ($("#viewId").length > 0) {
        selectedItemId = selectedId;
    }
    if (selectedItemId == theTr.id) {
        return;
    }
    $(theTr).addClass('selected');
    var tds = $('td', $(theTr));
    if (tds.length > 1) {
        $('span', tds[0]).css("visibility", "visible");
        if (tds[2] != null)
        $('img', tds[2]).css("visibility", "visible");
    }
};

ViewEdit.viewDropDownItemOnMouseOut = function (theTr, selectedItemId) {
    var selectedId = "tr" + $("#viewId").val();
    if ($("#viewId").length > 0) {
        selectedItemId = selectedId;
    }
    if (selectedItemId == theTr.id) {
        return;
    }
    $(theTr).removeClass('selected');
    var tds = $('td', $(theTr));
    if (tds.length > 1) {
        $('span', tds[0]).css("visibility", "hidden");
        if (tds[2] != null)
        $('img', tds[2]).css("visibility", "hidden");
    }
};

ViewEdit.onSaveView = function (saveAs, url, savingFilterImgId, callback) {
    var viewName = $('#ViewName').val();
    viewName = viewName.trim();
    $('#ViewName').val(viewName);
    if (viewName == '') {
        alert('Please specify the view name.');
        return;
    }

    if ((viewName.toLowerCase() == "(all)" || viewName.toLowerCase() == "all") && !$('#ViewName').attr('readonly')) {
        alert('The view name (All) is reserved. Please enter a different name.');
        $('#ViewName').focus();
        return;
    }

    var viewId = $('#editViewId').val();

    var isNameTaken = false;
        $('.viewlink').each(function (index) {
            var strTitle = $.trim(this.innerHTML.toLowerCase());
            var strId = $(this).attr('id').substring(2);
            if (strTitle == viewName.toLowerCase() && (saveAs || strId != viewId)) {
                isNameTaken = true;
                return false;
            }
        });
    
    if (isNameTaken) {
        alert('The view name is already taken. Please enter a different name.');
        $('#ViewName').focus();
        return;
    }

    if ($('#chkIsSharedToProfile').is(":checked") && viewName.replace(" ", "").toLowerCase() != "(all)") {
        var blnAtLeastOneProfileChecked = false;
        $('#currentSharedProfilePopup > table > tbody > tr').each(function (index) {
            if (!blnAtLeastOneProfileChecked) {
                var firstTd = $('td:first', $(this));
                var checkbox = $('input', firstTd);
                blnAtLeastOneProfileChecked = checkbox.attr("checked");
            }
        });
        if (!blnAtLeastOneProfileChecked) {
            alert('Please select profiles to share this view with.');
            return;
        }
    }
    viewName = escape($('#ViewName').val());
    var filterId = $('#FilterId').val();
    var primaryObjectId = $('#PrimaryObjectId').val();
    var advancedFilter = $('#advancedFilteringFormular').val();
    var viewType = 0;
    if ($('#imgListViewType').attr('src').indexOf("/togglelist.jpg") > -1) {
        viewType = 0;
    }
    if ($('#imgCardViewType').attr('src').indexOf("/togglecard.jpg") > -1) {
        viewType = 1;
    }
    var criteriaNumber = $('#criteriaListContainer > table > tbody > tr').length;
    var filterData = {
        viewId: viewId,
        viewName: viewName,
        filterId: filterId,
        primaryObjectId: primaryObjectId,
        criteriaNumber: criteriaNumber,
        criteriaListForSave: new Array(),
        existingFilterFieldIds: '',
        selectedProfile: new Array(),
        advancedFilteringFormular: advancedFilter,
        viewType: viewType,
        viewColumns: new Array(),
        viewSortColumns: new Array(),
        viewGroupcolumns: new Array(),
        saveAs: saveAs
    };

    $('#criteriaListContainer > table > tbody > tr').each(function (index) {
        var lastTd = $('td:last', $(this));
        if ($('input', lastTd).length > 0) {//existing criteria.
            if (filterData.existingFilterFieldIds.length > 0)
                filterData.existingFilterFieldIds += ',';
            filterData.existingFilterFieldIds += $('input', lastTd).val();
            return;
        }
        var tds = $('td', $(this));
        var fieldInfoJson = $(tds[2]).attr('data-custom');
        if (!fieldInfoJson)
            return;
        var operantType = $(tds[3]).attr('data-custom');
        var valueData = $(tds[4]).attr('data-custom').replace(/&#g4;&#4g;/g, "MULTIPICKLISTSPLITOR"); //single quotes are replaced with \'.
        var creteriaData = {
            FieldInfoJson: fieldInfoJson,
            OperantType: operantType,
            ValueData: valueData
        };
        filterData.criteriaListForSave.push(creteriaData);
    });

    $('#currentSharedProfilePopup > table > tbody > tr').each(function (index) {
        var firstTd = $('td:first', $(this));
        var checkbox = $('input:checkbox', firstTd);
        if (checkbox.attr("checked")) {
            var profileId = checkbox.attr("id").replace("profileChk", "");
            var profileName = checkbox.attr("profilename");
            var profileType = checkbox.attr("profiletype");
            var locationName = checkbox.attr("locationname");
            var sortingValue = checkbox.attr("sortingvalue");
            var margin = checkbox.attr("margin");
            var profileData = {
                Id: profileId,
                ProfileName: profileName,
                ProfileType: profileType,
                LocationName: locationName,
                SortingValue: sortingValue,
                Margin: margin
            };
            filterData.selectedProfile.push(profileData);
        }
    });

    $('#divViewColumnContainer > table > tbody > tr:first > td').each(function (index) {
        var fieldId = $(this).attr('id').split('_')[1];
        var relatedFieldId = $(this).attr('relatedFieldId');
        var objectNodePath = $(this).attr('objectNodePath');
        var width = $(this).attr('width');
        var columnData = {
            fieldId: fieldId,
            relatedFieldId: relatedFieldId,
            objectNodePath: objectNodePath,
            width: width
        };
        if (fieldId != "tdAddNewColumnButton" && fieldId != undefined) {
            filterData.viewColumns.push(columnData);
        }
    });

    $('#spnViewColumnsOrderContainerIn > span').each(function (index) {
        var fieldId = $(this).attr('id').split('_')[1];
        var relatedFieldId = $(this).attr('relatedFieldId');
        var objectNodePath = $(this).attr('objectNodePath');
        var type = "s";
        var direction = "";
        if ($(this).find("img")[0].src.indexOf("sort-up-transparent.png") > -1) {
            direction = "A";
        }
        if ($(this).find("img")[0].src.indexOf("sort-down-transparent.png") > -1) {
            direction = "D";
        }
        if (fieldId != "") {
            var columnData = {
                fieldId: fieldId,
                Type: type,
                Direction: direction,
                relatedFieldId: relatedFieldId,
                objectNodePath: objectNodePath

            }
            filterData.viewSortColumns.push(columnData);
        }
    });

    $('#spnViewColumnsGroupContainerIn > span').each(function (index) {
        var fieldId = $(this).attr('id').split('_')[1];
        var relatedFieldId = $(this).attr('relatedFieldId');
        var objectNodePath = $(this).attr('objectNodePath');
        var type = "g";
        var direction = "";
        if ($(this).find("img")[0].src.indexOf("sort-up-transparent.png") > -1) {
            direction = "A";
        }
        if ($(this).find("img")[0].src.indexOf("sort-down-transparent.png") > -1) {
            direction = "D";
        }
        if (fieldId != "") {
            var columnData = {
                fieldId: fieldId,
                Type: type,
                Direction: direction,
                relatedFieldId: relatedFieldId,
                objectNodePath: objectNodePath
            };
            filterData.viewGroupcolumns.push(columnData);
        }
    });


    if (savingFilterImgId) {
        $('#' + savingFilterImgId).show();
    }

    if ($.browser.opera) {
        url += "2";
        $.ajax({
            url: url,
            data: filterData,
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                if (!data.success) {
                    $('#ViewName').val(unescape(viewName));
                    alert(data.errorMsg);
                    window.location.reload();
                    return false;
                }
            }, //success
            complete: function (data) {

                if (data.responseText.indexOf('"success":false,"errorMsg":') == -1) {
                    window.location.reload();
                }
                else {
                    window.location.reload();
                    if (savingFilterImgId) {
                        $('#' + savingFilterImgId).hide();
                    }
                }
            }
        });
        return;
    }

    $.ajax({
        url: url,
        data: filterData,
        dataType: 'json',
        type: 'POST',
        success: function (data) {
            if ($.isFunction(callback)) {
                callback.call(this, data);
            }
            if (!data.success) {
                $('#ViewName').val(unescape(viewName));
                alert(data.errorMsg);
                //LoadRecordPage(data.redirectToUrl, data.viewId);
            }
            else {
                var isNew = filterId == '00000000-0000-0000-0000-000000000000';
                LoadRecordPage(data.redirectToUrl, data.viewId);
            }
        }, //success
        complete: function (request, statusCode) {
            if (savingFilterImgId) {
                $('#' + savingFilterImgId).hide();
            }
        }
    }); //$.ajax
};

function updateIframeCodeAndPreview(viewId) {
    var iframeUrl = $(".schedule-view-setup").data("iframe-url");
    var iframeContainer = $("#scheduleViewIframePreview .iframe-container");
    var objectSelector = $("select[name='objectSelector']");
    var displayText = $("input[name='displayText']");
    var skinSelector = $("select[name='skinSelector']");
    var layout = $("input[name='layout']");
    var height = $("input[name='height']");
    var width = $("input[name='width']");
    var txtEmbed = $("#txtEmbed");
    var iframeCodeTemplate = '<iframe src="' + iframeUrl + '?layoutType=@layoutType&objectId=@objectId&viewId=@viewId&text=@text&skinId=@skinId" style="width:@width; height:@height; border-style:none"></iframe>';
    var newCode = iframeCodeTemplate
                    .replace("@layoutType", layout.filter(":checked").val())
                    .replace("@objectId", objectSelector.val())
                    .replace("@viewId", viewId)
                    .replace("@text", displayText.val())
                    .replace("@skinId", skinSelector.val())
                    .replace("@width", width.val() + "px")
                    .replace("@height", height.val() + "px");
    txtEmbed.val(newCode);
    iframeContainer.html(newCode);
    $("#viewSelectorId").val(viewId);
        
    var val = $('option:selected', $('#viewSelectorId')).text();
    $('.pm-enhanced-select-option').removeAttr("style");
    var pickerList = $('.pm-enhanced-select-option > span.ellipsis');    
    if (val == "(All)") {
        $('.pm-enhanced-select-option').eq(0).css("background-color", "#1E90FF");       
        return;
    }
    pickerList.each(function (i) {
        if ($('.pm-enhanced-select-option > span.ellipsis')[i].textContent == val) {
            $('.pm-enhanced-select-option').eq(i + 1).css("background-color", "#1E90FF");
            return;
        }       
    })
}

function LoadRecordPage(url, viewId) {
    if ($("#viewId").length > 0) {
        var form = $($("#viewId")[0].form);
        if (window.location.href.indexOf('?') > -1) {
            var queryString = window.location.href.slice(window.location.href.indexOf('?'));
            if (queryString.charAt(queryString.length - 1) == '#') {
                queryString = queryString.slice(0, -1);
            }
            var actionUrl = form.attr('action');
            form.attr('action', actionUrl + queryString);
        }
        $("#viewId").val(viewId);
        document.getElementById("criteria").value = '';
        document.getElementById("sortField").value = '';
        form.submit();
    } else {
        updateIframeCodeAndPreview(viewId);
    }
    return false;
}

ViewEdit.deleteList = function (url, listId, loadingFilterPopupImgId, successDeleteCallback) {
    if (loadingFilterPopupImgId) {
        $('#' + loadingFilterPopupImgId).show();
    }
    $.ajax({
        url: url,
        dataType: 'json',
        type: 'POST',
        success: function (data) {
            if (!data.success) {
                alert(data.errorMsg);
            }
            else {
                $('option[selected]', 'select#recipientListId').remove();
                $('option[value="00000000-0000-0000-0000-000000000000"', 'select#recipientListId').attr('selected', 'selected');
                successDeleteCallback();
            }
        }, //success
        complete: function (request, statusCode) {
            if (loadingFilterPopupImgId) {
                $('#' + loadingFilterPopupImgId).hide();
            }
        }
    }); //$.ajax
};
ViewEdit.dateTimePicker = function (datePickerInput, timePickerInput, resultInput, dateFormat, timeFormat, originalDateFormat, jqueryTimeFormat) {
    datePickerInput.datepicker({
        changeMonth: true,
        changeYear: true,
        gotoCurrent: true,
        showOtherMonths: true,
        shortYearCutoff: 99,
        yearRange: '1900:2100',
        dateFormat: dateFormat,
        onClose: function () {
            // Only auto format if there is a valid date
            if (isValidDate(datePickerInput)) {
                $(this).datepicker("option", "dateFormat", dateFormat);
            }
            resultInput.val(datePickerInput.val());
        },
        onSelect: function (dateText, inst) {
            var midnight = new Date();
            midnight.setHours(0, 0, 0, 0);
            timePickerInput.val("12:00 AM");
            resultInput.val(dateText + " " + midnight.format(timeFormat));
        }
    });

    timePickerInput.timepicker({
        timeFormat: jqueryTimeFormat,
        startHour: 8,
        interval: 30,
        startMinutes: 0,
        change: function (time) {

            if (datePickerInput.val() == '') {
                resultInput.val('');
            } else {
                var thedate = datePickerInput.datepicker("getDate");
                var thetime = new Date();

                thetime.setTime(time.getTime());
                thetime.setFullYear(thedate.getFullYear(), thedate.getMonth(), thedate.getDate());

                resultInput.val(thetime.format(originalDateFormat + " " + timeFormat));
            }
        }
    });
};

ViewEdit.onTemplateFolderPopupLocationChanged = function (url, selectedLocationId, profileSelectorContainerId) {
    $.ajax({
        url: url,
        data: { locationId: selectedLocationId },
        dataType: 'json',
        type: 'POST',
        success: function (data) {
            $('#' + profileSelectorContainerId).html(data.ProfileListHtml);

        }, //success
        complete: function (request, statusCode) {
        }
    }); //$.ajax
};

ViewEdit.isFolderProfilePermissionAlreadyAdded = function (templateProfilePermissionsContainerId, locationId, profileId) {
    var isAdded = false;
    $('#' + templateProfilePermissionsContainerId + ' > table > tbody > tr').each(function (index) {
        var tds = $('td', $(this));
        var locationIdOfTd = $(tds[0]).attr('data-custom');
        var profileIdOfTd = $(tds[1]).attr('data-custom');

        if (profileIdOfTd == profileId) {
            isAdded = true;
            return false; //exit the loop
        }
    });
    return isAdded;
};

ViewEdit.addFolderProfilePermissionToList = function (url, templateProfilePermissionsContainerId) {
    var locationSelector = $('select#eb8f2576-660c-43d5-bd01-1fba1b00cf1c');
    var profileSelector = $('select#selectedProfileKey');
    var permissionSelector = $('select#selectedTemplateFolderPermissionKey');
    var locationId = locationSelector.val();
    var profileId = profileSelector.val();
    var permissionValue = permissionSelector.val();
    //check duplicate
    if (ViewEdit.isFolderProfilePermissionAlreadyAdded(templateProfilePermissionsContainerId, locationId, profileId)) {
        alert('This profile has already been granted access.');
        return;
    }

    var selectedLocationOption = $('option[selected]', 'select#eb8f2576-660c-43d5-bd01-1fba1b00cf1c');
    var selectedProfileOption = $('option[selected]', '#selectedProfileKey');
    var selectedPermissionOption = $('option[selected]', 'select#selectedTemplateFolderPermissionKey');
    var html = "<tr><td data-custom='" + locationId + "'>" + selectedLocationOption.html() + "</td>";
    html += "<td data-custom='" + profileId + "'>" + selectedProfileOption.html() + "</td>";
    html += "<td data-custom='" + permissionValue + "'>" + selectedPermissionOption.html() + "</td>";
    html += '<td><button class="deleteTemplateFolderProfilePermissionButton button-delete-icon pm-plain-button" type="button"></td>';
    html += '<td></td></tr>';

    $('#' + templateProfilePermissionsContainerId + ' > table > tbody > tr:last').after(html);
};

ViewEdit.removeFolderProfilePermissionFromList = function (button) {
    $(button).parents("tr:first").remove();
};


ViewEdit.showSharedToProfileList = function (theChkbox) {
    if (theChkbox.checked) {
        $('#divSharedToProfileList').show();
    }
    else {
        $('#currentSharedProfilePopup > table > tbody > tr').each(function (index) {
            var firstTd = $('td:first', $(this));
            var checkbox = $('input', firstTd);
            checkbox.attr("checked", false);
        });

        $('#divSharedToProfileList').hide();
    }
};

ViewEdit.SwitchViewTypeImage = function (viewTypeImage) {
    if (viewTypeImage.id == "imgListViewType") {
        if (viewTypeImage.src.indexOf("untogglelist.jpg") > -1) {
            viewTypeImage.src = viewTypeImage.src.replace("untogglelist.jpg", "togglelist.jpg");
            document.getElementById("imgCardViewType").src = document.getElementById("imgCardViewType").src.replace("togglecard.jpg", "untogglecard.jpg");
        }
    }
    if (viewTypeImage.id == "imgCardViewType") {
        if (viewTypeImage.src.indexOf("untogglecard.jpg") > -1) {
            viewTypeImage.src = viewTypeImage.src.replace("untogglecard.jpg", "togglecard.jpg");
            document.getElementById("imgListViewType").src = document.getElementById("imgListViewType").src.replace("togglelist.jpg", "untogglelist.jpg");
        }
    }
};

ViewEdit.getKeyCode = function (event) {
    return event ? event.which : event.keyCode;
};

ViewEdit.disableEnter = function (input) {
    if (input.attr('id') != undefined) {
        input.bind('keydown', function (event) {
            if (ViewEdit.getKeyCode(event) == 13) {
                event.preventDefault();
            }
        });
    }

};



