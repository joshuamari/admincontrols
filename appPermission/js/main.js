//#region GLOBALS
const rootFolder = `//${document.location.hostname}`;
var empDetails = [];
var projects = [];
var project_id = "";
var selectedModuleId = "";
//#endregion

function refreshIcons() {
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }
}

checkLogin()
  .then((emp) => {
    if (emp) {
      empDetails = emp;
      checkAppP().then((appp) => {
        if (appp) {
          $(document).ready(function () {
            $(".hello-user").text(empDetails["empFName"]);
            refreshIcons();
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
                if (desigp) {
                  $("#acNavLinks li.startli")
                    .before(`<li class="" style="font-weight: 500">
                    <a href="../designationList/">
                    <span class="icon"><i class='bx bxs-award' ></i></span>
                      <span class="title">Designation List</span>
                    </a>
                  </li>`);
                }
                if (usrp) {
                  $("#acNavLinks li.startli")
                    .before(`<li class="" style="font-weight: 500">
                  <a href="../userPermission/">
                    <span class="icon"><i class="bx bxs-user-badge"></i></span>
                    <span class="title">User Permission</span>
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
                $("#cardContainer").empty();
                projects = projs;
                displayProjects();
                refreshIcons();
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
$(document).on("click", ".btn-manageModules", function (e) {
  e.preventDefault();
  e.stopPropagation();
  $(this).closest(".dropdown-menu").removeClass("show");
  openAppManagementModal($(this).closest(".card-item").attr("proj-id"), "modules");
});
$(document).on("click", ".btn-managePermissions", function (e) {
  e.preventDefault();
  e.stopPropagation();
  $(this).closest(".dropdown-menu").removeClass("show");
  openAppManagementModal(
    $(this).closest(".card-item").attr("proj-id"),
    "permissions"
  );
});
$(document).on("click", ".btn-viewAppActivity", function (e) {
  e.preventDefault();
  e.stopPropagation();
  $(this).closest(".dropdown-menu").removeClass("show");
  openAppManagementModal($(this).closest(".card-item").attr("proj-id"), "activity");
});
$(document).on("click", "#tabAppModules", function () {
  setAppManagementTab("modules");
});
$(document).on("click", "#tabAppPermissions", function () {
  setAppManagementTab("permissions");
});
$(document).on("click", "#tabAppActivity", function () {
  setAppManagementTab("activity");
});
$(document).on("click", "#btn-addAccessType", function () {
  var accname = $("#newPermissionName").val();
  saveAccess(accname);
});
$(document).on("keydown", "#newPermissionName", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    $("#btn-addAccessType").click();
  }
});
$(document).on("click", "#closeAppModal", function () {
  closeAppManagementModal();
});
$(document).on("keydown", function (e) {
  if (e.key !== "Escape") return;
  if ($("#viewPermissions").hasClass("flex")) {
    closeAppManagementModal();
  }
});
$(document).on("click", ".mod-item", function () {
  $(".mod-item").removeClass("active");
  $(this).addClass("active");
  selectedModuleId = $(this).attr("mod-id");

  var txt = $(this).text();
  if (txt) {
    $("#permSelectedTitle").text(txt + " Permissions");
    $("#newPermissionName").val("");
    $("#permissionSearch").val("");
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
  var val = $("#newModuleName").val();
  saveModule(val);
});
$(document).on("keydown", "#newModuleName", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    $("#btn-addModule").click();
  }
});
$(document).on("keyup search", "#moduleSearch", function () {
  renderModulesTabList(project_id);
});
$(document).on("keyup search", "#permModuleSearch", function () {
  var q = String($(this).val() || "").toLowerCase();
  $(".mod-item").each(function () {
    var match = $(this).text().toLowerCase().indexOf(q) !== -1;
    $(this).toggle(match);
  });
});
$(document).on("keyup search", "#permissionSearch", function () {
  clickModule();
});
$(document).on("click", ".btn-rename-module", function (e) {
  e.preventDefault();
  var $row = $(this).closest(".app-manage-row");
  enterModuleEditMode($row);
});
$(document).on("click", ".btn-cancel-module-name", function (e) {
  e.preventDefault();
  renderModulesTabList(project_id);
});
$(document).on("click", ".btn-save-module-name", function (e) {
  e.preventDefault();
  var $row = $(this).closest(".app-manage-row");
  saveModuleRename($row);
});
$(document).on("keydown", ".module-rename-input", function (e) {
  var $row = $(this).closest(".app-manage-row");
  if (e.key === "Enter") {
    e.preventDefault();
    saveModuleRename($row);
  } else if (e.key === "Escape") {
    e.preventDefault();
    e.stopPropagation();
    renderModulesTabList(project_id);
  }
});
$(document).on("click", ".btn-rename-perm", function (e) {
  e.preventDefault();
  var $row = $(this).closest(".app-manage-row");
  enterPermissionEditMode($row);
});
$(document).on("click", ".btn-cancel-perm-name", function (e) {
  e.preventDefault();
  clickModule();
});
$(document).on("click", ".btn-save-perm-name", function (e) {
  e.preventDefault();
  var $row = $(this).closest(".app-manage-row");
  savePermissionRename($row);
});
$(document).on("keydown", ".perm-rename-input", function (e) {
  var $row = $(this).closest(".app-manage-row");
  if (e.key === "Enter") {
    e.preventDefault();
    savePermissionRename($row);
  } else if (e.key === "Escape") {
    e.preventDefault();
    e.stopPropagation();
    clickModule();
  }
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
      <div class="card-title d-flex align-items-center justify-content-between gap-2">
        <div class="d-flex align-items-center gap-2 min-w-0">
          <span class="try ${projColor}"></span>
          <span class="proj-title whitespace-nowrap overflow-hidden">${projectName}</span>
        </div>
        <div class="relative shrink-0">
          <div
            class="flex justify-center items-center cursor-pointer rounded p-1 text-slate-300 hover:bg-[var(--light-color)] hover:text-white"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            title="Application actions"
          >
            <i data-lucide="ellipsis-vertical" class="h-4 w-4"></i>
          </div>
          <ul class="bg-[var(--dark-color)] dropdown-menu dropdown-menu-end">
            <li class="hover:bg-[var(--light-color)]">
              <a class="hover:bg-[var(--light-color)] dropdown-item flex gap-2 items-center text-white btn-manageModules cursor-pointer">
                <i data-lucide="layers" class="h-4 w-4"></i>Manage Modules
              </a>
            </li>
            <li class="hover:bg-[var(--light-color)]">
              <a class="hover:bg-[var(--light-color)] dropdown-item flex gap-2 items-center text-white btn-managePermissions cursor-pointer">
                <i data-lucide="shield-check" class="h-4 w-4"></i>Manage Module Permissions
              </a>
            </li>
            <li class="hover:bg-[var(--light-color)]">
              <a class="hover:bg-[var(--light-color)] dropdown-item flex gap-2 items-center text-white btn-viewAppActivity cursor-pointer">
                <i data-lucide="history" class="h-4 w-4"></i>View Activity Log
              </a>
            </li>
          </ul>
        </div>
      </div><ul class="list-unstyled module-list mt-3 px-3">`;
    Object.keys(projectDetails.modules).forEach((moduleName) => {
      addString += `<li>${moduleName}</li>`;
    });
    if (Object.keys(projectDetails.modules).length < 1) {
      addString += `<li class="w-100 h-100 text-center justify-self-center "
      style="    color: rgba(255, 255, 255, 0.6) !important;">
      No modules found</li>`;
    }
    addString += `</ul></div></div>`;
  });
  $("#cardContainer").html(addString);
  refreshIcons();
}
function getProjectName(projID) {
  return (
    Object.keys(projects).find(
      (projectName) => Number(projects[projectName].project_id) === Number(projID)
    ) || ""
  );
}
function getProjectModules(projID) {
  const projectName = getProjectName(projID);
  if (!projectName) return [];
  const modules = projects[projectName].modules || {};
  return Object.keys(modules).map((moduleName) => ({
    name: moduleName,
    id: modules[moduleName].module_id,
    permissions: modules[moduleName].permissions || {},
  }));
}
function openAppManagementModal(projID, tab) {
  project_id = parseInt(projID, 10);
  selectedModuleId = "";
  $("#newModuleName").val("");
  $("#newPermissionName").val("");
  $("#moduleSearch").val("");
  $("#permModuleSearch").val("");
  $("#permissionSearch").val("");
  $("#viewProjTitle").text(getProjectName(project_id) || "Application");
  $("#viewPermissions")
    .removeClass("hidden")
    .addClass("flex")
    .attr("aria-hidden", "false");
  $("body").addClass("overflow-hidden");
  getModules(project_id);
  setAppManagementTab(tab || "modules");
  refreshIcons();
}
function closeAppManagementModal() {
  $("#viewPermissions")
    .addClass("hidden")
    .removeClass("flex")
    .attr("aria-hidden", "true");
  $("body").removeClass("overflow-hidden");
  project_id = "";
  selectedModuleId = "";
}
function setAppManagementTab(tab) {
  const isModules = tab === "modules";
  const isPermissions = tab === "permissions";
  const isActivity = tab === "activity";
  $("#tabAppModules")
    .toggleClass(
      "app-mgmt-tab-active border-b-[var(--primary-color)] text-white",
      isModules
    )
    .toggleClass("border-transparent text-slate-400", !isModules)
    .attr("aria-selected", isModules ? "true" : "false");
  $("#tabAppPermissions")
    .toggleClass(
      "app-mgmt-tab-active border-b-[var(--primary-color)] text-white",
      isPermissions
    )
    .toggleClass("border-transparent text-slate-400", !isPermissions)
    .attr("aria-selected", isPermissions ? "true" : "false");
  $("#tabAppActivity")
    .toggleClass(
      "app-mgmt-tab-active border-b-[var(--primary-color)] text-white",
      isActivity
    )
    .toggleClass("border-transparent text-slate-400", !isActivity)
    .attr("aria-selected", isActivity ? "true" : "false");
  $("#panelAppModules").toggleClass("hidden", !isModules);
  $("#panelAppPermissions").toggleClass("hidden", !isPermissions);
  $("#panelAppActivity").toggleClass("hidden", !isActivity);
  if (isActivity) {
    loadAppPermissionActivityLog(project_id);
  }
  refreshIcons();
}
function openProject(projID) {
  const projectName = getProjectName(projID);
  $("#viewProjTitle").text(projectName);
  getModules(projID);
}
function renderModulesTabList(projID) {
  const query = String($("#moduleSearch").val() || "").toLowerCase();
  const modules = getProjectModules(projID).filter((mod) =>
    String(mod.name || "").toLowerCase().includes(query)
  );
  if (!modules.length) {
    $("#moduleManageList").html(
      `<div class="px-4 py-8 text-center text-sm text-slate-400">No modules found</div>`
    );
    const emptyTotal = getProjectModules(projID).length;
    $("#moduleCount").text(
      emptyTotal ? `${emptyTotal} module${emptyTotal === 1 ? "" : "s"}` : ""
    );
    refreshIcons();
    return;
  }
  const html = modules
    .map(
      (mod) => `<div class="app-manage-row" data-mod-id="${mod.id}" data-mod-name="${escapeAppHtml(mod.name)}">
      <span class="app-manage-name">${escapeAppHtml(mod.name)}</span>
      <button type="button" class="btn-rename-module shrink-0 rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white" title="Rename">
        <i data-lucide="pencil" class="h-4 w-4"></i>
      </button>
    </div>`
    )
    .join("");
  $("#moduleManageList").html(html);
  const total = getProjectModules(projID).length;
  $("#moduleCount").text(`${total} module${total === 1 ? "" : "s"}`);
  refreshIcons();
}
function enterModuleEditMode($row) {
  const name = $row.attr("data-mod-name") || "";
  renderModulesTabList(project_id);
  const $current = $(
    `#moduleManageList .app-manage-row[data-mod-id="${$row.attr("data-mod-id")}"]`
  );
  $current.html(`
    <input type="text" class="module-rename-input !block min-w-0 flex-1 !rounded-md !border !border-slate-700 !bg-[var(--dark-color)] px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring focus:ring-orange-700" value="${escapeAppHtml(name)}" />
    <button type="button" class="btn-save-module-name shrink-0 rounded-md !border-0 !bg-[var(--primary-color)] !px-3 !py-1.5 !text-sm !text-white hover:!bg-[#be5c24]">Save</button>
    <button type="button" class="btn-cancel-module-name shrink-0 rounded-md !border !border-slate-600 !bg-[var(--light-color)] !px-3 !py-1.5 !text-sm !text-slate-200 hover:!bg-slate-600">Cancel</button>
  `);
  $current.find(".module-rename-input").focus().select();
}
function saveModuleRename($row) {
  const modId = Number($row.attr("data-mod-id"));
  const oldName = String($row.attr("data-mod-name") || "");
  const newName = String($row.find(".module-rename-input").val() || "").trim();
  if (!newName || newName === oldName) {
    renderModulesTabList(project_id);
    return;
  }
  const renamed = renameModuleLocal(modId, newName);
  if (!renamed) {
    renderModulesTabList(project_id);
    return;
  }
  displayProjects();
  getModules(project_id);
}
function renameModuleLocal(modId, newName) {
  let renamed = false;
  Object.keys(projects).forEach((projectName) => {
    const modules = projects[projectName].modules || {};
    Object.keys(modules).forEach((moduleName) => {
      if (Number(modules[moduleName].module_id) !== Number(modId)) return;
      if (modules[newName] && Number(modules[newName].module_id) !== Number(modId)) {
        return;
      }
      if (moduleName === newName) return;
      modules[newName] = modules[moduleName];
      delete modules[moduleName];
      renamed = true;
    });
  });
  return renamed;
}
function getModules(projID) {
  renderModulesTabList(projID);
  $(".mod-items").empty();
  var addString = "";
  getProjectModules(projID).forEach((mod) => {
    addString += `<li class="mod-item" mod-id="${mod.id}">${escapeAppHtml(mod.name)}</li>`;
  });
  $(".mod-items").html(addString);
  $("#permManageList").html(
    `<div class="px-4 py-8 text-center text-sm text-slate-400">No modules found</div>`
  );
  $("#permSelectedTitle").text("Module Permissions");
  $("#permissionCount").text("");
  if (selectedModuleId) {
    const $existing = $(`.mod-item[mod-id="${selectedModuleId}"]`);
    if ($existing.length) {
      $existing.click();
      return;
    }
  }
  $(".mod-items li:first-child").click();
  refreshIcons();
}
function clickModule() {
  var modID = parseInt($(".mod-item.active").attr("mod-id"), 10);
  selectedModuleId = modID;
  const query = String($("#permissionSearch").val() || "").toLowerCase();
  var rows = [];
  Object.values(projects).forEach((projectDetails) => {
    const modules = projectDetails.modules || {};
    Object.keys(modules).forEach((moduleName) => {
      const module = modules[moduleName];
      if (Number(module.module_id) !== Number(modID)) return;
      const permissions = module.permissions || {};
      Object.entries(permissions).forEach(([permissionName, permissionValue]) => {
        if (String(permissionName).toLowerCase().indexOf(query) === -1) return;
        rows.push({
          name: permissionName,
          id: permissionValue,
        });
      });
    });
  });
  if (!modID) {
    $("#permManageList").html(
      `<div class="px-4 py-8 text-center text-sm text-slate-400">No modules found</div>`
    );
    $("#permissionCount").text("");
    refreshIcons();
    return;
  }
  if (!rows.length) {
    $("#permManageList").html(
      `<div class="px-4 py-8 text-center text-sm text-slate-400">No permissions found</div>`
    );
  } else {
    $("#permManageList").html(
      rows
        .map(
          (perm) => `<div class="app-manage-row" data-perm-id="${perm.id}" data-perm-name="${escapeAppHtml(perm.name)}" data-mod-id="${modID}">
          <span class="app-manage-name">${escapeAppHtml(perm.name)}</span>
          <button type="button" class="btn-rename-perm shrink-0 rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white" title="Rename">
            <i data-lucide="pencil" class="h-4 w-4"></i>
          </button>
        </div>`
        )
        .join("")
    );
  }
  const allCount = getPermissionCount(modID);
  $("#permissionCount").text(
    `${allCount} permission${allCount === 1 ? "" : "s"}`
  );
  refreshIcons();
}
function getPermissionCount(modID) {
  let count = 0;
  Object.values(projects).forEach((projectDetails) => {
    const modules = projectDetails.modules || {};
    Object.keys(modules).forEach((moduleName) => {
      if (Number(modules[moduleName].module_id) !== Number(modID)) return;
      count = Object.keys(modules[moduleName].permissions || {}).length;
    });
  });
  return count;
}
function enterPermissionEditMode($row) {
  const name = $row.attr("data-perm-name") || "";
  clickModule();
  const $current = $(
    `#permManageList .app-manage-row[data-perm-id="${$row.attr("data-perm-id")}"]`
  );
  $current.html(`
    <input type="text" class="perm-rename-input !block min-w-0 flex-1 !rounded-md !border !border-slate-700 !bg-[var(--dark-color)] px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring focus:ring-orange-700" value="${escapeAppHtml(name)}" />
    <button type="button" class="btn-save-perm-name shrink-0 rounded-md !border-0 !bg-[var(--primary-color)] !px-3 !py-1.5 !text-sm !text-white hover:!bg-[#be5c24]">Save</button>
    <button type="button" class="btn-cancel-perm-name shrink-0 rounded-md !border !border-slate-600 !bg-[var(--light-color)] !px-3 !py-1.5 !text-sm !text-slate-200 hover:!bg-slate-600">Cancel</button>
  `);
  $current.find(".perm-rename-input").focus().select();
}
function savePermissionRename($row) {
  const permId = Number($row.attr("data-perm-id"));
  const modId = Number($row.attr("data-mod-id"));
  const oldName = String($row.attr("data-perm-name") || "");
  const newName = String($row.find(".perm-rename-input").val() || "").trim();
  if (!newName || newName === oldName) {
    clickModule();
    return;
  }
  renamePermissionLocal(modId, permId, newName);
  displayProjects();
  clickModule();
}
function renamePermissionLocal(modId, permId, newName) {
  Object.values(projects).forEach((projectDetails) => {
    const modules = projectDetails.modules || {};
    Object.keys(modules).forEach((moduleName) => {
      if (Number(modules[moduleName].module_id) !== Number(modId)) return;
      const permissions = modules[moduleName].permissions || {};
      Object.keys(permissions).forEach((permissionName) => {
        if (Number(permissions[permissionName]) !== Number(permId)) return;
        if (permissions[newName] && Number(permissions[newName]) !== Number(permId)) {
          return;
        }
        if (permissionName === newName) return;
        permissions[newName] = permissions[permissionName];
        delete permissions[permissionName];
      });
    });
  });
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
  var name = String(modName || "").trim();
  if (!name) {
    return;
  }
  $.post(
    "ajax/add_module.php",
    {
      modName: name,
      projID: project_id,
    },
    function (data) {
      if ($.parseJSON(data)) {
        alert(`Add failed: ${data}`);
        return;
      }
      $("#newModuleName").val("");
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
  var name = String(accName || "").trim();
  var modID = parseInt($(".mod-item.active").attr("mod-id"), 10);
  if (!name || !modID) {
    return;
  }
  $.post(
    "ajax/add_access.php",
    {
      modID: modID,
      accName: name,
    },
    function (data) {
      if ($.parseJSON(data)) {
        alert(`Add failed: ${data}`);
        return;
      }
      $("#newPermissionName").val("");
      getProjects().then((prjs) => {
        $("#cardContainer").empty();
        projects = prjs;
        displayProjects();
        getModules(project_id);
      });
    }
  );
}

//#region APPLICATION PERMISSION ACTIVITY LOG
const USE_DUMMY_APP_PERMISSION_ACTIVITY_LOGS = true;

function escapeAppHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatAppPermissionActivityDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(String(dateStr).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return dateStr;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hh = String(hours).padStart(2, "0");
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} • ${hh}:${minutes} ${ampm}`;
}

async function getDummyAppPermissionActivity(applicationId) {
  if (!USE_DUMMY_APP_PERMISSION_ACTIVITY_LOGS) {
    return [];
  }

  const response = await fetch(
    "assets/mock/app-permission-activity.mock.json"
  );

  if (!response.ok) {
    console.error("Failed to load dummy application permission activity logs.");
    return [];
  }

  const data = await response.json();

  return (data.logs || [])
    .filter((log) => Number(log.application_id) === Number(applicationId))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function isApplicationCreatedEvent(item) {
  const eventType = String(item.event_type || "").toUpperCase();
  const description = String(item.description || "").toLowerCase();
  return (
    eventType === "APPLICATION_CREATED" ||
    description === "application created"
  );
}

function ensureLegacyAppCreate(logs) {
  const items = Array.isArray(logs) ? [...logs] : [];
  const hasAppCreate = items.some(isApplicationCreatedEvent);
  if (!hasAppCreate) {
    items.push({
      action: "CREATE",
      event_type: "APPLICATION_CREATED",
      description: "Application created",
      actor: null,
      created_at: null,
      details: {},
    });
  }
  return items;
}

function getAppPermissionActivityMeta(action) {
  const a = String(action || "").toUpperCase();
  if (a === "CREATE") {
    return {
      label: "CREATE",
      color: "text-emerald-400",
      ring: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/40",
      icon: "plus",
    };
  }
  return {
    label: "UPDATE",
    color: "text-sky-400",
    ring: "bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/40",
    icon: "pencil",
  };
}

function formatAppPermissionActivityDescription(item) {
  const eventType = String(item.event_type || "").toUpperCase();
  const actor = (item.actor && item.actor.name) || item.actor_name || "";
  const description = item.description || "";

  if (isApplicationCreatedEvent(item)) {
    return actor
      ? `Application created by ${escapeAppHtml(actor)}.`
      : "Application created";
  }
  if (eventType === "MODULE_CREATED") {
    return actor
      ? `Module added by ${escapeAppHtml(actor)}.`
      : escapeAppHtml(description || "Module added");
  }
  if (eventType === "PERMISSION_CREATED") {
    return actor
      ? `Permission added by ${escapeAppHtml(actor)}.`
      : escapeAppHtml(description || "Permission added");
  }
  if (eventType === "MODULE_RENAMED") {
    return actor
      ? `Module name updated by ${escapeAppHtml(actor)}.`
      : escapeAppHtml(description || "Module name updated");
  }
  if (eventType === "PERMISSION_RENAMED") {
    return actor
      ? `Permission name updated by ${escapeAppHtml(actor)}.`
      : escapeAppHtml(description || "Permission name updated");
  }
  if (actor && description) {
    return `${escapeAppHtml(description)} by ${escapeAppHtml(actor)}.`;
  }
  return escapeAppHtml(description);
}

function renderAppPermissionDetailRows(rows) {
  const html = rows
    .filter((row) => row && row.value)
    .map(
      (row) => `<div class="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
        <span class="min-w-[8rem] text-slate-400">${escapeAppHtml(row.label)}</span>
        <span class="text-slate-200">${row.value}</span>
      </div>`
    )
    .join("");
  if (!html) return "";
  return `<div class="mt-3 rounded-md border !border-slate-700 bg-[var(--bg-color)] p-3 space-y-2">${html}</div>`;
}

function renderChangeValue(oldVal, newVal) {
  return `<span class="text-slate-300">${escapeAppHtml(oldVal)}</span>
    <span class="text-slate-500">→</span>
    <span class="text-emerald-400">${escapeAppHtml(newVal)}</span>`;
}

function renderAppPermissionActivityDetails(item) {
  const eventType = String(item.event_type || "").toUpperCase();
  const details = item.details || {};

  if (isApplicationCreatedEvent(item)) return "";

  if (eventType === "MODULE_CREATED") {
    return renderAppPermissionDetailRows([
      { label: "Module", value: escapeAppHtml(details.module_name || "") },
    ]);
  }

  if (eventType === "MODULE_RENAMED") {
    const oldVal = details.old_value != null ? details.old_value : "";
    const newVal = details.new_value != null ? details.new_value : "";
    if (String(oldVal) === String(newVal)) return "";
    return renderAppPermissionDetailRows([
      { label: "Module", value: renderChangeValue(oldVal, newVal) },
    ]);
  }

  if (eventType === "PERMISSION_CREATED") {
    return renderAppPermissionDetailRows([
      { label: "Module", value: escapeAppHtml(details.module_name || "") },
      {
        label: "Permission",
        value: escapeAppHtml(details.permission_name || ""),
      },
    ]);
  }

  if (eventType === "PERMISSION_RENAMED") {
    const oldVal = details.old_value != null ? details.old_value : "";
    const newVal = details.new_value != null ? details.new_value : "";
    if (String(oldVal) === String(newVal)) return "";
    return renderAppPermissionDetailRows([
      { label: "Module", value: escapeAppHtml(details.module_name || "") },
      { label: "Permission", value: renderChangeValue(oldVal, newVal) },
    ]);
  }

  return "";
}

function renderAppPermissionActivityLog(activities) {
  const $timeline = $("#appPermissionActivityTimeline");
  $timeline.empty();

  const logs = ensureLegacyAppCreate(activities).filter((item) => {
    const action = String(item.action || "").toUpperCase();
    return action === "CREATE" || action === "UPDATE";
  });

  const sorted = [...logs].sort((a, b) => {
    const aAppCreate = isApplicationCreatedEvent(a);
    const bAppCreate = isApplicationCreatedEvent(b);
    if (aAppCreate && !bAppCreate) return 1;
    if (bAppCreate && !aAppCreate) return -1;
    const ta = a.created_at
      ? new Date(String(a.created_at).replace(" ", "T")).getTime()
      : 0;
    const tb = b.created_at
      ? new Date(String(b.created_at).replace(" ", "T")).getTime()
      : 0;
    return tb - ta;
  });

  let html = `<ol class="relative ms-3">`;
  sorted.forEach((item, index) => {
    const isLastActivity = index === sorted.length - 1;
    const meta = getAppPermissionActivityMeta(item.action);
    const when = item.created_at
      ? formatAppPermissionActivityDate(item.created_at)
      : "";
    const descriptionHtml = formatAppPermissionActivityDescription(item);
    const body = renderAppPermissionActivityDetails(item);

    html += `
      <li class="relative mb-6 ms-6">
        ${
          !isLastActivity
            ? `<span class="absolute -start-6 top-3.5 -bottom-6 w-px bg-slate-600" aria-hidden="true"></span>`
            : ""
        }
        <span class="absolute -start-[2.375rem] z-[1] flex h-7 w-7 items-center justify-center rounded-full bg-[var(--dark-color)] ${meta.ring}">
          <i data-lucide="${meta.icon}" class="h-3.5 w-3.5"></i>
        </span>
        <article class="rounded-lg border !border-slate-700 bg-[var(--card-color)] p-4">
          <div class="mb-1 flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs font-semibold tracking-wide ${meta.color}">${meta.label}</span>
            ${
              when
                ? `<time class="text-xs text-slate-400">${escapeAppHtml(when)}</time>`
                : ""
            }
          </div>
          <p class="text-sm text-slate-200">${descriptionHtml}</p>
          ${body}
        </article>
      </li>`;
  });
  html += `</ol>`;
  $timeline.html(html);
  refreshIcons();
}

function loadAppPermissionActivityLog(applicationId) {
  $("#appPermissionActivityTimeline").html(
    `<div class="py-6 text-center text-sm text-slate-400">Loading activity…</div>`
  );
  getDummyAppPermissionActivity(applicationId)
    .then(renderAppPermissionActivityLog)
    .catch((err) => {
      console.error(
        "Failed to load dummy application permission activity logs.",
        err
      );
      renderAppPermissionActivityLog([]);
    });
}
//#endregion

//#endregion
