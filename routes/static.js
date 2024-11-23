const express = require('express');
const router = express.Router();

// Static Routes
// Set up "public" folder / subfolders for static files
router.use(express.static("public"));
router.use("/css", express.static(__dirname + "public/css"));
router.use("/js", express.static(__dirname + "public/js"));
router.use("/images", express.static(__dirname + "public/images"));

router.use(express.static("views"));
router.use("/partials", express.static(__dirname + "views/partials"));

// Define the index route
// router.get('/', (req, res) => {
//     res.render('index'); // Render the EJS template located in the views folder
// });

module.exports = router;



