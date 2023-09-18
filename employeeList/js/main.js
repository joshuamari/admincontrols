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

//#endregion
checkLogin();
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
  getEmployees();
  getGroups();
  getPos();
});

$(document).on("click", ".btn-addEmp", function () {
  addEmployee();
});
$(document).on("click", ".toggle", function () {
  $(".navigation").toggleClass("actived");
  $(".main").toggleClass("actived");
});
$(document).on("click", ".emp", function () {
  var eNum = $($(this).children()[0]).text();
  var name = $($(this).children()[1]).text();
  $("#showEmployee").modal("show");
  $("#empCon").val(name);
  $("#empConid").val(eNum);
  getEmpDetails(eNum);

  // $(this).prop('dataid',eNum);
});
$(document).on("click", "#clos", function () {
  $(
    this
  ).parent().html(`<button type="button" class="btn btn-editEmp">Edit</button>
    <button type="button" class="btn btn-secondary" id="clos" data-bs-dismiss="modal">Close</button>`);
  $(".m1,.m2,.m3,.m4,.m5,.m6,.m7,.m8,.m9,.m10,.m11,.m12").addClass("d-none");
  $("#showEmployee").modal("hide");
});
$(document).on("click", "#close", function () {
  $(".m1,.m2,.m3,.m4,.m5,.m6,.m7,.m8,.m9,.m10,.m11,.m12").addClass("d-none");
  resetAdd();
});
$(document).on("click", "#xadd", function () {
  $("#close").click();
  resetAdd();
});
$(document).on("click", ".btn-close", function () {
  $("#clos").click();
  resetAdd();
});
$(document).on("click", ".btn-editEmp", function () {
  $(
    this
  ).parent().html(`<button type="button" class="btn btn-saveEmp">SAVE</button>
    <button type="button" class="btn btn-secondary" id="clos" data-bs-dismiss="modal">Close</button>`);
  $(
    "#editFirstname,#editSurname,#editNick,#editPCUser,#editGroup,#editPos,#editBday,#editGender,#editStatus,#editDatehired,#editLotus,#ac"
  ).prop("disabled", false);
});
$(document).on("click", ".btn-saveEmp", function () {
  saveEdit();
});
$(document).on("keyup", "#searchWord", function () {
  getEmployees();
});
$(document).on("search", "#searchWord", function () {
  getEmployees();
});
$(document).on("click", "#activeOnly", function () {
  getEmployees();
});
$(document).on("click", "#resDate", function () {
  $(".r1").addClass("d-none");
  $("#resDate").removeClass("border border-danger");
});
$(document).on("click", ".btn-resEmp", function () {
  var resdate = $("#resDate").val();

  if (!resdate) {
    $(".r1").removeClass("d-none");
    $("#resDate").addClass("border border-danger");
    return;
  } else {
    $("#resignEmployee").modal("hide");
    $("#resConfirm").modal("show");
    $("#dateCon").val(resdate);
  }
});

