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
            // if (desigp) {
            //   $("#acNavLinks").append(`<li class="" style="font-weight: 500">
            //     <a href="../designationList/">
            //       <span class="icon"><i class='bx bxs-award' ></i></span>
            //       <span class="title">Designation List</span>
            //     </a>
            //   </li>`);
            // }
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
            //   if (clndr) {
            //     $("#acNavLinks").append(`<li class="" style="font-weight: 500">
            //   <a href="../calendar/">
            //     <span class="icon"><i class='bx bx-calendar'></i></span>
            //     <span class="title">Calendar</span>
            //   </a>
            // </li>`);
            //   }
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
  console.log("pindot");
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
                    ><i class="bx bx-edit-alt text-yellow-400"></i
                    >Edit</a
                  >
                </li>
              </ul>
            </td>
        </tr>
    `);
  });
}
function searchGroup() {
  // const searchTerm = searchInput.value.toLowerCase();
  const searchTerm = $("#searchWord").val().toLowerCase();
  const filteredData = groupList.filter((item) =>
    item.name.toLowerCase().includes(searchTerm)
  );
  console.log(filteredData);
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
      `<option value="${department.name}">${department.name}</option>`
  );

  $("#deptListEdit").html(`${defaultSelect}${selectOptions.join("")}`);
  $("#deptList").html(`${defaultSelect}${selectOptions.join("")}`);
}
function fillEditModal(rowID) {
  var name = $(`#groupList tr[row-id="${rowID}"]`).find("td:eq(1)").text();
  var acr = $(`#groupList tr[row-id="${rowID}"]`).find("td:eq(2)").text();
  var dept = $(`#groupList tr[row-id="${rowID}"]`).find("td:eq(3)").text();

  console.log(dept);
  $("#grpNameEdit").val(name);
  $("#grpCodeEdit").val(acr);
  $("#deptListEdit").val(dept);
  $("#editGroupModal").modal("show");
}
function addGroup() {
  const groupName = $("#grpName").val().trim();
  const groupCode = $("#grpCode").val().trim();
  const deptName = $("#deptList").val().trim();

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
  const deptName = $("#deptListEdit").val().trim();

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
