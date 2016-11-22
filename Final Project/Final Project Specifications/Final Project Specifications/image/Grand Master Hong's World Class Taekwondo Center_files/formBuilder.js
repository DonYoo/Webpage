/**
 * jQuery Form Builder Plugin
 * Copyright (c) 2009 Mike Botsko, Botsko.net LLC (http://www.botsko.net)
 * http://www.botsko.net/blog/2009/04/jquery-form-builder-plugin/
 * Originally designed for AspenMSM, a CMS product from Trellis Development
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * Copyright notice and license must remain intact for legal use
 */
(function ($) {
    $.fn.formbuilder = function (options) {
        // Extend the configuration options with user-provided
        var defaults = {
            save_url: false,
            delete_url: false,
            preview_url: false,
            edit_selector: '#form-edit-content',
            buttons_selector: '#form-builder-buttons',
            load_url: false,
            control_box_target: false,
            serialize_prefix: 'frmb',
            css_ol_sortable_class: 'ol_opt_sortable',
            messages: {
                save: "Save",
                delete_text: "Delete",
                add_new_field: "Add New Question...",
                text: "Text Field",
                help_text: "Help Text",
                title: "Question Title",
                paragraph: "Section",
                checkboxes: "Checkboxes",
                radio: "Radio",
                select: "Select List",
                select_title: "Select List",
                text_field: "Text Field",
                label: "Question Title",
                paragraph_field: "Section Header",
                select_options: "Options",
                add: "Add an Option",
                checkbox_group: "Checkbox Group",
                remove_message: "Are you sure you want to remove this question?",
                remove: "Remove",
                radio_group: "Radio Group",
                hide: "Hide",
                required: "Required",
                show: "Show",
                preview: "Preview",
                date: "Date",
                date_select_option: "Select Date"
            }
        };

        var questionType = { input_text: 1, textarea: 2, checkbox: 3, radio: 4, select: 5, date: 6 };

        var opts = $.extend(defaults, options);
        var frmb_id = 'frmb-' + $('ul[id^=frmb-]').length++;
        return this.each(function () {
            var ul_obj = $(this).append('<ul id="' + frmb_id + '" class="frmb"></ul>').find('ul');
            var field = '', field_type = '', last_id = 1;
            // Add a unique class to the current element
            $(ul_obj).addClass(frmb_id);

            // Create form control select box and add into the editor
            var controlBox = function (target) {

                var buttonsWrapperParent = $(opts.buttons_selector);
                var buttonsWrapper = $('<div>', {
                    class: 'form-builder-buttons'
                });

                var select = '';
                var box_content = '';
                var save_button = '', delete_button = '', cancel_button = '', preview_button = '', edit_button = '';
                var box_id = frmb_id + '-control-box';
                var save_id = frmb_id + '-save-button';
                var delete_id = frmb_id + '-delete-button';
                var preview_id = frmb_id + '-preview-button';
                var edit_id = frmb_id + '-edit-button';
                // Add the available options
                select += '<option value="0">' + opts.messages.add_new_field + '</option>';
                select += '<option value="input_text">' + opts.messages.text + '</option>';
                select += '<option value="textarea">' + opts.messages.paragraph + '</option>';
                select += '<option value="checkbox">' + opts.messages.checkboxes + '</option>';
                select += '<option value="radio">' + opts.messages.radio + '</option>';
                select += '<option value="select">' + opts.messages.select + '</option>';
                select += '<option value="date">' + opts.messages.date + '</option>';
                // Build the control box and search button content
                box_content = '<select id="' + box_id + '" class="frmb-control">' + select + '</select>';
                preview_button = '<button class="pm-button" id="' + preview_id + '">Preview</button>';
                edit_button = '<button class="pm-button" id="' + edit_id + '" style="display: none;">Edit</button>';
                save_button = '<input type="submit" id="' + save_id + '" class="pm-save-button" value="' + opts.messages.save + '"/>';
                delete_button = '<a id="' + delete_id + '"style="cursor:pointer;" class="pm-delete-text" ><I class="fa fa-trash"></i><span>' + opts.messages.delete_text + '</span></a>';
                cancel_button = '<button id="close-form-builder" class="pm-cancel-button">Cancel</button>';

                if (opts.initial_data) {
                    buttonsWrapper.append(delete_button);
                }
                buttonsWrapper.append(cancel_button).append(preview_button).append(edit_button).append(save_button);
                buttonsWrapperParent.append(buttonsWrapper);

                // Insert the control box into page
                if (!target) {
                    $(ul_obj).before(box_content);
                } else {
                    $(target).append(box_content);
                }
                // Set the form save action
                $('#' + save_id).click(function() {
                    if ($("#completedForms").val() === "True") {
                        $("#loadingIcon").css("visibility", "visible");
                        save();
                    }    
                    else {
                        var saveButton = $(this);
                        if (!saveButton.prop("disabled")) {
                            $('#' + save_id).prop("disabled", true);
                            save(this);
                        }
                    }
                    return false;
                });

                $('#' + delete_id).click(function () {
                    var confirmMessage = "Are you sure you want to delete this form?";
                    if ($("#completedForms").val() === "True") {
                        confirmMessage += " All answers will be deleted.";
                    }
                    $("#confirmDeleteButton").show();
                    openWindow(confirmMessage);
                });

                $("#confirmCancelButton").on("click", function () {
                    $("#divMsgContainer").data('kendoWindow').close();
                    return false;
                });

                $("#confirmDeleteButton").on("click", function () {
                    $("#loadingIcon").css("visibility", "visible");
                    deleteRegForm();
                    $("#divMsgContainer").data('kendoWindow').close();
                });
                
                // Set the form preview action
                $('#' + preview_id).click(function() {
                    preview();
                    return false;
                });

                // Set the form edit action
                $('#' + edit_id).click(function () {
                    edit();
                    return false;
                });

                // Add a callback to the select element
                $('#' + box_id).change(function() {
                    appendNewField($(this).val());
                    $(this).val(0).blur();
                    $(ul_obj).scrollTop($(ul_obj)[0].scrollHeight);
                    return false;
                });
            }(opts.control_box_target);
            // Json parser to build the form builder
            var fromJson = function (json) {
                // Parse json
                $(json).each(function() {
                    var values = '';
                    var options = {
                        title: this.title,
                        helpText: this.helpText || '',
                        questionId: this.id,
                        type: this.type,
                        advanced: this.advanced
                    };
                    // checkbox type
                    if (this.cssClass === 'checkbox') {
                        this.values = this.values || [];
                        values = [];
                        $.each(this.values, function () {
                            var val = { text: this.text, selected: this.selected }
                            values.push(val);
                        });
                    }
                        // radio type
                    else if (this.cssClass === 'radio') {
                        this.values = this.values || [];
                        values = [];
                        $.each(this.values, function () {
                            var val = { text: this.text, selected: this.selected }
                            values.push(val);
                        });
                    }
                        // select type
                    else if (this.cssClass === 'select') {
                        this.values = this.values || [];
                        options.multiple = this.multiple;
                        values = [];
                        $.each(this.values, function () {
                            var val = { text: this.text, selected: this.selected }
                            values.push(val);
                        });
                    }
                    else {
                        values = [this.title];
                    }
                    appendNewField(this.cssClass, values, options, this.required);
                });
            };
            // Wrapper for adding a new field
            var appendNewField = function (type, values, options, required) {
                field = '';
                field_type = type;

                if (typeof (values) === 'undefined') {
                    values = '';
                }
                if (typeof (options) === 'undefined') {
                    options = { };
                }
                if (typeof (options.title) === 'undefined') {
                    options.title = '';
                }
                if (typeof (options.helpText) === 'undefined') {
                    options.helpText = '';
                }

                options.type = questionType[field_type];

                switch (type) {
                    case 'input_text':
                        appendTextInput(values, options, required);
                        break;
                    case 'textarea':
                        appendTextarea(values, options, required);
                        break;
                    case 'checkbox':
                        appendCheckboxGroup(values, options, required);
                        break;
                    case 'radio':
                        appendRadioGroup(values, options, required);
                        break;
                    case 'select':
                        appendSelectList(values, options, required);
                        break;
                    case 'date':
                        appendDate(values, options, required);
                        break;
                    }
            };
            var getHelpTextField = function (helpText, htLabel) {
                htLabel = htLabel || 'Help Text';
                var helpField = '<div class="frm-fld"><label>' + htLabel + '</label>';
                helpField += '<input name="helpText" type="text" value="' + helpText + '" placeholder="(Optional)" /></div>';
                return helpField;
            };
            // single line input type="text"
            var appendTextInput = function (values, options, required) {
                field += '<div class="frm-fld"><label>' + opts.messages.label + '*</label>';
                field += '<input class="fld-title" name="title" id="title-' + last_id + '" type="text" value="' + values + '"  /></div>';
                field += getHelpTextField(options.helpText);
                appendFieldLi(opts.messages.text, field, required, options);
            };
            // single line input type="date"
            var appendDate = function (values, options, required) {
                field += '<div class="frm-fld"><label>' + opts.messages.label + '*</label>';
                field += '<input class="fld-title" name="title" id="title-' + last_id + '" type="text" value="' + values + '" /></div>';
                field += getHelpTextField(options.helpText);
                appendFieldLi(opts.messages.date, field, required, options);
            };
            // multi-line textarea (aka Section)
            var appendTextarea = function (values, options, required) {
                field += '<div class="frm-fld"><label>Header Text*</label>';
                field += '<input name="title" type="text" value="' + values + '" /></div>';
                field += getHelpTextField(options.helpText, 'Description');
                appendFieldLi(opts.messages.paragraph_field, field, required, options, true);
            };
            // adds a checkbox element
            var appendCheckboxGroup = function (values, options, required) {
                var title = options.title || '';
                field += '<div class="chk_group">';
                field += '<div class="frm-fld"><label>' + opts.messages.title + '*</label>';
                field += '<input type="text" name="title" value="' + title + '" /></div>';
                field += getHelpTextField(options.helpText);
                field += '<div class="false-label">' + opts.messages.select_options + '</div>';
                field += '<div class="fields">';
                field += '<div><ol class="' + opts.css_ol_sortable_class + '">';

                if (typeof (values) === 'object') {
                    for (i = 0; i < values.length; i++) {
                        field += checkboxFieldHtml(values[i]);
                    }
                }
                else {
                    field += checkboxFieldHtml('');
                }

                field += '</ol></div>';
                field += '<div class="add-area"><a href="#" class="add add_ck"><i class="fa fa-plus-circle"></i>' + opts.messages.add + '</a></div>';
                field += '</div>';
                field += '</div>';
                appendFieldLi(opts.messages.checkbox_group, field, required, options);

                $('.' + opts.css_ol_sortable_class).sortable(); // making the dynamically added option fields sortable.
            };
            // Checkbox field html, since there may be multiple
            var checkboxFieldHtml = function (values) {
                var checked = false;
                var value = '';
                if (typeof (values) === 'object') {
                    value = values.text;
                    checked = values.selected;
                }
                field = '<li>';
                //field += '<div>';
                field += '<input type="checkbox"' + (checked ? ' checked="checked"' : '') + ' />';
                field += '<i class="fa fa-align-justify"></i>';
                field += '<input type="text" value="' + value + '" />';
                field += '<a href="#" class="remove" title="' + opts.messages.remove_message + '"><i class="fa fa-times"></i></a>';
                //field += '</div></li>';
                field += '</li>';
                return field;
            };
            // adds a radio element
            var appendRadioGroup = function (values, options, required) {
                var title = options.title || '';
                field += '<div class="rd_group">';
                field += '<div class="frm-fld"><label>' + opts.messages.title + '*</label>';
                field += '<input type="text" name="title" value="' + title + '" /></div>';
                field += getHelpTextField(options.helpText);
                field += '<div class="false-label">' + opts.messages.select_options + '</div>';
                field += '<div class="fields">';
                field += '<div><ol class="' + opts.css_ol_sortable_class + '">';

                if (typeof (values) === 'object') {
                    for (i = 0; i < values.length; i++) {
                        field += radioFieldHtml(values[i], 'frm-' + last_id + '-fld');
                    }
                }
                else {
                    field += radioFieldHtml('', 'frm-' + last_id + '-fld');
                }

                field += '</ol></div>';
                field += '<div class="add-area"><a href="#" class="add add_rd"><i class="fa fa-plus-circle"></i>' + opts.messages.add + '</a></div>';
                field += '</div>';
                field += '</div>';
                appendFieldLi(opts.messages.radio_group, field, required, options);

                $('.' + opts.css_ol_sortable_class).sortable(); // making the dynamically added option fields sortable. 
            };
            // Radio field html, since there may be multiple
            var radioFieldHtml = function (values, name) {
                var checked = false;
                var value = '';
                if (typeof (values) === 'object') {
                    value = values.text;
                    checked = values.selected;
                }
                field = '<li>';
                //field += '<div>';
                field += '<input type="radio"' + (checked ? ' checked="checked"' : '') + ' name="radio_' + name + '" />';
                field += '<i class="fa fa-align-justify"></i>';
                field += '<input type="text" value="' + value + '" />';
                field += '<a href="#" class="remove" title="' + opts.messages.remove_message + '"><i class="fa fa-times"></i></a>';
                field += '</li>';

                return field;
            };
            // adds a select/option element
            var appendSelectList = function (values, options, required) {
                var multiple = false;
                var title = options.title || '';
                if (options.multile) {
                    multiple = true;
                }
                field += '<div class="opt_group">';
                field += '<div class="frm-fld"><label>' + opts.messages.title + '*</label>';
                field += '<input type="text" name="title" value="' + title + '" /></div>';
                field += getHelpTextField(options.helpText);
                field += '<div class="false-label">' + opts.messages.select_options + '</div>';
                field += '<div class="fields">';
                field += '<div><ol class="' + opts.css_ol_sortable_class + '">';

                if (typeof (values) === 'object') {
                    for (i = 0; i < values.length; i++) {
                        field += selectFieldHtml(values[i], multiple);
                    }
                }
                else {
                    field += selectFieldHtml('', multiple);
                }

                field += '</ol></div>';
                field += '<div class="add-area"><a href="#" class="add add_opt"><i class="fa fa-plus-circle"></i>' + opts.messages.add + '</a></div>';
                field += '</div>';
                field += '</div>';
                appendFieldLi(opts.messages.select_title, field, required, options);

                $('.' + opts.css_ol_sortable_class).sortable(); // making the dynamically added option fields sortable.  
            };
            // Select field html, since there may be multiple
            var selectFieldHtml = function (values, multiple) {
                if(multiple) {
                    return checkboxFieldHtml(values);
                }
                else {
                    return radioFieldHtml(values);
                }
            };
            // Appends the new field markup to the editor
            var appendFieldLi = function (title, field_html, required, question, hideRequired) {
                var questionId = question.questionId;

                if(required) {
                    required = (required === true || required === 'checked') ? true : false;
                }
                questionId = questionId || '';
                var li = '';
                li += '<li id="frm-' + last_id + '-item" class="closed" data-questionid="' + questionId + '" data-input-type="' + field_type + '" style="opacity: 0;">';
                li += '<div class="legend clearfix">';
                li += '<i class="fa fa-align-justify"></i>';
                li += '<a id="frm-' + last_id + '" class="pm-button toggle-form" href="#" style="display:none"><i class="fa fa-minus-circle"></i><span>' + opts.messages.hide + '</span></a> ';
                li += '<a id="del_' + last_id + '" class="pm-plain-button del-button delete-confirm" href="#" title="' + opts.messages.remove_message + '"><i class="fa fa-trash"></i><span>' + opts.messages.remove + '</span></a>';
                li += '<strong id="txt-title-' + last_id + '" class="item-title">' + title + ': <span class="inline-block ellipsis"></span></strong></div>';
                li += '<div id="frm-' + last_id + '-fld" class="frm-holder">';
                li += '<div class="frm-elements">';

                var hideRequiredCb = hideRequired ? "style='display:none'" : "";
                li += '<div class="frm-fld" ' + hideRequiredCb + '><label for="required-' + last_id + '">' + opts.messages.required + '</label>';
                li += '<input class="required" type="checkbox" value="1" name="required-' + last_id + '" id="required-' + last_id + '"' + (required ? ' checked="checked"' : '') + ' /></div>';
                li += field;
                li += '</div>';
                li += '</div>';
                li += '</li>';

                var $li = $(li);
                
                var advancedSection = getAdvancedSection(question, $li);
                $li.append(advancedSection);

                $(ul_obj).append($li);
                $('.legend', $li).trigger('click');

                //$('#frm-' + last_id + '-item').hide();
                $('#frm-' + last_id + '-item').fadeTo("slow", 1); //.animate({
                //opacity: 'show'//,
                //height: 'show'
                //}, 'slow');
                last_id++;
            };


            var getAdvancedSection = function (question, container) {

                var fields = options.questionFieldTypeMap[question.type] || [];
                var advanced = question.advanced || {};

                var advancedSection = $(".template .question-advanced-section").clone();
                var content = $(".content", advancedSection);
                $(".expand.link", advancedSection).click(function () {
                    content.slideToggle(500, function () {
            });
                });

                var fieldMap = [];
                var fieldPicker = $(".field-picker", advancedSection).on('change', function () {
                    var fieldId = this.value;
                    var requiredCheckbox = $("input.required[type=checkbox]", container);
                    if (fieldMap[fieldId].isRequired) {
                        requiredCheckbox.attr("checked", true).attr("disabled", true);
                    }
                    else {
                        requiredCheckbox.removeAttr("checked", true).removeAttr("disabled", true);
            }
                });

                var expirationDaysCount = $(".expiration-days-count", advancedSection).keypress(isNumber);
                var expirationDate = $(".expiration-date", advancedSection).show().kendoDatePicker({ format: options.date_format }).data("kendoDatePicker");
                var expirationDateElement = expirationDate.wrapper;

                var expirationOption = $(".expiration-option", advancedSection).on('change', function () {

                    var expirationOption = this.value;

                    if (expirationOption == options.expiration_options.never) {
                        expirationDaysCount.val("").hide();
                        expirationDateElement.hide();
                        expirationDate.value(null);
                    }
                    else if (expirationOption == options.expiration_options.daysCount) {
                        expirationDaysCount.val(advanced.expirationDaysCount).show();
                        expirationDateElement.hide();
                        expirationDate.value(null);
                    }
                    else if(expirationOption == options.expiration_options.specificDate) {
                        expirationDaysCount.val("").hide();
                        expirationDateElement.show();
                        expirationDate.value(advanced.exprationDate ? new Date(advanced.exprationDate) : new Date());
                    }
                }).val(advanced.expirationOption || options.expiration_options.never).trigger('change');

                $(fields).each(function (index, field) {
                    var fieldOption = $("<option>", {
                    value: field.id, text: field.name });
                    if (advanced && field.id == advanced.fieldId) {
                        fieldOption.attr("selected", "selected");
                    }

                    fieldMap[field.id]= field;
                    fieldPicker.append(fieldOption);
                });

                if (advanced) {

                    var expirationField = $(".expiration.frm-fld", advancedSection);

                    var displayOption = $(".display-option", advancedSection).on("change", function(){
                        this.value == options.display_options.once ? expirationField.show() : expirationField.hide();
                    }).val(advanced.displayOption).trigger("change");


                    var employeesOnly = $(".employees-only", advancedSection);
                    if (advanced.employeesOnly) {
                        employeesOnly.attr("checked", advanced.employeesOnly);
                    }
                }

                return advancedSection;
            };

        function isNumber(event) {
            event =(event) ? event: window.event;
            var charCode =(event.which) ? event.which: event.keyCode;
            if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                return false;
                }
            return true;
        }

            // handle field delete links
            $('.frmb').delegate('.remove', 'click', function () {
                $(this).parent('li').animate({
                    opacity: 'hide',
                    height: 'hide',
                    marginBottom: '0px'
                }, 'fast', function () {
                    $(this).remove();
                });
                return false;
            });
            // handle field display/hide
            $('.frmb').delegate('.toggle-form', 'click', function () {
                var target = $(this).attr("id");
                var message = $('span', $(this));
                if (message.html() === opts.messages.hide) {
                    $(this).removeClass('open').addClass('closed');
                    message.html(opts.messages.show);
                    $('#' + target + '-fld').animate({
                        opacity: 'hide',
                        height: 'hide'
                    }, 'slow');
                    return false;
                }
                if (message.html() === opts.messages.show) {
                    $(this).removeClass('closed').addClass('open');
                    message.html(opts.messages.hide);
                    $('#' + target + '-fld').animate({
                        opacity: 'show',
                        height: 'show'
                    }, 'slow');
                    return false;
                }
                return false;
            });

            var toggleField = function () {
                if($('.frmb > li.open').length && !$(this).parent().hasClass('open')) {
                    $('.frmb > li.open').removeClass('open').addClass('closed').find('.frm-holder').animate({
                        opacity: 'hide',
                        height: 'hide'
                    }, 'slow');
                }
                if ($(this).parent().hasClass('closed')) {
                    $(this).parent().removeClass('closed').addClass('open').find('.frm-holder').animate({
                        opacity: 'show',
                        height: 'show'
                    }, 'slow');
                }
                return false;
            };

            //Update Title
            $('.form-builder-controls').on('keyup', '.frmb input[name="title"]', function () {
                $(this).closest('li').find('.item-title span').html($(this).val());
            });

            // handle delete confirmation
            $('.frmb').delegate('.delete-confirm', 'click', function () {
                var delete_id = $(this).attr("id").replace(/del_/, '');
                if (confirm($(this).attr('title'))) {
                    $('#frm-' + delete_id + '-item').animate({
                        opacity: 'hide',
                        height: 'hide',
                        marginBottom: '0px'
                    }, 'slow', function () {
                        $(this).remove();
                    });
                }
                return false;
            });
            // Attach a callback to add new checkboxes
            $('.frmb').delegate('.add_ck', 'click', function () {
                $(this).parent().prev().find('ol').append(checkboxFieldHtml());
                return false;
            });
            // Attach a callback to add new options
            $('.frmb').delegate('.add_opt', 'click', function () {
                $(this).parent().prev().find('ol').append(selectFieldHtml('', false));
                return false;
            });
            // Attach a callback to add new radio fields
            $('.frmb').delegate('.add_rd', 'click', function () {
                $(this).parent().prev().find('ol').append(radioFieldHtml(false, $(this).parents('.frm-holder').attr('id')));
                return false;
            });

            var validateForm = function () {
                var regstrFormName = $('#regstrFormName').val();
                var regstrFormDescrpn = $('#regstrFormDescription').val();
                if (!regstrFormName || regstrFormName.trim() == '') {
                    alert("Please enter a title");
                    return false;
                }
                if ($(ul_obj).find('li').length == 0) {
                    alert('Please create at least one question.');
                    return false;
                }
                if ($(ul_obj).serializeFormList(options).length == 0) {
                    alert('Please fill the information for at least one question.');
                    return false;
                }
                if (!/[a-zA-Z ]/.test(regstrFormName)) {
                    alert('Name of Registration Form should has letters');
                    return false;
                }
                if (regstrFormDescrpn && (!/[a-zA-Z ]/.test(regstrFormDescrpn))) {
                    alert('Description of Registration Form should has letters');
                    return false;
                }
                return true;
            };

            // saves the serialized data to the server
            var save = function (saveButton) {
                if (!validateForm() || !opts.save_url) {
                    if (saveButton) {
                        $(saveButton).removeAttr("disabled");
                    }
                    return;
                }
                else {
                    var jsonData = {
                        'objectId': options.objectId,
                        'form_id': $('#regstrFormId').val(),
                        'name': $('#regstrFormName').val(),
                        'description': $('#regstrFormDescription').val(),
                        'frmb': $(ul_obj).serializeFormList(options)
                    };
                    $.ajax({
                        type: "POST",
                        url: opts.save_url,
                        data: JSON.stringify(jsonData),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (result) {
                            if (result.success) {
                                $(document).trigger("regisration-form-updated", [result]);

                                var newFormId = null;
                                var newFormName = null;
                                var exsitingFormId = null;

                                if (result.isNew) {
                                    // Notify picklist that a new form was created
                                    newFormId = result.id;
                                    newFormName = result.name;
                                }
                                else {
                                    exsitingFormId = result.id;
                                    newFormName = result.name;
                                }
                                $('#regFormWindow').data("eventType", "save");
                                $('#regFormWindow').data("newFormId", newFormId);
                                $('#regFormWindow').data("newFormName", newFormName);
                                $('#regFormWindow').data("exsitingFormId", exsitingFormId);
                                $('#regFormWindow').data("kendoWindow").close();
                            } else {
                                alert(result.errorMsg);
                                return false;
                            }
                        },
                        complete: function () {
                            if (saveButton) {
                                $(saveButton).removeAttr("disabled");
                            }
                        }
                    });
                }
            };

            // delete the registration form
            var deleteRegForm = function () {
                if(opts.delete_url) {
                    var formid = $('#regstrFormId').val();
                    var jsonData = { 'form_id': formid };
                    $.ajax({
                        type: "POST",
                        url: opts.delete_url,
                        data: JSON.stringify(jsonData),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (result) {
                            $(document).trigger("regisration-form-updated", [result]);
                            $('#regFormWindow').data("eventType", "delete");
                            $('#regFormWindow').data("newFormId", formid);
                            $('#regFormWindow').data("kendoWindow").close();
                        }
                    });
                }
            };

            var openWindow = function (confirmMessage) {
                $("#divMsg").html(confirmMessage);
                var win = $("#divMsgContainer");
                win.kendoWindow({
                    width: 450,
                    height: 137,
                    title: "Delete Confirmation",
                    resizable: false,
                    actions: ["Close"],
                    modal: true,
                }).data("kendoWindow").center().open();
            };

            var preview = function () {
                var previewButton = $(options.buttons_selector).find('[id*="-preview-button"]');
                previewButton.prop("disabled", true);
                if (!validateForm()) {
                    previewButton.prop("disabled", false);
                    return;
                }
                if (opts.preview_url && opts.edit_selector) {
                    var jsonData = {
                        'form_id': $('#regstrFormId').val(),
                        'name': $('#regstrFormName').val(),
                        'description': $('#regstrFormDescription').val(),
                        'frmb': $(ul_obj).serializeFormList(options)
                    };
                    $.ajax({
                        type: "POST",
                        url: opts.preview_url,
                        data: JSON.stringify(jsonData),
                        contentType: "application/json; charset=utf-8",
                        dataType: "html"
                    }).done(function(result) {
                        var $previewContainer = $('<div class="preview-form-wrapper"></div>');
                        var $editContainer = $(opts.edit_selector).hide();
                        $editContainer.after($previewContainer);
                        $previewContainer.html(result).show();
                        previewButton.hide();
                        $(options.buttons_selector).find('[id*="-edit-button"]').show();
                    }).fail(function(result, textStatus, errorThrown) {

                    }).always(function() {
                        previewButton.prop("disabled", false);
                    });
                }
            };

            var edit = function () {
                $('.preview-form-wrapper').remove();
                $(options.buttons_selector).find('[id*="-preview-button"]').show();
                $(options.buttons_selector).find('[id*="-edit-button"]').hide();
                $(opts.edit_selector).show();
            };

            // load existing form data
            if (opts.initial_data) {
                fromJson(opts.initial_data);
            }

            // handle field display/hide
            $('.form-builder-controls .frmb').on('click', '.legend', toggleField);
        });
    };
})(jQuery);
/**
 * jQuery Form Builder List Serialization Plugin
 * Copyright (c) 2009 Mike Botsko, Botsko.net LLC (http://www.botsko.net)
 * Originally designed for AspenMSM, a CMS product from Trellis Development
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * Copyright notice and license must remain intact for legal use
 * Modified from the serialize list plugin
 * http://www.botsko.net/blog/2009/01/jquery_serialize_list_plugin/
 */