$(document).on("click", "#resback", function () {
  $("#resignEmployee").modal("show");
  $("#resConfirm").modal("hide");
});
$(document).on("click", "#resclose", function () {
  $(".r1").addClass("d-none");
  $("#resDate").removeClass("border border-danger");
  $("#resDate").val("");
});
$(document).on("click", "#rescloseI", function () {
  $("#resclose").click();
});
$(document).on("click", "#employeeStat", function () {
  $("#clos").click();
  $("#resignEmployee").modal("show");
});
$(document).on("click", ".btn-cres", function () {
  var empnum = $("#empConid").val();
  var resdate = $("#resDate").val();

  resignEmployee(empnum, resdate);

  //if employee is resigned

  // $('#empStat').html(`<label class="form-label" style="color: #333;">Employee Status</label><span class="badge rounded-pill d-flex align-items-center justify-content-center" id="employeeStat"
  // data-bs-target="#resignEmployee" data-bs-toggle="modal" data-bs-dismiss="modal" style="width:50%; height: 35px; background: #f85e5e; cursor: pointer;  font-size: 15px;">Resigned</span>`);
});

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
      adminAccess();
      checkModify();
      checkUserP();
    },
    async: false,
  });
}
function adminAccess() {
  $.post(
    "ajax/check_admin.php",
    {
      empNum: empDetails["empNum"],
    },
    function (data) {
      var access = $.parseJSON(data);
      if (!access) {
        alert("Access denied");
        window.location.href = rootFolder;
      }
    }
  );
}
function checkModify() {
  $.post(
    "ajax/check_modify.php",
    {
      empNum: empDetails["empNum"],
    },
    function (data) {
      var access = $.parseJSON(data);
      if (access) {
        $("#aeDiv").html(`<button
        type="button"
        id="addEmp"
        class="btn mx-1"
        title="Add Employee"
        data-bs-toggle="modal"
        data-bs-target="#addEmployee"
        data-bs-dismiss="modal"
      >
        <i class="bx bx-fw bxs-user-plus fs-3"></i>
        ADD EMPLOYEE
      </button>`);
      } else {
        $(".btn-editEmp").prop("disabled", "true");
        $(document).off("click", ".btn-editEmp");
        $(document).off("click", "#employeeStat");
        $(document).off("click", ".btn-cres");
        $(document).off("click", ".btn-resEmp");
      }
    }
  );
}
function checkUserP() {
  $.post(
    "ajax/check_userp.php",
    {
      empNum: empDetails["empNum"],
    },
    function (data) {
      var access = $.parseJSON(data);
      if (access) {
        $("#acNavLinks").append(`<li class="" style="font-weight: 500">
        <a href="../userPermission/">
          <span class="icon"><i class="bx bxs-user-badge"></i></span>
          <span class="title">User Permission</span>
        </a>
      </li>`);
      }
    }
  );
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
      $("#clos").click();
      $("#resConfirm").modal("hide");
      getEmployees();
    }
  );
}
function getEmployees() {
  var employees = [];
  var searchWord = $("#searchWord").val();
  var active = 0;
  if ($("#activeOnly").is(":checked")) {
    active = 1;
  }
  $("#empList").empty();
  $.post(
    "ajax/get_employees.php",
    {
      searchWord: searchWord,
      active: active,
    },
    function (data) {
      employees = $.parseJSON(data);
      employees.map(fillEmployees);
    }
  );
}
function fillEmployees(empDetails) {
  var addString = ``;
  var employeeNumber = empDetails["emp_num"];
  var employeeName = empDetails["emp_name"];
  var employeeUser = empDetails["emp_user"];
  var employeeDepartment = empDetails["emp_dept"];
  var employeeGroup = empDetails["emp_group"];
  var employeePosition = empDetails["emp_pos"];
  addString = `<tr class='emp'>
<td>${employeeNumber}</td>
<td>${employeeName}</td>
<td>${employeeUser}</td>
<td>${employeeDepartment}</td>
<td>${employeeGroup}</td>
<td>${employeePosition}</td>
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
  if (!resDate) {
    $(".empStat").html(`
    <div class="mb-3 col-12 col-md-6" id="empStat">
    <label class="form-label" style="color: #333;">Employee Status</label>
    <span class="badge rounded-pill d-flex align-items-center justify-content-center" id="employeeStat"
       style="width:80%; height: 35px; background: #09c46f; cursor: pointer; font-size: 15px;">Active</span>
    </div>
    <div class="mb-3 col-12 col-md-6 res d-none">
      <label class="form-label" for="resigdate" style="color: #333;" >Resignation Effectivity Date</label>
      <input type="date" class="form-control" id="resigdate"  style="color: #333;" disabled>
    </div>`);
  } else {
    $(".empStat").html(`
    <div class="mb-3 col-12 col-md-6" id="empStat">
    <label class="form-label" style="color: #333;">Employee Status</label>
    <span class="badge rounded-pill d-flex align-items-center justify-content-center" 
     style="width:80%; height: 35px; background: red;  font-size: 15px;">Resigned</span>
    </div>
    <div class="mb-3 col-12 col-md-6 res">
      <label class="form-label" for="resigdate" style="color: #333;" >Resignation Effectivity Date</label>
      <input type="date" class="form-control" id="resigdate"  style="color: #333;" disabled>
    </div>`);
  }
  $("#resigdate").val(resDate);
}

function getGroups() {
  var grps = [];
  $(".empGroup").empty();

  var addString = ``;
  $(".empGroup").html(`<option value='' hidden>Select Group</option>`);

  $.ajax({
    url: "ajax/get_groups.php",
    success: function (data) {
      grps = $.parseJSON(data);
      grps.forEach((element) => {
        addString = `<option style="color: #333;">${element}</option>`;
        $(".empGroup").append(addString);
      });
    },
  });
}
function getPos() {
  var pos = [];
  $(".empPos").empty();
  $(".empPos").html(`<option value='' hidden>Select Position</option>`);
  $.ajax({
    url: "ajax/get_pos.php",
    success: function (data) {
      pos = $.parseJSON(data);
      fillPos(pos);
    },
  });
}
function fillPos(posDetails) {
  var addString = ``;
  Object.keys(posDetails).forEach((posAcro) => {
    const posFull = posDetails[posAcro];
    addString += `<option style='color: #333;' value='${posAcro}'>${posAcro}(${posFull})</option>`;
  });
  $(".empPos").append(addString);
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
  var group = $(`#addGroup`).find(`:selected`).val();
  var dhired = $(`#addDatehired`).val();
  var position = $(`#addPos`).find(`:selected`).val();
  var email = $(`#addLotus`).val();
  var error = 0;
  var eMsg = ``;
  if (!fname) {
    $(".m3").removeClass("d-none");
    error++;
  }
  if (!lname) {
    $(".m4").removeClass("d-none");
    error++;
  }
  if (!nname) {
    $(".m5").removeClass("d-none");
    error++;
  }
  if (!bday) {
    $(".m6").removeClass("d-none");
    error++;
  }
  if (!gender) {
    $(".m7").removeClass("d-none");
    error++;
  }
  if (!status) {
    $(".m8").removeClass("d-none");
    error++;
  }
  if (!empnum) {
    $(".m1").removeClass("d-none");
    error++;
  }
  if (!username) {
    $(".m2").removeClass("d-none");
    error++;
  }
  if (!group) {
    $(".m9").removeClass("d-none");
    error++;
  }
  if (!dhired) {
    $(".m10").removeClass("d-none");
    error++;
  }
  if (!position) {
    $(".m11").removeClass("d-none");
    error++;
  }
  if (!email) {
    $(".m12").removeClass("d-none");
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
      getEmployees();
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
  if (!fname) {
    $(".m3").removeClass("d-none");
    error++;
  }
  if (!lname) {
    $(".m4").removeClass("d-none");
    error++;
  }
  if (!nname) {
    $(".m5").removeClass("d-none");
    error++;
  }
  if (!bday) {
    $(".m6").removeClass("d-none");
    error++;
  }
  if (!gender) {
    $(".m7").removeClass("d-none");
    error++;
  }
  if (!status) {
    $(".m8").removeClass("d-none");
    error++;
  }
  if (!empnum) {
    $(".m1").removeClass("d-none");
    error++;
  }
  if (!username) {
    $(".m2").removeClass("d-none");
    error++;
  }
  if (!group) {
    $(".m9").removeClass("d-none");
    error++;
  }
  if (!dhired) {
    $(".m10").removeClass("d-none");
    error++;
  }
  if (!position) {
    $(".m11").removeClass("d-none");
    error++;
  }
  if (!email) {
    $(".m12").removeClass("d-none");
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
          idInp = "";
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

      $(".btn-saveEmp").parent()
        .html(`<button type="button" class="btn btn-editEmp">Edit</button>
                    <button type="button" class="btn btn-secondary" id="clos" data-bs-dismiss="modal">Close</button>`);
      $(
        "#editFirstname,#editSurname,#editNick,#editPCUser,#editGroup,#editPos,#editBday,#editGender,#editStatus,#editDatehired,#editLotus"
      ).prop("disabled", true);
      $(".errMsg").addClass("d-none");

      getEmployees();
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
  $(".errMsg").addClass("d-none");
}

//#endregion
