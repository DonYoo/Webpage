PerfectMind.Ajax.Control.MultiLookupBuilder = function () {

    // implementation of interface IControlBuilder

    this.BuildElementForPagelet = function (multilookupElement) {
        initMultilookup(getSettings(multilookupElement));
    };

    this.BuildElementForPage = function (multilookupElement) {
        initMultilookup(getSettings(multilookupElement));
    };

    this.render = function (settings) {
        return initMultilookup(settings);
    };

    this.renderElement = function (element, customSettings) {
        var elementSettings = getSettings(element);
        var settings = $.extend({}, elementSettings, customSettings);
        var selectedValue = settings.selectedRecords ? settings.selectedRecords[settings.valueField || "ID"] : null;

        var multilookup = initMultilookup(settings);

        if (selectedValue) {
            multilookup.value(selectedValue);
        }

        return multilookup;
    };

    function getSettings(multilookupElement) {
        var element = $(multilookupElement);
        var selectedRecordsText = $('<div/>').html(element.attr("selected-records")).text();
        var tableName = element.attr("tableName") != null ? element.attr("tableName") : element.attr("objectName");

        return {
            element: element,
            lookupId: element.attr("lookupId"),
            createUrl: element.attr("createUrl"),
            createText: element.attr("createText"),
            originalSelectedItems: element.attr("selected-items") ? element.attr("selected-items").split(",") : [],
            sourceUrl: element.attr("sourceUrl"),
            disabledDelete: !!element.attr("disabled-delete"),
            isReadOnly: !!element.attr("isReadonly"),
            textFieldName: element.attr("textFieldName"),
            valueField: element.attr("valueField"),
            photoUrlFieldName: element.attr("photoUrlFieldName"),
            tableName: tableName,
            descriptionFieldName: element.attr("descriptionFieldName"),
            maxSelectedItems: element.attr("maxSelectedItems") || 0,
            prefix: element.attr("prefix") || "",
            objectId: element.attr("objectId") || "",
            displayName: element.attr("displayName"),
            filter: element.attr("filter"),
            serverFiltering: element.attr("serverFiltering"),
            selectedRecords: selectedRecordsText ? JSON.parse(selectedRecordsText) : null,
            disableSorting: tableName == "Rank",
            filtering: createCustomFilter(element.attr("customFilter"))
        };
    }

    function createCustomFilter(customFilterString) {
        var filtering = null;

        if (customFilterString) {
            var customFilter = JSON.parse(customFilterString);
            filtering = function (e) {
                if (e.filter) {
                    var value = e.filter.value;
                    $.each(customFilter.filters, function (index, filter) {
                        filter.value = value;
                    });

                    e.sender.dataSource.filter(customFilter);
                    e.preventDefault();
                }

                e.preventDefault();
            };
        }

        return filtering;
    }

    this.GetCompatible = function () {
        return "pmmultilookup";
    };

    return this;
};

