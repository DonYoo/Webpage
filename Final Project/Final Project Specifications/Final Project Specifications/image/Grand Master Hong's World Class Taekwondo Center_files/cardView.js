registerNS("PerfectMind.CardView");

PerfectMind.CardView.currentPage = 1;

PerfectMind.CardView.loadPageAjax = function (pageIndex, options) {
    var tablename, criteria, viewId;
    options = options || {};
    options.pageSize = options.pageSize || 200;
    var gridRecords = options.gridContainerId ? $("#" + options.gridContainerId) : $(".gridRecords");
    var gridContainer = gridRecords.parent();
    
    tablename = gridRecords.attr("data-tablename");
    $(".t-refresh", gridContainer).addClass("t-loading");

    criteria = $('#criteria', gridContainer).val();
    viewId = $('#viewId', gridContainer).val();
    if (criteria == "Find...") criteria = undefined;
    var ajaxCallUrl = $('#cardViewAjaxUrl', gridContainer).attr("data");
    $.ajax({
        type: 'POST',
        url: ajaxCallUrl + "?tablename=" + tablename,
        data: {
            page: pageIndex,
            size: options.pageSize,
            criteria: criteria,
            viewId: viewId,
            isForInlineGrid: $("#isForInlineGrid", gridContainer).val(),
            ParentObjectId: $("#ParentObjectId", gridContainer).val(),
            ParentRecordId: $("#ParentRecordId", gridContainer).val(),
            RelatedFieldId: $("#RelatedFieldId", gridContainer).val(),
            ParentRecordName: $("#ParentRecordName", gridContainer).val(),
            ParentImageName: $("#ParentImageName", gridContainer).val()
        },
        context: document.body,
        success: function(result) {
            gridContainer.html(result);
            PerfectMind.CardView.currentPage = pageIndex;
            PerfectMind.View.Object.ActionMenu.Init();
            PerfectMind.CardView.immediateInitGrid(options);
            $(".t-refresh").removeClass("t-loading");
            PerfectMind.AddExportAndPrintToGrid();
        }
    });
};

PerfectMind.CardView.ajaxRequest = function () {
    PerfectMind.CardView.loadPageAjax(PerfectMind.CardView.currentPage);
}

PerfectMind.CardView.removeUnit = function (value) {
    if (value) {
        return parseInt(value.replace(/[^0-9|-]/g, ""), 10);
    } else {
        return 0;
    }
}

PerfectMind.CardView.setCellsWidth = function () {
    var gridWidth, cellWidth, i, gridContent, firstCardGridItem, extraWidth, marginLeft, marginRight;

    gridContent = $(".t-grid-content");
    if ($(".card-grid-item").size() == 0 || gridContent.length == 0) {
        return;
    }

    firstCardGridItem = $(".card-grid-item:first"),
        extraWidth = firstCardGridItem.outerWidth(false) - firstCardGridItem.width(),
        marginLeft = PerfectMind.CardView.removeUnit(firstCardGridItem.css("margin-left")),
        marginRight = PerfectMind.CardView.removeUnit(firstCardGridItem.css("margin-right")); ;

    if ($.browser.webkit) {
        //.width() return value with scrollbar width included, .css("width") don't
        gridWidth = PerfectMind.CardView.removeUnit(gridContent.css("width"));
    }
    else {
        // IE7 & Opera: .width() and .css("width") return the same value with scrollbar width included
        // IE8: .width() return value with scrollbar width included, .css("width") return a value larger than div width with scrollbar
        gridWidth = gridContent.width();
        //gridWidth = gridWidth - 17; ScrollBar is currently not used
        if (($.browser.msie && $.browser.version >= 8) || $.browser.opera) {
            gridContent.css("overflow", "hidden"); // otherwise IE8 always display a useless scrollbar
        }
    }

    for (i = 10; i > 0; i--) {
        cellWidth = gridWidth / i;
        if (cellWidth > 210 && cellWidth < 350) {
            cellWidth = Math.floor(cellWidth);
            break;
        }
    }

    if (!isNaN(marginLeft)) {
        extraWidth = extraWidth + PerfectMind.CardView.removeUnit(firstCardGridItem.css("margin-left"));
    }
    if (!isNaN(marginRight)) {
        extraWidth = extraWidth + PerfectMind.CardView.removeUnit(firstCardGridItem.css("margin-right"));
    }
    cellWidth = cellWidth - extraWidth;
    while ((cellWidth + extraWidth) * i > gridWidth) {
        cellWidth--;
    }
    $(".card-grid-item").width(cellWidth);
}

PerfectMind.CardView.setCellsHeight = function() {
    var maxHeight = 0;
    $(".cardview-container .inline-actionmenu").css("position","relative");
    $(".card-grid-item").each(function() {
        $(this).height("");
        var actionmenu = $(".inline-actionmenu", this);
        var height = $(this).height();
        if (actionmenu != null) {
            //height = height + actionmenu.height();
            //actionmenu.css("position","absolute");
            //actionmenu.show();
        }
        if (height > maxHeight) {
            maxHeight = height;
        }
    });

    $(".card-grid-item").height(maxHeight > 0 ? maxHeight : "auto").addClass("card-grid-item-border");
}

PerfectMind.CardView.immediateInitGrid = function (options) {
    if ($(".cardview-container").length == 0)
        return;

    var gridContainer = options && options.gridContainerId ? $("#" + options.gridContainerId).parent() : $(".gridRecords").parent();
    PerfectMind.CardView.pageSize = options && options.pageSize ? options.pageSize : PerfectMind.CardView.pageSize;
    PerfectMind.CardView.setCellsWidth();
    PerfectMind.CardView.setCellsHeight();

    $("a.t-refresh", gridContainer).unbind("click").click(function (event) {
        var currentPageIndex = $("#cardGridCurrentPage").attr("data-pageid");
        PerfectMind.CardView.loadPageAjax(currentPageIndex, options);
        return false;
    });

    $(".card-grid-item", gridContainer).unbind("click").click(function (event) {
        if (event.ctrlKey) {
            $(this).attr("data-selected", "selected");
        }
    });

    $(".card-grid-pageanchor", gridContainer).unbind("click").click(function (event) {
        if (!$(this).hasClass("t-state-disabled")) {
            PerfectMind.CardView.loadPageAjax(this.getAttribute("data-pageid"), options);
        }

        return false;
    });

    $("#cardGridPageInput", gridContainer).unbind("keydown").keydown(function (event) {
        if (event.keyCode === 13) {
            PerfectMind.CardView.loadPageAjax($(this).val(), options);
        }
    });
}

PerfectMind.CardView.initGrid = function() { };

PerfectMind.CardView.makeLabelsEllipsis = function () {
    $('.cardview-container .cv-label-text').ThreeDots({
        valid_delimiters: [' ', ',', '.', '@'],
        max_rows: 1,
        ellipsis_string: '&hellip;',
        text_span_class: 'label-text-ellipsis',
        whole_word: false,
        allow_dangle: false,
        alt_text_e: false,
        alt_text_t: true
    });
    $('.label-text-ellipsis').css('visibility', 'visible');
    PerfectMind.CardView.setCellsHeight();
};