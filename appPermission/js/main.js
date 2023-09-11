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

  getGroups();
});

$(document).on("click", ".btn-addEmp", function () {
  addEmpAccess();
});
$(document).on("click", "#addEmp", function () {});
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
  getEmpDetails(eNum);
});

$(document).on("click", "#close", function () {
  resetAdd();
});
$(document).on("click", "#xadd", function () {
  $("#close").click();
  resetAdd();
});
$(document).on("click", ".btn-close", function () {
  $("#clos").click();
  resetAdd();
});

$(document).on("keyup", "#searchWord", function () {
  getEmployees();
});
$(document).on("search", "#searchWord", function () {
  getEmployees();
});
$(document).on("click", ".rmv", function () {
  var removeID = $($(this).parent()).attr("val");
  var index = accessType.indexOf(removeID);
  if (index !== -1) {
    accessType.splice(index, 1);
  }
  console.log(accessType);
  $(this).parent().remove();
});
$(document).on("change", "#accessType", function () {
  var access = $("#accessType option:selected").val();
  var txt = $(`#accessType option:selected`).text();
  var badge = `<span class="mx-1 p-1 w-100 " val=${access} >
      ${txt} <i class="bx bx-x ps-1 rmv"></i>
    </span>`;

  accessType.push(access);

  $(".accesscont p").append(badge);
});
$(document).on("click", ".app-item", function () {
  var tab = $(this).text();
  $(".app-item").removeClass("active");
  $(this).addClass("active");

  $(".right .title span").text(tab + " Permissions");
  $("#savePermission").addClass("d-none");
  $("#modPermission").removeClass("d-none");
});
$(document).on("click", "#modPermission", function () {
  $(this).toggleClass("d-none");
  $("#savePermission").toggleClass("d-none");
  $(".permission-items .form-check-input").attr("disabled", false);
});
$(document).on("click", "#savePermission", function () {
  $(this).toggleClass("d-none");
  $("#modPermission").toggleClass("d-none");
  $(".permission-items .form-check-input").attr("disabled", true);
});
$(document).on("click", "#mclose", function () {
  $("#savePermission").addClass("d-none");
  $("#modPermission").removeClass("d-none");
});

$(document).on("click", ".btn-del", function () {
  eid = $(this).closest("tr").attr("trid");
  console.log(eid);
});
$(document).on("click", "#btn-delPermission", function () {
  $("#empList tr[trid='" + eid + "']").remove();
  $(".btn-close").click();
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

function getEmployees() {
  var employees = [];
  var searchWord = $("#searchWord").val();
  var active = 0;
  if ($("#activeOnly").is(":checked")) {
    active = 1;
  }
  $("#empList").empty();
  $.post(
    "ajax/getEmployees.php",
    {
      searchWord: searchWord,
      active: active,
    },
    function (data) {
      employees = $.parseJSON(data);
      employees.map(fillEmployees);
    }
  );
}
function fillEmployees(iVal) {
  var addString = ``;
  var employeeNumber = iVal.split("||")[0];
  var employeeName = iVal.split("||")[1];
  var employeeUser = iVal.split("||")[2];
  var employeeDepartment = iVal.split("||")[3];
  var employeeGroup = iVal.split("||")[4];
  var employeePosition = iVal.split("||")[5];
  addString = `<tr class='emp'>
<td>${employeeNumber}</td>
<td>${employeeName}</td>
<td>${employeeUser}</td>
<td>${employeeDepartment}</td>
<td>${employeeGroup}</td>
<td>${employeePosition}</td>
</tr>`;
  $("#empList").append(addString);
}
function getEmpDetails(iVal) {
  var empDeetsArray = [];
  $.post(
    "ajax/getEmpDetails.php",
    {
      empNum: iVal,
    },
    function (data) {
      empDeetsArray = $.parseJSON(data);
      // console.log(empDeetsArray)
    }
  );
}

function getGroups() {
  var grps = [];
  $(".empGroup").empty();

  var addString = ``;
  $(".empGroup").html(`<option value='' hidden>Select Group</option>`);

  $.ajax({
    url: "ajax/getGroups.php",
    success: function (data) {
      grps = $.parseJSON(data);
      grps.forEach((element) => {
        addString = `<option style="color: #333;">${element}</option>`;
        $(".empGroup").append(addString);
      });
    },
  });
}

function addEmpAccess() {
  var grp = $("#groupSel").val();
  var empid = $("#empID").val();
  var app = $("#appSel").val();
  var module = $("#moduleSel").val();
  var access = $;
}
function resetAdd() {
  $("#addEmpnum").val("");
  $(".m1,.m2,.m3,.m4,.m5,.m6,.m7,.m8,.m9,.m10,.m11,.m12").addClass("d-none");
}

//#endregion
// var projID=$($(this).find('option:selected')).attr('proj-id');

//#endregion