function initMultilookup(settings) {
    if (!settings.element.hasClass("new")) {
        return;
    }

    settings.element.removeClass("new");

    var itemTemplateHtml = '<div class="container" data-itemobject="' + settings.tableName + '" data-item="#: data.ID #" title="#: data.' + settings.textFieldName + ' #"><div class="pickup-template-text">#: data.' + settings.textFieldName + ' #</div></div>';
    var itemTemplateId = settings.itemTemplateId || (settings.tableName + "LookupItemTemplate");
    var itemTemplate = settings.itemTemplate || kendo.template($("#" +itemTemplateId).html() || itemTemplateHtml);
    var tagTemplate = '<span class="container lookup-tag-item link" title="#: data.' + settings.textFieldName + ' #" data-item="#: data.ID #" object-type="' + settings.tableName + '"><span>#: data.' + settings.textFieldName + ' #</span></span>';
    var mainContent = $("#main-content");
    var isDataLoaded = false;

    var maxSelected = settings.maxSelectedItems || 1000;
    var showMaxLimitMessage = settings.showMaxLimitMessage === true;
    var ajaxDataRequest = null;

    var multilookup = settings.element.kendoMultiSelect({
        dataTextField: settings.textFieldName,
        dataValueField: settings.valueField || "ID",
        itemTemplate: itemTemplate,
        tagTemplate: tagTemplate,
        placeholder: !settings.isReadOnly ? settings.placeholder || (settings.displayName ? "Find " + settings.displayName : "") : "",
        autoBind: settings.autoBind === true,
        filter: settings.filter || "startswith",
        maxSelectedItems: maxSelected == 1 ? 2 : maxSelected,
        value: settings.selectedRecords || [],
        minLength: settings.minLength || settings.serverFiltering ? 3 : 0,
        delay: 300,
        change: settings.change,
        filtering: settings.filtering,
        select: function () {
            if (maxSelected == 1) {
                var currentMultiselectValue = this.value();
                if (currentMultiselectValue != null && currentMultiselectValue.length > 0) {

                    //Workaround to not reset filter when remove the selected item 
                    var isFiltered = this.listView.isFiltered;
                    this.listView.isFiltered = function () { return false; }

                    this.value([]); // deselect current item

                    this.listView.isFiltered = isFiltered;
                }
            }


            if (showMaxLimitMessage && maxSelected <= this.value().length)
            {
                alert("Max limit " + maxSelected  + " for grouping reached. Cannot select more items.");
            }

            multilookup.bind("change", function (args) {
                if (settings.tableName == "Teachers" && settings.displayName == "Staff") {
                    $('body').trigger('lookup-value-change', [{ objectId: settings.objectId, value: multilookup.value() }]);
                    if (isMultilookup()) {
                        multiLookupValuesChanged();
                    }
                    else {
                        postChangeDataElement.val(multilookup.value());
                    }
                }
            });
        },
        dataSource: {
            serverFiltering: settings.serverFiltering,
            transport: {
                read: function (options) {

                    if (options.data.clear) {
                        options.success([]);
                        return;
                    }

                    var data = { models: kendo.stringify(options.data.models) };

                    if (settings.getDataParams) {
                        var dataParams = settings.getDataParams();
                        $.extend(data, dataParams);
                    }

                    if (!isDataLoaded && settings.initDataParams) {
                        $.extend(data, settings.initDataParams);
                    }

                    if (settings.filterName) {
                        data[settings.filterName] = options.data.filterName ||
                            (options.data.filter && options.data.filter.filters && options.data.filter.filters.length ?
                            options.data.filter.filters[0].value : "");
                    }
                    
                    if (settings.serverFiltering && (!data[settings.filterName] || data[settings.filterName].length < multilookup.options.minLength)) {
                        options.success([]);
                        return;
                    }
                    var sourceUrl = multilookup && multilookup.options && multilookup.options.customSourceUrl || settings.sourceUrl;
                    ajaxDataRequest = $.ajax({
                        type: "POST",
                        url: sourceUrl,
                        dataType: "json",
                        data: data,
                        traditional: true,
                        success: function (result) {
                            try {
                                var isCloneMode = $("#IsFromClone").val() == "True";
                                if (result.length && result[0].ID && !isCloneMode) {
                                    var currentRecordId = $("#currentRecordId").val();
                                    for (i = 0; i < result.length; i++) {
                                        if (result[i].ID.length && result[i].ID == currentRecordId)
                                            result.splice(i, 1);
                                    }
                                }

                                var dataSource = multilookup.dataSource._data.length ? multilookup.dataSource._data : multilookup._dataItems;
                                if (dataSource && dataSource.length && !settings.serverFiltering) {
                                    if(result.length) {
                                        var dataItems = [];
                                        for(var i = 0; i < dataSource.length; i++) {
                                            var dataItem = dataSource[i];
                                            var item = {};
                                            item[multilookup.options.dataTextField] = dataItem[multilookup.options.dataTextField];
                                            item[multilookup.options.dataValueField] = dataItem[multilookup.options.dataValueField];
                                            dataItems.push(item);
                                        }

                                        result = Enumerable.From(result.concat(dataItems))
                                            .GroupBy(function(x) {
                                                return x.id || x.Id || x.ID;
                                            })
                                            .Select(function(x) {
                                                return x.source && x.source.length ? x.source[0] : null;
                                            }).ToArray();
                                        //Sort datasource by Text Field
                                        result = sortDataSourceByTextField(result, settings);
                                    } 
                                } 
                                options.success(result.length || settings.serverFiltering ? result : typeof dataSource == "undefined" ? [] : dataSource);

                                $(document.body).trigger('PerfectMind.Ajax.Control.MultiLookupBuilder.mlLoaded', { objectName: settings.tableName, multilookup: multilookup });
                                isDataLoaded = true;

                                var editEventTabsLength = $('#editEventTabs').length;

                                if ((typeof createEventView != 'undefined' && editEventTabsLength)
                                                            || !editEventTabsLength
                                                            && multilookup.value().length) {
                                    multilookup.trigger("change", {isInitialLoad: true});
                                }
                            } catch (err) {
                                console.log("Multilookup init warning: " + err.message);
                            }
                        },
                        error: function (result) {
                            options.error(result);
                            $("div[lookupid=" + settings.lookupId + "]").parent('div').find(".k-loading").addClass("k-loading-hidden");
                        }
                    });
                }
            }
        },
        height: 'auto',
        close: function (e) {
            if (settings.serverFiltering && multilookup.dataSource.data.length) {
                multilookup.dataSource.read({ clear: true });
            }
            if (!$.data(window, 'scrolling')) {
                $(window).off('scroll', multilookup.options.scroll);
            }
        },
        open: function (e) {
            e.sender.popup.element.addClass("multilookup-dropdown-k-popup");
            if (!settings.serverFiltering && !isDataLoaded) {
                multilookup.dataSource.read({ clear: true });
                multilookup.dataSource.read();
            }

            $(window).off('scroll', this.options.scroll).on('scroll', this.options.scroll);
        },
        scroll: function () {
            $.data(window, 'scrolling', true);
            clearTimeout($.data(window, 'scrollTimer'));
            $.data(window, 'scrollTimer', setTimeout(function () {
                multilookup.open();
                $.data(window, 'scrolling', false);
            }, 250));
        }
    }).data("kendoMultiSelect");

    stopScroll();

    if (settings.disabledDelete) {
        multilookup.wrapper.addClass("disabled-delete");

        multilookup.input.keydown(function (e) {
            if (e.keyCode == 8) {
                e.stopImmediatePropagation();
            }
        });

        $._data(multilookup.input[0]).events.keydown.reverse();
    }

    multilookup.readonly(settings.isReadOnly);
    if (!settings.isReadOnly) {
        multilookup._innerWrapper.append($("<div>", {
            "class": "pmlookup",
            "html": '<i class="fa fa-search"></i>'
        }));
        multilookup.wrapper.unbind("mousedown.kendoMultiSelect").find('.k-multiselect-wrap').click(function (e) {

            if ($(e.target).is("span.k-icon.k-i-close")) {
                return;
            }

            if (!settings.serverFiltering) {
                multilookup.dataSource.filter({});
            }

            multilookup.popup.open();
            multilookup.input.focus();
            return false;
        }).bind("mousedown", function () {
            return false;
        });
    }

    if (!settings.isReadOnly) {
        if ($("#currentObjectId").length &&
            $("#currentObjectId").val().toUpperCase() == "87665895-0175-4958-BFDA-9396C1B5222F" &&
            settings.lookupId.toUpperCase() == "E0A28B3B-6DA9-4E3C-9B1E-33EA626B8CE3")
        {
            // When we are on the Facility object form:
            // do not add "Create New" button to the multi-lookup of the "Dependent Facilities" field
            // (avoid recursion: while creating facility create another facility).
        }
        else if (settings.createUrl)
        {
            var createLink = $("<div>", { "data-createurl": settings.createUrl, "class": "pm-new-object-button create-btn-program newLookupObjectButton", html: settings.createText })
                .click(function () {

                    multilookup.dataSource.filter({});
                    multilookup.close();

                    if (typeof multilookup.options.customCreate !== "undefined") {
                        multilookup.options.customCreate(function (newItemId) {
                            var selectedItems = settings.maxSelectedItems == "1" ? [newItemId] : multilookup.value().concat([newItemId]);
                            multilookup.reload({ selectedItems: selectedItems });
                        });
                        return;
                    }

                    OnNewLookupObjectButtonClick(this);
                    var popupoverlay = $('.ui-widget-overlay');
                    popupoverlay.css("height", $(document).height());
                    mainContent.hide();
                    window.FullContentPopup.customClose = function (smth, newLookup) {
                        //clean up the popup
                        window.FullContentPopup.close(smth, newLookup);
                        $("#fullContentPopup").hide();
                        $("#fullContentPopup iframe").attr("src", "");
                        $('.ui-widget-overlay').css("height", "100%");
                        mainContent.show();
                       
                        var selectedItems = settings.maxSelectedItems == "1" ? [newLookup.id] : multilookup.value().concat([newLookup.id]);

                        if (settings.onNewItemCreated) {
                            multilookup.dataSource.read({ clear: true });
                            settings.onNewItemCreated(settings);
                            multilookup.dataSource.read();
                        }

                        multilookup.reload({ filterName: newLookup.text, selectedItems: selectedItems });
                        multilookup.value(selectedItems);
                    };
                });
            
            if (settings.tableName != "Tax" && settings.tableName != "AccountCategory" && settings.tableName != "AccountType") {
                multilookup.popup.element.append(createLink);
            }
        }
    }

    var postMultilookupElementId = (settings.prefix || 'multi-lookup-') + settings.lookupId;
    var postChangeDataElement = $("#" + postMultilookupElementId);
    if (postChangeDataElement.length == 0) { // Add input element if it doesn't exist (needed for new calendar)
        postChangeDataElement = $("<input>", { type: "hidden", id: postMultilookupElementId, name: postMultilookupElementId, objectId: settings.objectId || "" });
    }
    settings.element.after(postChangeDataElement);

    if (isMultilookup()) {
        var initialValues = "";
        if (settings.originalSelectedItems.length) {
            for (var i = 0; i < settings.originalSelectedItems.length; i++) {
                initialValues += "," + settings.originalSelectedItems[i] + "(initialValue)";
            }

            if (postChangeDataElement.val().trim() == "") {
                postChangeDataElement.val(initialValues + ',(hasItems)');
            }
        }
    }
    else {
        postChangeDataElement.val(settings.originalSelectedItems);
    }

    var selectedValuesFromHiddenField = getPostedSelectedValues();

    if (!settings.serverFiltering) {

        multilookup.value(selectedValuesFromHiddenField);
    }
    else {
        if (settings.selectedRecords && settings.selectedRecords.length && !postChangeDataElement.val()) {
            postChangeDataElement.val(multilookup.value());
        }
    }

    multilookup.bind("change", function (args) {
        $('body').trigger('lookup-value-change', [ $.extend(args || {}, { objectId: settings.objectId, value: multilookup.value()})]);
        if (isMultilookup()) {
            multiLookupValuesChanged();
        }
        else {
            postChangeDataElement.val(multilookup.value());
        }
    });

    function multiLookupValuesChanged() {
        var multilookupSelectedValues = multilookup.value();
        var postSelectedValues = [];

        for (var i = 0; i < multilookupSelectedValues.length; i++) {
            if (settings.originalSelectedItems.indexOf(multilookupSelectedValues[i]) < 0) {
                postSelectedValues.push(multilookupSelectedValues[i] + "(add)");
            }
            else {
                postSelectedValues.push(multilookupSelectedValues[i] + "(initialValue)");
            }
        }

        for (var i = 0; i < settings.originalSelectedItems.length; i++) {
            if (multilookupSelectedValues.indexOf(settings.originalSelectedItems[i]) < 0) {
                postSelectedValues.push(settings.originalSelectedItems[i] + "(delete)");
            }
        }

        if (multilookupSelectedValues.length) {
            postSelectedValues.push('(hasItems)');
        }

        postChangeDataElement.val(postSelectedValues.join(","));
    }

    multilookup.getChanges = function () {
        var original = Enumerable.From(settings.originalSelectedItems).Select(function (v) { return v.Id; }).ToArray();
        var added = Enumerable.From(multilookup.value()).Except(original).ToArray();
        return { added: added };
    };

    function getPostedSelectedValues()
    {
        var hiddenPostedValue = [];
        var splitValues = postChangeDataElement.val().split(",");
        $.each(splitValues, function (index, value) {
            if (value && value.indexOf("(hasItems)") < 0 && value.indexOf("(delete)") < 0) {
                if (value.indexOf("(initialValue)") >= 0) {
                    hiddenPostedValue.push(value.replace("(initialValue)", ""));
                }
                else if (value.indexOf("(add)") >= 0) {
                    hiddenPostedValue.push(value.replace("(add)", ""));
                }
                else {
                    hiddenPostedValue.push(value);
                }
            }
        });

        return hiddenPostedValue;
    }

    function isMultilookup()
    {
        return !settings.prefix;
    }

    function sortDataSourceByTextField(result, settings) {
        if (!settings.disableSorting) {
            var sortedResult = result.sort(function (item1, item2) {
                return (item1[settings.textFieldName] || "").localeCompare(item2[settings.textFieldName]);
                });
            return sortedResult;
        }

        return result;
    }

    function setClick() {
        multilookup.wrapper.find(".lookup-tag-item.link").unbind('click').click(function () {
            if (window.location.href.indexOf('/Delete/') < 0 && window.location.href.indexOf('/Edit/') < 0 && window.location.href.indexOf('/Clone/') < 0 && !multilookup.options.disableLookupItemClick) {
                var linkUrl;
                var objectTypeValue = $(this).attr("object-type");
                var dataItemValue = $(this).attr("data-item");
                if (objectTypeValue != null && dataItemValue != null && objectTypeValue != "undefined" && dataItemValue != "undefined") {
                    if (objectTypeValue == 'Tax') {
                        linkUrl = getAnchor() + "Store/Setup/ShowSetupObjectDetail/Tax?recordId=" + dataItemValue;
                    } else {
                        linkUrl = getAnchor() + "Office/Object/View/" + objectTypeValue + "?recordId=" + dataItemValue;
                    }

                    window.open(linkUrl);
                }
            }
        });
    }
    $(function () {
        setTimeout(setClick, 1000);
    });

    multilookup.clear = function () {
        multilookup.value("");
        if (postChangeDataElement) {
            postChangeDataElement.val("");
        }

        isDataLoaded = false;
    };
    multilookup.reload = function (options, callback) {

        var deferred = $.Deferred();
        options = options || {};
        var value = options.value ? options.value : options.selectedItems && options.selectedItems.length ?
            options.selectedItems : multilookup.value().slice();

        if (ajaxDataRequest) {
            ajaxDataRequest.abort();
        }

        multilookup.unbind("dataBound").bind("dataBound", function () {

            if (!options.resetValue) {
                multilookup.unbind("dataBound");
                multilookup.value(value);
                multilookup.trigger("change");
                if (callback) {
                    callback();
                }
            }

            deferred.resolve();
        });

        if (options.resetValue) {
            multilookup.clear();
            options.filterName = "";
        }

        multilookup.dataSource.read(options);
        return deferred.promise();
    };

    function stopScroll() {
        var activeElement;

        $(document).off('mousewheel DOMMouseScroll').on('mousewheel DOMMouseScroll', function (e) {
            var scrollTo = null;
            if ($(activeElement).closest(".multilookup-dropdown-k-popup").length) {
                if (!$(activeElement).closest(".k-popup").length) {
                    return;
                }

                if (e.type == 'mousewheel') {
                    scrollTo = (e.originalEvent.wheelDelta * -1);
                }
                else if (e.type == 'DOMMouseScroll') {
                    scrollTo = 40 * e.originalEvent.detail;
                }

                var list = $(activeElement.closest('ul'));

                if (scrollTo) {
                    e.preventDefault();
                    list.scrollTop(scrollTo + list.scrollTop());
                }
            }
        });

        $(document).on('mouseover', function (e) {
            activeElement = e.target;
        });
    }

    postChangeDataElement.addClass("lookup-data").data("multilookup", multilookup);

    $(document).trigger("multilookupCreated" + settings.objectId, [settings.selectedId ? [settings.selectedId] : multilookup.value(), multilookup]);

    return multilookup;
}

