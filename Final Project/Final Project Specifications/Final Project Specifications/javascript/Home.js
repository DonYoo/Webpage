
var images = [], x = 0;
images[0] = "image/Home_Image/Family.jpg"; 
images[1] = "image/Home_Image/Children.jpg";
images[2] = "image/Home_Image/Teens.jpg";
images[3] = "image/Home_Image/Adult.jpg"; 
images[4] = "image/Home_Image/Event.jpg";

var image_swap;
function displayNextImage() {
    x = (x === images.length - 1) ? 0 : x + 1;
    document.getElementById("home_img").src = images[x];
    if (g_Current_Page.hasClass("home")) {
        clearInterval(image_swap);
        startTimer();
    }
    if (g_Current_Page.parent().hasClass("Programs")) {
        clearInterval(image_swap);
        gotoProgram();
    }
};

function displayPreviousImage() {
    x = (x <= 0) ? images.length - 1 : x - 1;
    document.getElementById("home_img").src = images[x];
    if (g_Current_Page.hasClass("home")) {
        clearInterval(image_swap);
        startTimer();
    }
    if (g_Current_Page.parent().hasClass("Programs")) {
        clearInterval(image_swap);
        gotoProgram();
    }
};

function startTimer() {
    image_swap = setInterval(displayNextImage, 3000);
};

var g_Current_Page;

$(document).ready(function () {
    g_Current_Page = $(".home");
    Open_Vertical($(".home"));
    startTimer();
});

function goto_home() {
    Open_Vertical($(".home"));
    startTimer();
}
function goto_AboutUs() {
    Open_Vertical($(".AboutUs"));
}
function goto_Program() {
    Open_Vertical($(".Program_List"));
}
function goto_ContactUs() {
    Open_Vertical($(".ContactUs"));
}




function gotoProgram(y) {
    if (y != undefined) {
        x = y;
    }
    switch (x) {
        case 0:
            Open_Vertical($(".Family_Program"));
            break;
        case 1:
            Open_Vertical($(".Children_Program"));
            break;
        case 2:
            Open_Vertical($(".Teen_Program"));
            break;
        case 3:
            Open_Vertical($(".Adult_Program"));
            break;
        case 4:
            Open_Vertical($(".Event_Program"));
            break;
        default:
    }

}

function Open_Vertical(Next_Page) {
    clearInterval(image_swap);
    $("#menu_button").html("Menu").animate({ 'opacity': 1 }, 500);

    $(".menu_page").animate({ width: "0px" }, 600);
    $("#menu_list").hide();
    g_Current_Page.animate({ height: "0px" }, 600);
    g_Current_Page.hide();
    Next_Page.css("display", "inline");

    Next_Page.animate({ height: "100%" }, 1000);

    g_Current_Page = Next_Page;
}


function open_menu() {
    if ($(".menu_page").width() > 0) {
        $(".menu_page").animate({ width: "0px" }, 600);
        $("#menu_list").hide();
        $("#menu_button").html("Menu").animate({ 'opacity': 1 }, 500);
    }
    else {
        $("#menu").animate({ width: "80px" });
        $(".home").css("display", "hidden");
        $(".menu_page").css("display", "block");
        $(".menu_page").animate({ width: "100%" }, 600);
        $("#menu_list").fadeIn(1000);
        $("#menu_button").html("Fold").animate({ 'opacity': 1 }, 500);
    }
}


// hover the menu box. 
var timeoutId;
$(document).ready(function(){
    $("#menu").hover(function () {
        var that = this;
        if (!timeoutId) {
            timeoutId = window.setTimeout(function () {
                timeoutId = null; // EDIT: added this line
                
                $("#menu_button").animate({ 'opacity': 0 }, 0, function () {
                    if ($(".menu_page").width() > 500) {
                        $(this).html("Fold").animate({ 'opacity': 1 }, 300);
                    }
                    else {
                        $(that).animate({ width: "100px" });
                        $(this).html("Open").animate({ 'opacity': 1 }, 300);
                    }
                })
            }, 700);
        }
    },
    function () {
        if (timeoutId) {
            window.clearTimeout(timeoutId);
            timeoutId = null;
        }
        if ($(".menu_page").width() < 1) {
            $(this).animate({ width: "80px" });
            $("#menu_button").animate({ 'opacity': 0 }, 0, function () {
                    $(this).html("Menu").animate({ 'opacity': 1 }, 300);
            })
        }
    })
});
