$(document).ready(function() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        $(".webcamButton").hide();
    }
    
    $(".img_sessions").each(function () {
        if ($(this).val() != "") {
            var sid = $(this).attr("id");            
            var id = sid.replace("img_session_", "");
            var preview = $("#img-" + id)[0];
            $('#img_data_' + id).val(sessionStorage.sid);
            preview.src = sessionStorage.sid;
        }
    });
});


function previewFile(id) {
    
    var preview = $("#img-"+id)[0];
    var file = $("#img_browse_" + id)[0].files[0];
    if (file && typeof FileReader != "undefined") {
        var reader = new FileReader();
        if (reader) {
            reader.onloadend = function() {
                preview.src = reader.result;
                if (typeof (Storage) !== "undefined") {
                    sessionStorage.sid = reader.result;
                    $("#img_session_" + id).val("1");
                }
            };
           
            reader.readAsDataURL(file);            
        }
    }
}

function ClearImage(id, noImageSrc) {    
    $('#'+id).val('').change();
    $('#img_browse_' + id).replaceWith($('#img_browse_' + id).val('').clone(true));
    $('#img-' + id).val('').attr('src', noImageSrc);
    $('#img_data_' + id).val('');
    $("#img_session_" + id).val("");
    return false;
}

function ShowCamera(id) {
    document._camera_target = id;

    var errBack = function (error) {
        alert("Webcam is not supported on this browser or not connected, please check your connection or use chrome browser to do so.");
    };

    var videoObj = {
        "video": true,
        mandatory: {
            minWidth: Math.min($(window).width() - 20, 620),
            minHeight: (Math.min($(window).width() - 20, 620)) * 2 / 3
        }
    };
    var video = document.getElementById("camera_popup_video");
    if (video != null) {
        if (video.readyState !== 4) {
            // Put video listeners into place
            if (navigator.webkitGetUserMedia) { // WebKit-prefixed
                navigator.webkitGetUserMedia(videoObj, function(stream) {
                    $(".webcamButton").show();
                    video.src = window.URL.createObjectURL(stream);
                    video.play();
                    $("#camera_popup").show();
                }, errBack);
            } else if (navigator.mozGetUserMedia) { // Firefox-prefixed
                navigator.mozGetUserMedia(videoObj, function(stream) {
                    $(".webcamButton").show();
                    video.src = window.URL.createObjectURL(stream);
                    video.play();
                    $("#camera_popup").show();
                }, errBack);
            } else if (navigator.msGetUserMedia) {
                navigator.msGetUserMedia(videoObj, function (stream) {
                    $(".webcamButton").show();
                    video.src = window.URL.createObjectURL(stream);
                    video.play();
                    $("#camera_popup").show();
                }, errBack);
            } else if (navigator.getUserMedia) { // Standard
                navigator.getUserMedia(videoObj, function(stream) {
                    $(".webcamButton").show();
                    video.src = window.URL.createObjectURL(stream);
                    video.play();
                    $("#camera_popup").show();
                }, errBack);
            }
        } else {
            $("#camera_popup").show();
        }
    } else
        alert('Sorry, Webcam is not supported in this page!');


}


function CloseCamera()
{
    $("#camera_popup").hide();
}

function CaptureCamera() {

    var id = document._camera_target;

    var canvas = $("#camera_canvas")[0];
    var context = canvas.getContext("2d");
    var video = document.getElementById("camera_popup_video");

    context.drawImage(video, 0, 0, 640, 480);
    $("#img-" + id).attr("src", canvas.toDataURL());

    $("#img_data_" + id).val(canvas.toDataURL());
    
    if (typeof (Storage) !== "undefined") {
        var sid = "img_session_" + id;
        sessionStorage.sid = canvas.toDataURL();
        $("#img_session_" + id).val("1");
    }

    $('#' + id).val('').change();
    $('#img_browse_' + id).replaceWith($('#img_browse_' + id).val('').clone(true));

    $("#camera_popup").hide();
}

