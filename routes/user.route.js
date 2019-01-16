var express = require("express");
var app = express();
// var bodyParser = require("body-parser");

var controller=require("./../controller/user.controller")
var validate=require("../validate/validate")
var router = express.Router();
// var authMiddleware=require("./../middleware/auth.middleware")
var multer  = require('multer')



// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: false }))
// var urlencodedParser = bodyParser.urlencoded({ extended: false })
// router.get("/", function(req, res) {
//     res.render('index', { name: 'hung96' })
// })

var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'manhhung96', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// var upload = multer({ dest: './public/uploads/' })

router.get('/',controller.index)
router.get('/search', controller.search)

router.get("/create",controller.create )
router.get("/edit/:id",controller.edit)
router.put("/:id", upload.single('avatar'),validate.postCreate,controller.put_edit)

router.get("/:id",controller.get )
router.get("/delete/:id",controller.delete )
router.post('/create', upload.single('avatar'),validate.postCreate,controller.postCreate )



module.exports = router