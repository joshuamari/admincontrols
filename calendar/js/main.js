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
let empDetails = [];
let selectedLoc = 1;
let selectEdit = 0;
let monthlyHolidayData = [
  // { holName: "Independence", holDate: "June 12, 2024" },
  // { holName: "New Year", holDate: "January 1, 2024" },
  // { holName: "Itik", holDate: "August 15, 2024" },
  // { holName: "Independence", holMonth: 6, holDay: 12, holType: 0 },
  // { holName: "New Year", holMonth: 1, holDay: 1, holType: 0 },
  // { holName: "Itik", holMonth: 8, holDay: 15, holType: 1 },
  // { holName: "Swap", holMonth: 4, holDay: 27, holType: 2 },
];
let currentYearMonthHoliday = [];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const holidayTypes = {
  0: "Regular Holiday",
  1: "Special Holiday",
  2: "Working Day",
};
const currentDate = new Date();
const currentMonthIndex = currentDate.getMonth();
const currentMonthName = monthNames[currentMonthIndex];
const currentYear = currentDate.getFullYear();
let selectedYear = currentYear;
checkLogin()
  .then((emps) => {
    if (emps) {
      empDetails = emps;
      checkCalendarP().then((clndr) => {
        if (clndr) {
          $(document).ready(function () {
            $(".hello-user").text(empDetails["empFName"]);
            refreshIcons();
            let list = document.querySelectorAll(".navigation li");
            function activeLink() {
              list.forEach((item) => item.classList.remove("active"));
              this.classList.add("active");
            }
            list.forEach((item) => item.addEventListener("click", activeLink));
            getCurrentMonthYear();
            $(".startli").click();
            $("#locationList").empty();
            fillHolidayType($("#holidayType"));
            fillHolidayType($("#holidayTypeEdit"));
            fillHolidayType($("#holType"));
            Promise.all([
              getLocations(),
              getHolidays(),
              checkGrpAccess(),
              checkDesigP(),
              checkUserP(),
              checkAppP(),
              getYears(),
              currentYMHolidays(),
            ]).then(([locs, hols, grpp, desigp, usrp, appp, yrs, cmHols]) => {
              fillLocations(locs);
              monthlyHolidayData = hols;
              holidayChart();
              setHolidaysforCurrentMonthofYear();
              currentYearMonthHoliday = cmHols;
              fillHolidayMonthList(currentYearMonthHoliday);
              $("#mainHoliday").empty();
              searchHoliday();
              fillMonthSelection();
              fillYears(yrs);
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
              if (appp) {
                $("#acNavLinks li.startli")
                  .before(`<li class="" style="font-weight: 500">
                    <a href="../appPermission/">
                      <span class="icon"><i class="bx bxs-window-alt"></i></span>
                      <span class="title">App Permission</span>
                    </a>
                  </li>`);
              }
            });
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
  })
  .catch((error) => {
    alert(`${error}`);
  });

//#endregion

//#region BINDS
$(document).on("click", ".menu", function () {
  $(".navigation").toggleClass("actived");
  $(".main").toggleClass("actived");
});
// $(document).on("change", "#startDate", function () {
//   var start = $(this).val();
//   $("#endDate").attr("min", start);
//   $("#endDate").val(start).change();
// });
$(document).on("click", "#addHoliday", function () {
  addHoliday();
});
$(document).on("click", "#holidayName, #holidayNameEdit", function () {
  $(this).parent("div").find("small").addClass("hidden");
  $(this).removeClass("bg-red-400");
});
$(document).on(
  "change",
  "#holidayName, #holidayDate,#holidayNameEdit, #holidayDateEdit",
  function () {
    $(this).parent("div").find("small").addClass("hidden");
    $(this).removeClass("bg-red-400");
  }
);
$(document).on("click", "#newHoliday .btn-close", function () {
  resetAddModal();
});
$(document).on("click", ".btn-editHol", function () {
  var rowID = $(this).closest("tr").attr("row-id");
  fillEditModal(rowID);
  selectEdit = rowID;
});
$(document).on("click", ".btn-delHol", function () {
  var rowID = $(this).closest("tr").attr("row-id");
  fillDeleteHolidayModal(rowID);
});
$(document).on("click", "#delHoliday", function () {
  var delID = $("#lbl-removeHol").attr("del-id");
  deleteHoliday(delID);
});
$(document).on("click", ".calendar-item", function () {
  $(".calendar-item").removeClass("active");
  $(this).addClass("active");
  selectedLoc = $(this).attr("loc-id");
  loadCalendarActivityLog(selectedLoc);
  Promise.all([getHolidays(), currentYMHolidays()])
    .then(([hols, cmHols]) => {
      monthlyHolidayData = hols;
      holidayChart();
      currentYearMonthHoliday = cmHols;
      fillHolidayMonthList(currentYearMonthHoliday);
      $("#mainHoliday").empty();
      searchHoliday();
    })
    .catch((error) => {
      alert(`${error}`);
    });
});
$(document).on("click", "#saveHoliday", function () {
  saveHoliday();
});
$(document).on("keyup", "#searchBar", function () {
  $("#mainHoliday").empty();
  searchHoliday();
});
$(document).on("search", "#searchBar", function () {
  $("#mainHoliday").empty();
  searchHoliday();
});
$(document).on("change", "#monthVal", function () {
  $("#mainHoliday").empty();
  searchHoliday();
});
$(document).on("change", "#holType", function () {
  $("#mainHoliday").empty();
  searchHoliday();
});
$(document).on("change", "#selectedYear", function () {
  setHolidaysforCurrentMonthofYear();
  selectedYear = $("#selectedYear").val();
  getHolidays()
    .then((hols) => {
      monthlyHolidayData = hols;
      holidayChart();
      $("#mainHoliday").empty();
      searchHoliday();
    })
    .catch((error) => {
      alert(`${error}`);
    });
});
//#endregion

//#region FUNCTIONS
function setHolidaysforCurrentMonthofYear() {
  var year = $("#selectedYear").val();

  $("#countforSelectedYear").text(year);
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
          reject("Unspecified error1");
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
function getHolidays() {
  const locID = selectedLoc;
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "ajax/get_holidays.php",
      data: {
        selectedYear: selectedYear,
        locID: locID,
      },
      dataType: "json",
      success: function (data) {
        const hols = data;
        resolve(hols);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Resource not found.");
        } else if (xhr.status === 500) {
          reject(`Server error: ${error}`);
        } else {
          reject("Unspecified error3");
        }
      },
    });
  });
}
function fillMonthSelection() {
  var option = "";
  monthNames.forEach(function (monthName, index) {
    option += `<option value="${index + 1}">${monthName}</option>`;
  });
  $("#allMonth").after(option);
}
function getCurrentMonthYear() {
  $("#thisYear").text(currentYear);
  $("#thisMonth").text(currentMonthName);
}
function renderCalendarPanelEmptyState(icon, title, message) {
  return `<div class="flex h-full min-h-[12rem] flex-col items-center justify-center px-4 py-8 text-center">
      <i data-lucide="${icon}" class="h-8 w-8 text-slate-500"></i>
      <p class="mt-3 mb-0 text-sm font-medium text-slate-300">${escapeCalendarActivityHtml(title)}</p>
      <p class="mt-1 mb-0 max-w-[16rem] text-sm text-slate-400">${escapeCalendarActivityHtml(message)}</p>
    </div>`;
}

function renderHolidayListEmptyState(isFiltered) {
  $("#holidayList").addClass("h-full");
  const calendarName = getSelectedCalendarLabel();
  const year = selectedYear || $("#selectedYear").val() || currentYear;
  const icon = isFiltered ? "search-x" : "calendar-days";
  const title = isFiltered ? "No holidays found" : "No holidays added yet";
  const message = isFiltered
    ? "No holidays match your current search or filters."
    : `No holidays have been added to ${calendarName} for ${year}.`;
  const $cell = $("<td>")
    .attr("colspan", 4)
    .addClass("!w-full !text-center align-middle hover:!bg-transparent");
  $cell.html(renderCalendarPanelEmptyState(icon, title, message));
  $("#mainHoliday").append($("<tr>").addClass("h-full").append($cell));
  refreshIcons();
}

function fillHolidayMonthList(monthlyHolidayData) {
  $("#monthlyList").empty().removeClass("h-full !py-0");
  const monthVal = currentMonthIndex + 1;
  const filteredHolidays = monthlyHolidayData.filter(
    (holiday) => holiday.holMonth === `${monthVal}`
  );
  if (!filteredHolidays.length) {
    const monthName = currentMonthName;
    const year = currentYear;
    $("#monthlyList")
      .addClass("h-full !py-0")
      .html(
        `<li class="h-full !border-0 !bg-transparent !p-0 hover:!bg-transparent">
        ${renderCalendarPanelEmptyState(
          "calendar-x",
          `No holidays for ${monthName} ${year}`,
          "There are no holidays scheduled for this month."
        )}
      </li>`
      );
    refreshIcons();
    return;
  }
  filteredHolidays.forEach(function (holiday) {
    var holName = holiday.holName;
    var holDate = `${monthNames[holiday.holMonth - 1]} ${
      holiday.holDay
    }, ${currentYear}`;
    var str = `
  <li class="">
    <div class="flex justify-between gap-2">
      <span>${holName}</span> 
      <span>${holDate}</span>
    </div>
  </li>`;
    $("#monthlyList").append(str);
  });
}
function fillMainHoliday(monthlyHolidayData) {
  $("#holidayList").removeClass("h-full");
  monthlyHolidayData.forEach((holiday, index) => {
    const monthName = monthNames[parseInt(holiday.holMonth) - 1];
    const formattedDate = `${monthName} ${holiday.holDay}, ${selectedYear}`;
    const $row = $("<tr>").attr("row-id", holiday.holID);
    $row.append($("<td>").text(holiday.holName));
    $row.append($("<td>").text(holidayTypes[holiday.holType]));
    $row.append($("<td>").text(formattedDate));

    const $dropdownContainer = $("<td>").html(`
      <div class="flex justify-center items-center" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        <i class="bx bx-dots-vertical-rounded"></i>
      </div>
      <ul class="dropdown-menu bg-[var(--dark-color)]">
        <li class="hover:bg-[var(--light-color)]">
          <a class="hover:bg-[var(--light-color)] dropdown-item flex gap-2 items-center text-white btn-editHol cursor-pointer">
            <i class="bx bx-edit-alt text-yellow-400"></i>Edit
          </a>
        </li>
        <li>
          <a class="hover:bg-[var(--light-color)] dropdown-item flex gap-2 items-center text-white btn-delHol cursor-pointer">
            <i class="bx bx-trash-alt text-red-600"></i>Delete
          </a>
        </li>
      </ul>
    `);

    $row.append($dropdownContainer);
    $("#mainHoliday").append($row);
  });
}
function addHoliday() {
  const name = $("#holidayName").val();
  const startDate = $("#holidayDate").val();
  const type = $("#holidayType").val();
  const locID = selectedLoc;

  ctr = 0;

  $("small").addClass("hidden");

  if (!name) {
    $("#holidayName").next("small").removeClass("hidden");
    $("#holidayName").addClass("bg-red-400");
    ctr++;
  }
  if (startDate === "") {
    $("#holidayDate").next("small").removeClass("hidden");
    $("#holidayDate").addClass("bg-red-400");
    ctr++;
  }

  if (ctr > 0) {
    return;
  } else {
    $.ajax({
      type: "POST",
      url: "ajax/add_holiday.php",
      data: {
        empID: empDetails["empNum"],
        holName: name,
        holDate: startDate,
        holType: type,
        locID: locID,
      },
      dataType: "json",
      success: function (response) {
        const isSuccess = response.isSuccess;
        if (!isSuccess) {
          alert(`${response.error}`); // Reject the promise
        } else {
          Promise.all([getHolidays(), currentYMHolidays()])
            .then(([hols, cmHols]) => {
              monthlyHolidayData = hols;
              holidayChart();
              currentYearMonthHoliday = cmHols;
              fillHolidayMonthList(currentYearMonthHoliday);
              $("#mainHoliday").empty();
              searchHoliday();
              resetAddModal();
              $("#newHoliday .btn-close").click();
            })
            .catch((error) => {
              alert(`${error}`);
            });
        }
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          alert("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          alert("Internal Server Error: There was a server error.");
        } else {
          alert("An unspecified error occurredxdxd.");
        }
      },
    });
  }
}
function resetAddModal() {
  $("#holidayName, #holidayDate").val("");
  $("#holidayName, #holidayDate").removeClass("bg-red-400");
  $("#holidayName , #holidayDate").next("small").addClass("hidden");
  $("#holidayType").val(0);
}
function fillEditModal(rowId) {
  const selectedHoliday = monthlyHolidayData.find(
    (item) => item.holID == rowId
  );
  const name = selectedHoliday["holName"];
  const type = selectedHoliday["holType"];
  const selectedMonth = selectedHoliday["holMonth"];
  const month =
    selectedMonth < 10
      ? selectedMonth.toString().padStart(2, "0")
      : selectedMonth.toString();
  const selectedDay = selectedHoliday["holDay"];
  const day =
    selectedDay < 10
      ? selectedDay.toString().padStart(2, "0")
      : selectedDay.toString();
  const date = `${selectedYear}-${month}-${day}`;
  $("#holidayNameEdit").val(name);
  $("#holidayTypeEdit").val(type);
  $("#holidayDateEdit").val(date);
  $("#editHolidayModal").modal("show");
}
function fillDeleteHolidayModal(rowId) {
  const selectedHoliday = monthlyHolidayData.find(
    (item) => item.holID == rowId
  );
  const name = selectedHoliday["holName"];
  $("#lbl-removeHol").text(name);
  $("#lbl-removeHol").attr("del-id", rowId);

  $("#deleteHolidayModal").modal("show");
}
function deleteHoliday(delete_id) {
  $.ajax({
    type: "POST",
    url: "ajax/delete_holiday.php",
    data: {
      delID: delete_id,
    },
    dataType: "json",
    success: function (response) {
      const isSuccess = response.isSuccess;
      if (!isSuccess) {
        alert(`${response.error}`); // Reject the promise
      } else {
        Promise.all([getHolidays(), currentYMHolidays()])
          .then(([hols, cmHols]) => {
            monthlyHolidayData = hols;
            holidayChart();
            currentYearMonthHoliday = cmHols;
            fillHolidayMonthList(currentYearMonthHoliday);
            $("#mainHoliday").empty();
            searchHoliday();
            $("#deleteHolidayModal .btn-close").click();
          })
          .catch((error) => {
            alert(`${error}`);
          });
      }
    },
    error: function (xhr, status, error) {
      if (xhr.status === 404) {
        alert("Not Found Error: The requested resource was not found.");
      } else if (xhr.status === 500) {
        alert("Internal Server Error: There was a server error.");
      } else {
        alert("An unspecified error occurred.");
      }
    },
  });
}
function holidayChart() {
  // Clear existing chart if it exists
  if (window.holidayChartInstance) {
    window.holidayChartInstance.destroy();
  }

  // var holidayCounts = [1, 1, 3, 2, 1, 0, 0, 2, 0, 3, 1, 7];
  const holidayCounts = new Array(12).fill(0);

  monthlyHolidayData.forEach((holiday) => {
    const monthIndex = parseInt(holiday.holMonth) - 1;
    holidayCounts[monthIndex]++;
  });

  const totalHolidayCount = holidayCounts.reduce(
    (sum, count) => sum + count,
    0
  );
  $("#holidayCountEmpty").remove();
  $("#holidayChart").removeClass("hidden");
  if (totalHolidayCount === 0) {
    const year = selectedYear || $("#selectedYear").val() || currentYear;
    $("#holidayChart").addClass("hidden");
    $("#holidayChart").parent().append(`
      <div id="holidayCountEmpty" class="h-full">
        ${renderCalendarPanelEmptyState(
          "bar-chart-3",
          `No holiday data for ${year}`,
          "Holiday counts will appear here once holidays are added."
        )}
      </div>
    `);
    refreshIcons();
    return;
  }

  // Get the canvas element for the chart
  var ctx = document.getElementById("holidayChart").getContext("2d");

  // Create the horizontal bar chart
  window.holidayChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: monthNames, // Months as labels
      datasets: [
        {
          label: "Holiday Count",
          data: holidayCounts, // Holiday counts for each month
          backgroundColor: "#e67b42", // Bar color
          borderColor: "#80553e", // Border color
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: "y",
      scales: {
        x: {
          beginAtZero: true, // Start x-axis at zero
          ticks: {
            precision: 0, // Display whole numbers without decimals
            callback: function (value, index, values) {
              return value.toLocaleString(); // Format label as whole number
            },
          },
        },
        y: {
          grace: "5%", // Add extra padding at the top of the chart
          ticks: {
            autoSkip: false, // Prevent automatic skipping of ticks
            stepSize: 1, // Adjust the step size between ticks
          },
        },
      },
      plugins: {
        legend: {
          display: false, // Hide the chart legend
        },
      },
      // Adjust bar thickness and width percentage
      layout: {
        padding: {
          top: 20, // Increase top padding for taller bars
        },
      },
      // Adjust bar thickness and width percentage
      dataset: {
        barThickness: 50, // Increase bar thickness (adjust as needed)
        categoryPercentage: 0.8, // Adjust bar width relative to available space
        barPercentage: 0.9, // Adjust bar width relative to category width
      },
    },
  });
}
function getLocations() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "ajax/get_locations.php",
      dataType: "json",
      success: function (data) {
        const locs = data;
        resolve(locs);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Resource not found.");
        } else if (xhr.status === 500) {
          reject(`Server error: ${error}`);
        } else {
          reject("Unspecified error4");
        }
      },
    });
  });
}
function fillLocations(locations) {
  $.each(locations, function (index, item) {
    var div = $("<div/>")
      .addClass("rounded-lg text-[16px] lg:text-[18px] calendar-item")
      .text(item.name + " Calendar")
      .attr("loc-id", item.id);
    $("#locationList").append(div);
  });
  $('#locationList [loc-id="1"]').trigger("click");
}
function searchHoliday() {
  const keyword = $("#searchBar").val();
  const monthValue = $("#monthVal").val();
  const holidayTypeValue = $("#holType").find(":selected").attr("type-id");
  const searchResults = monthlyHolidayData.filter((holiday) => {
    const isMonthValid =
      monthValue !== "0" ? holiday.holMonth === monthValue : true;
    const isHolidayTypeValid =
      holidayTypeValue !== undefined
        ? holiday.holType == holidayTypeValue
        : true;
    return (
      holiday.holName.toLowerCase().includes(keyword) &&
      isMonthValid &&
      isHolidayTypeValid
    );
  });
  if (!searchResults.length) {
    renderHolidayListEmptyState(monthlyHolidayData.length > 0);
    return;
  }
  fillMainHoliday(searchResults);
}
function fillHolidayType($selectElement) {
  $selectElement.empty();
  if ($selectElement.is($("#holType"))) {
    $("#holType").append(`<option>Holiday Type</option>`);
  }
  Object.entries(holidayTypes).forEach(([typeId, typeName]) => {
    $selectElement.append(
      $("<option>").attr("type-id", typeId).attr("value", typeId).text(typeName)
    );
  });
}
function saveHoliday() {
  const name = $("#holidayNameEdit").val();
  const startDate = $("#holidayDateEdit").val();
  const type = $("#holidayTypeEdit").val();
  const locID = selectedLoc;

  ctr = 0;

  $("small").addClass("hidden");

  if (!name) {
    $("#holidayNameEdit").next("small").removeClass("hidden");
    $("#holidayNameEdit").addClass("bg-red-400");
    ctr++;
  }
  if (startDate === "") {
    $("#holidayDateEdit").next("small").removeClass("hidden");
    $("#holidayDateEdit").addClass("bg-red-400");
    ctr++;
  }

  if (ctr > 0) {
    return;
  } else {
    $.ajax({
      type: "POST",
      url: "ajax/edit_holiday.php",
      data: {
        empID: empDetails["empNum"],
        holName: name,
        holDate: startDate,
        holType: type,
        locID: locID,
        holidayID: selectEdit,
      },
      dataType: "json",
      success: function (response) {
        const isSuccess = response.isSuccess;
        if (!isSuccess) {
          alert(`${response.error}`); // Reject the promise
        } else {
          Promise.all([getHolidays(), currentYMHolidays()])
            .then(([hols, cmHols]) => {
              monthlyHolidayData = hols;
              holidayChart();
              currentYearMonthHoliday = cmHols;
              fillHolidayMonthList(currentYearMonthHoliday);
              $("#mainHoliday").empty();
              searchHoliday();
              $("#editHolidayModal .btn-close").click();
            })
            .catch((error) => {
              alert(`${error}`);
            });
        }
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          alert("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          alert("Internal Server Error: There was a server error.");
        } else {
          alert("An unspecified error occurredxdxd.");
        }
      },
    });
  }
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
function getYears() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "ajax/get_years.php",
      dataType: "json",
      success: function (data) {
        const yrs = data;
        resolve(yrs);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Resource not found.");
        } else if (xhr.status === 500) {
          reject(`Server error: ${error}`);
        } else {
          reject("Unspecified error while fetching years");
        }
      },
    });
  });
}
function fillYears(yrs) {
  $selectElement = $("#selectedYear");
  $selectElement.empty();
  yrs.forEach(function (year) {
    const isSelected = year == currentYear ? "selected" : ""; // Check if the year is the current year
    $selectElement.append(
      `<option value="${year}" ${isSelected}>${year}</option>`
    );
  });
}
function currentYMHolidays() {
  const locID = selectedLoc;
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "ajax/get_current_holidays.php",
      data: {
        locID: locID,
      },
      dataType: "json",
      success: function (data) {
        const hols = data;
        resolve(hols);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Resource not found.");
        } else if (xhr.status === 500) {
          reject(`Server error: ${error}`);
        } else {
          reject("Unspecified error3");
        }
      },
    });
  });
}

