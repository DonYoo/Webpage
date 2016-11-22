var images = [], x = -1;
images[0] = "image/Home_Image/Family.jpg"; 
images[1] = "image/Home_Image/Children.jpg";
images[2] = "image/Home_Image/Teens.jpg";
images[3] = "image/Home_Image/Adult.jpg"; 
images[4] = "image/Home_Image/Event.jpg";

var image_swap;
function displayNextImage() {
    x = (x === images.length - 1) ? 0 : x + 1;
    document.getElementById("home_img").src = images[x];
    clearInterval(image_swap);
    startTimer();
};

function displayPreviousImage() {
    x = (x <= 0) ? images.length - 1 : x - 1;
    document.getElementById("home_img").src = images[x];
    clearInterval(image_swap);
    startTimer();
};

function startTimer() {
    image_swap = setInterval(displayNextImage, 3000);
};

function gotoProgram() {

}

function open_menu() {
    if ($(".menu_page").width() > 1000) {
        $(".menu_page").animate({ width: "0px" }, 1000);
        $("#menu_list").hide();
    }
    else {
        $("#menu").animate({ width: "80px" });
        $(".home").css("display", "hidden");
        $(".menu_page").css("display", "block");
        $(".menu_page").animate({ width: "1840px" }, 1000);
        $("#menu_list").fadeIn(3000);
        //$("#menu_list").fadeIn(2000);
    }
}

var timeoutId;
$(document).ready(function(){
    $("#menu").hover(function () {
        var that = this;
        if (!timeoutId) {
            timeoutId = window.setTimeout(function () {
                timeoutId = null; // EDIT: added this line
                $(that).animate({ width: "100px" });
                $("#menu_button").animate({ 'opacity': 0 }, 300, function () {
                    if ($(".menu_page").width() > 1000) {
                        $(this).html("Foldd").animate({ 'opacity': 1 }, 300);
                    }
                    else {
                        $(this).html("Open").animate({ 'opacity': 1 }, 300);
                    }
                })
            }, 500);
        }
    },
    function () {
        if (timeoutId) {
            window.clearTimeout(timeoutId);
            timeoutId = null;
        }
        $(this).animate({ width: "80px" });
        $("#menu_button").animate({ 'opacity': 0 }, 500, function () {
            if ($(".menu_page").width() > 1000) {
                $(this).html("Foldd").animate({ 'opacity': 1 }, 300);
            }
            else {
                $(this).html("Menu").animate({ 'opacity': 1 }, 300);
            }
        })
    })
});
