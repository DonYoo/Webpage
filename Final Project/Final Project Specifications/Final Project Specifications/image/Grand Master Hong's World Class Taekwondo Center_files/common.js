PerfectMind.Ajax.Control.IControlBuilder = function() { };
PerfectMind.Ajax.Control.IControlBuilder.prototype.BuildElementForPagelet = function(ele, primaryFormContainer, ajaxHiddenFromsContainer) { };
PerfectMind.Ajax.Control.IControlBuilder.prototype.BuildElementForPage = function(ele) { };
PerfectMind.Ajax.Control.IControlBuilder.prototype.GetCompatible = function() { };

PerfectMind.Ajax.Control.ControlBuilderFactory = function () {
    ///Builds the entire page with all supported builders
    PerfectMind.Ajax.Control.ControlBuilderFactory.prototype.BuildPage = function () {
        var listOfBuilders = GetListOfAvailableBuilders();
        for (var i = 0; i < listOfBuilders.length; i++) {
            var oneBuilder = listOfBuilders[i];

            var css = oneBuilder.GetCompatible();
            var listOfElementsToBeBuilt = $("." + css);

            for (var j = 0; j < listOfElementsToBeBuilt.length; j++) {
                oneBuilder.BuildElementForPage(listOfElementsToBeBuilt[j]);
            }
        }
    };

    ///Builds all supported controls that are decendents of the root element
    PerfectMind.Ajax.Control.ControlBuilderFactory.prototype.BuildPagelet = function (root, ajaxHiddenFromsContainer, primaryFormContainer, swapRoot) {

        var moved = false;

        if ((ajaxHiddenFromsContainer) && (primaryFormContainer)) {
            var hiddenFormContent;
            var primaryFormContent;

            if (swapRoot) { // do not worry about this unless you are using this function with ajax
                hiddenFormContent = $("#controlAjaxHiddenForms", swapRoot);
                primaryFormContent = $("#objectAjaxPageLayout", swapRoot);
            }
            else {
                hiddenFormContent = $("#controlAjaxHiddenForms");
                primaryFormContent = $("#objectAjaxPageLayout");
            }


            //do the primary form first because this is visible
            primaryFormContent.detach();

            if ((typeof (CKEDITOR) !== 'undefined') && CKEDITOR) {
                $("textarea", primaryFormContainer).each(function () {
                    var htmleditor;
                    htmleditor = CKEDITOR.instances[this.id];
                    if (htmleditor) {
                        htmleditor.destroy();
                    }
                });
            }

            primaryFormContainer.empty();
            primaryFormContent.appendTo(primaryFormContainer);

            //then change the hidden form around
            hiddenFormContent.detach();
            ajaxHiddenFromsContainer.empty();
            hiddenFormContent.appendTo(ajaxHiddenFromsContainer);
            moved = true;
        }
        else {

            if (ajaxHiddenFromsContainer) throw "ajaxHiddenFromsContainer and primaryFormContainer parameter must be both assigned or skipped";
            if (primaryFormContainer) throw "ajaxHiddenFromsContainer and primaryFormContainer parameter must be both assigned or skipped";
        }

        if (!root) throw "Root element must be specified";

        var listOfBuilders = GetListOfAvailableBuilders();

        if (!moved) { // primary form moved? reset the root
            primaryFormContainer = root;
        }

        // do the event attachment AFTER the dom manipulation
        // because jQuery's internal event chaining is dependent on the element's relative position in the DOM
        for (var i = 0; i < listOfBuilders.length; i++) {
            var oneBuilder = listOfBuilders[i];

            var css = oneBuilder.GetCompatible();
            var listOfElementsToBeBuilt = IfNotFirstSecond(primaryFormContainer, ajaxHiddenFromsContainer, "." + css);

            for (var j = 0; j < listOfElementsToBeBuilt.length; j++) {
                oneBuilder.BuildElementForPagelet(listOfElementsToBeBuilt[j], primaryFormContainer, ajaxHiddenFromsContainer);
            }
        }
    };

    GetListOfAvailableBuilders = function () {

        var ret = new Array();
        //every builder needs to be registered here
        var checkBox = new PerfectMind.Ajax.Control.CheckBoxBuilder();
        ret[0] = checkBox;
        var datePicker = new PerfectMind.Ajax.Control.DateBuilder();
        ret[1] = datePicker;
        var html = new PerfectMind.Ajax.Control.HtmlBuilder();
        ret[2] = html;
        var tax = new PerfectMind.Ajax.Control.TaxBuilder();
        ret[3] = tax;
        var youtube = new PerfectMind.Ajax.Control.YouTubeBuilder();
        ret[4] = youtube;
        var lookup = new PerfectMind.Ajax.Control.LookupBuilder();
        ret[5] = lookup;
        var address = new PerfectMind.Ajax.Control.AddressBuilder();
        ret[6] = address;
        var dynalookup = new PerfectMind.Ajax.Control.DynamicLookupBuilder();
        ret[7] = dynalookup;
        var multi = new PerfectMind.Ajax.Control.MultiLookupBuilder();
        ret[8] = multi;
        var dateTimePicker = new PerfectMind.Ajax.Control.DateTimeBuilder();
        ret[9] = dateTimePicker;
        var fdBuilder = new PerfectMind.Ajax.Control.FieldDependencyBuilder();
        ret[10] = fdBuilder;
        var maskedNumberBuilder = new PerfectMind.Ajax.Control.MaskedNumberBuilder();
        ret[11] = maskedNumberBuilder;
        var taxableNumberTextBoxBuilder = new PerfectMind.Ajax.Control.TaxableNumberTextBoxBuilder;
        ret[12] = taxableNumberTextBoxBuilder;
        var numericInputValidatorBuilder = new PerfectMind.Ajax.Control.NumericInputValidatorBuilder();
        ret[13] = numericInputValidatorBuilder;

        return ret;
    }

    MergeAndTrimArrayContents = function (array1, array2) {

        var ret = new Array();
        var currentArrayLength = 0;
        for (var i = 0; i < array1.length; i++) {
            if (jQuery.inArray(array1[i], ret) == -1) {
                ret[currentArrayLength] = array1[i];
                currentArrayLength++;
            }
        }
        for (var i = 0; i < array2.length; i++) {
            if (jQuery.inArray(array2[i], ret) == -1) {
                ret[currentArrayLength] = array2[i];
                currentArrayLength++;
            }
        }

        return ret;
    }

};

IfNotFirstSecond = function (first, second, query) {
    // some versions of jquery throw an exception with "#" as a selector
    if (query === "#") return $();

    var firstResult = $(query, first);

    if ((firstResult) && (firstResult.length > 0)) {
        return firstResult;
    }
    var secondResult = $(query, second);
    if ((secondResult) && (secondResult.length > 0)) {
        return secondResult;
    }

    return $(query);
}