//#region CALENDAR ACTIVITY LOG
const USE_DUMMY_CALENDAR_ACTIVITY_LOGS = true;

function refreshIcons() {
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }
}

function escapeCalendarActivityHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatCalendarActivityDate(dateStr) {
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

function getSelectedCalendarLabel() {
  const label = String($(".calendar-item.active").first().text() || "").trim();
  return label || "this calendar";
}

function updateCalendarActivitySubtitle() {
  $("#calendarActivitySubtitle").text(
    `History of changes made to ${getSelectedCalendarLabel()}.`
  );
}

async function getDummyCalendarActivity(calendarId) {
  if (!USE_DUMMY_CALENDAR_ACTIVITY_LOGS) {
    return [];
  }

  try {
    const response = await fetch("assets/mock/calendar-activity.mock.json");
    if (!response.ok) {
      console.error("Failed to load dummy calendar activity logs.");
      return [];
    }
    const data = await response.json();
    return (data.logs || [])
      .filter(
        (log) => Number(log.calendar_id) === Number(calendarId)
      )
      .sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
  } catch (err) {
    console.error("Failed to load dummy calendar activity logs.", err);
    return [];
  }
}

function getCalendarActivityMeta(action) {
  const a = String(action || "").toUpperCase();
  if (a === "CREATE") {
    return {
      label: "CREATE",
      color: "text-emerald-400",
      ring: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/40",
      icon: "plus",
      description: "Holiday created",
    };
  }
  if (a === "DELETE") {
    return {
      label: "DELETE",
      color: "text-red-400",
      ring: "bg-red-500/15 text-red-400 ring-1 ring-red-500/40",
      icon: "trash-2",
      description: "Holiday deleted",
    };
  }
  return {
    label: "UPDATE",
    color: "text-sky-400",
    ring: "bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/40",
    icon: "pencil",
    description: "Holiday information updated",
  };
}

function formatCalendarActivityDescription(item) {
  const action = String(item.action || "").toUpperCase();
  const actor = (item.actor && item.actor.name) || item.actor_name || "";
  if (action === "CREATE") {
    return actor
      ? `Holiday created by ${escapeCalendarActivityHtml(actor)}.`
      : "Holiday created";
  }
  if (action === "DELETE") {
    return actor
      ? `Holiday deleted by ${escapeCalendarActivityHtml(actor)}.`
      : "Holiday deleted";
  }
  if (action === "UPDATE") {
    return actor
      ? `Holiday information updated by ${escapeCalendarActivityHtml(actor)}.`
      : "Holiday information updated";
  }
  return escapeCalendarActivityHtml(item.description || "");
}

function renderCalendarChangeValue(oldVal, newVal) {
  return `<span class="text-slate-300">${escapeCalendarActivityHtml(oldVal)}</span>
    <span class="text-slate-500">→</span>
    <span class="text-emerald-400">${escapeCalendarActivityHtml(newVal)}</span>`;
}

function renderCalendarActivityDetailRows(rows) {
  const html = rows
    .filter((row) => row && row.value)
    .map(
      (row) => `<div class="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
        <span class="min-w-[8rem] text-slate-400">${escapeCalendarActivityHtml(row.label)}</span>
        <span class="text-slate-200">${row.value}</span>
      </div>`
    )
    .join("");
  if (!html) return "";
  return `<div class="mt-3 rounded-md border !border-slate-700 bg-[var(--bg-color)] p-3 space-y-2">${html}</div>`;
}

function isHolidayNameChange(change) {
  const field = String((change && change.field) || "").toLowerCase();
  const label = String((change && change.label) || "").toLowerCase();
  return (
    field === "holiday_name" ||
    field === "name" ||
    label === "holiday name"
  );
}

function renderCalendarActivityDetails(item) {
  const action = String(item.action || "").toUpperCase();
  const holiday = item.holiday || {};
  const name = holiday.name || "";
  const changes = Array.isArray(item.changes) ? item.changes : [];

  if (action === "CREATE" || action === "DELETE") {
    return renderCalendarActivityDetailRows([
      { label: "Holiday", value: escapeCalendarActivityHtml(name) },
    ]);
  }

  if (action === "UPDATE") {
    const rows = [];
    const nameChanged = changes.some(isHolidayNameChange);
    if (name && !nameChanged) {
      rows.push({
        label: "Holiday",
        value: escapeCalendarActivityHtml(name),
      });
    }
    changes.forEach((change) => {
      const oldVal = change.old_value != null ? change.old_value : "";
      const newVal = change.new_value != null ? change.new_value : "";
      if (String(oldVal) === String(newVal)) return;
      rows.push({
        label: change.label || change.field || "",
        value: renderCalendarChangeValue(oldVal, newVal),
      });
    });
    return renderCalendarActivityDetailRows(rows);
  }

  return "";
}

function renderCalendarActivityLog(activities) {
  const $timeline = $("#calendarActivityTimeline");
  $timeline.empty();

  const logs = (Array.isArray(activities) ? activities : []).filter((item) => {
    const action = String(item.action || "").toUpperCase();
    return action === "CREATE" || action === "UPDATE" || action === "DELETE";
  });

  if (!logs.length) {
    $timeline.html(`
      <div class="flex h-full min-h-[12rem] flex-col items-center justify-center px-4 py-8 text-center">
        <i data-lucide="history" class="h-8 w-8 text-slate-500"></i>
        <p class="mt-3 mb-0 text-sm font-medium text-slate-300">No activity recorded yet</p>
        <p class="mt-1 mb-0 max-w-[16rem] text-sm text-slate-400">Changes made to holidays in this calendar will appear here.</p>
      </div>
    `);
    refreshIcons();
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
    const action = String(item.action || "").toUpperCase();
    const meta = getCalendarActivityMeta(action);
    const when = item.created_at
      ? formatCalendarActivityDate(item.created_at)
      : "";
    const descriptionHtml = formatCalendarActivityDescription(item);
    const body = renderCalendarActivityDetails(item);
    const isDelete = action === "DELETE";

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
          isDelete
            ? "!border-red-500/40 bg-red-950/20"
            : "!border-slate-700 bg-[var(--card-color)]"
        } p-4">
          <div class="mb-1 flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs font-semibold tracking-wide ${meta.color}">${meta.label}</span>
            ${
              when
                ? `<time class="text-xs text-slate-400">${escapeCalendarActivityHtml(when)}</time>`
                : ""
            }
          </div>
          <p class="mb-0 text-sm text-slate-200">${descriptionHtml}</p>
          ${body}
        </article>
      </li>`;
  });
  html += `</ol>`;
  $timeline.html(html);
  refreshIcons();
}

function loadCalendarActivityLog(calendarId) {
  updateCalendarActivitySubtitle();
  $("#calendarActivityTimeline").html(
    `<div class="py-6 text-center text-sm text-slate-400">Loading activity…</div>`
  );
  getDummyCalendarActivity(calendarId)
    .then(renderCalendarActivityLog)
    .catch((err) => {
      console.error("Failed to load dummy calendar activity logs.", err);
      renderCalendarActivityLog([]);
    });
}
//#endregion
//#endregion
