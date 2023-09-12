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
var accessType = [];
var eid;
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
});

$(document).on("click", ".toggle", function () {
  $(".navigation").toggleClass("actived");
  $(".main").toggleClass("actived");
});
$(document).on("change", "input[type='radio']", function () {
  if (this.checked) {
    $("#appName").removeAttr("disabled");
  }
});
$(document).on("keyup", "#appName", function () {
  $(".badgePrev").empty();
  var val = $("input[type='radio']:checked").val();
  var txt = $("#appName").val();
  $(".badgePrev").append(`<span class="badge ${val}">${txt}</span>`);
});
$(document).on("click", ".btn-close", function () {
  $(".badgePrev").empty();
  $("#appName").val("");
  $("#appName").prop("disabled", true);
  $("input[type='radio']").prop("checked", false);
});
$(document).on("click", "#close", function () {
  $(".btn-close").click();
});
$(document).on("click", ".card-item", function () {
  $("#viewPermissions").modal("show");
});
$(document).on("click", "#btn-addAccessType", function () {
  var newAT = `
  <tr style="background-color:#2f363b;">
    <td colspan="1" style="vertical-align: middle;">
     <input type="text" class="form-control" placeholder="Access name"/>
    </td>
    <td style="text-align: end;" colspan="1">
      <button id="btn-saveAccessType" class="btn d-inline-block justify-content-center p-0 me-1" title="Save" style="height: 35px; width: 35px; background-color: var(--green-color);"><i class='bx bx-save m-0' ></i></button>
      <button class="btn btn-danger d-inline-block justify-content-center p-0" title="Cancel" id="btn-cancelAddTR" style="height: 35px; width: 35px;"><i class='bx bx-x m-0' ></i></i></button>
    </td>
  </tr>`;

  $(newAT).insertBefore("#row-addAT");
  $(this).closest("tr").addClass("d-none");
});
$(document).on("click", "#btn-cancelAddTR", function () {
  $(this).closest("tr").remove();
  $(this).closest("tr").find("input").val("");
  $("#row-addAT").removeClass("d-none");
});
$(document).on("click", "#btn-saveAccessType", function () {
  $("#btn-addAccessType").closest("tr").removeClass("d-none");
  // SAVE ACCESS TYPE
});
$(document).on("click", "#closeAppModal", function () {
  $("#btn-cancelAddTR").click();
});
$(document).on("click", ".mod-item", function () {
  $(".mod-item").removeClass("active");
  $(this).addClass("active");

  var txt = $(this).text();
  $(".right .title span").text(txt + " Access Types");
  $("#btn-cancelAddTR").click();
  $("#row-addAT").removeClass("d-none");
});
$(document).on("click", "#confirmaddApp", function () {
  var val = $("input[type='radio']:checked").val();
  var name = $("#appName").val();
  var err;
  if (!val) {
    $(".colorpick").siblings("small").removeClass("d-none");
    err++;
  }
  if (!name) {
    $("#appName").siblings("small").removeClass("d-none");
    err++;
  }

  if (err > 0) {
    return;
  } else {
    addApp(name, val);
    $("#close").click();
  }
});
$(document).on("click", "input[type='radio']", function () {
  $(".colorpick").siblings("small").addClass("d-none");
});
$(document).on("click", "#btn-addModule", function () {
  $(".mod-items").append(`
  
  <li class="mod-item eto" mod-id=""><input style="border: 1px solid #ccc; "  type="text" class="form-control" placeholder="module name"/></li>`);
  $("#btn-saveModule, #btn-addModule").toggleClass("d-none");
});
$(document).on("click", "#btn-saveModule", function () {
  var val = $(".mod-item:last input").val();
  $("#btn-saveModule, #btn-addModule").toggleClass("d-none");

  if (!val) {
    $(".mod-items").find("li:last").remove();
  } else {
    $(".mod-item:last").html(val);
  }
});
//#endregion

//#region FUNCTIONS
function addApp(name, color) {
  var str = `
  <div class="col-md-6  col-xl-3 col-12  mb-3" >
    <div class="shadow  card-item">
      <div class="card-title d-flex align-items-center gap-2">
        <span class="try ${color}"></span>
        <span>${name}</span>
      </div>
  
      <ul class="list-unstyled module-list mt-3 px-3">
       <li class="w-100 h-100 text-center justify-self-center "
       style="    color: rgba(255, 255, 255, 0.6) !important;">
       No modules found. Please click to add module</li>
      </ul>
    </div>
  </div>`;

  $("#cardContainer").append(str);
}
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

//#endregion
// var projID=$($(this).find('option:selected')).attr('proj-id');

//#endregion
