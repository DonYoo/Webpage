function registerNS(ns) {
    var nsParts = ns.split(".");
    var root = window;

    for (var i = 0; i < nsParts.length; i++) {
        if (typeof root[nsParts[i]] == "undefined")
            root[nsParts[i]] = new Object();

        root = root[nsParts[i]];
    }

    return root;
}

registerNS("PerfectMind.Layout.DynamicTabs");

PerfectMind.Layout.DynamicTabs.resizeTabsBar = function() {
    var headerWrapper, headerOuterWidth, headerPadding, containerWidth, dropdown, invisibleElements;

    headerWrapper = $("#header-wrapper"),
    headerOuterWidth = headerWrapper.outerWidth(false),
    headerPadding = headerOuterWidth - headerWrapper.width();

    containerWidth =
        headerWrapper.width()
            - headerPadding
            - $(".header-logo-td").width() - 100;
    $("#appSuiteContainer").width(containerWidth);
    $("#appSuiteCell").css("overflow", "");

    dropdown = $('#ObjectSelector ul');
    $('#object-tab-more').before($('li', dropdown));
    invisibleElements = [];
    $("#appsuite-nav li").show();
    $("#appsuite-nav li").not("#object-tab-more, #ObjectSelector > li").each(function(e) {
        var jqThis, eltRight, visible, childLink;
        jqThis = $(this);
        //eltRight = jqThis.position().left + jqThis.width();
        eltRight = jqThis.position().left + $("a", jqThis).width() + 10;
        visible = eltRight < containerWidth - $("#object-tab-more").width();
        childLink = $("a", jqThis);

        if (!visible) {
            if (childLink.is(".selected") || childLink.is(".tab-active")) {
                childLink.attr("class", "t-link selected");
            } else {
                childLink.attr("class", "t-link");
            }
            //childLink.removeClass("tab tab-active object-tab-link").addClass("t-link");

            invisibleElements.push(this);
        } else {
            if (childLink.is(".selected") || childLink.is(".tab-active")) {
                childLink.attr("class", "tab-active object-tab-link");
            } else {
                childLink.attr("class", "tab object-tab-link");
            }
            childLink.removeClass("t-link");
        }
    });

    $(invisibleElements).appendTo(dropdown);
    if ($("li", dropdown).length > 0) {
        $("#object-tab-more").css("visibility", "visible");
    } else {
        $("#object-tab-more").css("visibility", "hidden");
    }

    moreObjectTab = $("#object-tab-more > div");
    if ($(".selected", moreObjectTab).length > 0) {
        moreObjectTab.addClass("tab-active").removeClass("tab");
    } else {
        moreObjectTab.removeClass("tab-active").addClass("tab");
    }
    $("#appSuiteContainer").css("overflow", "visible");
};

PerfectMind.Layout.DynamicTabs.resizeTabsBarHeight = function (menuContainer) {

    var menu = menuContainer.type ? $(".t-group", menuContainer.target) : menuContainer,
        tab = menu.closest(".tab");
    
    if (!tab.length) {
        return;
    }

    var offset = tab.offset().top + tab.outerHeight() - $(document).scrollTop(),
        windowHeight = $(window).height(),
        maxHeight = parseInt(windowHeight - offset) * 0.66;
    
    menu.addClass("fixed-menu").css("max-height", maxHeight);
}
function getIEVersion() {
    var agent = navigator.userAgent;
    var reg = /MSIE\s?(\d+)(?:\.(\d+))?/i;
    var matches = agent.match(reg);
    if (matches != null) {
        return { major: matches[1], minor: matches[2] };
    }
    return { major: "-1", minor: "-1" };
}