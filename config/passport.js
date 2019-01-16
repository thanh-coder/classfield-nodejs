var validator = require('express-validator');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const jwt = require('jsonwebtoken');

var settings = require('./settings');
var Member = require('../models/member');
var cfgAuth = require('./auth');

var provider = null;

passport.serializeUser(function(user, done) { //chứa user trả về
    done(null, user._id);//ghi thông tin id ra ngoài cookie
});

passport.deserializeUser(function(id, done) {//id là giá trị lưu trong cookie 
    Member.findById(id, function(err, member) {// từ cái id lấy ra user trong database nếu như khớp user thì cho vào các router khác còn ko thì thất bại

        var newMember = member.toObject();
        newMember['provider'] = provider;
        done(err, newMember);
    });
});

// Passport register
passport.use('local.regsiter', new LocalStrategy({
    usernameField: 'email', // Tên của input dùng đăng nhập
    passwordField: 'password', // tên của input mật khẩu
    passReqToCallback: true
}, function(req, email, password, done) {
    // Validator các input từ trang đăng ký
    req.checkBody('firstname', 'Please input first name.').notEmpty();
    req.checkBody('lastname', 'Please input last name.').notEmpty();
    req.checkBody('email', 'Email address invalid, please check again.').notEmpty().isEmail();
    req.checkBody('password', `Password invalid, password must be at least ${settings.passwordLength} characters or more`).notEmpty().isLength({min: settings.passwordLength});
    req.checkBody('password', 'Confirm password is not the same, please check again.').equals(req.body.confirmpassword);
    req.checkBody('accept', 'You have to accept with our terms to continute.').equals("1");

    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }

    Member.findOne({
        'local.email': email
    }, function(err, member) {
        if (err) {
            return done(err);
        }
        if (member) {
            return done(null, false, {
                message: 'Email address used, please enter another email.'
            });
        }
        var newMember = new Member();
        newMember.info.firstname = req.body.firstname;
        newMember.info.lastname = req.body.lastname;
        newMember.local.email = req.body.email;
        newMember.local.password = newMember.encryptPassword(req.body.password);
        newMember.newsletter = req.body.newsletter;
        newMember.roles = 'MEMBER';
        // Nếu yêu cầu kích hoạt tài khoản qua email thì trạng thái tài khoản là INACTIVE
        newMember.status = (settings.confirmRegister == 1) ? 'INACTIVE' : 'ACTIVE';

        newMember.save(function(err, result) {
            if (err) {
                return done(err);
            } else {
                // Nếu yêu cầu kích hoạt tài khoản qua email thì chỉ đăng ký mà không tự động đăng nhập
                if (settings.confirmRegister == 1) {
                    return done(null, newMember);
                } else {
                    // Tự động đăng nhập cho thành viên mới đăng ký khi không yêu cầu kích hoạt tài khoản qua email
                    req.logIn(newMember, function(err) {
                        provider = 'local';
                        return done(err, newMember);//xác thực thành công trả dữ liệu về cho hàm seralizeUser 
                    });
                }
            }
        });
    });
}));

// Passport Facebook Login
passport.use('local.login', new LocalStrategy({
    usernameField: 'email', // Tên của input dùng đăng nhập
    passwordField: 'password', // tên của input mật khẩu
    passReqToCallback: true
}, function(req, email, password, done) {
    req.checkBody('email', 'Invalid email address, please try again.').notEmpty().isEmail();
    req.checkBody('password', 'Incorrect password, please try again.').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }

    // Check member input
    Member.findOne({
        'local.email': email
    }, function(err, member) {
        if (err) {
            return done(err);
        }

        if (!member) {
            return done(null, false, {
                message: 'Member not found!'
            });
        }

        if (!member.validPassword(password)) {
            return done(null, false, {
                message: 'Password incorrect, please try again.'
            });
        };

        if (member.isInActivated(member.status)) {
            return done(null, false, {
                message: 'Your account is Inactive'
            });
        }

        if (member.isSuspended(member.status)) {
            return done(null, false, {
                message: 'Your account is Suspended'
            });
        }
        const payload={user_id:member._id}
        const token = jwt.sign(payload,settings.jwtSecret,{
            expiresIn:'2m'
        });
        // res.cookie("acces_token",token);       
         provider = "local";
        return done(null,member);

    });

}));

