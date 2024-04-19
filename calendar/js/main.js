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
var monthlyHolidayData = [
  { holName: "Independence", holDate: "June 12, 2024" },
  { holName: "New Year", holDate: "January 1, 2024" },
  { holName: "Itik", holDate: "August 15, 2024" },
];
var monthNames = [
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
checkLogin();
adminAccess();
getCurrentMonthYear();

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
  holidayChart();
  $("#monthlyList").empty();
  fillHolidayMonthList(monthlyHolidayData);
  fillMonthSelection();
});

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
function fillMonthSelection() {
  var option = "";
  monthNames.forEach(function (monthName, index) {
    option += `<option value="${index + 1}">${monthName}</option>`;
  });
  $("#allMonth").after(option);
}
function getCurrentMonthYear() {
  var currentDate = new Date();

  var currentMonthIndex = currentDate.getMonth();
  var currentMonthName = monthNames[currentMonthIndex];

  var currentYear = currentDate.getFullYear();

  $("#thisYear").text(currentYear);
  $("#thisMonth").text(currentMonthName);
}
function fillHolidayMonthList(monthlyHolidayData) {
  monthlyHolidayData.forEach(function (holiday) {
    var holName = holiday.holName;
    var holDate = holiday.holDate;
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
  // Data for holiday count by month (replace with your actual data)
  var holidayCounts = [1, 1, 3, 2, 1, 0, 0, 2, 0, 3, 1, 4];

  // Months array for labels
  var months = [
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

  // Get the canvas element for the chart
  var ctx = document.getElementById("holidayChart").getContext("2d");

  // Create the horizontal bar chart
  var holidayChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: months, // Months as labels
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
