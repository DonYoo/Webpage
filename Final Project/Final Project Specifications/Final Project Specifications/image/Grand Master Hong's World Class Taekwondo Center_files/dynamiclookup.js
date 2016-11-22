PerfectMind.Ajax.Control.DynamicLookupBuilder = function () {

    // implementation of interface IControlBuilder

    this.BuildElementForPagelet = function (element, root, secondRoot) {
        setupDynaLookupDialog(element.id, root, secondRoot);
        var selectEle = $("#" + element.id + "_ObjectID");
        selectEle.change(function () {
            var fieldId = element.id.replace("fld_", "");
            var frmEle = IfNotFirstSecond(root, secondRoot, "#frm-" + fieldId);           
            var objectEle = $("input[name='lookupObjectId']", frmEle);
            var displayFieldEle = $("input[name='lookupDisplayFieldId']", frmEle);
            objectEle.val($(selectEle).val());

            var option = $(this).find('option:selected');
            var fieldId = option.attr("lookup_field_id");
            displayFieldEle.val(fieldId);
        });
    };

    this.BuildElementForPage = function (element) {
        setupDynaLookupDialog(element.id, null);
    };

    this.GetCompatible = function () {
        return "pmdynamiclookup";
    };

    PerfectMind.Ajax.Util.Reflection.FirstIsImplementationOfSecond(this, PerfectMind.Ajax.Control.IControlBuilder, true);

    // end of implementation of interface IControlBuilder

    showDynaLookupDialog = function (dialogEle, selectEle, submitButtonEle, fieldId, root, secondRoot) {
        dialogEle.data("kendoWindow").open();
        // need set the default objectid and field id
        var frmEle = IfNotFirstSecond(root, secondRoot, "#frm-" + fieldId);
        var objectEle = $("input[name='lookupObjectId']", frmEle);
        var displayFieldEle = $("input[name='lookupDisplayFieldId']", frmEle);

        objectEle.val($(selectEle).val());

        var option = selectEle.options[selectEle.selectedIndex];
        var fieldId = $(option).attr("lookup_field_id");

        displayFieldEle.val(fieldId);
        // end 
        submitButtonEle.click();
    };

    closeDialogForDynamicLookup = function (id, text, fieldId, root, secondRoot) {
        IfNotFirstSecond(root, secondRoot, "#lookup-" + fieldId).data('kendoWindow').close();
        IfNotFirstSecond(root, secondRoot, "#fld_" + fieldId).val(id);
        IfNotFirstSecond(root, secondRoot, "#textbox-" + fieldId).val(text).change();
    };

    setupDynaLookupDialog = function (hiddenElementId, root, secondRoot) {

        var dialogEle;
        var submitButtonEle;
        var ajaxTargetEle;
        var imgButtonEle;
        var hiddenEle;
        var textEle;
        var selectEle;

        var serverId = hiddenElementId.replace("fld_", "");

        if (root) {
            hiddenEle = $("#" + hiddenElementId, root);
        } else {
            hiddenEle = $("#" + hiddenElementId);
        }

        if (root) {
            dialogEle = IfNotFirstSecond(root, secondRoot, "#lookup-" + serverId);
            submitButtonEle = IfNotFirstSecond(root, secondRoot, "#btn-" + serverId);
            ajaxTargetEle = IfNotFirstSecond(root, secondRoot, "#target-" + serverId);
            imgButtonEle = IfNotFirstSecond(root, secondRoot, "#imgbtndyna-" + serverId);
            textEle = IfNotFirstSecond(root, secondRoot, "#textbox-" + serverId);
            selectEle = IfNotFirstSecond(root, secondRoot, "#" + hiddenElementId + "_ObjectID")[0];
        } else {
            dialogEle = $("#lookup-" + serverId);
            submitButtonEle = $("#btn-" + serverId);
            ajaxTargetEle = $("#target-" + serverId);
            imgButtonEle = $("#imgbtn-" + serverId);
            textEle = $("#textbox-" + serverId);
            selectEle = $("#" + hiddenElementId + "_ObjectID")[0];
        }

        var isDesktop = $('#formMobileEdit').length == 0;
        if (isDesktop) {

            dialogEle.kendoWindow({
                autoOpen: false,
                width: "740px",
                height: "480px",
                modal: true,
                destroyOnClose: false,
                draggable: true,
                resizable: false,
                open: function (event) {
                    $("body").addClass('overflowHidden');
                    this.element.data("kendoWindow").center();  
                },
                close: function (event) {
                    var isOverflowHidden = $("#textbox-" + serverId).closest(".pm-dialog").length || $("#textbox-" + serverId).closest(".k-window").length;
                    if (!isOverflowHidden) {
                        $("body").removeClass('overflowHidden');
                    }
                }
            });

            dialogEle.addClass("dynamiclookup-dialog");

            dialogEle.data("kendoWindow").bind("open", function (event, ui) {
                var container = $(event.sender.element);
                container.undelegate("tr", "click");
                container.delegate("tr", "click", function (event) {

                    var currentEle = $(this);
                    var valueElement = IfNotFirstSecond(root, secondRoot, "#fld_" + serverId);
                    var someId = currentEle.attr("class");

                    if ((someId) && (someId == "grid-td-style")) {
                        var recordId = currentEle.attr("recordId");

                        if (recordId) {
                            var nameCell = $(currentEle.children()[0]);
                            //BUG-032408
                            var selectedText = nameCell.text();
                           // var selectedText = nameCell.html();

                            closeDialogForDynamicLookup(recordId, selectedText, serverId, root, secondRoot);

                            valueElement.trigger('recordChanged');
                        }
                    } else {
                        // See if the user clicked the None button
                        var theHtml = $(event.target).html();
                        if (theHtml.indexOf("None") >= 0)
                            valueElement.trigger('recordChanged');
                    }
                });
                ajaxTargetEle.empty();
            });

            dialogEle.data("kendoWindow").bind("close", function (event, ui) {
                ajaxTargetEle.empty();
            });

            imgButtonEle.unbind("click");
            imgButtonEle.bind("click", function () {
                showDynaLookupDialog(dialogEle, selectEle, submitButtonEle, serverId, root, secondRoot);
            });
            textEle.unbind("click");
            textEle.bind("click", function () {
                showDynaLookupDialog(dialogEle, selectEle, submitButtonEle, serverId, root, secondRoot);
            });
        } else {
            // Mobile version
        }

    };

};

