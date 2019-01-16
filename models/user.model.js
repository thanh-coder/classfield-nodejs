var mongoose=require("mongoose");
var userSchema= new mongoose.Schema(
    {
        email:String,
       avatar:String,
        password:String,
        phone:String,
        name:String,
        imageID:String
    }
)
var User=mongoose.model("User",userSchema,"users");
module.exports=User;