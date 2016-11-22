/*
Scripts for Promote Rank by Exam VC
*/

var UpdateRankExamNamespace = {

    onExamDataBinding: function (e) {
        e.preventDefault();
    },
    onDataBinding: function (e) {
        if (examId == null || examId == '') {
            return false;
        }

        e.data = $.extend(e.data, { examId: examId });
    },
    onRowSelected: function (e) {

        $("#confirmExamMessage").css("display", "");
        $("#selectExamMessage").css("display", "none");

        var detailDiv = $("#detailGrid");
        var examDiv = $("#examGrid");
        detailDiv.css("display", "");
        examDiv.css("display", "none");
        var detailsGrid = $("#Deatils").data("tGrid");
        examId = e.row.cells[0].innerHTML;
        // rebind the related grid
        detailsGrid.rebind();

        var confirmButton = $('#promoteRankByExamPopup').closest('.k-window').find(".pm-dialog-buttonpane > .confirm-exam-buttom")[0];
        confirmButton.style.display = '';
        var examPopup = $('#promoteRankByExamPopup').closest('.k-window-content');
        if (examPopup.length)
            examPopup.pmKendoDialog('open');
    },

    confirmResults: function () {

        fullUrl = getAnchor() + "dummy/MartialArtsV3/ConfirmExamResults";

        var passedRecords = $("#detailGrid :input:checked");
        var failedRecords = $("#detailGrid :input:not(:checked)");

        var listOfPassedIds = "";
        var listOfFailedIds = "";

        $.each(passedRecords, function (i, val) {

            listOfPassedIds += val.value +
                (i == passedRecords.length - 1 ? "" : ';');

        });

        $.each(failedRecords, function (i, val) {

            listOfFailedIds += val.value +
                (i == failedRecords.length - 1 ? "" : ';');

        });

        data = { examId: examId, passedPromotionIds: listOfPassedIds, failedPromotionIds: listOfFailedIds };

        $.ajax({

            url: fullUrl,
            dataType: "json",
            type: "post",
            data: data,
            success: function (data) {
                // empty
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status !== 0) {
                    signUserOut();
                }
            },
            complete: function (data) {
                window.location.reload();
            }
        });

    },

    showExamsInAPopup: function (elementName) {
        virtualNotificationSettings = {
            title: 'Exam Update',
            buttons: [
                    { label: "Confirm", clickHandler: UpdateRankExamNamespace.confirmResults, style: "pm-confirm-button confirm-exam-buttom" },
                    { label: "Cancel" }
            ],
            refresh: function () {
                this.center();
            },
            open: function () {
                if ($("#detailGrid:visible").length) {
                    $(".pm-confirm-button.confirm-exam-buttom").show();
                }
                else {
                    $(".pm-confirm-button.confirm-exam-buttom").hide();
                }
            }
        };
    }
};