PerfectMind.Ajax.Control.LookupBuilder = function () {

    // implementation of interface IControlBuilder

    this.BuildElementForPagelet = function (element, root, secondRoot) {
        setupLookupDialog(element.id, root, secondRoot);
    };

    this.BuildElementForPage = function (element) {
        setupLookupDialog(element.id, null);
    };

    this.GetCompatible = function () {
        return "pmlookup";
    };
    var checkDataIntervalId;
    PerfectMind.Ajax.Util.Reflection.FirstIsImplementationOfSecond(this, PerfectMind.Ajax.Control.IControlBuilder, true);

    // end of implementation of interface IControlBuilder
    initializeDialog = function (dialogEle, fieldId, root, secondRoot, ajaxTargetEle) {
        var firstResult = $("#lookup-" + fieldId, root);

        if ((firstResult) && (firstResult.length > 0)) {
            dialogEle = firstResult;
        }
        var secondResult = $("#lookup-" + fieldId, secondRoot);
        if ((secondResult) && (secondResult.length > 0)) {
            dialogEle = secondResult;
            dialogEle.kendoWindow({
                autoOpen: false,
                width: "760px",
                height: "480px",
                modal: true,
                resizable: false,
                draggable: true,
                destroyOnClose: false,
                close: function (event) {
                    $("#textbox-" + fieldId).closest(".pm-dialog").show();
                    var isOverflowHidden = $("#textbox-" + fieldId).closest(".pm-dialog").length || $("#textbox-" + fieldId).closest(".k-window").length;
                    if (!isOverflowHidden) {
                        $("body").removeClass('overflowHidden');
                    }
                },
                open: function (event) {
                    $("body").addClass('overflowHidden');
                    this.element.data("kendoWindow").center();
                }
            });
        }
        if (dialogEle.data("kendoWindow")) {
            dialogEle.data("kendoWindow").bind("close", function (event, ui) {
                var kendoDialog = $("#textbox-" + fieldId).closest(".k-window");
                kendoDialog.length ? kendoDialog.show() : $("#textbox-" + fieldId).closest(".pm-dialog").show();
            });
            dialogEle.data("kendoWindow").bind("open", function (event, ui) {
                var container = $(event.sender.element);
                container.undelegate("tr", "click");
                container.delegate("tr", "click", function (event) {
                    var currentEle = $(this);
                    var someId = currentEle.attr("class");

                    if ((someId) && (someId == "grid-td-style")) {
                        var recordId = currentEle.attr("recordId");

                        if (recordId) {
                            var nameCell = $(currentEle.children()[0]);
                            var selectedText = nameCell.text();

                            closeDialogForLookup(recordId, selectedText, fieldId);
                        }
                    }
                });

                $(ajaxTargetEle).closest(".pm-dialog").show();
            });
        }

        dialogEle.addClass("lookup-dialog");
        return dialogEle;
    }
    showLookupDialog = function (dialogEle, submitButtonEle, fieldId, controllingfieldId, dependentObjectId, root, secondRoot, ajaxTargetEle) {

        if (!dialogEle.data("kendoWindow")) {
            dialogEle = initializeDialog(dialogEle, fieldId, root, secondRoot, ajaxTargetEle);
        }

            dialogEle.data("kendoWindow").bind("activate", function (event, ui) {
                $("#criteria").focus();
            });

            dialogEle.data('kendoWindow').open();
            //ControllingLookupFieldId
            //fld_b2e8233f-ae9c-48a5-a8a8-8da3bec07560
            var controllingRecord = $("#fld_" + controllingfieldId).val();
            $("#controllingLookupFieldRecord-" + fieldId).val(controllingRecord);
            $("#needTempView").val("true");
            submitButtonEle = IfNotFirstSecond(root, secondRoot, "#btn-" + fieldId);

            submitButtonEle.click();
    };
    setFindFocused = function () {
        $("#criteria").focus();
        window.clearInterval(checkDataIntervalId);
    };
    closeDialogForLookup = function (id, text, fieldId, root, secondRoot) {
        var dialogKendoWindow = IfNotFirstSecond(root, secondRoot, "#lookup-" + fieldId).data('kendoWindow');
        if (dialogKendoWindow) {
            dialogKendoWindow.close();
        }
        IfNotFirstSecond(root, secondRoot, "#fld_" + fieldId).val(id);      
        IfNotFirstSecond(root, secondRoot, "#textbox-" + fieldId).val(text).change();
        IfNotFirstSecond(root, secondRoot, "#textbox-" + fieldId).closest(".pm-dialog").show();
    };

    setupLookupDialog = function (hiddenElementId, root, secondRoot) {

        var dialogEle;
        var submitButtonEle;
        var ajaxTargetEle;
        var imgButtonEle;
        var hiddenEle;
        var serverId = hiddenElementId.replace("fld_", "");
        var textBoxControl;
        var fieldDependencySubmitBtn;
        var childLookupSubmitBtn;
        var ControllingFieldRecordId;
        var dependentObjectId;
        var dependentObjectIdForform;

        var primaryObjectId;
        var primaryObjectIdForform;

        var dependentDisplayId;
        var dependentDisplayIdForForm;
        if (root) {
            hiddenEle = IfNotFirstSecond(root, secondRoot, "#" + hiddenElementId);
        } else {
            hiddenEle = $("#" + hiddenElementId);
        }
        var allow = hiddenEle.attr("allow");
        var controllingParentLookupFieldId;
        controllingParentLookupFieldId = hiddenEle.attr("ControllingParentLookupId-FieldId");
        var isMobile = $('#formMobileEdit').length > 0;
        if (isMobile) {
            return;
        }

        if (root) {
            dialogEle = IfNotFirstSecond(root, secondRoot, "#lookup-" + serverId);
            submitButtonEle = IfNotFirstSecond(root, secondRoot, "#btn-" + serverId);
            ajaxTargetEle = IfNotFirstSecond(root, secondRoot, "#target-" + serverId);
            imgButtonEle = IfNotFirstSecond(root, secondRoot, "#imgbtn-" + serverId);
            textBoxControl = IfNotFirstSecond(root, secondRoot, "#textbox-" + serverId);
            fieldDependencySubmitBtn = IfNotFirstSecond(root, secondRoot, "#field-dependency-ajax-btn-" + serverId);
            childLookupSubmitBtn = IfNotFirstSecond(root, secondRoot, ".field-dependency-childlookup-ajax-btn-" + serverId);

            ControllingFieldRecordId = IfNotFirstSecond(root, secondRoot, "#field-dependency-depdent-record-" + serverId);
            dependentObjectId = IfNotFirstSecond(root, secondRoot, "#lookup-object-id-" + serverId);

            dependentObjectIdForform = IfNotFirstSecond(root, secondRoot, "#field-dependency-depdent-object-" + serverId);

            dependentDisplayId = IfNotFirstSecond(root, secondRoot, "#lookup-display-id-" + serverId);
            dependentDisplayIdForForm = IfNotFirstSecond(root, secondRoot, "#field-dependency-display-fieldid-" + serverId);

            primaryObjectId = IfNotFirstSecond(root, secondRoot, "#primary-object-id-" + serverId);
            primaryObjectIdForform = IfNotFirstSecond(root, secondRoot, "#field-dependency-primary-object-" + serverId);

        } else {
            dialogEle = $("#lookup-" + serverId);
            submitButtonEle = $("#btn-" + serverId);
            ajaxTargetEle = $("#target-" + serverId);
            imgButtonEle = $("#imgbtn-" + serverId);
            textBoxControl = $("#textbox-" + serverId);
            fieldDependencySubmitBtn = $("#field-dependency-ajax-btn-" + serverId);
            childLookupSubmitBtn = $(".field-dependency-childlookup-ajax-btn-" + serverId);

            ControllingFieldRecordId = $("#field-dependency-depdent-record-" + serverId);
            dependentObjectId = $("#object-id-" + serverId);
            dependentObjectIdForform = $("#field-dependency-depdent-object-" + serverId);
            dependentObjectIdForform = $("#field-dependency-depdent-object-" + serverId);

            dependentDisplayId = $("#lookup-display-id" + serverId);
            dependentDisplayIdForForm = $("#field-dependency-display-fieldid-" + serverId);

            primaryObjectId = $("#primary-object-id-" + serverId);
            primaryObjectIdForform = $("#field-dependency-primary-object-" + serverId);
        }

        var jqWindow;
        try {
            jqWindow = $(window.top);
            var width = jqWindow.width();
        } catch (e) {
            jqWindow = $(window);
        }
        $('div[pmclass]').each(function () {
            if ($(this).parent().prop("tagName").toLowerCase() == "body") {
                $(this).remove();
            }
        }
        );
        dialogEle.kendoWindow({
            autoOpen: false,
            width: "760px",
            height: "480px",
            modal: true,
            draggable: true,
            destroyOnClose: false,
            resizable: false,
            close: function (event) {
                $("#textbox-" + serverId).closest(".pm-dialog").show();
                ajaxTargetEle.empty();
                var isOverflowHidden = $("#textbox-" + serverId).closest(".pm-dialog").length || $("#textbox-" + serverId).closest(".k-window").length;
                if (!isOverflowHidden) {
                    $("body").removeClass('overflowHidden');
                }
            },
            open: function (event) {
                $("body").addClass('overflowHidden');
                this.element.data("kendoWindow").center();
            }
        });

        if (dialogEle.data("kendoWindow")) {
            dialogEle.data("kendoWindow").bind("close", function (event, ui) {
                var kendoDialog = $("#textbox-" + serverId).closest(".k-window");
                kendoDialog.length ? kendoDialog.show() : $("#textbox-" + serverId).closest(".pm-dialog").show();
                ajaxTargetEle.empty();
            });
            dialogEle.data("kendoWindow").bind("open", function (event, ui) {
                var container = $(event.sender.element);
                container.undelegate("tr", "click");
                container.delegate("tr", "click", function (event) {
                    var currentEle = $(this);
                    var someId = currentEle.attr("class");

                    if ((someId) && (someId == "grid-td-style")) {
                        var recordId = currentEle.attr("recordId");

                        if (recordId) {
                            var nameCell = $(currentEle.children()[0]);
                            var selectedText = nameCell.text();

                            closeDialogForLookup(recordId, selectedText, serverId);
                            //if it is instructor object , try to update payrate when value changed
                            var objectid = IfNotFirstSecond(root, secondRoot, "#fld_" + serverId).data("relation-object-id");
                            if (objectid == "15a420c7-6c93-4548-993a-f1d6e779e106") {
                                updatePayRates(recordId);
                            }
                        }
                    }
                });
                ajaxTargetEle.empty();
                $(ajaxTargetEle).closest(".pm-dialog").show();
            });
        }

        dialogEle.addClass("lookup-dialog");

        textBoxControl.change(function () {
            var theValue = hiddenEle.val();
            var theObjectId = dependentObjectId.val();
            var theDisplayId = dependentDisplayId.val();
            var primaryObjectIdValue = primaryObjectId.val();
            ControllingFieldRecordId.val(theValue);
            dependentObjectIdForform.val(theObjectId);
            dependentDisplayIdForForm.val(theDisplayId);
            primaryObjectIdForform.val(primaryObjectIdValue);
            fieldDependencySubmitBtn.click();
            // update the child lookup field

            childLookupSubmitBtn.each(function () {
                var parentForm = $(this).closest("Form");
                var childFieldId = $(".childfieldId", parentForm).val();
                var childFieldrecordId = $(".childrecordId", parentForm);
                var currentFieldrecordId = $(".currentRecordId", parentForm);
                var selectedValue = $("#fld_" + childFieldId).val();
                $(childFieldrecordId).val(selectedValue);
                var currentValue = hiddenEle.val();
                $(currentFieldrecordId).val(currentValue);
                $(this).trigger('click');
            });
        });

        if (allow) {
            imgButtonEle.add(textBoxControl).off("click").on("click", function (event) {
                if ($(this).hasClass("disabled")) {
                    event.preventDefault();
                    return false;
                }
                var kendoDialog = $(this).closest(".pm-dialog");
                kendoDialog.length ? kendoDialog.hide() : $(this).closest(".k-window").hide();
                var currentDialogId = dialogEle.attr('id');
                var isCurrentDialogAlreadyVisible = $('[id=' + currentDialogId + ']').length > 1;
                if (isCurrentDialogAlreadyVisible) {
                    var availableKendoWindow = $('.k-window-content[id=' + currentDialogId + ']');
                    if (availableKendoWindow.length > 1) {
                        $('[id=' + currentDialogId + ']:not(:last)').remove();
                    }
                    else {
                        $('[id=' + currentDialogId + ']:not(.k-window-content)').remove();
                    }
                }

                showLookupDialog(dialogEle, submitButtonEle, serverId, controllingParentLookupFieldId, dependentObjectId, root, secondRoot, ajaxTargetEle);
            });
        } else {
            imgButtonEle.off("click").on("click", function () {
                alert("No view permission to this object.");
            });
        }

    };

};
