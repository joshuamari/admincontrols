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
var projects = [];
//#endregion
checkLogin();
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
  getProjects();
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
  $("#appName").prop("disabled", true);
  $("input[type='radio']").prop("checked", false);
});
$(document).on("click", "#close", function () {
  $(".btn-close").click();
});
$(document).on("click", ".card-item", function () {
  $("#viewPermissions").modal("show");
  var projID = parseInt($(this).attr("proj-id"));
  openProject(projID);
});
$(document).on("click", "#btn-addAccessType", function () {
  var newAT = `
  <tr style="background-color:#2f363b;">
    <td colspan="1" style="vertical-align: middle;">
     <input type="text" class="form-control" placeholder="Access name"/>
    </td>
    <td style="text-align: end;" colspan="1">
      <button id="btn-saveAccessType" class="btn d-inline-block justify-content-center p-0 me-1" title="Save" style="height: 35px; width: 35px; background-color: var(--green-color);"><i class='bx bx-save m-0' ></i></button>
      <button class="btn btn-danger d-inline-block justify-content-center p-0" title="Cancel" id="btn-cancelAddTR" style="height: 35px; width: 35px;"><i class='bx bx-x m-0' ></i></i></button>
    </td>
  </tr>`;

  $(newAT).insertBefore("#row-addAT");
  $(this).closest("tr").addClass("d-none");
});
$(document).on("click", "#btn-cancelAddTR", function () {
  $(this).closest("tr").remove();
  $(this).closest("tr").find("input").val("");
  $("#row-addAT").removeClass("d-none");
});
$(document).on("click", "#btn-saveAccessType", function () {
  $("#btn-addAccessType").closest("tr").removeClass("d-none");
  // SAVE ACCESS TYPE
});
$(document).on("click", "#closeAppModal", function () {
  $("#btn-cancelAddTR").click();
});
$(document).on("click", ".mod-item", function () {
  $(".mod-item").removeClass("active");
  $(this).addClass("active");

  var txt = $(this).text();
  $(".right .title span").text(txt + " Access Types");
  $("#btn-cancelAddTR").click();
  $("#row-addAT").removeClass("d-none");
  clickModule();
});
$(document).on("click", "#confirmaddApp", function () {
  var val = $("input[type='radio']:checked").val();
  var name = $("#appName").val();
  var err;
  if (!val) {
    $(".colorpick").siblings("small").removeClass("d-none");
    err++;
  }
  if (!name) {
    $("#appName").siblings("small").removeClass("d-none");
    err++;
  }

  if (err > 0) {
    return;
  } else {
    addApp(name, val);
    $("#close").click();
  }
});
$(document).on("click", "input[type='radio']", function () {
  $(".colorpick").siblings("small").addClass("d-none");
});
$(document).on("click", "#btn-addModule", function () {
  $(".mod-items").append(`
  
  <li class="mod-item eto" mod-id=""><input style="border: 1px solid #ccc; "  type="text" class="form-control" placeholder="module name"/></li>`);
  $("#btn-saveModule, #btn-addModule").toggleClass("d-none");
});
$(document).on("click", "#btn-saveModule", function () {
  var val = $(".mod-item:last input").val();
  $("#btn-saveModule, #btn-addModule").toggleClass("d-none");

  if (!val) {
    $(".mod-items").find("li:last").remove();
  } else {
    $(".mod-item:last").html(val);
  }
});
//#endregion

//#region FUNCTIONS
function checkLogin() {
  $.ajax({
    url: "Includes/check_login.php",
    success: function (data) {
      empDetails = $.parseJSON(data);
      if (Object.keys(empDetails).length < 1) {
        window.location.href = rootFolder + "/KDTPortalLogin";
      }
      adminAccess();
    },
    async: false,
  });
}
function adminAccess() {
  $.post(
    "ajax/check_admin.php",
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
function getProjects() {
  $("#cardContainer").empty();
  $.ajax({
    url: "ajax/get_projects.php",
    success: function (response) {
      projects = $.parseJSON(response);
      displayProjects();
      console.log(projects);
    },
  });
}
function displayProjects() {
  var addString = "";
  Object.keys(projects).forEach((projectName) => {
    const projectDetails = projects[projectName];
    const projectId = projectDetails.project_id;
    const projColor = projectDetails.project_color;
    addString += `<div class="col-md-6  col-xl-3 col-12  mb-3" >
    <div class="shadow  card-item" proj-id="${projectId}">
      <div class="card-title d-flex align-items-center gap-2">
        <span class="try ${projColor}"></span>
        <span>${projectName}</span>
      </div><ul class="list-unstyled module-list mt-3 px-3">`;
    Object.keys(projectDetails.modules).forEach((moduleName) => {
      const moduleDetails = projectDetails.modules[moduleName];
      const moduleId = moduleDetails.module_id;
      addString += `<li>${moduleName}</li>`;
    });
    addString += `</ul></div></div>`;
  });
  $("#cardContainer").html(addString);
}
function openProject(projID) {
  $(".mod-items").empty();
  var addString = "";
  Object.entries(projects).forEach(([projectName, projectDetails]) => {
    if (projectDetails.project_id === projID) {
      const modules = projectDetails.modules;
      $("#viewProjTitle").text(projectName);
      Object.keys(modules).forEach((moduleName) => {
        const moduleId = modules[moduleName].module_id;
        addString += `<li class="mod-item" mod-id=${moduleId}>${moduleName}</li>`;
      });
    }
  });
  $(".mod-items").html(addString);
  $(".mod-items li:first-child").click();
}
function clickModule() {
  $("#permList").empty();
  var addString = "";
  var modID = parseInt($(".mod-item.active").attr("mod-id"));
  Object.values(projects).forEach((projectDetails) => {
    const modules = projectDetails.modules;

    Object.keys(modules).forEach((moduleName) => {
      const module = modules[moduleName];

      if (module.module_id === modID) {
        const permissions = module.permissions;
        Object.entries(permissions).forEach(
          ([permissionName, permissionValue]) => {
            console.log(
              `Permission: ${permissionName}, Value: ${permissionValue}`
            );
            addString += `<tr><td colspan="2" style="vertical-align: middle;">${permissionName}</td></tr>`;
          }
        );
      }
    });
  });
  addString += `<tr id="row-addAT">
  <td colspan="2" style="text-align: center; background-color: #293134;"><button class="btn text-center w-100" id="btn-addAccessType"><i class='bx bx-plus me-1'></i>Add Access Type</button></td>
</tr>`;

  $("#permList").html(addString);
}
function addApp(name, color) {
  var str = `
  <div class="col-md-6  col-xl-3 col-12  mb-3" >
    <div class="shadow  card-item">
      <div class="card-title d-flex align-items-center gap-2">
        <span class="try ${color}"></span>
        <span>${name}</span>
      </div>
  
      <ul class="list-unstyled module-list mt-3 px-3">
       <li class="w-100 h-100 text-center justify-self-center "
       style="    color: rgba(255, 255, 255, 0.6) !important;">
       No modules found. Please click to add module</li>
      </ul>
    </div>
  </div>`;

  $("#cardContainer").append(str);
}
//#endregion
