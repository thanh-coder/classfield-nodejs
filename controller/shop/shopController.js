var Product=require("../../models/product");
var Cart=require("../../models/cart");
var Order=require("../../models/order");

module.exports.get=async (req,res,next)=>{

    try{
        var successMsg=req.flash('success')[0];

       var page=parseInt(req.query.page)||1;
        var perpage=8;
        var start=(page-1)*perpage;
        var end=page*perpage;
     var products=await Product.find().skip(start).limit(perpage);
     var productChunks=[];
		var chunkSize=3;
		for(var i=0;i<products.length;i+=chunkSize){
			productChunks.push(products.slice(i,i+chunkSize))
		}
     var count=await Product.find().count();
    
    res.render("shop/index",{
        pageTitle: 'Shopping cart',
        products:productChunks,
        current:page,
        pages:Math.ceil(count/perpage),
        successMsg:successMsg,
        noMessage:!successMsg
    })
    }catch(error){
        next(error)
    }
    }

exports.search =async (req,res,next) => {
    try{
        var q=req.query.q
           var page=parseInt(req.query.page)||1;
    
        var match=await Product.find();
         var matched=   match.filter((product,index)=>{
            return product.title.toLowerCase().indexOf(q.toLowerCase()) !== -1;
        })
    
         var perpage=8;
        var start=(page-1)*perpage;
        var end=page*perpage;
        var products=matched.slice(start,end)
        var productChunks=[];
		var chunkSize=3;
		for(var i=0;i<products.length;i+=chunkSize){
			productChunks.push(products.slice(i,i+chunkSize))
		}
         // var products=await Product.find().skip(start).limit(perpage);
         var count=await Product.find().count();
        
        res.render("shop/index", {
            products:productChunks,
             current:page,
             pages:Math.ceil(count/perpage),
             pageTitle: 'Shopping cart'
        })
       
    
    
    }catch(error){
        next(error)
    }
}

exports.addToCart = (req,res,next) => {
        var productId=req.params.id;
        var cart=new Cart(req.session.cart?req.session.cart:{})
        Product.findById(productId,function(err,product){
            if(err){
                return res.redirect("/shop");
            
            }
            else{
                cart.add(product,product.id);
                req.session.cart=cart;
                console.log(req.session.cart);
                res.redirect("/shop");
            }
        })
    }

exports.shoppingCart = (req,res,next) => {
        if(!req.session.cart){
            return res.render("shop/shopping-cart",{products:null})
        }
        var cart=new Cart(req.session.cart);
             res.render("shop/shopping-cart",{pageTitle:'shopping Cart',products:cart.generateArray(),totalPrice:cart.totalPrice})
    }

exports.checkout = (req,res,next) => {
    if(!req.session.cart){
            return res.redirect("/shop/shopping-cart")
    
        }
        var errMsg=req.flash('error')[0];
        var cart=new Cart(req.session.cart);
        res.render("shop/checkout",{pageTitle:'shopping Cart',total:cart.totalPrice,errMsg:errMsg,noError:!errMsg})
    }

exports.payment =(req,res,next) => {
    console.log("tao order")

    if(!req.session.cart){
        return res.redirect("/shopping-cart")
    }
    var cart=new Cart(req.session.cart);
    var stripe = require("stripe")("sk_test_MGTxexzQk4T4f544bN0klBSj");

// Token is created using Checkout or Elements!
// Get the payment token ID submitted by the form:
// const token = request.body.stripeToken; // Using Express

const charge = stripe.charges.create({
  amount: cart.totalPrice*100,
  currency: 'usd',
  description: 'Test charge',
//   source: req.body.stripeToken,
source:"tok_mastercard"
},function(err,charge){
    if(err){
        req.flash('error',err.message);
        return res.redirect("/shop/checkout");
    }
    console.log("tao order")
    var order=new Order({
        user:req.user,
        cart:cart,
        address:req.body.address,
        name:req.body.name,
        paymentId:charge.id


    })
    order.save(function(err,resulr){
    
    req.flash('success','success bought product');
    console.log("mua thanh cong")
    req.session.cart=null;
    res.redirect('/shop');
});
})
        
}

exports.profile = (req,res,next) => {
    console.log("profile")
        Order.find({user:req.user},function(err,orders){
        if(err){
            return res.write('error!')
        }
        var cart;
        orders.forEach(function(order) {
            cart=new Cart(order.cart);
            order.items=cart.generateArray();

            
        });
        res.render('shop/profile',{orders:orders})
    })
    }
 exports.reduceOne =(req,res,next) => {
    var productId=req.params.id;
    var cart=new Cart(req.session.cart?req.session.cart:{})
    cart.reduceByOne(productId);
    req.session.cart=cart;
    res.redirect('/shop/shopping-cart')
 }
 
 exports.removeAll =(req,res,next) => {
    
    var productId=req.params.id;
    var cart=new Cart(req.session.cart?req.session.cart:{})
    console.log(cart);
    cart.removeItem(productId);

    req.session.cart=cart;
    console.log(cart);


    res.redirect('/shop/shopping-cart')
 }
    
   