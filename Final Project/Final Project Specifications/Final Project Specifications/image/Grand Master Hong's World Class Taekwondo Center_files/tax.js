PerfectMind.Ajax.Control.TaxBuilder = function() {

    // implementation of interface IControlBuilder

    this.BuildElementForPagelet = function(element, root, secondRoot) {
        BuildTax(element, root, secondRoot);
    }

    this.BuildElementForPage = function(element) {
        BuildTax(element, null);
    }

    this.GetCompatible = function() {
        return "pmtaxpicklist";
    }

    PerfectMind.Ajax.Util.Reflection.FirstIsImplementationOfSecond(this, PerfectMind.Ajax.Control.IControlBuilder, true);

    // end of implementation of interface IControlBuilder

    BuildTax = function(ele, root, secondRoot) {

        var fieldId = ele.id.replace("fld_", "");
        var grandTotalHidden;
        var subTotalHidden;

        if (root) {
            grandTotalHidden = IfNotFirstSecond(root, secondRoot, "#grandtotal-" + fieldId);
            subTotalHidden = IfNotFirstSecond(root, secondRoot, "#subtotal-" + fieldId);
        }
        else {
            grandTotalHidden = $("#grandtotal-" + fieldId);
            subTotalHidden = $("#subtotal-" + fieldId);
        }

        var grandTotalFieldId = grandTotalHidden.val();
        var subTotalFieldId = subTotalHidden.val();

        doTaxCalculationAndSetTotalFirstTimer(subTotalFieldId, grandTotalFieldId, "$");


    }
};

