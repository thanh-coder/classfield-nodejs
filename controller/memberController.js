var passport = require('passport');

exports.get_regsiter = function(req, res, next) {
    var messages = req.flash('error');
    res.render('member', {
        pageTitle: 'Member Register',
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0
    });
};

// POST Register
exports.post_regsiter = passport.authenticate('local.regsiter', {
    successRedirect: '/thanh-vien/tai-khoan',
    failureRedirect: '/thanh-vien/dang-ky',
    failureFlash: true
});

// GET Profile
exports.get_profile = function(req, res, next) {
    res.render('dashboard', {
        pageTitle:'Dashboard'
    });
};

// GET Login
exports.get_login = function(req, res, next) {
    var messages = req.flash('error');
    console.log(req.user)
    res.render('dangnhap', {
        pageTitle:'Member Login',
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0
    });
};

exports.post_login = passport.authenticate('local.login',
// (err,token,data)=>{
// if(err){
//     return res,status(500).json(err);
// }
// return res.status(200).json({token,data})
// },
 {
    successRedirect: '/thanh-vien/tai-khoan',
    failureRedirect: '/thanh-vien/dang-nhap',
    failureFlash: true
});

exports.get_logout = function(req, res, next) {
    req.logout();
    res.redirect('/');
};

// GET Facebook login
//gửi các yêu cầu lên facebook 
exports.get_facebook_login = passport.authenticate('facebook', {
    scope: ['email, public_profile']
});

// GET Facebook login
//sau khi no thuc hien newpassport no se kiem tr loi hay thanh cong và điều hướng ứng dụng của mình
exports.get_facebook_login_callback = passport.authenticate('facebook', {
    successRedirect: '/thanh-vien/tai-khoan',
    failureRedirect: '/thanh-vien/dang-nhap'
});

// GET Google login
exports.get_google_login = passport.authenticate('google', {
    scope: ['email', 'profile']
});

// GET Google login
exports.get_google_login_callback = passport.authenticate('google', {
    successRedirect: '/thanh-vien/tai-khoan',
    failureRedirect: '/thanh-vien/dang-nhap'
});


exports.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/thanh-vien/dang-nhap');
};

exports.notLoggedIn = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/thanh-vien/tai-khoan');
};

exports.notLogin_use = function(req, res, next) {
    console.log("middelware")
    next();
};