module.exports.postCreate= function (req,res,next ){


    var erros=[];
       if(!req.body.name){
           erros.push("name is require");
       }
       if(!req.body.phone){
        erros.push("phone is require");
    }
    if(erros.length){
        res.render("users/create",{
            erros:erros,
            values:req.body
        });
        return;
    }
    res.locals.success=true;
    next();
    }