PerfectMind.Ajax.Control.HtmlBuilder = function() {

    // implementation of interface IControlBuilder

    this.BuildElementForPagelet = function(element, root) {
        BuildOneHtml(element, root);
    }

    this.BuildElementForPage = function(element) {
        BuildOneHtml(element, null);
    }

    this.GetCompatible = function() {
        return "pmhtml";
    }

    PerfectMind.Ajax.Util.Reflection.FirstIsImplementationOfSecond(this, PerfectMind.Ajax.Control.IControlBuilder, true);

    // end of implementation of interface IControlBuilder

    BuildOneHtml = function(ele, root) {

// We no longer use CKEditor
//        var anchor = getAnchor();
//        CKEDITOR.replace(ele.id, {
//            filebrowserImageBrowseUrl: anchor + 'Menu/FileManager/OrganizationRoot',
//            filebrowserBrowseUrl: anchor + 'Menu/FileManager/OrganizationRoot',
//            filebrowserWindowWidth: 800,
//            filebrowserWindowHeight: 550
//        });

    }

};

