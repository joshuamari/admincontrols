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
let monthlyHolidayData = [
  // { holName: "Independence", holDate: "June 12, 2024" },
  // { holName: "New Year", holDate: "January 1, 2024" },
  // { holName: "Itik", holDate: "August 15, 2024" },
  // { holName: "Independence", holMonth: 6, holDay: 12, holType: 0 },
  // { holName: "New Year", holMonth: 1, holDay: 1, holType: 0 },
  // { holName: "Itik", holMonth: 8, holDay: 15, holType: 1 },
  // { holName: "Swap", holMonth: 4, holDay: 27, holType: 2 },
];
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
  0: "Regular",
  1: "Special",
  2: "Working Day",
};
const currentDate = new Date();
const currentMonthIndex = currentDate.getMonth();
const currentMonthName = monthNames[currentMonthIndex];
const currentYear = currentDate.getFullYear();
checkLogin().then((emps) => {
  if (emps) {
    empDetails = emps;
    checkCalendarP().then((clndr) => {
      if (clndr) {
        $(document).ready(function () {
          $(".hello-user").text(empDetails["empFName"]);
          let list = document.querySelectorAll(".navigation li");
          function activeLink() {
            list.forEach((item) => item.classList.remove("active"));
            this.classList.add("active");
          }
          list.forEach((item) => item.addEventListener("click", activeLink));
          getCurrentMonthYear();
          $(".startli").click();
          getHolidays().then((hols) => {
            monthlyHolidayData = hols;
            holidayChart();
            $("#monthlyList").empty();
            fillHolidayMonthList(monthlyHolidayData);
            fillMainHoliday(monthlyHolidayData);
            fillMonthSelection();
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
});
// adminAccess();
// getCurrentMonthYear();

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
$(document).on("click", "#holidayName", function () {
  $(this).parent("div").find("small").addClass("hidden");
  $(this).removeClass("bg-red-400");
});
$(document).on("change", "#holidayName, #holidayDate", function () {
  $(this).parent("div").find("small").addClass("hidden");
  $(this).removeClass("bg-red-400");
});
$(document).on("click", "#newHoliday .btn-close", function () {
  resetAddModal();
});
$(document).on("click", ".btn-editHol", function () {
  var rowID = $(this).closest("tr").attr("row-id");
  fillEditModal(rowID);
});
$(document).on("click", ".btn-delHol", function () {
  var rowID = $(this).closest("tr").attr("row-id");
  fillDeleteHolidayModal(rowID);
});
$(document).on("click", "#delHoliday", function () {
  var delID = $("#lbl-removeHol").attr("del-id");
  console.log(delID);
  $("#holidayList tbody tr[row-id='" + delID + "']").remove();
  $("#deleteHolidayModal .btn-close").click();
});
$(document).on("click", "#saveHoliday", function () {});

//#endregion

//#region FUNCTIONS
function checkLogin() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "Includes/checkLogin.php",
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
  const currentYear = $("#thisYear").text();
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "ajax/get_holidays.php",
      data: {
        currentYear: currentYear,
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
          reject("Unspecified error");
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
function fillHolidayMonthList(monthlyHolidayData) {
  const monthVal = currentMonthIndex + 1;
  const filteredHolidays = monthlyHolidayData.filter(
    (holiday) => holiday.holMonth === `${monthVal}`
  );
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
  console.log(monthlyHolidayData);
}
function addHoliday() {
  var name = $("#holidayName").val();
  var startDate = $("#holidayDate").val();

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
    resetAddModal();
    $("#newHoliday .btn-close").click();
  }
}
function resetAddModal() {
  $("#holidayName, #holidayDate").val("");
  $("#holidayName, #holidayDate").removeClass("bg-red-400");
  $("#holidayName , #holidayDate").next("small").addClass("hidden");
  $("#holidayType").val(1);
}
function fillEditModal(rowId) {
  var name = $(`#holidayList tr[row-id="${rowId}"]`).find("td:eq(0)").text();
  var type = $(`#holidayList tr[row-id="${rowId}"]`).find("td:eq(1)").text();
  var date = $(`#holidayList tr[row-id="${rowId}"]`).find("td:eq(2)").text();

  $("#holidayNameEdit").val(name);
  $("#holidayTypeEdit").val(type);
  $("#holidayDateEdit").val(date);
  $("#editHolidayModal").modal("show");
}

function fillDeleteHolidayModal(rowId) {
  var name = $(`#holidayList tr[row-id="${rowId}"]`).find("td:eq(0)").text();
  $("#lbl-removeHol").text(name);
  $("#lbl-removeHol").attr("del-id", rowId);
  console.log(name);
  $("#deleteHolidayModal").modal("show");
}

function holidayChart() {
  // var holidayCounts = [1, 1, 3, 2, 1, 0, 0, 2, 0, 3, 1, 7];
  const holidayCounts = new Array(12).fill(0);

  monthlyHolidayData.forEach((holiday) => {
    const monthIndex = parseInt(holiday.holMonth) - 1;
    holidayCounts[monthIndex]++;
  });

  // Get the canvas element for the chart
  var ctx = document.getElementById("holidayChart").getContext("2d");

  // Create the horizontal bar chart
  var holidayChart = new Chart(ctx, {
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

//#endregion
