
// var db = require("../data")
var cloudinary = require('cloudinary');
var User = require('../models/user.model')
var mongoose =require('mongoose')
var shortid = require("shortid")

// db.defaults({ users: [] })
//     .write()

module.exports.index= async function(req, res) {
    try{
    const users = await User.find({})
    res.render("users/user", {
        // users: db.get('users').value()
        users,
        pageTitle:'Member Login'

    })
    }
    catch(e){
        console.log("không lấy được data để hiển h=thị user")
    }
}
module.exports.search=async function(req, res) {

    var q = req.query.q;
    try{
          var matched = await User.find({})
                      
       const users = matched.filter((user, index) => {
        return user.name.toLowerCase().indexOf(q.toLowerCase()) !== -1;
    })
        res.render("users/user", {
            users,
            search:q,
        pageTitle:'Member Login'

        })
    }
    catch(e) {
            console.log("can't take data");
        }
    
}
module.exports.create=function(req, res) {
    res.render('users/create',{
        pageTitle:'Member Login'
  })
}
module.exports.get= async function (req, res) {
    var id = req.params.id;
    try{
    const user = await User.find({_id:mongoose.Types.ObjectId(id)});
    console.log(user);
        res.render("users/view", { user,a:2,pageTitle:"Member Login"})
    }
    catch(e){
        console.log("can't display data")
    }
}

module.exports.edit = async (req,res,next) => {
    console.log("in edit");
    try{
    const users = await User.findById(req.params.id);
    console.log(users);
        res.render("users/edit",{user:users,pageTitle:"Member Login"})
    }
    catch(e){
        console.log("can't send data to edit page")
    }
}

module.exports.put_edit =  (req,res,next) => {
    console.log("put edit");
    if(re.user){
        if(req.user.roles.ADMIN){

     User.findById(req.params.id,async (err,users) => {
         if(err){
             res.redirect('back');
         } else{
            if(req.file){
              try{
                await cloudinary.uploader.destroy(users.imageID)
                const result = await cloudinary.uploader.upload(req.file.path)
                users.avatar = result.secure_url;
                users.imageID=result.public_id;
              }  catch(e){
                console.log("can't send data to edit page")
                res.redirect('back');
            }
            }
       
        users.name = req.body.name 
        users.phone = req.body.phone;

        await users.save();
    console.log(users);

    res.redirect("/users")
    }
    
})
    }
    else{
        
    }
}
}


module.exports.delete =  (req,res,next) => {
    console.log("delete");
    
     User.findById(req.params.id,async (err,users) => {
         if(err){
             res.redirect('back');
         } 
              try{
                await cloudinary.uploader.destroy(users.imageID)
                await users.remove();
                res.redirect("/users")

              }  catch(e){
                console.log("can't send data to edit page")
                res.redirect('back');
            
             }
    
})
}


module.exports.postCreate=function(req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
        req.body.id = shortid.generate();
        console.log("cloudinary : " + result.secure_url );
        // req.body.avatar=req.file.path.split("/").slice(1).join("/");
        req.body.avatar = result.secure_url;
        req.body.imageID=result.public_id;

        //    db.get("users").push(req.body).write();
           const user = new User(req.body);
           user.save()
           .then((result) => console.log("save succesed"))
           .catch((err) => console.log(`saved failed ${err}`));
                    
    
        res.redirect("/users")
      });

    // req.body.id = shortid.generate();
    // req.body.avatar=req.file.path.split("/").slice(1).join("/");
    // //    db.get("users").push(req.body).write();
    //    const user = new User(req.body);
    //    user.save()
    //    .then((result) => console.log("save succesed"))
    //    .catch((err) => console.log(`saved failed ${err}`));
                

    // res.redirect("/users")
}
