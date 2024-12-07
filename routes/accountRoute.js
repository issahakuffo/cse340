/*************************************
 * Account Routes
 * Unit 4 - Deliver Login and Registration Views
 *************************************/

const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController")
const utilities = require("../utilities");
const regValidate = require("../utilities/account-validation");

/*********************
 * Deliver Login View
 *********************/
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
);

/*********************
 * Deliver Registration View
 *********************/
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

/*********************
 * Handle Registration Form Submission
 *********************/
router.post(
  "/register",
  regValidate.registationRules(), // Validation rules middleware
  regValidate.checkRegData,       // Check validation results
  utilities.handleErrors(accountController.registerAccount) // Handle registration
);

// Export the router
module.exports = router;
