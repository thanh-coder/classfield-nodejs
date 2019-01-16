const express=require("express");
var app= express();

require("dotenv").config();

const bodyParser=require("body-parser")
// const helmet = require('helmet')
const path = require ('path')
const cookieParser=require('cookie-parser')
var expressLayout=require("express-ejs-layouts")
const passport=require("passport");
const session=require("express-session");
const passportLocal=require("passport-local").Strategy
const flash=require('connect-flash');
const validator=require("express-validator")
const fs=require("fs");
var mongoose = require('mongoose');
var backendRoutes = require('./routes/backend');
var i18n = require('i18n');
var methodOverride = require("method-override");


const MongoStore = require('connect-mongo')(session);

var database = require('./config/database');

var index = require('./routes/index');
var userRouter = require("./routes/user.route")
const memberRoute=require('./routes/member')
const shopRoute=require('./routes/shop/index')

const authUser =require("./middleware/auth.user")

const Member=require('./models/member');


mongoose.connect(process.env.MONGO_URL,{ useNewUrlParser: true }).then(
     () => {
      console.log("connect DB successfully");
    },
    err => {
      console.log('Connection failed. Error: ${err}');
    }
);
require('./config/passport');

app.set("views","./views");
app.set("view engine","ejs");
app.use(express.static('public'))
app.use(expressLayout);
app.set('layout','layout')

// app.use(helmet())

app.use(methodOverride('_method'));

app.use(validator());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

i18n.configure({
  locales: ['en', 'vi'],
  register: global,
  fallbacks: { 'vi': 'en' },
  cookie: 'language', // Tên của cookie trên browser nhé
  queryParameter: 'lang', // Đây là params trên url dùng thay đổi ngôn ngữ 
  defaultLocale: 'vi', //Ngôn ngữ mặc định khi init nó sẽ tự tìm các chuỗi nằm trong hàm __ và __n để tự thêm vào file json
  directory: __dirname + '/languages',
  directoryPermissions: '755', // Thiết lập quyền ghi cho các file ngôn ngữ (chỉ dùng cho hệ thống nodejs trên linux)
  autoReload: true,
  updateFiles: true,
  api: {
      '__': '__', // Đây là 2 hàm dùng trong template dịch ngôn ngữ nhé. Các bạn cũng có thể thay đổi tên của nó (nên để mặc địch)
      '__n': '__n'
  }
});

app.use(session({secret:"13k4PhxQ0IueZb8KhrclEwJ4nfNR3ZoG",
resave:false,
saveUninitialized:false,
store: new MongoStore({ mongooseConnection: mongoose.connection }),

cookie: {
        maxAge: 1000 * 50 * 5*24 //đơn vị là milisecond
    }
}));

// req.session=_token;

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  i18n.init(req, res, next);
})

//khai bao trước khi khai báo route
app.use(async function(req, res, next) {
  res.locals.clanguage = req.getLocale(); // Ngôn ngữ hiện tại
  res.locals.languages = i18n.getLocales(); // Danh sách ngôn ngữ khai báo trong phần cấu hình bên trên.
  // res.locals.settings = settings;
  // res.locals.user="anoymouus";
    
  try{
    console.log(i18n.getLocales());
    console.log(req.getLocale());
    console.log(req.user);

  res.locals.logged = req.isAuthenticated();
  // res.locals.user=req.user.google.email
  if(req.session.cart)
  {
  res.locals.session=req.session.cart.totalQty;
  }else{
  res.locals.session=0;

  }
  if(req.user){
    res.locals.accsess_user=true;
  
  if(req.user.roles=="ADMIN"){
    res.locals.admin=true
    res.locals.user=req.user.local.email;
  }else if(req.user.roles=="MEMBER"){
    res.locals.admin=false
    if(req.user.provider=="google"){
      res.locals.user=req.user.google.email
    }else if(req.user.provider=="facebook"){
      res.locals.user=req.user.facebook.name
    }else if(req.user.provider=="local"){
      res.locals.user=req.user.local.email
    }else{
      res.locals.user="anoymouus";
    
    }
  }
}else {
    res.locals.user="anoymouus";
    res.locals.accsess_user=false;
    res.locals.admin=false;
  res.locals.session=0;

  }
 
  res.locals.member = req.user;
  var count=await Member.find().count();
  res.locals.count=req.__n('%d member',count);
  app.locals.moment = require('moment');
  next();
  }
  catch(err)
  {
    console.log(err);
  }
});

app.use('/backoffice', backendRoutes);

app.use('/thanh-vien', memberRoute);
app.use('/shop',authUser, shopRoute);

app.use("/users",authUser, userRouter);

app.use('/', index);

var port=process.env.PORT||3000;
app.listen(port,() => console.log(`server mo cong ${port}`))