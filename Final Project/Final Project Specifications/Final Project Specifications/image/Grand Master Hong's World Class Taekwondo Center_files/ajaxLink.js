PerfectMind.Ajax.Control.AjaxLinkBuilder = function () {

    // implementation of interface IControlBuilder

    this.BuildElementForPagelet = function (element, root, secondRoot) {
        var oneEle = $(element);
        oneEle.unbind("click");
        oneEle.bind("click", function (event) {
            AjaxLinkClick(event, oneEle, root, secondRoot);
        });
    };

    this.BuildElementForPage = function (element) {
        var oneEle = $(element);
        oneEle.unbind("click");
        oneEle.bind("click", function (event) {
            AjaxLinkClick(event, oneEle, null);
        });
    };

    this.GetCompatible = function () {
        return "showajaxlink";
    };

    PerfectMind.Ajax.Util.Reflection.FirstIsImplementationOfSecond(this, PerfectMind.Ajax.Control.IControlBuilder, true);

    // end of implementation of interface IControlBuilder

    AjaxLinkClick = function (event, ele, root, secondRoot) {
        var objv = ele.attr("ajaxobject");
        var actv = ele.attr("ajaxaction");
        var widthv = parseInt(ele.attr("ajaxwidth"));
        var heightv = parseInt(ele.attr("ajaxheight"));
        event.preventDefault();

        var anchorUrl = getAnchor();
        var fullUrl = anchorUrl + "dummy/Object/" + actv + "/" + objv;

        var dialogEle = $("#objectAjaxLoadingOutter");

        dialogEle.pmKendoDialog({
            autoOpen: true,
            width: widthv + "px" ,
            height: heightv + "px",
            modal: true,
            destroyOnClose: false,
            draggable: true
        });

        dialogEle.addClass(ele.data("dialog-class"));
        dialogEle.html("<img src ='" + anchorUrl + "Content/Images/ControlIcons/ajax-loader.gif'/>");
        dialogEle.data("kendoWindow").open().center();

        dialogEle.closest(".ui-dialog").css("background-image", "none");
        dialogEle.load(
                            fullUrl,
                            {},
                            function (responseText, textStatus, XMLHttpRequest) {
                                if (XMLHttpRequest.status == 500) {
                                    var documentText = responseText.toString();
                                    dialogEle.html(documentText);
                                }
                            }
                        );

        return false;
    };
};

