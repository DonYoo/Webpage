PerfectMind.Ajax.Control.AddressBuilder = function() {

    // implementation of interface IControlBuilder

    this.BuildElementForPagelet = function(element, root, secondRoot) {
        var oneEle = $(element);
        oneEle.unbind("change");
        oneEle.bind("change", function() {
            CountryChange(element, root, secondRoot);
        });
    }

    this.BuildElementForPage = function(element) {
        var oneEle = $(element);
        oneEle.unbind("change");
        oneEle.bind("change", function() {
            CountryChange(element, null);
        });
    }

    this.GetCompatible = function() {
        return "pmaddress";
    }

    PerfectMind.Ajax.Util.Reflection.FirstIsImplementationOfSecond(this, PerfectMind.Ajax.Control.IControlBuilder, true);

    // end of implementation of interface IControlBuilder

    CountryChange = function(ele, root, secondRoot) {
        var domId = ele.id;
        var cutpoint = domId.length - 8;

        var fieldId = domId.substring(0, cutpoint);

        var theValue = $(ele).val();
        var theHidden;
        var theButton;

        if (root) {
            theHidden = IfNotFirstSecond(root, secondRoot, "#" + fieldId + "-country-id");
            theButton = IfNotFirstSecond(root, secondRoot, "#" + fieldId + "-ajax-btn");
        }
        else {
            theHidden = $("#" + fieldId + "-country-id");
            theButton = $("#" + fieldId + "-ajax-btn");
        }

        theHidden.val(theValue);
        theButton.click();

    }
};

