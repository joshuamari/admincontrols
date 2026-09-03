//#region GLOBALS
const rootFolder = `//${document.location.hostname}`;
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
$(document).on("click", ".btn-viewDesignationActivity", function (e) {
  e.preventDefault();
  e.stopPropagation();
  var $row = $(this).closest("tr");
  var designationId = $row.attr("pos-id");
  var designationName = $row.find("td:eq(1)").text();
  $(this).closest(".dropdown-menu").removeClass("show");
  openDesignationActivityModal(designationId, designationName);
});
$(document).on("click", "[data-close-designation-activity]", function () {
  closeDesignationActivityModal();
});
$(document).on("keydown", function (e) {
  if (e.key !== "Escape") return;
  if ($("#designationActivityModal").hasClass("flex")) {
    closeDesignationActivityModal();
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
        filter: isDesignationActivityMenuTarget,
        preventOnFilter: false,
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
          $(event.target).closest("tr").hasClass("exclude-sortable") ||
          isDesignationActivityMenuTarget(event),
        preventOnFilter: false,
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
    tr.append(`<td>
      <div class="flex justify-center items-center gap-1">
        ${sortableIcon}
        <div
          class="flex justify-center items-center"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i class="bx bx-dots-vertical-rounded btn-edit"></i>
        </div>
        <ul class="bg-[var(--dark-color)] dropdown-menu">
          <li class="hover:bg-[var(--light-color)]">
            <a
              class="hover:bg-[var(--light-color)] dropdown-item flex gap-2 items-center text-white btn-viewDesignationActivity cursor-pointer"
              ><i data-lucide="history" class="h-4 w-4"></i
              >View Activity</a
            >
          </li>
        </ul>
      </div>
    </td>`);
    $("#sortable").append(tr);
  });
  refreshIcons();
}

//#region DESIGNATION ACTIVITY LOG
const USE_DUMMY_DESIGNATION_ACTIVITY_LOGS = true;

function refreshIcons() {
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }
}

function isDesignationActivityMenuTarget(event) {
  return !!$(event.target).closest(
    "[data-bs-toggle='dropdown'], .dropdown-menu, .btn-viewDesignationActivity"
  ).length;
}

function formatDesignationActivityDate(dateStr) {
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

function escapeDesignationActivityHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function getDummyDesignationActivity(designationId) {
  if (!USE_DUMMY_DESIGNATION_ACTIVITY_LOGS) {
    return [];
  }

  const response = await fetch("assets/mock/designation-activity.mock.json");

  if (!response.ok) {
    console.error("Failed to load dummy designation activity logs.");
    return [];
  }

  const data = await response.json();

  return (data.logs || [])
    .filter((log) => Number(log.designation_id) === Number(designationId))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function ensureLegacyDesignationCreate(logs) {
  const items = Array.isArray(logs) ? [...logs] : [];
  const hasCreate = items.some(
    (item) => String(item.action || "").toUpperCase() === "CREATE"
  );
  if (!hasCreate) {
    items.push({
      action: "CREATE",
      description: "Designation created",
      actor_name: null,
      created_at: null,
      changes: [],
    });
  }
  return items;
}

function getDesignationActivityMeta(action) {
  const a = String(action || "").toUpperCase();
  if (a === "CREATE") {
    return {
      label: "CREATE",
      color: "text-emerald-400",
      ring: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/40",
      icon: "plus",
      description: "Designation created",
    };
  }
  return {
    label: "UPDATE",
    color: "text-sky-400",
    ring: "bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/40",
    icon: "pencil",
    description: "Manpower Summary updated",
  };
}

function formatDesignationActivityDescription(item, meta) {
  const action = String(item.action || "").toUpperCase();
  const actor = item.actor_name || (item.actor && item.actor.name) || "";
  if (action === "CREATE") {
    return actor
      ? `Designation created by ${escapeDesignationActivityHtml(actor)}.`
      : "Designation created";
  }
  if (action === "UPDATE" && actor) {
    return `Manpower Summary updated by ${escapeDesignationActivityHtml(actor)}.`;
  }
  return escapeDesignationActivityHtml(item.description || meta.description);
}

function renderDesignationChangedFields(changes) {
  if (!Array.isArray(changes) || !changes.length) return "";

  const rows = changes
    .map((change) => {
      const label = change.label || change.field || "";
      const oldVal = change.old_value != null ? change.old_value : "";
      const newVal = change.new_value != null ? change.new_value : "";
      if (String(oldVal) === String(newVal)) return "";
      return `<div class="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
        <span class="min-w-[8rem] text-slate-400">${escapeDesignationActivityHtml(label)}</span>
        <span class="text-slate-300">${escapeDesignationActivityHtml(oldVal)}</span>
        <span class="text-slate-500">→</span>
        <span class="text-emerald-400">${escapeDesignationActivityHtml(newVal)}</span>
      </div>`;
    })
    .filter(Boolean)
    .join("");

  if (!rows) return "";
  return `<div class="mt-[0.75rem] rounded-md border-[1px] border-solid border-slate-700 bg-[var(--bg-color)] p-[0.75rem] space-y-2">${rows}</div>`;
}

function renderDesignationActivityLog(activities) {
  const $timeline = $("#designationActivityTimeline");
  $timeline.empty();

  const logs = ensureLegacyDesignationCreate(activities).filter((item) => {
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
    const meta = getDesignationActivityMeta(item.action);
    const action = String(item.action || "").toUpperCase();
    const when = item.created_at
      ? formatDesignationActivityDate(item.created_at)
      : "";
    const body =
      action === "CREATE" ? "" : renderDesignationChangedFields(item.changes);
    const descriptionHtml = formatDesignationActivityDescription(item, meta);

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
                ? `<time class="text-xs text-slate-400">${escapeDesignationActivityHtml(when)}</time>`
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

function loadDesignationActivityLog(designationId) {
  $("#designationActivityTimeline").html(
    `<div class="py-6 text-center text-sm text-slate-400">Loading activity…</div>`
  );
  getDummyDesignationActivity(designationId)
    .then(renderDesignationActivityLog)
    .catch((err) => {
      console.error("Failed to load dummy designation activity logs.", err);
      renderDesignationActivityLog([]);
    });
}

function openDesignationActivityModal(designationId, designationName) {
  $("#designationActivityName").text(designationName);
  $("#designationActivityModal")
    .removeClass("hidden")
    .addClass("flex")
    .attr("aria-hidden", "false");
  $("body").addClass("overflow-hidden");
  refreshIcons();
  loadDesignationActivityLog(designationId);
}

function closeDesignationActivityModal() {
  $("#designationActivityModal")
    .addClass("hidden")
    .removeClass("flex")
    .attr("aria-hidden", "true");
  $("body").removeClass("overflow-hidden");
}
//#endregion
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
