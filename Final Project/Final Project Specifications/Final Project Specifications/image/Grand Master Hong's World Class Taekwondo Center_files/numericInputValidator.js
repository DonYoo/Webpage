PerfectMind.Ajax.Control.NumericInputValidatorBuilder = function () {

    // implementation of interface IControlBuilder

    this.BuildElementForPagelet = function (element, root, secondRoot) {
        var oneEle = $(element);
        oneEle.unbind("keypress");
        oneEle.bind('keypress', function (e) { return allowNumberKeysOnly(e, false); });
        oneEle.bind('paste', function (e) { return false; });
    }

    this.BuildElementForPage = function (element) {
        var oneEle = $(element);
        oneEle.unbind("keypress");
        oneEle.bind('keypress', function (e) { return allowNumberKeysOnly(e, false); });
        oneEle.bind('paste', function (e) { return false; });
    }

    this.GetCompatible = function () {
        return "pm_numeric_input_validator";
    }

    PerfectMind.Ajax.Util.Reflection.FirstIsImplementationOfSecond(this, PerfectMind.Ajax.Control.IControlBuilder, true);

    // end of implementation of interface IControlBuilder
};

