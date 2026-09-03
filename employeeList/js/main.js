//#region GLOBALS
const rootFolder = `//${document.location.hostname}`;
let empDetails = [];
let canModifyEmployee = false;
let currentEmployeeIsActive = true;

//#endregion

function refreshIcons() {
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }
}

function openModal(selector) {
  const $el = $(selector);
  $el.removeClass("hidden").addClass("flex").attr("aria-hidden", "false");
  $("body").addClass("overflow-hidden");
  refreshIcons();
}

function closeModal(selector) {
  const $el = $(selector);
  $el.addClass("hidden").removeClass("flex").attr("aria-hidden", "true");
  if (
    !$("#addEmployee").hasClass("flex") &&
    !$("#showEmployee").hasClass("flex") &&
    !$("#resignEmployee").hasClass("flex") &&
    !$("#resConfirm").hasClass("flex")
  ) {
    $("body").removeClass("overflow-hidden");
  }
}

function closeAllModals() {
  ["#addEmployee", "#showEmployee", "#resignEmployee", "#resConfirm"].forEach(
    closeModal
  );
  $("body").removeClass("overflow-hidden");
}

function setEmployeeTab(tab) {
  const isDetails = tab === "details";
  $("#tabDetails")
    .toggleClass("emp-tab-active border-b-[var(--primary-color)] text-white", isDetails)
    .toggleClass("border-transparent text-slate-400", !isDetails)
    .attr("aria-selected", isDetails ? "true" : "false");
  $("#tabActivity")
    .toggleClass("emp-tab-active border-b-[var(--primary-color)] text-white", !isDetails)
    .toggleClass("border-transparent text-slate-400", isDetails)
    .attr("aria-selected", isDetails ? "false" : "true");
  $("#panelDetails").toggleClass("hidden", !isDetails);
  $("#panelActivity").toggleClass("hidden", isDetails);
  $("#editFooter").toggleClass("hidden", !isDetails);
  if (!isDetails) {
    loadActivityLog($("#editEmpnum").val());
  }
  refreshIcons();
}

function resetEditFooter() {
  $("#editFooter").html(`
    <button type="button" class="btn-secondary-ui" id="clos">Close</button>
    <button type="button" class="btn-primary-ui btn-editEmp">Edit Details</button>
  `);
  if (!canModifyEmployee) {
    $(".btn-editEmp").prop("disabled", true);
  }
}

function openEmployeeDetails(eNum, name, tab) {
  $("#empCon").val(name);
  $("#empConid").val(eNum);
  setEmployeeTab(tab || "details");
  resetEditFooter();
  openModal("#showEmployee");
  getEmpDetails(eNum);
}

function closeActionMenus() {
  $(".emp-actions-menu").addClass("hidden");
  $(".emp-actions-btn").attr("aria-expanded", "false");
}

