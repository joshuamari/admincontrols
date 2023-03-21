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

$('.startli').next('li').click();
});


// $(document).on('mouseover', '.navigation li',function(){
//     $(this).
// })

$(document).on('click', '.toggle', function(){
    $('.navigation').toggleClass('actived');
    $('.main').toggleClass('actived');
})

function ifSmallScreen(){
    if($(window).width() < 1060){
       $('#addGroup').html("<i class='bx bx-plus fs-3' ></i>"); 
    }

}