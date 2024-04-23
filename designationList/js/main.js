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
let sortable;
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
          fetchSections();
          initializeSortable();
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
$(document).on("click", ".menu", function () {
  $(".navigation").toggleClass("actived");
  $(".main").toggleClass("actived");
});
$(document).on("click", "#designationType li", function () {
  $("#designationType li").removeClass("active");
  $(this).addClass("active");
});
$(document).on("click", ".delSec", function () {
  var secID = $(this).parent().attr("sec-id");
  var secName = $(this).parent().text().trim();

  fillDeleteSection(secID, secName);
});
$(document).on("click", "#cancelDelModal", function () {
  $("#delSectionModal .btn-close").click();
});
$(document).on("click", "#delSection", function () {
  var secID = $("#secPlaceholder").attr("sec-id");
  console.log(secID);
  $("#designationType li div[sec-id='" + secID + "']").remove();
});
//#endregion

//#region FUNCTIONS
// function ifSmallScreen() {
//   if ($(window).width() < 1060) {
//     $("#addGroup").html("<i class='bx bx-plus fs-3' ></i>");
//   }
// }
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
function fetchSections() {
  var str = "";
  var data = [
    { id: 1, secName: "Management" },
    { id: 2, secName: "Software" },
    { id: 3, secName: "Engineering" },
  ];
  $("#designationType").empty();
  data.forEach(function (item, index) {
    var isActive = index === 0; // Check if current item is the first item (index 0)
    var activeClass = isActive ? "active" : "";
    str += `
      <li class="${activeClass}">
        <div class="flex justify-between items-center" sec-id=${item.id}>
          ${item.secName} <i class="bx bx-x text-[16px] delSec"></i>
        </div>
      </li>`;
  });
  $("#designationType").append(str);
}
function fillDeleteSection(secID, secName) {
  $("#secPlaceholder").attr("sec-id", secID);
  $("#secPlaceholder").text(secName);

  $("#delSectionModal").modal("show");
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

function initializeSortable() {
  const sortableList = document.getElementById("sortable");

  if (sortableList) {
    if (sortable) {
      // Destroy the existing instance by reinitializing
      sortable = new Sortable(sortableList, {
        animation: 150,
        onStart: function (event) {
          // Add dragging class to tr being dragged
          event.item.classList.add("dragging");
          event.item.style.cursor = "grabbing";
        },
        onEnd: function (event) {
          // Remove dragging class after dragging ends
          event.item.classList.remove("dragging");
          event.item.style.cursor = "grab";
        },
        onUpdate: function (event) {
          updateTableRanking();
        },
      });
    } else {
      // Initialize Sortable for the first time
      sortable = new Sortable(sortableList, {
        animation: 150,
        onStart: function (event) {
          // Add dragging class to tr being dragged
          event.item.classList.add("dragging");
        },
        onEnd: function (event) {
          // Remove dragging class after dragging ends
          event.item.classList.remove("dragging");
        },
        onUpdate: function (event) {
          updateTableRanking();
        },
      });
    }
  }
}
function updateTableRanking() {
  $("#sortable tr").each(function (index) {
    $(this)
      .find("td:first-child")
      .text(index + 1);
  });
}
//#endregion