function formatActivityDate(dateStr) {
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
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()} • ${hh}:${minutes} ${ampm}`;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Returns employee activity records from the backend when available.
 * Expected response shape:
 * [
 *   {
 *     id, action: "CREATE"|"UPDATE"|"RESIGNED",
 *     actor_name, created_at,
 *     old_values: {}, new_values: {}
 *   }
 * ]
 */
const USE_DUMMY_EMPLOYEE_ACTIVITY_LOGS = true;

async function getDummyEmployeeActivity(employeeId) {
  if (!USE_DUMMY_EMPLOYEE_ACTIVITY_LOGS) {
    return [];
  }

  const response = await fetch(
    "assets/mock/employee-activity.mock.json"
  );

  if (!response.ok) {
    throw new Error("Failed to load dummy employee activity logs.");
  }

  const data = await response.json();

  return (data.logs || [])
    .filter(
      (log) =>
        Number(log.employee_id) === Number(employeeId)
    )
    .sort(
      (a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    );
}

function getEmployeeActivityLog(empNum) {
  return new Promise((resolve) => {
    // Future backend hook (keep payload shape stable):
    // $.ajax({
    //   type: "POST",
    //   url: "ajax/get_employee_activity.php",
    //   data: { empNum: empNum },
    //   dataType: "json",
    //   success: (data) => resolve(Array.isArray(data) ? data : []),
    //   error: () => resolve([]),
    // });
    getDummyEmployeeActivity(empNum)
      .then((logs) => {
        const mapped = (logs || []).map((log) => {
          const old_values = {};
          const new_values = {};
          (log.changes || []).forEach((change) => {
            const key = change.label || change.field;
            old_values[key] = change.old_value;
            new_values[key] = change.new_value;
          });
          return {
            id: log.id,
            action: log.action,
            actor_name: (log.actor && log.actor.name) || "",
            created_at: log.created_at,
            old_values,
            new_values,
          };
        });
        resolve(mapped);
      })
      .catch((err) => {
        console.error("Failed to load dummy employee activity logs.", err);
        resolve([]);
      });
  });
}

function renderChangedFields(oldValues, newValues) {
  const keys = Object.keys(newValues || {});
  if (!keys.length) return "";

  const rows = keys
    .map((key) => {
      const oldVal = oldValues && oldValues[key] != null ? oldValues[key] : "—";
      const newVal = newValues[key];
      if (String(oldVal) === String(newVal)) return "";

      const isStatus = /status/i.test(key);
      const isResignDate = /resign/i.test(key);
      let newHtml = `<span class="text-emerald-400">${escapeHtml(newVal)}</span>`;

      if (isStatus && /resign/i.test(String(newVal))) {
        newHtml = `<span class="inline-flex rounded-full bg-red-600/90 px-2 py-0.5 text-xs font-medium text-white">${escapeHtml(newVal)}</span>`;
      } else if (isStatus && /active/i.test(String(newVal))) {
        newHtml = `<span class="inline-flex rounded-full bg-emerald-600/90 px-2 py-0.5 text-xs font-medium text-white">${escapeHtml(newVal)}</span>`;
      } else if (isResignDate) {
        newHtml = `<span class="text-red-400">${escapeHtml(newVal)}</span>`;
      }

      return `<div class="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
        <span class="min-w-[8rem] text-slate-400">${escapeHtml(key)}</span>
        <span class="text-slate-300">${escapeHtml(oldVal)}</span>
        <span class="text-slate-500">→</span>
        ${newHtml}
      </div>`;
    })
    .filter(Boolean)
    .join("");

  if (!rows) return "";
  return `<div class="mt-3 rounded-md border border-slate-700 bg-[var(--bg-color)] p-3 space-y-2">${rows}</div>`;
}

function renderCreateSnapshot(snapshot) {
  if (!snapshot || !Object.keys(snapshot).length) return "";
  const rows = Object.keys(snapshot)
    .map((key) => {
      let val = snapshot[key];
      let valHtml = escapeHtml(val);
      if (/status/i.test(key)) {
        const isActive = /active/i.test(String(val));
        valHtml = `<span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium text-white ${
          isActive ? "bg-emerald-600/90" : "bg-red-600/90"
        }">${escapeHtml(val)}</span>`;
      }
      return `<div class="flex flex-wrap gap-x-3 gap-y-1 text-sm">
        <span class="min-w-[7rem] text-slate-400">${escapeHtml(key)}</span>
        <span class="text-slate-200">${valHtml}</span>
      </div>`;
    })
    .join("");
  return `<div class="mt-3 rounded-md border border-slate-700 bg-[var(--bg-color)] p-3 space-y-2">${rows}</div>`;
}

function getActivityMeta(action) {
  const a = String(action || "").toUpperCase();
  if (a === "CREATE") {
    return {
      label: "CREATE",
      color: "text-emerald-400",
      ring: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/40",
      icon: "plus",
      description: (actor) =>
        actor
          ? `Employee record created by ${escapeHtml(actor)}.`
          : `Employee record created`,
    };
  }
  if (a === "RESIGNED") {
    return {
      label: "RESIGNED",
      color: "text-red-400",
      ring: "bg-red-500/15 text-red-400 ring-1 ring-red-500/40",
      icon: "user-round-x",
      description: (actor) =>
        `Employee marked as resigned by ${escapeHtml(actor)}.`,
    };
  }
  return {
    label: "UPDATE",
    color: "text-sky-400",
    ring: "bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/40",
    icon: "pencil",
    description: (actor) =>
      `Employee information updated by ${escapeHtml(actor)}.`,
  };
}

