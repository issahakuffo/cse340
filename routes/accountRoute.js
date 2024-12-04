/*************************************
 * Account routes 
 * Unit 4, deliver Login view activity
 *************************************/

const express = require("express")
const router = express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")

/*********************
 * Deliver login view
 *********************/

router.get("/login",utilities.handleErrors(accountController.buildLogin))

/*********************
 * Deliver registration view
 *********************/

router.get("/register",utilities.handleErrors(accountController.buildRegister))

router.post('/register', utilities.handleErrors(accountController.registerAccount))


// Export the router
module.exports = router;
