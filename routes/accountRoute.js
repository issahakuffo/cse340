/*************************************
 * Account Routes
 * Unit 4 - Deliver Login and Registration Views
 *************************************/

const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController")
const utilities = require("../utilities");
const regValidate = require("../utilities/account-validation")


// Route for account management page (default route)
router.get(
  "/",
  utilities.checkLogin,  // Ensure the user is logged in
  utilities.handleErrors(accountController.buildAccountManagement)
)


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
)

/*********************
 * Deliver Registration View (WK 6)
 *********************/
router.get(
  "/register-admin",
  utilities.handleErrors(accountController.buildRegisterAdmin)
)

/*********************
 * Handle Registration Form Submission
 *********************/
router.post(
  "/register",
  regValidate.registationRules(), // Validation rules middleware
  regValidate.checkRegData,       // Check validation results
  utilities.handleErrors(accountController.registerAccount) // Handle registration
)

/*********************
 * Handle Registration Form Submission (WK 6)
 *********************/
router.post(
  "/register-admin",
  regValidate.registationRules(), // Validation rules middleware
  regValidate.checkRegData,       // Check validation results
  utilities.handleErrors(accountController.registerAccount) // Handle registration
)

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(), 
  regValidate.checkLoginData, 
  utilities.handleErrors(accountController.accountLogin)
)

//(WK 6)
router.get(   
  "/logout",
  utilities.handleErrors(accountController.accountLogout)
)

/* ***************************
 * Account Update Routes
 * *************************** */

// Route to account update page
router.get(
  "/update/:account_id",
  utilities.checkLogin,  // Ensure the user is logged in
  utilities.handleErrors(accountController.buildUpdate)
)

// Route to process account update (POST request)
router.post(
  "/update",
  utilities.checkLogin,  // Ensure the user is logged in
  regValidate.updateAccountValidationRules(),  // Validate account update data
  regValidate.checkAccountUpdateData,  // Check for validation errors
  utilities.handleErrors(accountController.updateAccount)
)

// Route to process password change (POST request)
router.post(
  "/update-password",
  utilities.checkLogin,  // Ensure the user is logged in
  regValidate.passwordValidationRules(),  // Validate password change data
  regValidate.checkPasswordData,  // Check for validation errors
  utilities.handleErrors(accountController.updatePassword)
)


// Export the router
module.exports = router;
