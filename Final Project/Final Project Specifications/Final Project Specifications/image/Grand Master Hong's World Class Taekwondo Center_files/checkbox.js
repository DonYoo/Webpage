PerfectMind.Ajax.Control.CheckBoxBuilder = function () {

    // implementation of interface IControlBuilder

    this.BuildElementForPagelet = function (element, root, secondRoot) {
        var oneEle = $(element);
        oneEle.unbind("click");
        oneEle.bind("click", function () {
            changeValue(oneEle, root, secondRoot);
        });
    }

    this.BuildElementForPage = function (element) {
        var oneEle = $(element);
        oneEle.unbind("click");
        oneEle.bind("click", function () {
            changeValue(oneEle, null);
        });
    }

    this.GetCompatible = function () {
        return "pm-checkbox";
    }

    PerfectMind.Ajax.Util.Reflection.FirstIsImplementationOfSecond(this, PerfectMind.Ajax.Control.IControlBuilder, true);

    // end of implementation of interface IControlBuilder

    function changeValue(chk, root, secondRoot) {

        var id = chk.attr("id");
        var hidden = "dummy";
        if (root) {
            hidden = IfNotFirstSecond(root, secondRoot, '#' + id + '-hidden');
        }
        else {
            hidden = $('#' + id + '-hidden');
        }

        var isChecked = chk.prop('checked');
        if (isChecked) {
            hidden.attr('value', isChecked);
        }
        else {
            hidden.attr('value', false);
        }


        chk.trigger("clicked");
    }

};

