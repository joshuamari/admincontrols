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
let sections = [
  // { id: 1, secName: "Managemenst" },
  // { id: 2, secName: "Software" },
  // { id: 3, secName: "Engineering" },
];
let selectedSec = 1;
let designations = [];
//#endregion
checkLogin().then((emps) => {
  if (emps) {
    empDetails = emps;
    checkDesigP().then((desigp) => {
      if (desigp) {
        $(document).ready(function () {
          $(".hello-user").text(empDetails["empFName"]);
          let list = document.querySelectorAll(".navigation li");
          function activeLink() {
            list.forEach((item) => item.classList.remove("active"));
            this.classList.add("active");
          }
          list.forEach((item) => item.addEventListener("click", activeLink));
          $(".startli").click();
          Promise.all([
            checkGrpAccess(),
            checkUserP(),
            checkAppP(),
            checkCalendarP(),
            getSections(),
            getDesignations(),
          ])
            .then(([grpp, usrp, appp, clndr, secs, desigs]) => {
              $("#acNavLinks li.startli").nextAll().remove();
              if (grpp) {
                $("#acNavLinks li.startli")
                  .before(`<li class="" style="font-weight: 500">
          <a href="../groupList/">
          <span class="icon"><i class='bx bxs-group' ></i></span>
            <span class="title">Group List</span>
          </a>
        </li>`);
              }
              if (usrp) {
                $("#acNavLinks").append(`<li class="" style="font-weight: 500">
                <a href="../userPermission/">
                  <span class="icon"><i class="bx bxs-user-badge"></i></span>
                  <span class="title">User Permission</span>
                </a>
              </li>`);
              }
              if (appp) {
                $("#acNavLinks").append(`<li class="" style="font-weight: 500">
            <a href="../appPermission/">
              <span class="icon"><i class="bx bxs-window-alt"></i></span>
              <span class="title">App Permission</span>
            </a>
          </li>`);
              }
              if (clndr) {
                $("#acNavLinks").append(`<li class="" style="font-weight: 500">
              <a href="../calendar/">
                <span class="icon"><i class='bx bx-calendar'></i></span>
                <span class="title">Calendar</span>
              </a>
            </li>`);
              }
              if (secs) {
                sections = secs;
                fetchSections();
              }
              if (desigs) {
                designations = desigs;
                $("#sortable").empty();
                searchDesig();
              }
            })
            .catch((error) => {
              alert(`${error}`);
            });

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
  const sec = $(this).find("[sec-id]").attr("sec-id");
  selectedSec = sec;
  getDesignations().then((desig) => {
    designations = desig;
    $("#sortable").empty();
    searchDesig();
  });
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
$(document).on("keyup", "#searchBar", function () {
  $("#sortable").empty();
  searchDesig();
});
$(document).on("search", "#searchBar", function () {
  $("#sortable").empty();
  searchDesig();
});
$(document).on("click", ".btn-close", function () {
  resetAdd();
});
$(document).on("click", "#addBtn", function () {
  addDesig();
});
$(document).on("click", "#posName, #posAcr", function () {
  $(this).parent("div").find("small").addClass("hidden");
  $(this).removeClass("bg-red-400");
});
$(document).on("change", "#posSec", function () {
  $(this).parent("div").find("small").addClass("hidden");
  $(this).removeClass("bg-red-400");
});
$(document).on("change", ".toggleActive", function () {
  const isChecked = $(this).is(":checked");
  const posID = $(this).closest("tr").attr("pos-id");
  toggleActive(isChecked, posID).then((res) => {
    if (res) {
      getDesignations().then((desig) => {
        designations = desig;
        $("#sortable").empty();
        searchDesig();
      });
    }
  });
});
//#endregion

//#region FUNCTIONS
function checkLogin() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "../php/check_login.php",
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
function checkGrpAccess() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "ajax/check_groupAccess.php",
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
function checkUserP() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "ajax/check_userp.php",
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
function checkAppP() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "ajax/check_appp.php",
      data: {
        empNum: empDetails["empNum"],
      },
      dataType: "json",
      success: function (data) {
        const appp = data;
        resolve(appp);
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
function checkCalendarP() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "ajax/check_calendarAccess.php",
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
function fetchSections() {
  var str = "";
  var opts = "";
  $("#designationType").empty();
  $("#posSec").empty();
  sections.forEach(function (item, index) {
    var isActive = index === 0; // Check if current item is the first item (index 0)
    var activeClass = isActive ? "active" : "";
    str += `
      <li class="${activeClass}">
        <div class="flex justify-between items-center" sec-id=${item.id}>
          ${item.secName} <i class="bx bx-x text-[16px] delSec"></i>
        </div>
      </li>`;
    opts += `<option value="${index}" sec-id="${item.id}">${item.secName}</option>`;
  });
  $("#designationType").append(str);
  $("#posSec").append(opts);
}
function fillDeleteSection(secID, secName) {
  $("#secPlaceholder").attr("sec-id", secID);
  $("#secPlaceholder").text(secName);

  $("#delSectionModal").modal("show");
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
          const draggedItem = $(event.item); // Get the dragged item as a jQuery object
          const posId = draggedItem.attr("pos-id"); // Get the value of the "pos-id" attribute
          const oldIndex = parseInt(event.oldIndex); // Get the original index of the dragged item
          const newIndex = parseInt(event.newIndex); // Get the new index of the dragged item
          updateRanking(posId, oldIndex + 1, newIndex + 1).then((res) => {
            if (res.isSuccess) {
              getDesignations().then((desig) => {
                designations = desig;
                $("#sortable").empty();
                searchDesig();
              });
            } else {
              alert(`${res.message}`);
            }
          });
          // updateTableRanking();
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
          const draggedItem = $(event.item); // Get the dragged item as a jQuery object
          const posId = draggedItem.attr("pos-id"); // Get the value of the "pos-id" attribute
          const oldIndex = parseInt(event.oldIndex); // Get the original index of the dragged item
          const newIndex = parseInt(event.newIndex); // Get the new index of the dragged item
          updateRanking(posId, oldIndex + 1, newIndex + 1).then((res) => {
            if (res.isSuccess) {
              getDesignations().then((desig) => {
                designations = desig;
                $("#sortable").empty();
                searchDesig();
              });
            } else {
              alert(`${res.message}`);
            }
          });
        },
        filter: (event) =>
          $(event.target).closest("tr").hasClass("exclude-sortable"),
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
function getSections() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "ajax/get_sections.php",
      dataType: "json",
      success: function (response) {
        const sec = response;
        resolve(sec);
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
function getDesignations() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "ajax/get_designations.php",
      data: {
        sectionID: selectedSec,
      },
      dataType: "json",
      success: function (response) {
        const desig = response;
        resolve(desig);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Resource not found.");
        } else if (xhr.status === 500) {
          reject(`Server error: ${error}`);
        } else {
          reject("Unspecified error: Get Designations.");
        }
      },
    });
  });
}
function fillDesignations(desigs) {
  $.each(desigs, function (index, item) {
    const isChecked = item.manSum == 1 ? "checked" : "";
    const sortable = isChecked ? "" : "exclude-sortable";
    const sortableIcon = isChecked ? `<i class="bx bx-grid-vertical"></i>` : "";
    var tr = $(`<tr pos-id="${item.id}" class="${sortable}">`);
    tr.append(`<td>${index + 1}</td>`);
    tr.append(`<td>${item.name}</td>`);
    tr.append(`<td>${item.acro}</td>`);
    tr.append(
      `<td><div><input type="checkbox" class="checkbox toggleActive" role="switch" ${isChecked}></div></td>`
    );
    tr.append(
      `<td><div class="flex justify-center items-center">${sortableIcon}</div></td>`
    );
    $("#sortable").append(tr);
  });
}
function searchDesig() {
  const keyword = $("#searchBar").val();
  const searchResults = designations.filter((desig) => {
    return desig.name.toLowerCase().includes(keyword.toLowerCase());
  });
  fillDesignations(searchResults);
}
function resetAdd() {
  $("#posName, #posAcr").val("");
  $("#posSec").val(0);
}
function addDesig() {
  const name = $("#posName").val();
  const acro = $("#posAcr").val();
  const sectionID = $("#posSec").find(":selected").attr("sec-id");
  console.log(name, acro, sectionID);
  $("small").addClass("hidden");
  let ctr = 0;
  if (!name) {
    $("#posName").next("small").removeClass("hidden");
    $("#posName").addClass("bg-red-400");
    ctr++;
  }
  if (!acro) {
    $("#posAcr").next("small").removeClass("hidden");
    $("#posAcr").addClass("bg-red-400");
    ctr++;
  }
  if (ctr > 0) {
    return;
  } else {
    $.ajax({
      type: "POST",
      url: "ajax/add_designation.php",
      data: {
        name: name,
        acro: acro,
        sectionID: sectionID,
      },
      dataType: "json",
      success: function (response) {
        const isSuccess = response.isSuccess;
        if (!isSuccess) {
          alert(`${response.error}`); // Reject the promise
        } else {
          getDesignations().then((desig) => {
            $(".btn-close").click();
            designations = desig;
            $("#sortable").empty();
            searchDesig();
          });
        }
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          alert("Resource not found.");
        } else if (xhr.status === 500) {
          alert(`Server error: ${error}`);
        } else {
          alert("Unspecified error");
        }
      },
    });
  }
}
function toggleActive(toggle_state, pos_id) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "ajax/toggle_active.php",
      data: {
        toggleState: toggle_state,
        sectionID: selectedSec,
        posID: pos_id,
      },
      dataType: "json",
      success: function (data) {
        const result = data;
        resolve(result);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Resource not found.");
        } else if (xhr.status === 500) {
          reject(`Server error: ${error}`);
        } else {
          reject("Unspecified error: Toggle Active");
        }
      },
    });
  });
}
function updateRanking(pos_id, old_index, new_index) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "ajax/update_priority.php",
      data: {
        secID: selectedSec,
        posID: pos_id,
        oldIndex: old_index,
        newIndex: new_index,
      },
      dataType: "json",
      success: function (data) {
        const result = data;
        resolve(result);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Resource not found.");
        } else if (xhr.status === 500) {
          reject(`Server error: ${error}`);
        } else {
          reject("Unspecified error: Toggle Active");
        }
      },
    });
  });
}
//#endregion
