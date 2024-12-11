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

// Route to show edit inventory page
router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventory))

// Route to update inventory
router.post(
  "/edit/:inv_id",  // Make sure this matches the form action URL
  inventoryValidate.inventoryValidationRules(),  // Validate input data
  inventoryValidate.checkInventoryData,           // Check for errors in validation
  utilities.handleErrors(invController.updateInventory) // Process the update
)

// Route to show delete confirmation page for an inventory item
router.get(
  "/delete/:inv_id",
  utilities.handleErrors(invController.deleteConfirmation)
)

// Route to handle deleting an inventory item
router.post(
  "/delete/:inv_id",
  utilities.handleErrors(invController.deleteInventory)
)

/* ***************************
 * Intentional Error Route
 * *************************** */
router.get("/trigger-error", (req, res, next) => {
  const error = new Error("This is an intentional 500 error!")
  error.status = 500
  next(error)
})

// JavaScript Route to return inventory based on classification ID
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

module.exports = router;