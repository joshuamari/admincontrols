//#region GLOBALS
switch (document.location.hostname) {
  case "kdt-ph":
    rootFolder = "//kdt-ph/";
    break;
  case "localhost":
    rootFolder = "//localhost/";
    break;
  default:
    rootFolder = "//kdt-ph/";
    break;
}
var empDetails = [];
var accessType = [];
var eid;
checkLogin();
adminAccess();
//#endregion

//#region BINDS
$(document).ready(function () {
  $(".hello-user").text(empDetails["empFName"]);
  let list = document.querySelectorAll(".navigation li");
  function activeLink() {
    list.forEach((item) => item.classList.remove("active"));
    this.classList.add("active");
  }
  list.forEach((item) => item.addEventListener("click", activeLink));

  $(".startli").click();
});

$(document).on("click", ".toggle", function () {
  $(".navigation").toggleClass("actived");
  $(".main").toggleClass("actived");
});
$(document).on("change", "input[type='radio']", function () {
  if (this.checked) {
    $("#appName").removeAttr("disabled");
  }
});
$(document).on("keyup", "#appName", function () {
  $(".badgePrev").empty();
  var val = $("input[type='radio']:checked").val();
  var txt = $("#appName").val();
  $(".badgePrev").append(`<span class="badge ${val}">${txt}</span>`);
});
$(document).on("click", ".btn-close", function () {
  $(".badgePrev").empty();
  $("#appName").val("");
  $("input[type='radio']").prop("checked", false);
});
$(document).on("click", "#close", function () {
  $(".btn-close").click();
});
$(document).on("click", ".card-item", function () {
  $("#viewPermissions").modal("show");
});
//#endregion

//#region FUNCTIONS
function checkLogin() {
  //check if user is logged in
  $.ajax({
    url: "Includes/checkLogin.php",
    success: function (data) {
      //ajax to check 9 is logged in
      empDetails = $.parseJSON(data);
      if (Object.keys(empDetails).length < 1) {
        //if result is 0, redirect to log in page
        window.location.href = rootFolder + "/KDTPortalLogin";
      }
    },
    async: false,
  });
}

function adminAccess() {
  //check if user has access to jmc
  $.post(
    "ajax/checkAdminAccess.php",
    {
      empNum: empDetails["empNum"],
    },
    function (data) {
      if (data.trim() == 0) {
        alert("Access denied");
        window.location.href = rootFolder + "/KDTPortalLogin";
      }
    }
  );
}

//#endregion
// var projID=$($(this).find('option:selected')).attr('proj-id');

//#endregion
