//#region GLOBALS
switch (document.location.hostname)
{
        case 'kdt-ph':
            rootFolder = '//kdt-ph/'; 
            break;
        case 'localhost' :
            rootFolder = '//localhost/'; 
            break;
        default : 
            rootFolder = '//kdt-ph/update_test/';
            break;
}
var empDetails=[];
$.ajaxSetup({async: false});
$.ajax(
    {
        url:"Includes/checkLogin.php",
        success: function(data){ //ajax to check if user is logged in
            empDetails=$.parseJSON(data);
            if(empDetails.length<1){
                window.location.href=rootFolder+'/welcome'; //if result is 0, redirect to log in page
            }
            adminAccess();
        }
    }
    );
$.ajaxSetup({async: true});
//#endregion

//#region BINDS
$(document).ready(function(){
    ifSmallScreen();
    $('.hello-user').text(empDetails['empFName']);
    let list = document.querySelectorAll('.navigation li');
    function activeLink(){
        list.forEach((item) => 
            item.classList.remove('active'));
            this.classList.add('active');
    }
    list.forEach((item)=>
    item.addEventListener('click',activeLink));
    
    $('.startli').click();
    getEmployees();
    getGroups();
    getPos();
});
$(document).on('click', '.toggle', function(){
    $('.navigation').toggleClass('actived');
    $('.main').toggleClass('actived');
});
$(document).on('click', '.emp', function(){
    var eNum = $($(this).children()[0]).text();
    $('#showEmployee').modal('show');
    getEmpDetails(eNum);
    // $(this).prop('dataid',eNum); 
});
$(document).on('click','#clos',function(){
    $(this).parent().html(`<button type="button" class="btn btn-editEmp">Edit</button>
    <button type="button" class="btn btn-secondary" id="clos" data-bs-dismiss="modal">Close</button>`);
});
$(document).on('click','.btn-close',function(){
    $('#clos').click();
});
$(document).on('click', '.btn-editEmp',function(){
    $(this).parent().html(`<button type="button" class="btn btn-saveEmp">SAVE</button>
    <button type="button" class="btn btn-secondary" id="clos" data-bs-dismiss="modal">Close</button>`);
});
$(document).on('keyup','#searchWord',function(){
    getEmployees();
})
$(document).on('search','#searchWord',function(){
    getEmployees();
})
//#endregion

//#region FUNCTIONS
function adminAccess(){//check if user has access to jmc
  $.post("ajax/checkAdminAccess.php",
  {
    empNum:empDetails['empNum']
  },
    function (data) {
      if(data.trim()==0){
        alert('Access denied');
        window.location.href=rootFolder+'/welcome';
      }
    }
  );
}
function ifSmallScreen(){
    if($(window).width() < 1150){
       $('#addEmp').html("<i class='bx bxs-user-plus fs-3' ></i>"); 
    }

}
function getEmployees(){
    var employees=[];
    var searchWord=$('#searchWord').val();
    $('#empList').empty();
    $.post("ajax/getEmployees.php",
    {
        searchWord:searchWord,
    },
        function (data) {
            employees=$.parseJSON(data);
            employees.map(fillEmployees)
        }
    );
}
function fillEmployees(iVal){
var addString=``;
var employeeNumber=iVal.split('||')[0];
var employeeName=iVal.split('||')[1];
var employeeUser=iVal.split('||')[2];
var employeeDepartment=iVal.split('||')[3];
var employeeGroup=iVal.split('||')[4];
var employeePosition=iVal.split('||')[5];
addString=`<tr class='emp'>
<td>${employeeNumber}</td>
<td>${employeeName}</td>
<td>${employeeUser}</td>
<td>${employeeDepartment}</td>
<td>${employeeGroup}</td>
<td>${employeePosition}</td>
</tr>`;
$('#empList').append(addString);
}
function getEmpDetails(iVal){
    var empDeetsArray=[];
    $.post("ajax/getEmpDetails.php",
    {
        empNum:iVal
    },
        function (data) {
            empDeetsArray=$.parseJSON(data)
            // console.log(empDeetsArray)
            // empDeetsArray.map(fillModal);
        }
    );
}
function fillModal(iVal){
//empNum||firstname||surname||nickname||username||group||position||bday||gender||civilstatus||datehired
// var firstName=iVal.split('||')[0];
}
function getGroups(){
    var grps=[];
    $('.empGroup').empty();
    var addString=``;
    $('.empGroup').html(`<option value='' hidden>Select Group</option>`);
    $.ajax({
        url: "ajax/getGroups.php",
        success: function (data) {
            grps=$.parseJSON(data);
            grps.forEach(element => {
                addString=`<option style="color: #333;">${element}</option>`;
                $('.empGroup').append(addString);
            });
        }
    });
}
function getPos(){
    var pos=[];
    $('.empPos').empty();
    $('.empPos').html(`<option value='' hidden>Select Position</option>`);
    $.ajax({
        url: "ajax/getPos.php",
        success: function (data) {
            pos=$.parseJSON(data);
            pos.map(fillPos)
            // pos.forEach(element => {
            //     addString=`<option style="color: #333;">${element}</option>`;
            //     $('.empPos').append(addString);
            // });
        }
    });   
}
function fillPos(iVal){
    var addString=``;
    var acroPos=iVal.split('||')[0];
    var fullPos=iVal.split('||')[1];
    addString=`<option style='color: #333;' value='${acroPos}'>${acroPos}(${fullPos})</option>`;
    $('.empPos').append(addString);
}
//#endregion
// var projID=$($(this).find('option:selected')).attr('proj-id');