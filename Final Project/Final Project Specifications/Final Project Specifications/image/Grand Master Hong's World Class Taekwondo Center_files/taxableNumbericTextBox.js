PerfectMind.Ajax.Control.TaxableNumberTextBoxBuilder = function() {

    // implementation of interface IControlBuilder

    this.BuildElementForPagelet = function(element, root, secondRoot) {
        if ($.browser.ie)
            return;
        var oneEle = $(element);
        oneEle.bind("contextmenu", function (e) {
            return false;           
        });
        oneEle.bind('input', { parameters: oneEle.attr('pmParameters') },
                function(e) {
                    var parameters = e.data.parameters.split(',');
                    doTaxCalculationAndSetTotal(parameters[0], parameters[1], parameters[2], null, e);
                });
    }

    this.BuildElementForPage = function(element) {
        if ($.browser.ie)
            return;
        var oneEle = $(element);
        oneEle.bind("contextmenu", function (e) {
            return false;
        });
        oneEle.bind('input', { parameters: oneEle.attr('pmParameters') },
                function(e) {
                    var parameters = e.data.parameters.split(',');
                    doTaxCalculationAndSetTotal(parameters[0], parameters[1], parameters[2], null, e);
                });
    }

    this.GetCompatible = function() {
        return "pm_taxable_number_textbox";
    }

    PerfectMind.Ajax.Util.Reflection.FirstIsImplementationOfSecond(this, PerfectMind.Ajax.Control.IControlBuilder, true);

    // end of implementation of interface IControlBuilder
};

