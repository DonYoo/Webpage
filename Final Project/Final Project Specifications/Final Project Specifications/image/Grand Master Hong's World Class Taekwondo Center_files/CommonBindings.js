
define("CommonBindings", ["knockout", "PlannerUtility", "linq"],
    function (ko, plannerUtility) {
        window.plannerUtility = plannerUtility;

        ko.bindingHandlers.dropdown = {
            init: function (element, valueAccessor, allBindings) {
                var item = ko.unwrap(valueAccessor());
                var value = item && typeof(item.id) != "undefined" ? item.id : item;
                var dataSource = allBindings.get('dataSource');
                var options = allBindings.get('settings') || {};

                if (typeof (dataSource) == "function") {
                    dataSource = dataSource();
                }

                var modelChange = allBindings.get('change');
                var disable = allBindings.get('disable') || false;
                // Used value != null to consider zero as a value
                var index = value != null ? getIndex(value, dataSource) : 0;

                var settings = {
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: dataSource,
                    index: index,
                    template: '<div title="#: name #">#: name #</div>',
                    close: options.close,
                    change: function () {
                        if (dataSource) { //focus out and null datasource
                            var value = $(element).val();
                            var index = getIndex(value, dataSource);
                            var item = dataSource[index];
                            valueAccessor()(item || {});
                        }
                        if (modelChange && modelChange.notify) {
                            modelChange.notify();
                        }
                    }
                };

                var template = allBindings.get('templateId');
                if (template) {
                    var templateHtml = $(template).html();
                    settings.valueTemplate = templateHtml;
                    settings.template = templateHtml;
                }

                $(element).kendoDropDownList(settings);
                var kendoDropDown = $(element).data("kendoDropDownList");

                if (modelChange) {
                    modelChange.trigger = function (data, value) {
                        // Try to keep the same selected value if it's in the new data source
                        var newIndex = getIndex(kendoDropDown.value(), data);
                        dataSource = data;
                        kendoDropDown.dataSource.data(data);
                        valueAccessor()(dataSource[newIndex] || {});
                        kendoDropDown.value(value);
                    };
                }

                if (disable) {
                    kendoDropDown.enable(false);
                }

                if (options.open) {
                    options.open.subscribe(function (isOpened) {
                        isOpened ? kendoDropDown.open() : kendoDropDown.close();
                    });
                }

                var lazyLoad = allBindings.get('lazyLoad');
                if (lazyLoad) {
                    kendoDropDown.wrapper.click(function (e) {
                        lazyLoad(function () {
                            kendoDropDown.open();
                        });

                        return false;
                    });
                }

                if (allBindings.get("autoOpen")) setTimeout(function () { kendoDropDown.open() });
            }
        };

        ko.bindingHandlers.dateTimePicker = {
            init: function (element, valueAccessor, allBindings) {
                var value = valueAccessor()(),
                    options = allBindings().dateTimePickerOptions || {};

                options.value = value;
                options.change = function () {
                    var val = this.value();
                    if (val) {
                        valueAccessor()(val);
                    } else {
                        this.value(valueAccessor()());
                    }
                };

                $(element).dateTimeAutocomplete({
                    timeFormat: options.timeFormat
                }).kendoDateTimePicker(options);
            },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var kendoDateTimePicker = $(element).data("kendoDateTimePicker");
                kendoDateTimePicker.value(valueAccessor()());
            }
        };

        function getValueAccessor(valueAccessor) {
            if(typeof valueAccessor() == "function"){
                return valueAccessor();
            }
            else{
                return valueAccessor;
            }
        }

        ko.bindingHandlers.numericTextbox = {
            init: function (element, valueAccessor, allBindings) {
                var value =  getValueAccessor(valueAccessor)(),
                    options = allBindings().settings || {};

                var kendoNumericTextBox = $(element).kendoNumericTextBox(options).data("kendoNumericTextBox");
                kendoNumericTextBox.bind("spin", function (newValue) {
                    $(element).trigger("keyup");
                    kendoNumericTextBox.trigger("change");
                });

                $(element).bind("keyup", function () {
                    kendoNumericTextBox.trigger("change");
                });

                if (options.isDisabled) {
                    kendoNumericTextBox.enable(!options.isDisabled());
                    options.isDisabled.subscribe(function (isDisabled) {
                        kendoNumericTextBox.enable(!isDisabled);
                        $(element).trigger("keyup");
                    });
                }

                kendoNumericTextBox.bind("change", function (newValue) {
                    getValueAccessor(valueAccessor)(kendoNumericTextBox.element.val());
                });
            },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var kendoNumericTextBox = $(element).data("kendoNumericTextBox");
                kendoNumericTextBox.value(getValueAccessor(valueAccessor)());
            }
        };


        ko.bindingHandlers.multiselect = {
            init: function (el, valueAccessor, allBindings) {
                var value = valueAccessor();
                var element = $(el);
                var settings = {
                    element: element,
                    createUrl: value.createUrl,
                    sourceUrl: value.dataSourceUrl,
                    createText: value.createText,
                    originalSelectedItems: value.selected || [],
                    data: value.data,
                    textFieldName: value.nameField || 'name',
                    valueField: value.valueField || 'id',
                    isReadOnly: false,
                    serverFiltering: value.serverFiltering,
                    placeholder: value.placeholder,
                    minLength: value.minLength,
                    objectType: value.objectType,
                    filterName: value.filterName,
                    maxSelectedItems: value.maxSelectedItems,
                    initDataParams: value.initDataParams,
                    getDataParams: value.getDataParams,
                    displayName: value.displayName,
                    itemTemplateId: value.itemTemplateId,
                    objectId: value.objectId,
                    filter: value.filter,
                    onNewItemCreated: value.onNewItemCreated || function () { },
                    autoBind: value.autoBind,
                    getServicesUrl: value.getServicesUrl || ''
                };

                var multilookup = PerfectMind.Ajax.Control.MultiLookupBuilder().render(settings);

                if (multilookup) {
                    value.clear = multilookup.clear;
                    multilookup.value(settings.originalSelectedItems);

                    if (value.change) {
                        multilookup.bind("change", function () {
                            value.change(multilookup.value());
                        });
                    }

                    value.reload = multilookup.reload;
                }
            }
        };

        ko.bindingHandlers.picklist = {
            init: function (el, valueAccessor, allBindings) {
                var value = valueAccessor();
                var element = $(el);

                element.attr("name", value.fieldId);
                $("<div>", { id: "mpl-popup-window" }).insertAfter(element);

                var options = { disableManage:value.disableManage, close:value.close, change: value.change, hasNoneOption: value.hasNoneOption, selectedValue: value.selected };
                PM.pickList.reload(element, value.fieldId, options);
            }
        };

        ko.bindingHandlers.dataGrid = {
            init: function (el, valueAccessor, allBindings) {
                var value = valueAccessor();
                var pageSize = value.pageSize || 10;
                var element = $(el);
                var paging = {};

                var grid = element.kendoGrid({
                    dataSource: { data: value.data, pageSize: pageSize },
                    groupable: false,
                    sortable: true,
                    pageable: true,
                    
                    columns: value.columns,
                    dataBound: function () {
                        
                    }
                }).data("kendoGrid");

                if (value.hideHeader) {
                    $(".k-grid-header", grid.wrapper).hide();
                }

                //paging = $(".k-grid-pager", grid.wrapper).hide();
            }
        };

        ko.bindingHandlers.validation = {
            init: function (el, valueAccessor, allBindings) {
                var settings = valueAccessor();
                settings.isValid = ko.observable(true);
                var validationMessage = $("<div>", { "class": "validation-message pm-error-msg" }).hide();
                if (settings.appendTo) {
                    $(el).closest(settings.appendTo).after(validationMessage);
                }
                else {
                $(el).after(validationMessage);
                }
                $(el).keyup(validate);
                validate();

                function validate(e) {
                    var value = $(el).val();
                    settings.isValid(true);

                    if (settings.type == "number") {
                        var isValid = /^[0-9]*$/.test(value);
                        validationMessage.css("display", isValid ? "none" : "block").text(settings.validationMessage);
                        settings.isValid(isValid);
                    }
                    else if (settings.type == "float") {
                        var isValid = /^\d+(\.\d+)?$/.test(value);
                        validationMessage.css("display", isValid ? "none" : "block").text(settings.validationMessage);
                        settings.isValid(isValid);
                    }

                    if (settings.isValid() && settings.custom) {
                        var message = settings.custom(value);
                        validationMessage.css("display", message ? "block" : "none").text(message);
                        settings.isValid(!message);
                    }
                }
            }
        }

        ko.bindingHandlers.popup = {
            init: function (el, valueAccessor, allBindings) {
                var view = valueAccessor();
                var settings = view.popupSettings;
                var element = $(el);
                var kendoWindowClosed = false;

                var popup = $("<div>").html(element.html()).pmKendoDialog(settings);
                settings.close = function () {
                    if (settings.preClose && typeof settings.preClose == 'function') {
                        settings.preClose();
                    }
                    if (view.isVisible) {
                        kendoWindowClosed = true;
                        view.isVisible(false);
                    }
                };

                settings.closePopup = function () {
                    popup.data("pmDialog").settings.close();
                }

                var kendoWindow = popup.data("kendoWindow");

                var popupElement = kendoWindow.element[0];
                ko.applyBindings(view, popupElement);

                if (kendoWindow) {
                    kendoWindow.center();
                }

                if (settings.buttons) {
                $.each(settings.buttons, function (index) {
                    var button = settings.buttons[index];
                    popup.on(button.eventName, function () {
                        button.action(arguments);
                    });
                    });
                }

                view.isVisible.subscribe(function (newValue) {
                    if (!newValue && !kendoWindowClosed) {
                        kendoWindow.close();
                    }
                });

                return { controlsDescendantBindings: true };
            }
        };

        ko.bindingHandlers.preventBubble = {
            init: function (element, valueAccessor) {
                var eventName = ko.utils.unwrapObservable(valueAccessor());
                ko.utils.registerEventHandler(element, eventName, function (event) {
                    event.cancelBubble = true;
                    if (event.stopPropagation) {
                        event.stopPropagation();
                    }
                });
            }
        };

        function getIndex(value, data) {
            var selected = Enumerable.From(data).Where(function (o) { return o.id == value; }).FirstOrDefault();
            var index = selected ? data.indexOf(selected) : 0;
            return index < 0 ? 0 : index;
        }

        ko.virtualElements.allowedBindings.stopBinding = true;
        ko.bindingHandlers.stopBinding = {
            init: function () {
                return { controlsDescendantBindings: true };
            }
        };
    }
);