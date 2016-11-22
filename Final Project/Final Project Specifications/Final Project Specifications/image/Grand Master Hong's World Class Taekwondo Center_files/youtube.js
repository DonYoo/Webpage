PerfectMind.Ajax.Control.YouTubeBuilder = function() {

    // implementation of interface IControlBuilder

    this.BuildElementForPagelet = function(element, root, secondRoot) {
        BuildYouTube(element, root, secondRoot);
    }

    this.BuildElementForPage = function(element) {
        BuildYouTube(element, null);
    }

    this.GetCompatible = function() {
        return "pmyoutube";
    }

    PerfectMind.Ajax.Util.Reflection.FirstIsImplementationOfSecond(this, PerfectMind.Ajax.Control.IControlBuilder, true);

    // end of implementation of interface IControlBuilder

    BuildYouTube = function(ele, root, secondRoot) {

        var id = ele.id;
        var videoValue;

        if (root) {
            videoValue = IfNotFirstSecond(root, secondRoot, "#" + id + "-video").val();
        }
        else {
            videoValue = $("#" + id + "-video").val();
        }
        LoadVideo(videoValue, 480, id);
    }

};

