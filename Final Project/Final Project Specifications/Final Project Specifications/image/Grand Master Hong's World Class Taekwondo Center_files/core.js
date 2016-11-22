registerNS("PerfectMind.Ajax");
registerNS("PerfectMind.Ajax.Util.Reflection");
registerNS("PerfectMind.Ajax.Control");

PerfectMind.Ajax.AugumentException = function(argumentName, argumentValue) {
    this.argumentName = argumentName;
    this.argumentValue = argumentValue;
};

PerfectMind.Ajax.Util.Reflection.FirstIsImplementationOfSecond = function(theObject, theInterface, barkOnMismatch) {
    for (member in theInterface.prototype) {
        if (typeof theInterface.prototype[member] === "undefined") {
            continue;
        }
        else {
            if (!((typeof theInterface.prototype[member] == typeof theObject[member]))) {
                if (barkOnMismatch) {
                    var message = "The member: " + member + " is not implemented on the interface";
                    alert(message);
                    throw message;
                }
                return false;
            }
        }
    }

    return true;
}
