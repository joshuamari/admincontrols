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
checkLogin();
adminAccess();
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
  getEmployees();
  getGroups();
  getPos();
});

$(document).on("click", ".btn-addEmp", function () {
  addEmployee(0);
  // $('.m1,.m2,.m3,.m4,.m5,.m6,.m7,.m8,.m9,.m10,.m11,.m12').addClass('d-none');

  // console.log(position+' '+email);
});
$(document).on("click", "#addEmp", function () {
  $("#ac").prop("disabled", false);
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
  // $('.btn-saveEmp').parent().html(`<button type="button" class="btn btn-editEmp">Edit</button>
  // <button type="button" class="btn btn-secondary" id="clos" data-bs-dismiss="modal">Close</button>`);
  // $('#editFirstname,#editSurname,#editNick,#editPCUser,#editGroup,#editPos,#editBday,#editGender,#editStatus,#editDatehired,#editLotus,#ac').prop('disabled',true);
  addEmployee(1);
});
$(document).on("keyup", "#searchWord", function () {
  getEmployees();
});
$(document).on("search", "#searchWord", function () {
  getEmployees();
});
$(document).on("click", "#ac", function () {
  var lname = $("#addSurname").val();

  $("#addLotus").val(lname + `-kdt`);
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
    },
    async: false,
  });
}
function resignEmployee(empnum, resdate) {
  $.post(
    "ajax/resignEmployee.php",
    {
      resdate: resdate,
      empnum: empnum,
    },
    function (data) {
      console.log(data);
      $("#clos").click();
      $("#resConfirm").modal("hide");
    }
  );
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
// function ifSmallScreen(){
//     if($(window).width() < 1150){
//        $('#addEmp').html("<i class='bx bxs-user-plus fs-3' ></i>");
//        $('#resignEmp').html("<i class='bx bxs-tag-x bx-md' ></i>");
//     }

// }
function getEmployees() {
  var employees = [];
  var searchWord = $("#searchWord").val();
  var active = 0;
  if ($("#activeOnly").is(":checked")) {
    active = 1;
  }
  $("#empList").empty();
  $.post(
    "ajax/getEmployees.php",
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
function fillEmployees(iVal) {
  var addString = ``;
  var employeeNumber = iVal.split("||")[0];
  var employeeName = iVal.split("||")[1];
  var employeeUser = iVal.split("||")[2];
  var employeeDepartment = iVal.split("||")[3];
  var employeeGroup = iVal.split("||")[4];
  var employeePosition = iVal.split("||")[5];
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
    "ajax/getEmpDetails.php",
    {
      empNum: iVal,
    },
    function (data) {
      empDeetsArray = $.parseJSON(data);
      // console.log(empDeetsArray)
      empDeetsArray.map(fillModal);
    }
  );
}
function fillModal(iVal) {
  // empNum||firstname||surname||nickname||username||group||position||bday||gender||civilstatus||datehired
  var empnum = iVal.split("||")[0];
  var firstname = iVal.split("||")[1];
  var surname = iVal.split("||")[2];
  var nname = iVal.split("||")[3];
  var uname = iVal.split("||")[4];
  var group = iVal.split("||")[5];
  var position = iVal.split("||")[6];
  var bday = iVal.split("||")[7];
  var gender = iVal.split("||")[8];
  var status = iVal.split("||")[9];
  var dhired = iVal.split("||")[10];
  var empEmail = iVal.split("||")[11].split("/P/KHI")[0];
  var resDate = iVal.split("||")[12];
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
    "#editEmpnum,#editFirstname,#editSurname,#editNick,#editPCUser,#editGroup,#editPos,#editBday,#editGender,#editStatus,#editDatehired,#editLotus,#ac"
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
    url: "ajax/getGroups.php",
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
    url: "ajax/getPos.php",
    success: function (data) {
      pos = $.parseJSON(data);
      pos.map(fillPos);
      // pos.forEach(element => {
      //     addString=`<option style="color: #333;">${element}</option>`;
      //     $('.empPos').append(addString);
      // });
    },
  });
}
function fillPos(iVal) {
  var addString = ``;
  var acroPos = iVal.split("||")[0];
  var fullPos = iVal.split("||")[1];
  addString = `<option style='color: #333;' value='${acroPos}'>${acroPos}(${fullPos})</option>`;
  $(".empPos").append(addString);
}
function addEmployee(iVal) {
  var modeStr = `add`;
  if (iVal == "1") {
    modeStr = `edit`;
  }
  var fname = $(`#${modeStr}Firstname`).val();
  var lname = $(`#${modeStr}Surname`).val();
  var nname = $(`#${modeStr}Nick`).val();
  var bday = $(`#${modeStr}Bday`).val();
  var gender = $(`#${modeStr}Gender`).find(`:selected`).val();
  var status = $(`#${modeStr}Status`).find(`:selected`).val();
  var empnum = $(`#${modeStr}Empnum`).val();
  var username = $(`#${modeStr}PCUser`).val();
  var group = $(`#${modeStr}Group`).find(`:selected`).val();
  var dhired = $(`#${modeStr}Datehired`).val();
  var position = $(`#${modeStr}Pos`).find(`:selected`).val();
  var email = $(`#${modeStr}Lotus`).val();
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
    // console.log('may kulang')
    return;
  }

  $.ajaxSetup({ async: false });
  $.post(
    "ajax/checkEmpExists.php",
    {
      username: username,
      empnum: empnum,
      email: email,
      mode: iVal,
    },
    function (data) {
      // console.log(data)
      if (data.trim()) {
        if (data.includes("id")) {
          eMsg += " Employee Number";
          idInp = $("#addEmpnum").val("");
        }
        if (data.includes("user")) {
          eMsg += " Username";
          userInp = $("#addPCUser").val("");
        }
        if (data.includes("lotus")) {
          eMsg += " Lotus";
          userInp = $("#emailNaddLotusameInp").val("");
        }
        eMsg += " taken";
        alert(eMsg);
        // return;
      }
    }
  );

  $.ajaxSetup({ async: true });
  if (eMsg !== "") {
    return;
  }
  $.post(
    "ajax/addEmployee.php",
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
      mode: iVal,
    },
    function (data) {
      switch (iVal) {
        case 0:
          $("#xadd").click();
          break;
        case 1:
          $(".btn-saveEmp").parent()
            .html(`<button type="button" class="btn btn-editEmp">Edit</button>
                    <button type="button" class="btn btn-secondary" id="clos" data-bs-dismiss="modal">Close</button>`);
          $(
            "#editFirstname,#editSurname,#editNick,#editPCUser,#editGroup,#editPos,#editBday,#editGender,#editStatus,#editDatehired,#editLotus,#ac"
          ).prop("disabled", true);
          // $('.btn-close').click();
          $(".errMsg").addClass("d-none");
          break;
      }
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
