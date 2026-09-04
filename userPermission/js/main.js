if (typeof jQuery !== "undefined") {
  $.ajaxSetup({
    beforeSend: function (xhr) {
      if (window.CSRF_TOKEN) {
        xhr.setRequestHeader("X-CSRF-Token", window.CSRF_TOKEN);
      }
    },
  });
}

//#region GLOBALS
const rootFolder = `//${document.location.hostname}`;
var devs = [464, 487];
var empDetails = [];
var permissions = [];
const cloudNaviAllControl = 33;
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
      checkUserP().then((userp) => {
        if (userp) {
          $(document).ready(function () {
            refreshIcons();
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
                  $(document).off("click", "#cancelPermission");
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
                if (desigp) {
                  $("#acNavLinks li.startli")
                    .before(`<li class="" style="font-weight: 500">
                    <a href="../designationList/">
                    <span class="icon"><i class='bx bxs-award' ></i></span>
                      <span class="title">Designation List</span>
                    </a>
                  </li>`);
                }
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
          alert("Access denied");
          window.location.href = rootFolder;
        }
      });
    } else {
      alert("Not logged in");
      window.location.href = `${rootFolder}`;
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
$(document).on("click", ".btn-view", function () {
  var TR = $(this).closest("tr");
  var eNum = $($(TR).children()[0]).text();
  var name = $($(TR).children()[1]).text();
  $("#addPermission").modal("show");
  $("#empNamePermission").val(name);
  $("#empIDPermission").val(eNum);
  $("#appPermissionSearch").val("");
  $(".app-item").show();
  $(".app-items li:first-child").click();
  setPermissionTab("permissions");
});
$(document).on("click", "#tabPermissions", function () {
  setPermissionTab("permissions");
});
$(document).on("click", "#tabActivity", function () {
  setPermissionTab("activity");
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

  $("#permSelectedTitle").text(tab + " Permissions");
  viewModules(projID);
  getPermissions(projID);
  setPermissionModifyMode(false);
});
$(document).on("keyup search", "#appPermissionSearch", function () {
  var q = String($(this).val() || "").toLowerCase();
  $(".app-item").each(function () {
    var match = $(this).text().toLowerCase().indexOf(q) !== -1;
    $(this).toggle(match);
  });
});
$(document).on("click", "#modPermission", function () {
  setPermissionModifyMode(true);
  var permid = $('input[type="checkbox"]:checked').attr("perm-id");

  if (permid == cloudNaviAllControl) {
    $('input[type="checkbox"]').prop("disabled", true);

    $('input[type="checkbox"]:checked').prop("disabled", false);
  }
});
$(document).on("click", "#savePermission", function () {
  savePermissions();
  setPermissionModifyMode(false);
});
$(document).on("click", "#cancelPermission", function () {
  var projID = $(".app-item.active").attr("mod-id");
  viewModules(projID);
  getPermissions(projID);
  setPermissionModifyMode(false);
});
$(document).on("click", "#mclose", function () {
  setPermissionModifyMode(false);
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
  refreshIcons();
}
function viewModules(projID) {
  $(".permission-items").empty();
  var addString = "";
  const filteredData = permissions[projID].modules;
  const moduleKeys = Object.keys(filteredData);
  moduleKeys.forEach((outerKey, index) => {
    const innerObject = filteredData[outerKey];
    const isLast = index === moduleKeys.length - 1;
    addString += `<div class="permission-item${isLast ? "" : " border-b !border-slate-700"} py-3">
    <span class="title mb-2 block text-sm font-medium text-slate-200">${outerKey} Module</span>`;

    Object.keys(innerObject).forEach((innerKey) => {
      const innerValue = innerObject[innerKey];
      addString += `
      <div class="form-check">
  <label class="form-check-label flex cursor-pointer items-center gap-2">
    <input
      class="form-check-input"
      type="checkbox"
      value=""
      perm-id="${innerKey}"
    />
    <span>${innerValue}</span>
  </label>
</div>`;
    });
    addString += `</div>`;
                                                                                                                                                                                                                                                                                                       
  });
  $(".permission-items").html(addString);
}
function setPermissionModifyMode(isEditing) {
  $("#modPermission").toggleClass("d-none", isEditing);
  $("#savePermission").toggleClass("d-none", !isEditing);
  $("#cancelPermission").toggleClass("d-none", !isEditing);
  $("#editingEnabledBadge").toggleClass("d-none", !isEditing);
  $(".permission-items .form-check-input").attr("disabled", !isEditing);
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

function setPermissionTab(tab) {
  const isPermissions = tab === "permissions";
  $("#tabPermissions")
    .toggleClass(
      "perm-tab-active border-b-[var(--primary-color)] text-white",
      isPermissions
    )
    .toggleClass("border-transparent text-slate-400", !isPermissions)
    .attr("aria-selected", isPermissions ? "true" : "false");
  $("#tabActivity")
    .toggleClass(
      "perm-tab-active border-b-[var(--primary-color)] text-white",
      !isPermissions
    )
    .toggleClass("border-transparent text-slate-400", isPermissions)
    .attr("aria-selected", isPermissions ? "false" : "true");
  $("#panelPermissions").toggleClass("hidden", !isPermissions);
  $("#panelActivity").toggleClass("hidden", isPermissions);
  if (!isPermissions) {
    loadUserPermissionActivityLog($("#empIDPermission").val());
  }
  refreshIcons();
}

//#region USER PERMISSION ACTIVITY LOG
const USE_DUMMY_USER_PERMISSION_ACTIVITY_LOGS = true;

function formatUserPermissionActivityDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr.replace(" ", "T"));
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

function escapeUserPermissionActivityHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function getDummyUserPermissionActivity(employeeId) {
  if (!USE_DUMMY_USER_PERMISSION_ACTIVITY_LOGS) {
    return [];
  }

  const response = await fetch(
    "assets/mock/user-permission-activity.mock.json"
  );

  if (!response.ok) {
    console.error("Failed to load dummy user permission activity logs.");
    return [];
  }

  const data = await response.json();

  return (data.logs || [])
    .filter((log) => Number(log.employee_id) === Number(employeeId))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function renderUserPermissionApplicationChanges(applications) {
  if (!Array.isArray(applications) || !applications.length) return "";

  const blocks = applications
    .map((app) => {
      const added = Array.isArray(app.added)
        ? app.added.filter(Boolean)
        : [];
      const removed = Array.isArray(app.removed)
        ? app.removed.filter(Boolean)
        : [];
      if (!added.length && !removed.length) return "";

      let sections = "";
      if (added.length) {
        sections += `<div>
          <p class="text-xs font-medium text-emerald-400">Added</p>
          <ul class="mt-1 space-y-0.5">
            ${added
              .map(
                (item) =>
                  `<li class="text-sm text-emerald-400">+ ${escapeUserPermissionActivityHtml(item)}</li>`
              )
              .join("")}
          </ul>
        </div>`;
      }
      if (removed.length) {
        sections += `<div>
          <p class="text-xs font-medium text-red-400">Removed</p>
          <ul class="mt-1 space-y-0.5">
            ${removed
              .map(
                (item) =>
                  `<li class="text-sm text-red-400">- ${escapeUserPermissionActivityHtml(item)}</li>`
              )
              .join("")}
          </ul>
        </div>`;
      }

      return `<div class="rounded-md border !border-slate-700 bg-[var(--bg-color)] p-3 space-y-2">
        <p class="text-sm font-semibold text-slate-200">${escapeUserPermissionActivityHtml(app.app_name || "")}</p>
        ${sections}
      </div>`;
    })
    .filter(Boolean)
    .join("");

  if (!blocks) return "";
  return `<div class="mt-3 space-y-3">${blocks}</div>`;
}

function renderUserPermissionActivityLog(activities) {
  const $timeline = $("#permissionActivityTimeline");
  $timeline.empty();

  const logs = (Array.isArray(activities) ? activities : []).filter(
    (item) => String(item.action || "").toUpperCase() === "UPDATE"
  );

  if (!logs.length) {
    $timeline.html(`
      <div class="rounded-md  px-4 py-8 text-center text-sm text-slate-400">
        <p class="font-medium text-slate-600">No permission activity recorded yet</p>
        <p class="mt-1 text-slate-600 text-sm">Changes made to this employee's permissions will appear here.</p>
      </div>
    `);
    return;
  }

  const sorted = [...logs].sort((a, b) => {
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
    const actor = (item.actor && item.actor.name) || item.actor_name || "";
    const when = item.created_at
      ? formatUserPermissionActivityDate(item.created_at)
      : "";
    const descriptionHtml = actor
      ? `User permissions updated by ${escapeUserPermissionActivityHtml(actor)}.`
      : "User permissions updated";
    const body = renderUserPermissionApplicationChanges(item.applications);

    html += `
      <li class="relative mb-6 ms-6">
        ${
          !isLastActivity
            ? `<span class="absolute -start-6 top-3.5 -bottom-6 w-px bg-slate-600" aria-hidden="true"></span>`
            : ""
        }
        <span class="absolute -start-[2.375rem] z-[1] flex h-7 w-7 items-center justify-center rounded-full bg-[var(--dark-color)] bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/40">
          <i data-lucide="pencil" class="h-3.5 w-3.5"></i>
        </span>
        <article class="rounded-lg border !border-slate-700 bg-[var(--card-color)] p-4">
          <div class="mb-1 flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs font-semibold tracking-wide text-sky-400">UPDATE</span>
            ${
              when
                ? `<time class="text-xs text-slate-400">${escapeUserPermissionActivityHtml(when)}</time>`
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

function loadUserPermissionActivityLog(employeeId) {
  $("#permissionActivityTimeline").html(
    `<div class="py-6 text-center text-sm text-slate-400">Loading activity…</div>`
  );
  getDummyUserPermissionActivity(employeeId)
    .then(renderUserPermissionActivityLog)
    .catch((err) => {
      console.error("Failed to load dummy user permission activity logs.", err);
      renderUserPermissionActivityLog([]);
    });
}
//#endregion

//#endregion
