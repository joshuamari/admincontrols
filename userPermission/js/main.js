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
var devs = [464, 487];
var empDetails = [];
var permissions = [];
const cloudNaviAllControl = 33;
//#endregion
checkLogin()
  .then((emp) => {
    if (emp) {
      empDetails = emp;
      checkUserP().then((userp) => {
        if (userp) {
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
              checkModify(),
              checkGrpAccess(),
              checkDesigP(),
              checkAppP(),
              checkCalendarP(),
              getEmployees(),
              getProjects(),
            ])
              .then(([modi, grpp, desigp, appp, clndr, emps, projs]) => {
                if (!modi) {
                  $("#modPermission").prop("disabled", "true");
                  $(document).off("click", "#savePermission");
                  $(document).off("click", "#modPermission");
                }
                if (grpp) {
                  $("#acNavLinks li.startli")
                    .before(`<li class="" style="font-weight: 500">
              <a href="../groupList/">
              <span class="icon"><i class='bx bxs-group' ></i></span>
                <span class="title">Group List</span>
              </a>
            </li>`);
                }
                // if (desigp) {
                //   $("#acNavLinks li.startli")
                //     .before(`<li class="" style="font-weight: 500">
                //     <a href="../designationList/">
                //     <span class="icon"><i class='bx bxs-award' ></i></span>
                //       <span class="title">Designation List</span>
                //     </a>
                //   </li>`);
                // }
                if (appp) {
                  $("#acNavLinks")
                    .append(`<li class="" style="font-weight: 500">
                  <a href="../appPermission/">
                    <span class="icon"><i class="bx bxs-window-alt"></i></span>
                    <span class="title">App Permission</span>
                  </a>
                </li>`);
                }
                if (clndr) {
                  $("#acNavLinks")
                    .append(`<li class="" style="font-weight: 500">
                    <a href="../calendar/">
                    <span class="icon"><i class='bx bx-calendar'></i></span>
                      <span class="title">Calendar</span>
                    </a>
                  </li>`);
                }
                $("#empList").empty();
                emps.map(fillEmployees);
                permissions = projs;
                fillProjects();
              })
              .catch((error) => {
                alert(`${error}`);
              });
          });
        } else {
          alert("Not logged in");
          window.location.href = `${rootFolder}/KDTPortalLogin`;
        }
      });
    }
  })
  .catch((error) => {
    alert(`${error}`);
  });
//#region BINDS
$(document).on("click", ".menu", function () {
  $(".navigation").toggleClass("actived");
  $(".main").toggleClass("actived");
  console.log("pindot");
});
$(document).on("click", ".btn-view", function () {
  var TR = $(this).closest("tr");
  var eNum = $($(TR).children()[0]).text();
  var name = $($(TR).children()[1]).text();
  $("#addPermission").modal("show");
  $("#empNamePermission").val(name);
  $("#empIDPermission").val(eNum);
  $(".app-items li:first-child").click();
});
$(document).on("keyup", "#searchWord", function () {
  getEmployees().then((emps) => {
    $("#empList").empty();
    emps.map(fillEmployees);
  });
});
$(document).on("search", "#searchWord", function () {
  getEmployees().then((emps) => {
    $("#empList").empty();
    emps.map(fillEmployees);
  });
});
$(document).on("click", ".app-item", function () {
  var tab = $(this).text();
  var projID = $(this).attr("mod-id");
  $(".app-item").removeClass("active");
  $(this).addClass("active");

  $(".right .title span").text(tab + " Permissions");
  $("#savePermission").addClass("d-none");
  $("#modPermission").removeClass("d-none");
  viewModules(projID);
  getPermissions(projID);
  $(".permission-items .form-check-input").attr("disabled", true);
});
$(document).on("click", "#modPermission", function () {
  $(this).toggleClass("d-none");
  $("#savePermission").toggleClass("d-none");
  $(".permission-items .form-check-input").attr("disabled", false);
  var permid = $('input[type="checkbox"]:checked').attr("perm-id");

  if (permid == cloudNaviAllControl) {
    $('input[type="checkbox"]').prop("disabled", true);

    $('input[type="checkbox"]:checked').prop("disabled", false);
  }
});
$(document).on("click", "#savePermission", function () {
  $(this).toggleClass("d-none");
  $("#modPermission").toggleClass("d-none");
  savePermissions();
  $(".permission-items .form-check-input").attr("disabled", true);
});
$(document).on("click", "#mclose", function () {
  $("#savePermission").addClass("d-none");
  $("#modPermission").removeClass("d-none");
});
$(document).on("change", "input[type='checkbox']", function () {
  //cloud navi pa-special amp
  if ($(this).attr("perm-id") == cloudNaviAllControl) {
    $('input[type="checkbox"]').prop("disabled", false);
    if ($(this).is(":checked")) {
      $('input[type="checkbox"]').prop("checked", false);
      $('input[type="checkbox"]').prop("disabled", true);
      $(this).prop("checked", true);
      $(this).prop("disabled", false);
    }
  }
});