(function ($) {
    $.fn.serializeFormList = function (options) {
        // Extend the configuration options with user-provided
        var defaults = {
            prepend: 'ul',
            is_child: false,
            attributes: ['class']
        };
        var opts = $.extend(defaults, options);
        if (!opts.is_child) {
            opts.prepend = '&' + opts.prepend;
        }

        var jsonObj = [];
        // Begin the core plugin
        this.each(function() {
            $(this).children().each(function() {
                var item = { };
                item.cssClass = $(this).attr('data-input-type');
                item.required = $('#' + $(this).attr('id') + ' input.required').is(':checked');
                item.title = $(this).find('input[name=title]').val();
                item.helpText = $(this).find('input[name=helpText]').val();
                item.id = $(this).data('questionid') || null;
                item.values = [];
                switch (item.cssClass) {
                    case 'input_text':
                        item.title = $('#' + $(this).attr('id') + ' input[type=text]').val();
                        break;
                    case 'textarea':
                        item.title = $('#' + $(this).attr('id') + ' input[type=text]').val();
                        break;
                    case 'checkbox':
                        $('#' + $(this).attr('id') + ' ol input[type=text]').each(function() {
                            var opt = {
                                text: $(this).val(),
                                selected: $(this).prev().is(':checked')
                            }
                            item.values.push(opt);
                        });
                        break;
                    case 'radio':
                        $('#' + $(this).attr('id') + ' ol input[type=text]').each(function() {
                            var opt = {
                                text: $(this).val(),
                                selected: $(this).prev().is(':checked')
                            }
                            item.values.push(opt);
                        });
                        break;
                    case 'select':
                        item.multiple = $('#' + $(this).attr('id') + ' input[name=multiple]').is(':checked');
                        $('#' + $(this).attr('id') + ' ol input[type=text]').each(function() {
                            var opt = {
                                text: $(this).val(),
                                selected: $(this).prev().is(':checked')
                            }
                            item.values.push(opt);
                        });
                        break;
                    case 'date':
                        item.title = $('#' + $(this).attr('id') + ' input[type=text]').val();
                        break;
                    }
                if (item.title && item.title.trim()) {
                    jsonObj.push(item);
                }

                var exprationDatePicker = $(this).find("input.expiration-date").data("kendoDatePicker");
                var exprationDate = exprationDatePicker ? exprationDatePicker.value(): null;

                item.advanced = {
                    fieldId: $(this).find(".field-picker").val(),
                    displayOption: $(this).find(".display-option").val(),
                    employeesOnly: $(this).find(".employees-only").is(":checked"),
                    expirationOption: $(this).find(".expiration-option").val(),
                    expirationDaysCount: $(this).find(".expiration-days-count").val(),
                    exprationDate: exprationDate ? new Date(exprationDate.getFullYear(), exprationDate.getMonth(), exprationDate.getDate()).toISOString() : null
                };

            });
        });

        return jsonObj;
    };
})(jQuery);