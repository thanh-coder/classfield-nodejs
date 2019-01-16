document.addEventListener("DOMContentLoaded", function(event) {
    
    var span11 = document.querySelector(".add-user");

    if(span11!=null){
    span11.addEventListener('click',function(){
        console.log("aaaaaa")
        alert("bạn không có quyền truy cập chức năng thêm user")
    var admin = document.querySelector("div#admin");
    admin.classList.add('active_user');

     })
   }
   var span12 = document.querySelector(".edit_admin");
   if(span12!=null){
    span12.addEventListener('click',function(){
        alert("bạn không có quyền truy cập chức năng sửa user")
    var admin = document.querySelector("div#admin");
    admin.classList.add('active_user');

     })
   }

   var span13 = document.querySelector(".delete_admin");
   if(span13!=null){
    span13.addEventListener('click',function(){
        alert("bạn không có quyền truy cập chức năng xóa user")
    var admin = document.querySelector("div#admin");
    admin.classList.add('active_user');

     })
   }


});