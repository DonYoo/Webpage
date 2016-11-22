PerfectMind.Ajax.Control.MaskedNumberBuilder = function() {

    // implementation of interface IControlBuilder

    this.BuildElementForPagelet = function(element, root, secondRoot) {
        var oneEle = $(element);
        oneEle.unbind("keypress");
        oneEle.bind('keypress', function(e) { return allowNumberKeysOnly(e, false); });
    }

    this.BuildElementForPage = function(element) {
        var oneEle = $(element);
        oneEle.unbind("keypress");
        oneEle.bind('keypress', function(e) { return allowNumberKeysOnly(e, false); });
    }

    this.GetCompatible = function() {
        return "pm_masked_number";
    }

    PerfectMind.Ajax.Util.Reflection.FirstIsImplementationOfSecond(this, PerfectMind.Ajax.Control.IControlBuilder, true);

    // end of implementation of interface IControlBuilder
};

