//#region GLOBALS
const rootFolder = `//${document.location.hostname}`;
var empDetails = [];
let groupList = [];
let editID = 0;
//#endregion
checkLogin().then((emp) => {
  if (emp) {
    empDetails = emp;
    checkGrpAccess().then((grpa) => {
      if (grpa) {
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
        });
        Promise.all([
          checkDesigP(),
          checkUserP(),
          checkAppP(),
          checkCalendarP(),
          getGroups(),
          getDepartments(),
        ])
          .then(([desigp, usrp, appp, clndr, grps, depts]) => {
            $("#acNavLinks li.startli").nextAll().remove();
            if (desigp) {
              $("#acNavLinks").append(`<li class="" style="font-weight: 500">
                <a href="../designationList/">
                  <span class="icon"><i class='bx bxs-award' ></i></span>
                  <span class="title">Designation List</span>
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
            $("#groupList").empty();
            groupList = grps;
            fillGroups(groupList);
            $("#deptList, #deptListEdit").empty();
            fillDepartments(depts);
          })
          .catch((error) => {
            alert(`${error}`);
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
$(document).on("keyup", "#searchWord", function () {
  // getGroups().then((grps) => {
  //   $("#groupList").empty();
  //   fillGroups(grps);
  // });
  $("#groupList").empty();
  searchGroup();
});
$(document).on("search", "#searchWord", function () {
  // getGroups().then((grps) => {
  //   $("#groupList").empty();
  //   fillGroups(grps);
  // });
  $("#groupList").empty();
  searchGroup();
});
$(document).on("click", "#addButton", function () {
  addGroup()
    .then((res) => {
      if (res.isSuccess) {
        getGroups().then((grps) => {
          groupList = grps;
          $("#groupList").empty();
          fillGroups(groupList);
          resetAdd();
          $(".close-btn").click();
        });
      } else {
        alert(res.message);
      }
    })
    .catch((error) => {
      alert(`${error}`);
    });
});
$(document).on("click", ".close-btn", function () {
  resetAdd();
});
$(document).on("click", ".btn-editGroup", function () {
  var rowId = $(this).closest("tr").attr("row-id");
  editID = rowId;
  fillEditModal(rowId);
});
$(document).on("click", ".btn-viewGroupActivity", function (e) {
  e.preventDefault();
  e.stopPropagation();
  var $row = $(this).closest("tr");
  var groupId = $row.attr("row-id");
  var groupName = $row.find("td:eq(1)").text();
  $(this).closest(".dropdown-menu").removeClass("show");
  openGroupActivityModal(groupId, groupName);
});
$(document).on("click", "[data-close-group-activity]", function () {
  closeGroupActivityModal();
});
$(document).on("keydown", function (e) {
  if (e.key !== "Escape") return;
  if ($("#groupActivityModal").hasClass("flex")) {
    closeGroupActivityModal();
  }
});
$(document).on("click", "#saveButton", function () {
  saveEdit()
    .then((res) => {
      if (res.isSuccess) {
        getGroups().then((grps) => {
          groupList = grps;
          $("#groupList").empty();
          fillGroups(groupList);
          $("#editGroupModal .btn-close").click();
        });
      } else {
        alert(res.message);
      }
    })
    .catch((error) => {
      alert(`${error}`);
    });
});
//#endregion

//#region FUNCTIONS
function ifSmallScreen() {
  if ($(window).width() < 1060) {
    $("#addGroup").html("<i class='bx bx-plus fs-3' ></i>");
  }
}
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
function getGroups() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "ajax/get_groups.php",
      dataType: "json",
      success: function (data) {
        const grps = data;
        resolve(grps);
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
function fillGroups(grps) {
  $.each(grps, function (index, item) {
    $("#groupList").append(`
        <tr row-id='${item.id}'><td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${item.code}</td>
            <td>${item.dept}</td>
            <td>
              <div
                class="flex justify-center items-center"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i class="bx bx-dots-vertical-rounded btn-edit"></i>
              </div>
              <ul class="bg-[var(--dark-color)] dropdown-menu ">
                <li class="hover:bg-[var(--light-color)]">
                  <a
                    class="hover:bg-[var(--light-color)] dropdown-item flex gap-2 items-center text-white btn-editGroup cursor-pointer"
                    ><i data-lucide="pencil" class="h-4 w-4"></i
                    >Edit</a
                  >
                </li>
                <li class="hover:bg-[var(--light-color)]">
                  <a
                    class="hover:bg-[var(--light-color)] dropdown-item flex gap-2 items-center text-white btn-viewGroupActivity cursor-pointer"
                    ><i data-lucide="history" class="h-4 w-4"></i
                    >View Activity</a
                  >
                </li>
              </ul>
            </td>
        </tr>
    `);
  });
  refreshIcons();
}

//#region GROUP ACTIVITY LOG
const USE_DUMMY_GROUP_ACTIVITY_LOGS = true;

function refreshIcons() {
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }
}

function formatGroupActivityDate(dateStr) {
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

function escapeGroupActivityHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function getDummyGroupActivity(groupId) {
  if (!USE_DUMMY_GROUP_ACTIVITY_LOGS) {
    return [];
  }

  const response = await fetch("assets/mock/group-activity.mock.json");

  if (!response.ok) {
    console.error("Failed to load dummy group activity logs.");
    return [];
  }

  const data = await response.json();

  return (data.logs || [])
    .filter((log) => Number(log.group_id) === Number(groupId))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function ensureLegacyGroupCreate(logs) {
  const items = Array.isArray(logs) ? [...logs] : [];
  const hasCreate = items.some(
    (item) => String(item.action || "").toUpperCase() === "CREATE"
  );
  if (!hasCreate) {
    items.push({
      action: "CREATE",
      description: "Group created",
      actor_name: null,
      created_at: null,
      changes: [],
    });
  }
  return items;
}

function getGroupActivityMeta(action) {
  const a = String(action || "").toUpperCase();
  if (a === "CREATE") {
    return {
      label: "CREATE",
      color: "text-emerald-400",
      ring: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/40",
      icon: "plus",
      description: "Group created",
    };
  }
  return {
    label: "UPDATE",
    color: "text-sky-400",
    ring: "bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/40",
    icon: "pencil",
    description: "Group information updated",
  };
}

function renderGroupChangedFields(changes) {
  if (!Array.isArray(changes) || !changes.length) return "";

  const rows = changes
    .map((change) => {
      const label = change.label || change.field || "";
      const oldVal = change.old_value != null ? change.old_value : "";
      const newVal = change.new_value != null ? change.new_value : "";
      if (String(oldVal) === String(newVal)) return "";
      return `<div class="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
        <span class="min-w-[8rem] text-slate-400">${escapeGroupActivityHtml(label)}</span>
        <span class="text-slate-300">${escapeGroupActivityHtml(oldVal)}</span>
        <span class="text-slate-500">→</span>
        <span class="text-emerald-400">${escapeGroupActivityHtml(newVal)}</span>
      </div>`;
    })
    .filter(Boolean)
    .join("");

  if (!rows) return "";
  return `<div class="mt-[0.75rem] rounded-md border-[1px] border-solid border-slate-700 bg-[var(--bg-color)] p-[0.75rem] space-y-2">${rows}</div>`;
}

function renderGroupActivityLog(activities) {
  const $timeline = $("#groupActivityTimeline");
  $timeline.empty();

  const logs = ensureLegacyGroupCreate(activities).filter((item) => {
    const action = String(item.action || "").toUpperCase();
    return action === "CREATE" || action === "UPDATE";
  });

  const sorted = [...logs].sort((a, b) => {
    const aCreate = String(a.action || "").toUpperCase() === "CREATE";
    const bCreate = String(b.action || "").toUpperCase() === "CREATE";
    if (aCreate && !bCreate) return 1;
    if (bCreate && !aCreate) return -1;
    const ta = a.created_at
      ? new Date(String(a.created_at).replace(" ", "T")).getTime()
      : 0;
    const tb = b.created_at
      ? new Date(String(b.created_at).replace(" ", "T")).getTime()
      : 0;
    return tb - ta;
  });

  let html = `<ol class="relative ms-[0.75rem]">`;
  sorted.forEach((item, index) => {
    const isLastActivity = index === sorted.length - 1;
    const meta = getGroupActivityMeta(item.action);
    const action = String(item.action || "").toUpperCase();
    const actor = item.actor_name || (item.actor && item.actor.name) || "";
    const when = item.created_at
      ? formatGroupActivityDate(item.created_at)
      : "";
    const description = item.description || meta.description;
    const body =
      action === "CREATE" ? "" : renderGroupChangedFields(item.changes);
    const descriptionHtml =
      action === "UPDATE" && actor
        ? `Group information updated by ${escapeGroupActivityHtml(actor)}.`
        : escapeGroupActivityHtml(description);

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
        <article class="rounded-lg border-[1px] border-solid border-slate-700 bg-[var(--card-color)] p-[1rem]">
          <div class="mb-1 flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs font-semibold tracking-wide ${meta.color}">${meta.label}</span>
            ${
              when
                ? `<time class="text-xs text-slate-400">${escapeGroupActivityHtml(when)}</time>`
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

function loadGroupActivityLog(groupId) {
  $("#groupActivityTimeline").html(
    `<div class="py-6 text-center text-sm text-slate-400">Loading activity…</div>`
  );
  getDummyGroupActivity(groupId)
    .then(renderGroupActivityLog)
    .catch((err) => {
      console.error("Failed to load dummy group activity logs.", err);
      renderGroupActivityLog([]);
    });
}

function openGroupActivityModal(groupId, groupName) {
  $("#groupActivityName").text(groupName);
  $("#groupActivityModal")
    .removeClass("hidden")
    .addClass("flex")
    .attr("aria-hidden", "false");
  $("body").addClass("overflow-hidden");
  refreshIcons();
  loadGroupActivityLog(groupId);
}

function closeGroupActivityModal() {
  $("#groupActivityModal")
    .addClass("hidden")
    .removeClass("flex")
    .attr("aria-hidden", "true");
  $("body").removeClass("overflow-hidden");
}
//#endregion
function searchGroup() {
  // const searchTerm = searchInput.value.toLowerCase();
  const searchTerm = $("#searchWord").val().toLowerCase();
  const filteredData = groupList.filter((item) =>
    item.name.toLowerCase().includes(searchTerm)
  );
  fillGroups(filteredData);
}
function getDepartments() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "ajax/get_departments.php",
      dataType: "json",
      success: function (data) {
        const depts = data;
        resolve(depts);
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
function fillDepartments(depts) {
  const defaultSelect = `<option value="" selected hidden>Select Department</option>`;
  const selectOptions = depts.map(
    (department) =>
      `<option value="${department.name}" dept-id="${department.id}">${department.name}</option>`
  );

  $("#deptListEdit").html(`${defaultSelect}${selectOptions.join("")}`);
  $("#deptList").html(`${defaultSelect}${selectOptions.join("")}`);
}
function fillEditModal(rowID) {
  var name = $(`#groupList tr[row-id="${rowID}"]`).find("td:eq(1)").text();
  var acr = $(`#groupList tr[row-id="${rowID}"]`).find("td:eq(2)").text();
  var dept = $(`#groupList tr[row-id="${rowID}"]`).find("td:eq(3)").text();

  $("#grpNameEdit").val(name);
  $("#grpCodeEdit").val(acr);
  $("#deptListEdit").val(dept);
  $("#editGroupModal").modal("show");
}
function addGroup() {
  const groupName = $("#grpName").val().trim();
  const groupCode = $("#grpCode").val().trim();
  const deptSelect = $("#deptList option:selected");
  const deptName = deptSelect.val();
  const deptId = deptSelect.attr("dept-id");

  return new Promise((resolve, reject) => {
    if (groupName === "" || groupCode === "" || deptName === "") {
      reject("Incomplete Fields!");
    } else {
      $.ajax({
        type: "POST",
        url: "ajax/add_group.php",
        data: {
          groupName: groupName,
          groupCode: groupCode,
          deptName: deptName,
          deptID: deptId,
        },
        dataType: "json",
        success: function (data) {
          const res = data;
          resolve(res);
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
    }
  });
}
function resetAdd() {
  $("#grpName").val("");
  $("#grpCode").val("");
  $("#deptList").val("");
}
function saveEdit() {
  const groupName = $("#grpNameEdit").val().trim();
  const groupCode = $("#grpCodeEdit").val().trim();
  const deptSelect = $("#deptListEdit option:selected");
  const deptName = deptSelect.val();
  const deptId = deptSelect.attr("dept-id");

  return new Promise((resolve, reject) => {
    if (groupName === "" || groupCode === "" || deptName === "") {
      reject("Incomplete Fields!");
    } else {
      $.ajax({
        type: "POST",
        url: "ajax/edit_group.php",
        data: {
          groupID: editID,
          groupName: groupName,
          groupCode: groupCode,
          deptName: deptName,
          deptID: deptId,
        },
        dataType: "json",
        success: function (data) {
          const res = data;
          resolve(res);
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
    }
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
//#endregion
