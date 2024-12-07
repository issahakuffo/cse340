// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const classificationValidate = require("../utilities/classification-validation")
const inventoryValidate = require("../utilities/inventory-validation")


// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)

// Route to fetch specific vehicle details by ID
router.get('/detail/:inv_id', invController.getInventoryDetail)

// Route to Inventory Management Page
router.get("/", utilities.handleErrors(invController.buildManagement))

// Route to add new classification
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification)) // Show form
router.post(
  "/add-classification",
  classificationValidate.classificationValidationRules(),
  classificationValidate.checkClassificationData, 
  utilities.handleErrors(invController.addClassification)
)

// Route to add new inventory
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))
router.post(
  "/add-inventory",
  inventoryValidate.inventoryValidationRules(),
  inventoryValidate.checkInventoryData, 
  utilities.handleErrors(invController.addInventory)
)


module.exports = router;