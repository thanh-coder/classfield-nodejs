const jwt = require('jsonwebtoken');
var settings = require('../config/settings');

module.exports = (req, res, next) => {
    try {
        // const token = req.headers.authorization.split(" ")[1];
        if(!req.headers.authorization){
            res.send({error:true})
        }
        const token = req.headers.authorization;
        // const token = req.cookies.acces_token;
        // const token = _token.acces_token;
        const decoded = jwt.verify(token, settings.jwtSecret);
        req.userData = decoded;
        console.log(token)
        console.log(req.userData)
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
};