function renderActivityLog(activities) {
  const $timeline = $("#activityTimeline");
  $timeline.empty();

  let logs = Array.isArray(activities) ? [...activities] : [];
  const hasRealCreate = logs.some(
    (item) => String(item.action || "").toUpperCase() === "CREATE"
  );
  if (!hasRealCreate) {
    logs.push({
      action: "CREATE",
      actor_name: null,
      created_at: null,
      old_values: {},
      new_values: {},
    });
  }

  if (!logs.length) {
    $timeline.html(`
      <div class="rounded-md border border-dashed border-slate-600 px-4 py-8 text-center text-sm text-slate-400">
        <p class="font-medium text-slate-300">No activity recorded yet</p>
        <p class="mt-1">Changes made to this employee will appear here.</p>
      </div>
    `);
    return;
  }

  const sorted = [...logs].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return tb - ta;
  });

  let html = `<ol class="relative ms-3">`;
  sorted.forEach((item, index) => {
    const isLastActivity = index === sorted.length - 1;
    const meta = getActivityMeta(item.action);
    const action = String(item.action || "").toUpperCase();
    const actor =
      action === "CREATE"
        ? item.actor_name || ""
        : item.actor_name || "Unknown";
    const when = item.created_at ? formatActivityDate(item.created_at) : "";
    const isResigned = action === "RESIGNED";
    const body =
      action === "CREATE"
        ? ""
        : renderChangedFields(item.old_values, item.new_values);

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
        <article class="rounded-lg border ${
          isResigned ? "border-red-500/40 bg-red-950/20" : "border-slate-700 bg-[var(--card-color)]"
        } p-4">
          <div class="mb-1 flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs font-semibold tracking-wide ${meta.color}">${meta.label}</span>
            ${
              when
                ? `<time class="text-xs text-slate-400">${escapeHtml(when)}</time>`
                : ""
            }
          </div>
          <p class="text-sm text-slate-200">${meta.description(actor)}</p>
          ${body}
        </article>
      </li>`;
  });
  html += `</ol>`;
  $timeline.html(html);
  refreshIcons();
}

function loadActivityLog(empNum) {
  $("#activityTimeline").html(
    `<div class="py-6 text-center text-sm text-slate-400">Loading activity…</div>`
  );
  getEmployeeActivityLog(empNum).then(renderActivityLog);
}

checkLogin()
  .then((emp) => {
    if (emp) {
      empDetails = emp;
      adminAccess().then((acc) => {
        if (acc) {
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
              checkUserP(),
              checkAppP(),
              checkCalendarP(),
              getEmployees(),
              getGroups(),
              getPos(),
            ])
              .then(
                ([modi, grpp, desigp, usrp, appp, clndr, emps, grps, pos]) => {
                  canModifyEmployee = !!modi;
                  if (modi) {
                    $("#addEmp").removeClass("hidden");
                  } else {
                    $("#addEmp").addClass("hidden");
                    $(".btn-editEmp").prop("disabled", true);
                    $(document).off("click", ".btn-editEmp");
                    $(document).off("click", "#employeeStat");
                    $(document).off("click", ".btn-cres");
                    $(document).off("click", ".btn-resEmp");
                    $(document).off("click", "#btn-res");
                    $(document).off("click", ".action-resign");
                    $(document).off("click", ".action-edit");
                  }
                  if (grpp) {
                    $("#acNavLinks").append(`<li style="font-weight: 500">
                <a href="../groupList/">
                <span class="icon"><i data-lucide="users-round" class="h-5 w-5"></i></span>
                  <span class="title">Groups</span>
                </a>
              </li>`);
                  }
                  if (desigp) {
                    $("#acNavLinks").append(`<li style="font-weight: 500">
                    <a href="../designationList/">
                    <span class="icon"><i data-lucide="award" class="h-5 w-5"></i></span>
                      <span class="title">Designations</span>
                    </a>
                  </li>`);
                  }
                  if (usrp) {
                    $("#acNavLinks").append(`<li style="font-weight: 500">
                    <a href="../userPermission/">
                      <span class="icon"><i data-lucide="user-cog" class="h-5 w-5"></i></span>
                      <span class="title">User Permissions</span>
                    </a>
                  </li>`);
                  }
                  if (appp) {
                    $("#acNavLinks").append(`<li style="font-weight: 500">
                <a href="../appPermission/">
                  <span class="icon"><i data-lucide="app-window" class="h-5 w-5"></i></span>
                  <span class="title">Application Permissions</span>
                </a>
              </li>`);
                  }
                  if (clndr) {
                    $("#acNavLinks").append(`<li style="font-weight: 500">
                    <a href="../calendar/">
                    <span class="icon"><i data-lucide="calendar" class="h-5 w-5"></i></span>
                      <span class="title">Calendar</span>
                    </a>
                  </li>`);
                  }
                  $("#empList").empty();
                  emps.map(fillEmployees);
                  fillGroups(grps);
                  fillPos(pos);
                  refreshIcons();
                }
              )
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

$(document).on("click", ".btn-addEmp", function () {
  addEmployee();
});
$(document).on("click", ".menu", function () {
  $(".navigation").toggleClass("actived");
  $(".main").toggleClass("actived");
});

$(document).on("click", "#addEmp", function () {
  resetAdd();
  openModal("#addEmployee");
});

$(document).on("click", ".emp", function (e) {
  if ($(e.target).closest(".emp-actions").length) return;
  var eNum = $($(this).children()[0]).text();
  var name = $($(this).children()[1]).text();
  openEmployeeDetails(eNum, name, "details");
});

$(document).on("click", ".emp-actions-btn", function (e) {
  e.stopPropagation();
  const $btn = $(this);
  const $menu = $btn.siblings(".emp-actions-menu");
  const wasOpen = !$menu.hasClass("hidden");
  closeActionMenus();
  if (!wasOpen) {
    const rect = this.getBoundingClientRect();
    $menu
      .css({
        position: "fixed",
        top: rect.bottom + 4 + "px",
        right: window.innerWidth - rect.right + "px",
        left: "auto",
        marginTop: 0,
      })
      .removeClass("hidden");
    $btn.attr("aria-expanded", "true");
    refreshIcons();
  }
});

$(document).on("click", function () {
  closeActionMenus();
});

$(document).on("keydown", ".emp-actions-btn", function (e) {
  if (e.key === "Escape") {
    closeActionMenus();
    $(this).focus();
  }
  if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    closeActionMenus();
    $(this).siblings(".emp-actions-menu").removeClass("hidden");
    $(this).attr("aria-expanded", "true");
    $(this)
      .siblings(".emp-actions-menu")
      .find("[role='menuitem']")
      .first()
      .focus();
  }
});

$(document).on("keydown", ".emp-actions-menu [role='menuitem']", function (e) {
  const $items = $(this).closest(".emp-actions-menu").find("[role='menuitem']");
  const idx = $items.index(this);
  if (e.key === "ArrowDown") {
    e.preventDefault();
    $items.eq((idx + 1) % $items.length).focus();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    $items.eq((idx - 1 + $items.length) % $items.length).focus();
  } else if (e.key === "Escape") {
    closeActionMenus();
    $(this).closest(".emp-actions").find(".emp-actions-btn").focus();
  }
});

$(document).on("click", ".action-view-details", function (e) {
  e.stopPropagation();
  const $row = $(this).closest("tr");
  openEmployeeDetails(
    $row.children().eq(0).text(),
    $row.children().eq(1).text(),
    "details"
  );
  closeActionMenus();
});

$(document).on("click", ".action-view-activity", function (e) {
  e.stopPropagation();
  const $row = $(this).closest("tr");
  openEmployeeDetails(
    $row.children().eq(0).text(),
    $row.children().eq(1).text(),
    "activity"
  );
  closeActionMenus();
});

$(document).on("click", ".action-edit", function (e) {
  e.stopPropagation();
  if (!canModifyEmployee) return;
  const $row = $(this).closest("tr");
  openEmployeeDetails(
    $row.children().eq(0).text(),
    $row.children().eq(1).text(),
    "details"
  );
  closeActionMenus();
  setTimeout(function () {
    $(".btn-editEmp").trigger("click");
  }, 300);
});

$(document).on("click", ".action-resign", function (e) {
  e.stopPropagation();
  if (!canModifyEmployee) return;
  const $row = $(this).closest("tr");
  const eNum = $row.children().eq(0).text();
  const name = $row.children().eq(1).text();
  $("#empCon").val(name);
  $("#empConid").val(eNum);
  $("#resPlaceholder").text(name);
  closeActionMenus();
  openModal("#resignEmployee");
});

$(document).on("click", "#tabDetails", function () {
  setEmployeeTab("details");
});
$(document).on("click", "#tabActivity", function () {
  setEmployeeTab("activity");
});

$(document).on("click", "#clos", function () {
  resetEditFooter();
  $(".m1,.m2,.m3,.m4,.m5,.m6,.m7,.m8,.m9,.m10,.m11,.m12").addClass("hidden");
  closeModal("#showEmployee");
});
$(document).on("click", "#close", function () {
  $(".m1,.m2,.m3,.m4,.m5,.m6,.m7,.m8,.m9,.m10,.m11,.m12").addClass("hidden");
  resetAdd();
  closeModal("#addEmployee");
});
$(document).on("click", "#xadd", function () {
  $("#close").click();
});
$(document).on("click", "[data-close-modal]", function () {
  const target = $(this).data("close-modal");
  if (target === "showEmployee") {
    $("#clos").click();
  } else if (target === "resConfirm") {
    closeModal("#resConfirm");
  } else {
    closeModal("#" + target);
  }
});

$(document).on("click", ".btn-editEmp", function () {
  if (!canModifyEmployee) return;
  $(this).parent().html(`
    <button type="button" class="btn-secondary-ui" id="clos">Close</button>
    <button type="button" class="btn-success-ui btn-saveEmp">Save changes</button>
  `);
  $(
    "#editFirstname,#editSurname,#editNick,#editPCUser,#editGroup,#editPos,#editBday,#editGender,#editStatus,#editDatehired,#editLotus,#ac"
  ).prop("disabled", false);
});
$(document).on("click", ".btn-saveEmp", function () {
  saveEdit();
});
$(document).on("keyup", "#searchWord", function () {
  getEmployees().then((emps) => {
    $("#empList").empty();
    emps.map(fillEmployees);
    refreshIcons();
  });
});
$(document).on("search", "#searchWord", function () {
  getEmployees().then((emps) => {
    $("#empList").empty();
    emps.map(fillEmployees);
    refreshIcons();
  });
});
$(document).on("click", "#activeOnly", function () {
  getEmployees().then((emps) => {
    $("#empList").empty();
    emps.map(fillEmployees);
    refreshIcons();
  });
});
$(document).on("click", "#resDate", function () {
  $("#resignEmployee small").addClass("hidden");
  $("#resDate").removeClass("border border-red-500");
});

$(document).on("click", "#resback", function () {
  closeModal("#resConfirm");
  openModal("#resignEmployee");
});
$(document).on("click", "#resclose", function () {
  $(".r1").addClass("hidden");
  $("#resDate").removeClass("border border-red-500");
  $("#resDate").val("");
  closeModal("#resignEmployee");
});
$(document).on("click", "#rescloseI", function () {
  $("#resclose").click();
});
$(document).on("click", "#employeeStat", function () {
  if (!canModifyEmployee || !currentEmployeeIsActive) return;
  var fname = $("#editFirstname").val();
  var lname = $("#editSurname").val();
  $("#resPlaceholder").text(fname + " " + lname);
  $("#empCon").val(fname + " " + lname);
  $("#empConid").val($("#editEmpnum").val());
  closeModal("#showEmployee");
  openModal("#resignEmployee");
});
$(document).on("click", ".btn-cres", function () {
  var empnum = $("#empConid").val();
  var resdate = $("#resDate").val();
  resignEmployee(empnum, resdate);
});
$(document).on("click", "#btn-res", function () {
  var resDate = $("#resDate").val();
  if (!resDate) {
    $("#resignEmployee small").removeClass("hidden");
    $("#resDate").addClass("border border-red-500");
    return;
  }
  $("#dateCon").val(resDate);
  $("#resignEmployee small").addClass("hidden");
  $("#resDate").removeClass("border border-red-500");
  closeModal("#resignEmployee");
  openModal("#resConfirm");
});

$(document).on("keydown", function (e) {
  if (e.key !== "Escape") return;
  if ($("#resConfirm").hasClass("flex")) {
    closeModal("#resConfirm");
    return;
  }
  if ($("#resignEmployee").hasClass("flex")) {
    $("#resclose").click();
    return;
  }
  if ($("#addEmployee").hasClass("flex")) {
    $("#close").click();
    return;
  }
  if ($("#showEmployee").hasClass("flex")) {
    $("#clos").click();
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
          reject("Unspecified error on checklogin");
        }
      },
    });
  });
}
function adminAccess() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "ajax/check_admin.php",
      data: {
        empNum: empDetails["empNum"],
      },
      dataType: "json",
      success: function (response) {
        const admin = response;
        resolve(admin);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred.3");
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
          reject("Unspecified error on check modify");
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
          reject("Unspecified error on group access");
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
          reject("Unspecified error on desig access");
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
          reject("Unspecified error on user permission");
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
          reject("Unspecified error app permission");
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
          reject("Unspecified error on calendar");
        }
      },
    });
  });
}
function resignEmployee(empnum, resdate) {
  $.post(
    "ajax/resign_employee.php",
    {
      resdate: resdate,
      empnum: empnum,
    },
    function (data) {
      if ($.parseJSON(data)) {
        alert(`Save failed: ${data}`);
        return;
      }
      closeModal("#resConfirm");
      closeModal("#resignEmployee");
      closeModal("#showEmployee");
      $("#resDate").val("");
      getEmployees().then((emps) => {
        $("#empList").empty();
        emps.map(fillEmployees);
        refreshIcons();
      });
    }
  );
}
function getEmployees() {
  const searchWord = $("#searchWord").val();
  let active = 0;
  if ($("#activeOnly").is(":checked")) {
    active = 1;
  }
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "ajax/get_employees.php",
      data: {
        searchWord: searchWord,
        active: active,
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
          reject("Unspecified error on get employees");
        }
      },
    });
  });
}
function fillEmployees(row) {
  var employeeNumber = row["emp_num"];
  var employeeName = row["emp_name"];
  var employeeUser = row["emp_user"];
  var employeeDepartment = row["emp_dept"];
  var employeeGroup = row["emp_group"];
  var employeePosition = row["emp_pos"];
  var isActive = row["is_active"] == null || Number(row["is_active"]) === 1;

  var modifyItems = "";
  if (canModifyEmployee) {
    modifyItems = `
      <button type="button" role="menuitem" class="action-edit emp-menu-item">
        <i data-lucide="pencil" class="h-4 w-4"></i> Edit Employee
      </button>`;
    if (isActive) {
      modifyItems += `
      <div class="my-1 border-t border-slate-600"></div>
      <button type="button" role="menuitem" class="action-resign emp-menu-item emp-menu-item-danger">
        <i data-lucide="user-round-x" class="h-4 w-4"></i> Mark as Resigned
      </button>`;
    }
  }

  var addString = `<tr class="emp">
<td>${escapeHtml(employeeNumber)}</td>
<td>${escapeHtml(employeeName)}</td>
<td>${escapeHtml(employeeUser)}</td>
<td>${escapeHtml(employeeDepartment)}</td>
<td>${escapeHtml(employeeGroup)}</td>
<td>${escapeHtml(employeePosition)}</td>
<td class="emp-actions relative text-right">
  <button type="button" class="emp-actions-btn inline-flex rounded p-1.5 text-slate-300 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-600" aria-label="Employee actions" aria-haspopup="true" aria-expanded="false">
    <i data-lucide="ellipsis-vertical" class="h-4 w-4"></i>
  </button>
  <div class="emp-actions-menu absolute right-0 z-20 mt-1 hidden min-w-[180px] rounded-md border border-slate-600 bg-[var(--dark-color)] py-1 shadow-lg" role="menu">
    <button type="button" role="menuitem" class="action-view-details emp-menu-item">
      <i data-lucide="user-round" class="h-4 w-4"></i> View Details
    </button>
    <button type="button" role="menuitem" class="action-view-activity emp-menu-item">
      <i data-lucide="clock-3" class="h-4 w-4"></i> View Activity
    </button>
    ${modifyItems}
  </div>
</td>
</tr>`;
  $("#empList").append(addString);
}
function getEmpDetails(iVal) {
  var empDeetsArray = [];
  $.post(
    "ajax/get_empDetails.php",
    {
      empNum: iVal,
    },
    function (data) {
      empDeetsArray = $.parseJSON(data);
      fillModal(empDeetsArray);
      if (!$("#panelActivity").hasClass("hidden")) {
        loadActivityLog(iVal);
      }
    }
  );
}
function fillModal(empDeets) {
  var empnum = empDeets["emp_num"];
  var firstname = empDeets["emp_fname"];
  var surname = empDeets["emp_sname"];
  var nname = empDeets["emp_nick"];
  var uname = empDeets["emp_user"];
  var group = empDeets["emp_group"];
  var position = empDeets["emp_pos"];
  var bday = empDeets["emp_bday"];
  var gender = empDeets["emp_gender"];
  var status = empDeets["emp_status"];
  var dhired = empDeets["emp_dhired"];
  var empEmail = empDeets["emp_outlook"];
  var resDate = empDeets["emp_resdate"];
  $("#editEmpnum").val(empnum);
  $("#editFirstname").val(firstname);
  $("#editSurname").val(surname);
  $("#editNick").val(nname);
  $("#editPCUser").val(uname);
  $("#editGroup").val(group);
  $("#editPos").val(position);
  $("#editBday").val(bday);
  $("#editGender").val(gender);
  $("#editStatus").val(status);
  $("#editDatehired").val(dhired);
  $("#editLotus").val(empEmail);

  $(
    "#editEmpnum,#editFirstname,#editSurname,#editNick,#editPCUser,#editGroup,#editPos,#editBday,#editGender,#editStatus,#editDatehired,#editLotus"
  ).prop("disabled", true);

  currentEmployeeIsActive = !resDate || resDate === "0000-00-00";

  if (currentEmployeeIsActive) {
    $(".empStat").html(`
    <div id="empStat">
      <label class="mb-1 block text-sm text-slate-300">Employee Status</label>
      <button type="button" id="employeeStat"
        class="flex h-9 w-full max-w-[200px] items-center justify-center rounded-full bg-emerald-500 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
        ${canModifyEmployee ? 'title="Mark as resigned"' : "disabled"}>
        Active
      </button>
      ${
        canModifyEmployee
          ? '<p class="mt-1 text-xs text-slate-500">Click to mark as resigned</p>'
          : ""
      }
    </div>
    <div class="res hidden">
      <label class="mb-1 block text-sm text-slate-300" for="resigdate">Resignation Date</label>
      <input type="date" class="form-input" id="resigdate" disabled>
    </div>`);
  } else {
    $(".empStat").html(`
    <div id="empStat">
      <label class="mb-1 block text-sm text-slate-300">Employee Status</label>
      <span class="inline-flex h-9 w-full max-w-[200px] items-center justify-center rounded-full bg-red-600 text-sm font-medium text-white"
        aria-label="Employee status: Resigned">Resigned</span>
    </div>
    <div class="res">
      <label class="mb-1 block text-sm text-slate-300" for="resigdate">Resignation Date</label>
      <input type="date" class="form-input" id="resigdate" disabled>
    </div>`);
  }
  $("#resigdate").val(resDate);
  resetEditFooter();
}

function getGroups() {
  $(".empGroup").empty();
  $(".empGroup").html(`<option value='' hidden>Select Group</option>`);
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "ajax/get_groups.php",
      dataType: "json",
      success: function (data) {
        const grp = data;
        resolve(grp);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Resource not found.");
        } else if (xhr.status === 500) {
          reject(`Server error: ${error}`);
        } else {
          reject("Unspecified error on get groups");
        }
      },
    });
  });
}
function fillGroups(groups) {
  groups.forEach((element) => {
    var addString = `<option value='${element.id}' >${element.name}</option>`;
    $(".empGroup").append(addString);
  });
}
function getPos() {
  $(".empPos").empty();
  $(".empPos").html(`<option value='' hidden>Select Position</option>`);
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "ajax/get_pos.php",
      dataType: "json",
      success: function (data) {
        const pos = data;
        resolve(pos);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Resource not found.");
        } else if (xhr.status === 500) {
          reject(`Server error: ${error}`);
        } else {
          reject("Unspecified error on get positions");
        }
      },
    });
  });
}
function fillPos(posDetails) {
  posDetails.forEach((element) => {
    var addString = `<option value='${element.id}' >${element.acronym}(${element.name})</option>`;
    $(".empPos").append(addString);
  });
}
function addEmployee() {
  var fname = $(`#addFirstname`).val();
  var lname = $(`#addSurname`).val();
  var nname = $(`#addNick`).val();
  var bday = $(`#addBday`).val();
  var gender = $(`#addGender`).find(`:selected`).val();
  var status = $(`#addStatus`).find(`:selected`).val();
  var empnum = $(`#addEmpnum`).val();
  var username = $(`#addPCUser`).val();
  var group = $(`#addGroup`).val();
  var dhired = $(`#addDatehired`).val();
  var position = $(`#addPos`).val();
  var email = $(`#addLotus`).val();
  var error = 0;
  var eMsg = ``;
  $(".errMsg").addClass("hidden");
  if (!fname) {
    $(".m3").removeClass("hidden");
    error++;
  }
  if (!lname) {
    $(".m4").removeClass("hidden");
    error++;
  }
  if (!nname) {
    $(".m5").removeClass("hidden");
    error++;
  }
  if (!bday) {
    $(".m6").removeClass("hidden");
    error++;
  }
  if (!gender) {
    $(".m7").removeClass("hidden");
    error++;
  }
  if (!status) {
    $(".m8").removeClass("hidden");
    error++;
  }
  if (!empnum) {
    $(".m1").removeClass("hidden");
    error++;
  }
  if (!username) {
    $(".m2").removeClass("hidden");
    error++;
  }
  if (!group) {
    $(".m9").removeClass("hidden");
    error++;
  }
  if (!dhired) {
    $(".m10").removeClass("hidden");
    error++;
  }
  if (!position) {
    $(".m11").removeClass("hidden");
    error++;
  }
  if (!email) {
    $(".m12").removeClass("hidden");
    error++;
  }
  if (error > 0) {
    return;
  }

  $.ajaxSetup({ async: false });
  $.post(
    "ajax/check_exists_add.php",
    {
      username: username,
      empnum: empnum,
      email: email,
    },
    function (data) {
      var err = $.parseJSON(data);
      if (Object.keys(err).length !== 0) {
        eMsg = err.join(", ");
        eMsg += " taken";
        if (err.includes("Employee Number")) {
          $("#addEmpnum").val("");
        }
        if (err.includes("Username")) {
          $("#addPCUser").val("");
        }
        if (err.includes("Email")) {
          $("#addLotus").val("");
        }
        alert(eMsg);
      }
    }
  );

  $.ajaxSetup({ async: true });
  if (eMsg !== "") {
    return;
  }
  $.post(
    "ajax/add_employee.php",
    {
      fname: fname,
      lname: lname,
      nname: nname,
      bday: bday,
      gender: gender,
      status: status,
      empnum: empnum,
      username: username,
      group: group,
      dhired: dhired,
      position: position,
      email: email,
    },
    function (data) {
      if ($.parseJSON(data)) {
        alert(`Save failed: ${data}`);
        return;
      }
      $("#xadd").click();
      getEmployees().then((emps) => {
        $("#empList").empty();
        emps.map(fillEmployees);
        refreshIcons();
      });
    }
  );
}
function saveEdit() {
  var fname = $(`#editFirstname`).val();
  var lname = $(`#editSurname`).val();
  var nname = $(`#editNick`).val();
  var bday = $(`#editBday`).val();
  var gender = $(`#editGender`).find(`:selected`).val();
  var status = $(`#editStatus`).find(`:selected`).val();
  var empnum = $(`#editEmpnum`).val();
  var username = $(`#editPCUser`).val();
  var group = $(`#editGroup`).find(`:selected`).val();
  var dhired = $(`#editDatehired`).val();
  var position = $(`#editPos`).find(`:selected`).val();
  var email = $(`#editLotus`).val();
  var error = 0;
  var eMsg = ``;
  $(".errMsg").addClass("hidden");
  if (!fname) {
    $(".m3").removeClass("hidden");
    error++;
  }
  if (!lname) {
    $(".m4").removeClass("hidden");
    error++;
  }
  if (!nname) {
    $(".m5").removeClass("hidden");
    error++;
  }
  if (!bday) {
    $(".m6").removeClass("hidden");
    error++;
  }
  if (!gender) {
    $(".m7").removeClass("hidden");
    error++;
  }
  if (!status) {
    $(".m8").removeClass("hidden");
    error++;
  }
  if (!empnum) {
    $(".m1").removeClass("hidden");
    error++;
  }
  if (!username) {
    $(".m2").removeClass("hidden");
    error++;
  }
  if (!group) {
    $(".m9").removeClass("hidden");
    error++;
  }
  if (!dhired) {
    $(".m10").removeClass("hidden");
    error++;
  }
  if (!position) {
    $(".m11").removeClass("hidden");
    error++;
  }
  if (!email) {
    $(".m12").removeClass("hidden");
    error++;
  }
  if (error > 0) {
    return;
  }

  $.ajaxSetup({ async: false });
  $.post(
    "ajax/check_exists_edit.php",
    {
      username: username,
      empnum: empnum,
      email: email,
    },
    function (data) {
      var err = $.parseJSON(data);
      if (Object.keys(err).length !== 0) {
        eMsg = err.join(", ");
        eMsg += " taken";
        if (err.includes("Username")) {
          $("#editPCUser").val("");
        }
        if (err.includes("Email")) {
          $("#editLotus").val("");
        }
        alert(eMsg);
      }
    }
  );

  $.ajaxSetup({ async: true });
  if (eMsg !== "") {
    return;
  }
  $.post(
    "ajax/edit_employee.php",
    {
      fname: fname,
      lname: lname,
      nname: nname,
      bday: bday,
      gender: gender,
      status: status,
      empnum: empnum,
      username: username,
      group: group,
      dhired: dhired,
      position: position,
      email: email,
    },
    function (data) {
      if ($.parseJSON(data)) {
        alert(`Save failed: ${data}`);
        return;
      }

      resetEditFooter();
      $(
        "#editFirstname,#editSurname,#editNick,#editPCUser,#editGroup,#editPos,#editBday,#editGender,#editStatus,#editDatehired,#editLotus"
      ).prop("disabled", true);
      $(".errMsg").addClass("hidden");

      getEmployees().then((emps) => {
        $("#empList").empty();
        emps.map(fillEmployees);
        refreshIcons();
      });
    }
  );
}
function resetAdd() {
  $("#addEmpnum").val("");
  $("#addFirstname").val("");
  $("#addSurname").val("");
  $("#addNick").val("");
  $("#addPCUser").val("");
  $("#addGroup").val("");
  $("#addPos").val("");
  $("#addBday").val("");
  $("#addGender").val("");
  $("#addStatus").val("");
  $("#addDatehired").val("");
  $("#addLotus").val("");
  $(".errMsg").addClass("hidden");
}

//#endregion