//#endregion

//#region FUNCTIONS
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
function checkModify() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "ajax/check_modify.php",
      data: {
        empNum: empDetails["empNum"],
      },
      dataType: "json",
      success: function (data) {
        const modi = data;
        resolve(modi);
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
function getEmployees() {
  return new Promise((resolve, reject) => {
    const searchWord = $("#searchWord").val();
    $.ajax({
      type: "POST",
      url: "ajax/get_employees.php",
      data: {
        searchWord: searchWord,
      },
      dataType: "json",
      success: function (data) {
        const emplist = data;
        resolve(emplist);
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
function fillEmployees(empDeets) {
  var emp_id = empDeets["emp_id"];
  var emp_name = empDeets["emp_name"];
  var projs = empDeets["projs"];
  var projData = getBadges(projs);
  var addString = `
  <tr trid='${emp_id}'>
  <td>${emp_id}</td>
  <td>${emp_name}</td>
  <td class='apps'>
  ${projData}
  </td>
  <td >
                      <button class="btn btn-view" title="view">
                        <i class="bx bxs-folder-open"></i>
                      </button>
  </td>
  </tr>`;
  $("#empList").append(addString);
}
function getBadges(projArray) {
  var addString = ``;
  Object.keys(projArray).forEach((proj) => {
    const myClass = projArray[proj];
    addString += `<span class="badge ${myClass}">${proj}</span>`;
  });
  return addString;
}
function getProjects() {
  $(".app-items").empty();
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "ajax/get_projects.php",
      dataType: "json",
      success: function (data) {
        const projs = data;
        resolve(projs);
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
function fillProjects() {
  var addString = "";
  Object.keys(permissions).forEach((proj) => {
    const projName = permissions[proj]["project_name"];
    addString += `<li class="app-item" mod-id="${proj}">${projName}</li>`;
  });
  $(".app-items").html(`${addString}`);
}
function viewModules(projID) {
  $(".permission-items").empty();
  var addString = "";
  const filteredData = permissions[projID].modules;
  Object.keys(filteredData).forEach((outerKey) => {
    const innerObject = filteredData[outerKey];
    addString += `<div class="permission-item my-3">
    <span class="title mb-1">${outerKey} Module</span>`;

    Object.keys(innerObject).forEach((innerKey) => {
      const innerValue = innerObject[innerKey];
      addString += `<div class="form-check">
      <input
        class="form-check-input"
        type="checkbox"
        value=""
        perm-id="${innerKey}"
      />
      <label class="form-check-label" for="flexCheckDefault">
        ${innerValue}
      </label></div>`;
    });
    addString += `</div>`;
  });
  $(".permission-items").html(addString);
}
function getPermissions(projID) {
  var empID = $("#empIDPermission").val();
  $.post(
    "ajax/get_permissions.php",
    {
      projID: projID,
      empID: empID,
    },
    function (data) {
      var perms = $.parseJSON(data);
      perms.forEach(function (projectId) {
        $(`.form-check input[type="checkbox"][perm-id="${projectId}"]`).prop(
          "checked",
          true
        );
      });
    }
  );
}
function savePermissions() {
  var projID = $(".app-item.active").attr("mod-id");
  var empID = $("#empIDPermission").val();
  var perm = [];
  $(".form-check-input:checked").each(function () {
    perm.push(parseInt($(this).attr("perm-id")));
  });
  $.post(
    "ajax/save_permissions.php",
    {
      empID: empID,
      projID: projID,
      perm: perm,
    },
    function (data) {
      if ($.parseJSON(data)) {
        alert(`Save failed: ${data}`);
      }
      getPermissions(projID);
      getEmployees().then((emps) => {
        $("#empList").empty();
        emps.map(fillEmployees);
      });
    }
  );
}

//#endregion
