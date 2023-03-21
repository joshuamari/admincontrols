$(document).ready(function(){

    ifSmallScreen()

let list = document.querySelectorAll('.navigation li');
function activeLink(){
    list.forEach((item) => 
        item.classList.remove('active'));
        this.classList.add('active');
}
list.forEach((item)=>
item.addEventListener('click',activeLink));

$('.startli').click();
});


// $(document).on('mouseover', '.navigation li',function(){
//     $(this).
// })

$(document).on('click', '.toggle', function(){
    $('.navigation').toggleClass('actived');
    $('.main').toggleClass('actived');
})

$(document).on('click', '.table-container table tr', function(){
    var eNum = $($(this).children()[0]).text();
    alert(eNum);
    $('#showEmployee').modal('show');
    $(this).prop('dataid',eNum);
    
})
$(document).on('click','#clos',function(){
    $(this).parent().html(`<button type="button" class="btn btn-editEmp">Edit</button>
    <button type="button" class="btn btn-secondary" id="clos" data-bs-dismiss="modal">Close</button>`);
})
$(document).on('click','.btn-close',function(){
    $('#clos').click();
})
$(document).on('click', '.btn-editEmp',function(){
    $(this).parent().html(`<button type="button" class="btn btn-saveEmp">SAVE</button>
    <button type="button" class="btn btn-secondary" id="clos" data-bs-dismiss="modal">Close</button>`);
})



function ifSmallScreen(){
    if($(window).width() < 1150){
       $('#addEmp').html("<i class='bx bxs-user-plus fs-3' ></i>"); 
    }

}