registerNS("PerfectMind.RegistrationFormPrompts");

PerfectMind.RegistrationFormPrompts.Init = function (options) {
    var objectId = options.objectId;
    var recordId = options.recordId;
    var registrationFormObjectId = options.registrationFormObjectId;
    var registrationFormsUrl = options.registrationFormsUrl;
    var isEditMode = options.isEditMode;
    var registrationFormLookup = $("div.pmmultilookup[objectid=" + registrationFormObjectId + "]").data("kendoMultiSelect");

    if (registrationFormLookup) {
        registrationFormLookup.options.customSourceUrl = registrationFormsUrl;
    }

    $(document).on("multilookupCreated" + registrationFormObjectId, function(element, selectedId, lookup) {
        registrationFormLookup = lookup;

        lookup.options.customSourceUrl = registrationFormsUrl;
        lookup.options.disableLookupItemClick = true;
        var value = lookup.options.value.Id;
        lookup.options.customCreate = function() {
            editRegForm(null, null, null, null, objectId);
        };

        lookup.reload({ value: [lookup.options.value.Id] });

        if (isEditMode) {
            var cell = lookup.wrapper.closest("td");
            var editRegistrationFormButton = $("<button>", { text: "Edit", "class": "pm-edit-button" }).hide().click(function() {
                editRegForm(registrationFormLookup.value().slice()[0], null, null, null, objectId);
                return false;
            });

            cell.append(editRegistrationFormButton);

            $('body').on('lookup-value-change', function(element, lookup) {
                if (lookup.objectId == registrationFormObjectId) {
                    lookup.value.length ? editRegistrationFormButton.show() : editRegistrationFormButton.hide();
                }
            });
        }
    });

    $(document).on("regisration-form-updated", function (event, result) {
        if (registrationFormLookup) {
            registrationFormLookup.reload(result.isNew ? { value: result.id } : null);
        }
    });

    if (!isEditMode) {

        $(document).ready(function() {

            var registrationFormRequired = "registration-form-required";
            subscribeButtonToRegistrationForm(App.Common.Store.AddCartToCartButtonId);
            subscribeButtonToRegistrationForm(App.Common.Store.CheckoutButtonId);
            subscribeButtonToRegistrationForm(App.Common.Store.BuyNowButtonId);

            function subscribeButtonToRegistrationForm(buttonId){

                var button = $("#btn" + buttonId + ", #btn" + buttonId).unbind("click.loader").click(function(event){
                if ($(this).attr(registrationFormRequired)) {
                    showRegistrationFormPriorAction({
                        objectId: objectId,
                        recordId: recordId,
                        callback: function() {
                            showPageLoader();
                            return button.removeAttr(registrationFormRequired).click();
                        }
                    });

                    event.preventDefault();
                }

                $(this).attr(registrationFormRequired, "true");

                }).attr(registrationFormRequired, "true");

                if (button.data('events')) {
                    var clickHandlers = button.data('events').click;
                    if (clickHandlers) {
                        clickHandlers.reverse();
                    }
                }
            }
        });
    }
};