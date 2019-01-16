var settings = require('../config/settings');

module.exports = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/thanh-vien/dang-nhap');
};