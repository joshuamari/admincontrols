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
//#endregion
checkLogin().then((emps) => {
  if (emps) {
    empDetails = emps;
    checkDesigP().then((desigp) => {
      if (desigp) {
        $(document).ready(function () {
          $(".hello-user").text(empDetails["empFName"]);
          ifSmallScreen();
          let list = document.querySelectorAll(".navigation li");
          function activeLink() {
            list.forEach((item) => item.classList.remove("active"));
            this.classList.add("active");
          }
          list.forEach((item) => item.addEventListener("click", activeLink));

          $(".startli").click();
        });
      } else {
        alert(`Access Denied`);
        window.location.href = `${rootFolder}`;
      }
    });
  } else {
    alert("Not logged in");
    window.location.href = `${rootFolder}/KDTPortalLogin`;
  }
});
//#region BINDS
$(document).on("click", ".toggle", function () {
  $(".navigation").toggleClass("actived");
  $(".main").toggleClass("actived");
});
//#endregion

//#region FUNCTIONS
function ifSmallScreen() {
  if ($(window).width() < 1060) {
    $("#addGroup").html("<i class='bx bx-plus fs-3' ></i>");
  }
}
function checkLogin() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "Includes/checkLogin.php",
      dataType: "json",
      success: function (data) {
        const emp = data;
        resolve(emp);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Resource not found.");
        } else if (xhr.status === 500) {
          reject(`Server error: ${error}`);
        } else {
          reject("Unspecified error");
        }
      },
    });
  });
}
function checkDesigP() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "ajax/check_desigAccess.php",
      data: {
        empNum: empDetails["empNum"],
      },
      dataType: "json",
      success: function (data) {
        const usrp = data;
        resolve(usrp);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Resource not found.");
        } else if (xhr.status === 500) {
          reject(`Server error: ${error}`);
        } else {
          reject("Unspecified error");
        }
      },
    });
  });
}
//#endregion
