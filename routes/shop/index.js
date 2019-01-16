var express = require('express');
var router = express.Router();
var shopController =require('../../controller/shop/shopController');

var Cart=require("../../models/cart");
var Order=require("../../models/order");

/* GET home page. */
router.get('/', shopController.get);

router.get("/add/:id",shopController.addToCart);

router.get("/search",shopController.search);


router.get('/reduce/:id',shopController.reduceOne)



router.get('/remove/:id',shopController.removeAll);


router.get("/shopping-cart",shopController.shoppingCart)

router.get("/checkout",shopController.checkout);

router.post("/checkout",shopController.payment);

router.get("/profile",shopController.profile);




module.exports = router;

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
	}
	req.session.oldUrl=req.url;
    res.redirect('user/signin');
}
