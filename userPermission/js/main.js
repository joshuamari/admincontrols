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
//#endregion
checkLogin();
//#region BINDS
$(document).ready(function () {
  let list = document.querySelectorAll(".navigation li");
  function activeLink() {
    list.forEach((item) => item.classList.remove("active"));
    this.classList.add("active");
  }
  list.forEach((item) => item.addEventListener("click", activeLink));

  $(".startli").click();

  getEmployees();
  getProjects();
});

$(document).on("click", ".toggle", function () {
  $(".navigation").toggleClass("actived");
  $(".main").toggleClass("actived");
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
$(document).on("input", "#searchWord", function () {
  getEmployees();
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

//#endregion

//#region FUNCTIONS
function checkLogin() {
  $.ajax({
    url: "Includes/checkLogin.php",
    success: function (data) {
      empDetails = $.parseJSON(data);
      if (Object.keys(empDetails).length < 1) {
        window.location.href = rootFolder + "/KDTPortalLogin";
      } else {
        checkUserP();
        checkModify();
        checkAppP();
        $(`.hello-user`).text(`${empDetails["empFName"]}`);
      }
    },
    async: false,
  });
}
function checkUserP() {
  $.post(
    "ajax/check_userp.php",
    {
      empNum: empDetails["empNum"],
    },
    function (data) {
      var access = $.parseJSON(data);
      if (!access) {
        alert("Access denied");
        window.location.href = `${rootFolder}`;
      }
    }
  );
}
function checkModify() {
  $.post(
    "ajax/check_modify.php",
    {
      empNum: empDetails["empNum"],
    },
    function (data) {
      var access = $.parseJSON(data);
      if (!access) {
        $("#modPermission").prop("disabled", "true");
        $(document).off("click", "#savePermission");
        $(document).off("click", "#modPermission");
      }
    }
  );
}
function checkAppP() {
  $.post(
    "ajax/check_appp.php",
    {
      empNum: empDetails["empNum"],
    },
    function (data) {
      var access = $.parseJSON(data);
      if (access) {
        $("#acNavLinks").append(`<li class="" style="font-weight: 500">
        <a href="../appPermission/">
          <span class="icon"><i class="bx bxs-window-alt"></i></span>
          <span class="title">App Permission</span>
        </a>
      </li>`);
      }
    }
  );
}
function getEmployees() {
  var employees = [];
  var searchWord = $("#searchWord").val();
  $("#empList").empty();
  $.post(
    "ajax/get_employees.php",
    {
      searchWord: searchWord,
    },
    function (data) {
      employees = $.parseJSON(data);
      employees.map(fillEmployees);
    }
  );
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
  <td class="d-flex gap-1">
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
  $.ajax({
    url: "ajax/get_projects.php",
    success: function (response) {
      permissions = $.parseJSON(response);
      fillProjects();
    },
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
      getEmployees();
      adminAccess();
      checkModify();
    }
  );
}

//#endregion