//xu li ket qua tra ve tu facebook
passport.use(new FacebookStrategy({ //object cau hinh cho ung dung
    clientID: cfgAuth.facebookAuth.clientID,
    clientSecret: cfgAuth.facebookAuth.clientSecret,
    profileFields: cfgAuth.facebookAuth.profileFields,
    callbackURL: cfgAuth.facebookAuth.callbackURL, //khi minh tao ung dung can co 1 cai root khi no goi ve,khi face xu li xong thong tin no se quay lai cai root nay va gui thong tin bang query do vay can tao them mot cai ham callback nua

    passReqToCallback: true //khi minh tao ung dung can co 1 cai root khi no goi ve,khi face xu li xong thong tin no se quay lai cai root nay va gui thong tin bang query do vay can tao them mot cai ham callback nua
    //kiểm tra tài khoản face tồn tại hay chư tồn tại rồi thì cho đăng kí chưa tồn tại thêm tài khoản mới
    //nếu mà emai dăng kí ở local rồi thì kiểm tra xem tài khoản local sử dụng chưa nếu sử dụng rồi thì update thông tin facebook vào model facebook
}, function(req, token, refreshTonken, profile, done) { //chua cac thong tin facebook gui ve

    // Check exist account
    Member.findOne({
        'facebook.id': profile.id
    }, function(err, member) {
        if (err) {
            return done(err);
        }

        if (member) {
            provider = "facebook";
            return done(null, member);
        } else { 
            //không tìm thấy id facebook thì se tìm tiếp email trong lacal 
            // Link facebook to local account
            Member.findOne({
                'local.email': profile.emails[0].value
            }, function(err, member) {

                if (err) {
                    return done(err);
                }
            // nếu tồn tại tài khoản email đki face trùng với tài khoản local thì tìm và update vào model facebook
                if (member) {
                    // Update exist account
                    Member.findOneAndUpdate({
                        'local.email': profile.emails[0].value
                    }, {
                        'facebook.id': profile.id,
                        'facebook.token': token,
                        'facebook.email': profile.emails[0].value,
                        'facebook.name': profile._json.first_name + ' ' + profile._json.last_name,
                        'facebook.photo': 'https://graph.facebook.com/v2.9/' + profile.id + '/picture?type=large'
                    }, {
                        new: true//tạo mới đối tượng facebook
                    }, function(err, member) {
                        if (err) {
                            return done(err);
                        }
                        provider = "facebook";
                        return done(null, member);
                    });
                } else {

                    // Link facebook to google account
                    Member.findOne({
                        'google.email': profile.emails[0].value
                    }, function(err, member) {

                        if (err) {
                            return done(err);
                        }

                        if (member) {
                            // Update exist account
                            Member.findOneAndUpdate({
                                'google.email': profile.emails[0].value
                            }, {
                                'facebook.id': profile.id,
                                'facebook.token': token,
                                'facebook.email': profile.emails[0].value,
                                'facebook.name': profile._json.first_name + ' ' + profile._json.last_name,
                                'facebook.photo': 'https://graph.facebook.com/v2.9/' + profile.id + '/picture?type=large'
                            }, {
                                new: true
                            }, function(err, member) {
                                if (err) {
                                    return done(err);
                                }
                                provider = "facebook";
                                return done(null, member);
                            });
                        } else {
                            // add new account with facebook info
                            var newMember = new Member();
                            newMember.facebook.id = profile.id;
                            newMember.facebook.token = token;
                            newMember.facebook.email = profile.emails[0].value;
                            newMember.facebook.name = profile._json.first_name + ' ' + profile._json.last_name;
                            newMember.facebook.photo = 'https://graph.facebook.com/v2.9/' + profile.id + '/picture?type=large';
                            newMember.roles = "MEMBER";
                            newMember.status = "ACTIVE";
                            newMember.save(function(err) {
                                if (err) {
                                    return done(err);
                                }
                                provider = "facebook";
                                return done(null, newMember);
                            });
                        }
                    });
                    
                }
            });

        }
    });
}));



