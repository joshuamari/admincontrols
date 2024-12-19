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
          });
        } else {
          alert(`Access Denied`);
          window.location.href = `${rootFolder}`;
        }
      });
      // Promise.all([getLocations(), checkCalendarP()])
      //   .then(([locs, clndr]) => {
      //     if (clndr && locs) {
      //       $(document).ready(function () {
      //         $(".hello-user").text(empDetails["empFName"]);
      //         let list = document.querySelectorAll(".navigation li");
      //         function activeLink() {
      //           list.forEach((item) => item.classList.remove("active"));
      //           this.classList.add("active");
      //         }
      //         list.forEach((item) =>
      //           item.addEventListener("click", activeLink)
      //         );
      //         getCurrentMonthYear();
      //         $(".startli").click();
      //         $("#locationList").empty();
      //         fillLocations(locs);
      //         fillHolidayType($("#holidayType"));
      //         fillHolidayType($("#holidayTypeEdit"));
      //         fillHolidayType($("#holType"));
      //         getHolidays()
      //           .then((hols) => {
      //             monthlyHolidayData = hols;
      //             holidayChart();
      //             $("#monthlyList").empty();
      //             fillHolidayMonthList(monthlyHolidayData);
      //             $("#mainHoliday").empty();
      //             searchHoliday();
      //             fillMonthSelection();
      //           })
      //           .catch((error) => {
      //             alert(`${error}`);
      //           });
      //         Promise.all([
      //           getHolidays(),
      //           checkGrpAccess(),
      //           checkDesigP(),
      //           checkUserP(),
      //           checkAppP(),
      //         ])
      //           .then(([hols, grpp, desigp, usrp, appp]) => {
      //             monthlyHolidayData = hols;
      //             holidayChart();
      //             setHolidaysforCurrentMonthofYear();
      //             $("#monthlyList").empty();
      //             fillHolidayMonthList(monthlyHolidayData);
      //             $("#mainHoliday").empty();
      //             searchHoliday();
      //             fillMonthSelection();
      //             if (grpp) {
      //               $("#acNavLinks li.startli")
      //                 .before(`<li class="" style="font-weight: 500">
      //           <a href="../groupList/">
      //           <span class="icon"><i class='bx bxs-group' ></i></span>
      //             <span class="title">Group List</span>
      //           </a>
      //         </li>`);
      //             }
      //             if (desigp) {
      //               $("#acNavLinks li.startli")
      //                 .before(`<li class="" style="font-weight: 500">
      //               <a href="../designationList/">
      //               <span class="icon"><i class='bx bxs-award' ></i></span>
      //                 <span class="title">Designation List</span>
      //               </a>
      //             </li>`);
      //             }
      //             if (usrp) {
      //               $("#acNavLinks li.startli")
      //                 .before(`<li class="" style="font-weight: 500">
      //                   <a href="../userPermission/">
      //                     <span class="icon"><i class="bx bxs-user-badge"></i></span>
      //                     <span class="title">User Permission</span>
      //                   </a>
      //                 </li>`);
      //             }
      //             if (appp) {
      //               $("#acNavLinks li.startli")
      //                 .before(`<li class="" style="font-weight: 500">
      //               <a href="../appPermission/">
      //                 <span class="icon"><i class="bx bxs-window-alt"></i></span>
      //                 <span class="title">App Permission</span>
      //               </a>
      //             </li>`);
      //             }
      //           })
      //           .catch((error) => {
      //             alert(`${error}`);
      //           });
      //       });
      //     } else {
      //       alert(`Access Denied`);
      //       window.location.href = `${rootFolder}`;
      //     }
      //   })
      //   .catch((error) => {
      //     alert(`${error}`);
      //   });
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
  getHolidays()
    .then((hols) => {
      monthlyHolidayData = hols;
      holidayChart();
      $("#monthlyList").empty();
      fillHolidayMonthList(monthlyHolidayData);
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
      $("#monthlyList").empty();
      fillHolidayMonthList(monthlyHolidayData);
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
function fillHolidayMonthList(monthlyHolidayData) {
  const monthVal = currentMonthIndex + 1;
  const filteredHolidays = monthlyHolidayData.filter(
    (holiday) => holiday.holMonth === `${monthVal}`
  );
  filteredHolidays.forEach(function (holiday) {
    var holName = holiday.holName;
    var holDate = `${monthNames[holiday.holMonth - 1]} ${
      holiday.holDay
    }, ${selectedYear}`;
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
  monthlyHolidayData.forEach((holiday, index) => {
    const monthName = monthNames[parseInt(holiday.holMonth) - 1];
    const formattedDate = `${monthName} ${holiday.holDay}, 2024`;
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
          getHolidays()
            .then((hols) => {
              monthlyHolidayData = hols;
              holidayChart();
              $("#monthlyList").empty();
              fillHolidayMonthList(monthlyHolidayData);
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
        getHolidays()
          .then((hols) => {
            monthlyHolidayData = hols;
            holidayChart();
            $("#monthlyList").empty();
            fillHolidayMonthList(monthlyHolidayData);
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
          getHolidays()
            .then((hols) => {
              monthlyHolidayData = hols;
              holidayChart();
              $("#monthlyList").empty();
              fillHolidayMonthList(monthlyHolidayData);
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
//#endregion
