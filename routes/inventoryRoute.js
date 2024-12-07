// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
//const inventoryValidate = require("../utilities/inventory-validation")
//const classificationValidate = require("../utilities/classification-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)

// Route to fetch specific vehicle details by ID
router.get('/detail/:inv_id', invController.getInventoryDetail)

// Route to Inventory Management Page
router.get("/", utilities.handleErrors(invController.buildManagement))

module.exports = router;