// Passport Google Login
passport.use(new GoogleStrategy({
    clientID: cfgAuth.googleAuth.clientID,
    clientSecret: cfgAuth.googleAuth.clientSecret,
    callbackURL: cfgAuth.googleAuth.callbackURL,
    passReqToCallback: true
}, function(req, token, refreshTonken, profile, done){

    //check exist account
    Member.findOne({
        'google.id': profile.id
    }, function(err, member) {
        if (err) { 
            return done(err);
        }
//nếu tồn tại thành viên trong database đã đăng nhập rthì ta cho thành viên đăng nhập luôn
        if (member) {
            provider = "google";//phân biệt thành viên đăng nhập qua facebook,google...
            return done(null, member);
       //nếu không tìm thấy member thì có 2 trường hơp: tài khoản email này đã đăng kí ở local chưa nếu đăng kí r thì mình chỉ việc link tới tài khoản local thôi
       //còn nếu chưa tồn tại ở tài khoản local nào đó thì thêm dữ liệu mới
        } else {

            Member.findOne({
                'local.email': profile.emails[0].value
            }, function(err, member) {
                if (err) {
                    return done(err);
                }

                if (member) {
                    //Link google account to local account nếu tồn tại thêm tài khoản email local vào google 
                    Member.findOneAndUpdate({
                        'local.email': profile.emails[0].value
                    }, {
                        'google.id': profile.id,
                        'google.token': token,
                        'google.name': profile.displayName,
                        'google.email': profile.emails[0].value,
                        'google.photo': profile.photos[0].value
                    }, {
                        new: true
                    }, function(err, member) {
                        if (err) {
                            return done(err);
                        }
                        provider = "google";
                        return done(null, member);
                    });
                } else {
                    Member.findOne({
                        'facebook.email': profile.emails[0].value
                    }, function(err, member) {
                        if (err) {
                            return done(err);
                        }
        
                        if (member) {
                            //Link google account to facebook account
                            Member.findOneAndUpdate({
                                'facebook.email': profile.emails[0].value
                            }, {
                                'google.id': profile.id,
                                'google.token': token,
                                'google.name': profile.displayName,
                                'google.email': profile.emails[0].value,
                                'google.photo': profile.photos[0].value
                            }, {
                                new: true
                            }, function(err, member) {
                                if (err) {
                                    return done(err);
                                }
                                provider = "google";
                                return done(null, member);
                            });
                        } else {
                            //Add new account using google email
                            var newMemmber = new Member();
                            newMemmber.google.id = profile.id;
                            newMemmber.google.token = token;
                            newMemmber.google.name = profile.displayName;
                            newMemmber.google.email = profile.emails[0].value;
                            newMemmber.google.photo = profile.photos[0].value;
                            newMemmber.roles = "MEMBER";
                            newMemmber.status = "ACTIVE";
                            newMemmber.save(function(err) {
                                if (err) { return done(err); }
                                provider = "google";
                                return done(null, newMemmber);
                            });
                        }
        
                    });
                }

            });

        }
    });

}));

passport.use('backend.login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {

    req.checkBody('email', 'Email address is invalid, please check again').notEmpty().isEmail();
    req.checkBody('password', 'Please input your password').notEmpty();
    req.checkBody('pin_code', 'Please input your pincode').notEmpty();

    var errrors = req.validationErrors();

    if (errrors) {
        var messages = [];
        errrors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }

    // Find member
    Member.findOne({
        'local.email': email
    }, function(err, member) {
        if (err) 
            return done(err);
        
        if (!member) {
            return done(null, false, {
                message:  'account not exist, please check again.'
            });
        }

        if (!member.validPassword(password)) {
            return done(null, false, {
                message: 'Your password invalid, please reinput.'
            });
        }

        if (!member.validPincode(req.body.pin_code)) {
            return done(null, false, {
                message: 'Your pin code invalid, please reinput.'
            });
        }

        if (!member.isGroupAdmin(member.roles)) {
            return done(null, false, {
                message: `You haven\'t permission login to administrator panel, please goback home page.`
            });
        }

        if (member.isInActivated(member.status)) {
            return done(null, false, {
                message: 'Your account not activated.'
            });
        }

        if (member.isSuspended(member.status)) {
            return done(null, false, {
                message: 'Your account is locked.'
            });
        }

        provider = "backend";
        return done(null, member);

    });
}));