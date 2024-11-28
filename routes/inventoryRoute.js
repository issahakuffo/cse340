// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)

// Route to fetch specific vehicle details by ID
router.get('/detail/:inv_id', invController.getInventoryDetail)

module.exports = router;