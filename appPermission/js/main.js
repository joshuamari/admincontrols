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
var project_id = "";
//#endregion
checkLogin()
  .then((emp) => {
    if (emp) {
      empDetails = emp;
      checkAppP().then((appp) => {
        if (appp) {
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
              checkDesigP(),
              checkUserP(),
              checkCalendarP(),
              getProjects(),
            ])
              .then(([grpp, desigp, usrp, clndr, projs]) => {
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
                if (usrp) {
                  $("#acNavLinks li.startli")
                    .before(`<li class="" style="font-weight: 500">
                  <a href="../userPermission/">
                    <span class="icon"><i class="bx bxs-user-badge"></i></span>
                    <span class="title">User Permission</span>
                  </a>
                </li>`);
                }
                // if (clndr) {
                //   $("#acNavLinks")
                //     .append(`<li class="" style="font-weight: 500">
                //     <a href="../calendar/">
                //     <span class="icon"><i class='bx bx-calendar'></i></span>
                //       <span class="title">Calendar</span>
                //     </a>
                //   </li>`);
                // }
                $("#cardContainer").empty();
                projects = projs;
                displayProjects();
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
  project_id = parseInt($(this).attr("proj-id"));
  $(".right .title span").text("");
  openProject(project_id);
});
$(document).on("click", "#btn-addAccessType", function () {
  var newAT = `
  <tr style="background-color:#2f363b;">
    <td colspan="1" style="vertical-align: middle;">
     <input id="accName" type="text" class="form-control" placeholder="Access name"/>
    </td>
    <td style="text-align: end;" colspan="1">
      <button id="btn-saveAccessType" class="btn d-inline-block justify-content-center p-0 me-1" title="Save" style="height: 35px; width: 35px; background-color: var(--green-color);"><i class='bx bx-save m-0' ></i></button>
      <button class="btn btn-danger d-inline-block justify-content-center p-0" title="Cancel" id="btn-cancelAddTR" style="height: 35px; width: 35px;"><i class='bx bx-x m-0' ></i></i></button>
    </td>
  </tr>`;

  $(newAT).insertBefore("#row-addAT");
  $(this).closest("tr").addClass("d-none");
  cancelModule();
});
$(document).on("click", "#btn-cancelAddTR", function () {
  $(this).closest("tr").remove();
  $(this).closest("tr").find("input").val("");
  $("#row-addAT").removeClass("d-none");
});
$(document).on("click", "#btn-saveAccessType", function () {
  var accname = $("#accName").val();
  saveAccess(accname);
});
$(document).on("click", "#closeAppModal", function () {
  cancelModule();
  project_id = "";
});
$(document).on("click", ".mod-item", function () {
  $(".mod-item").removeClass("active");
  $(this).addClass("active");

  var txt = $(this).text();
  if (txt) {
    $(".right .title span").text(txt + " Access Types");
    cancelAccessType();
    $("#row-addAT").removeClass("d-none");
    clickModule();
  }
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
  }
});
$(document).on("click", "input[type='radio']", function () {
  $(".colorpick").siblings("small").addClass("d-none");
});
$(document).on("click", "#btn-addModule", function () {
  $(".mod-items").append(`
  
  <li class="mod-item eto" mod-id=""><input id="modInput" style="border: 1px solid #ccc; "  type="text" class="form-control" placeholder="module name"/></li>`);
  $("#btn-saveModule, #btn-addModule").toggleClass("d-none");
  cancelAccessType();
  $(".right .title span").text("");
  $("#permList").empty();
  $("#modInput").click();
  $("#modInput").focus();
});
$(document).on("click", "#btn-saveModule", function () {
  var val = $(".mod-item:last input").val();
  $("#btn-saveModule, #btn-addModule").toggleClass("d-none");

  if (!val) {
    $(".mod-items").find("li:last").remove();
    return;
  }
  saveModule(val);
});
//#endregion

//#region FUNCTIONS
function checkLogin() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "Includes/check_login.php",
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
function getProjects() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "ajax/get_projects.php",
      dataType: "json",
      success: function (data) {
        const prjs = data;
        resolve(prjs);
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
        <span class="proj-title">${projectName}</span>
      </div><ul class="list-unstyled module-list mt-3 px-3">`;
    Object.keys(projectDetails.modules).forEach((moduleName) => {
      const moduleDetails = projectDetails.modules[moduleName];
      const moduleId = moduleDetails.module_id;
      addString += `<li>${moduleName}</li>`;
    });
    if (Object.keys(projectDetails.modules).length < 1) {
      addString += `<li class="w-100 h-100 text-center justify-self-center "
      style="    color: rgba(255, 255, 255, 0.6) !important;">
      No modules found. Please click to add module</li>`;
    }
    addString += `</ul></div></div>`;
  });
  $("#cardContainer").html(addString);
}
function openProject(projID) {
  const projectName = Object.keys(projects).find(
    (projectName) => projects[projectName].project_id === projID
  );
  $("#viewProjTitle").text(projectName);
  getModules(projID);
}
function getModules(projID) {
  $(".mod-items").empty();
  var addString = "";
  Object.keys(projects)
    .filter((projectName) => projects[projectName].project_id === projID)
    .forEach((projectName) => {
      const modules = projects[projectName].modules;
      Object.keys(modules).forEach((moduleName) => {
        const moduleId = modules[moduleName].module_id;
        addString += `<li class="mod-item" mod-id=${moduleId}>${moduleName}</li>`;
      });
    });
  $(".mod-items").html(addString);
  $("#permList").html(`No modules found`);
  $(".mod-items li:first-child").click();
}
function clickModule() {
  cancelModule();
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
            addString += `<tr><td colspan="2" style="vertical-align: middle;">${permissionName}(${permissionValue})</td></tr>`;
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
function cancelModule() {
  $("#btn-saveModule").addClass("d-none");
  $("#btn-addModule").removeClass("d-none");
  $(".mod-item.eto").remove();
}
function cancelAccessType() {
  $("#btn-cancelAddTR").click();
}
function addApp(name, color) {
  $.post(
    "ajax/add_app.php",
    {
      appName: name,
      appColor: color,
    },
    function (data) {
      if ($.parseJSON(data)) {
        alert(`Add failed: ${data}`);
        return;
      }
      getProjects().then((prjs) => {
        $("#cardContainer").empty();
        projects = prjs;
        displayProjects();
      });
      $("#close").click();
    }
  );
}
function saveModule(modName) {
  $.post(
    "ajax/add_module.php",
    {
      modName: modName,
      projID: project_id,
    },
    function (data) {
      if ($.parseJSON(data)) {
        alert(`Add failed: ${data}`);
        return;
      }
      getProjects().then((prjs) => {
        $("#cardContainer").empty();
        projects = prjs;
        displayProjects();
        getModules(project_id);
      });
    }
  );
}
function saveAccess(accName) {
  var modID = parseInt($(".mod-item.active").attr("mod-id"));
  $.post(
    "ajax/add_access.php",
    {
      modID: modID,
      accName: accName,
    },
    function (data) {
      if ($.parseJSON(data)) {
        alert(`Add failed: ${data}`);
        return;
      }
      getProjects().then((prjs) => {
        $("#cardContainer").empty();
        projects = prjs;
        displayProjects();
        $(".mod-item.active").click();
      });
    }
  );
}
//#endregion
