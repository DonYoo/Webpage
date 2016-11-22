PerfectMind.Ajax.Control.FieldDependencyBuilder = function() {

    // implementation of interface IControlBuilder

    this.BuildElementForPagelet = function(element, root, secondRoot) {
        var oneEle = $(element);
        registerFunction(oneEle);
    }

    this.BuildElementForPage = function(element) {
        var oneEle = $(element);
        registerFunction(oneEle);
    }

    this.GetCompatible = function() {
        return "pmFieldDependency";
    }

    PerfectMind.Ajax.Util.Reflection.FirstIsImplementationOfSecond(this, PerfectMind.Ajax.Control.IControlBuilder, true);

    // end of implementation of interface IControlBuilder

    function registerFunction(element, root, secondRoot) {
        var scriptElement = $(element);

        if (scriptElement && scriptElement.length > 0) {
            var functionStr = scriptElement.text();
            functionStr = functionStr.replace(/&lt;/g, "<");
            functionStr = functionStr.replace(/&gt;/g, ">");
            var starterIndex = functionStr.indexOf("changeValue");
            var endIndex = functionStr.indexOf(";");

            var funcName = functionStr.substring(starterIndex, endIndex-2);

            var funcBody = functionStr.substring(endIndex+2, functionStr.length-1);

            window[funcName] = new Function(undefined, funcBody);

            var objA = { doSomething: undefined };

            objA[funcName] = new Function(undefined, funcBody);




        }

    }

};

