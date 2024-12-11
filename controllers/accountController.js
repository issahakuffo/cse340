// Account Controller
const bcrypt = require("bcryptjs")
const utilities = require("../utilities/")
const accountModel =  require("../models/account-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    if (req.session.loggedIn) {
      req.flash("notice", "You have successfully logged in!.")
      return res.redirect("/dashboard")
    }
    res.render("account/login", {
      title: "Login",
      nav,
    })
  }

  /* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
 *  Deliver Account Management View
 * *************************************** */
async function buildAccountManagement(req, res, next) {
  try {
    let nav = await utilities.getNav()
    const accountData = res.locals.accountData  // Use the account data from res.locals

    res.render("account/manage", {
      title: "Account Management",
      nav,
      flashMessage: req.flash("notice") || null,
      errors: null,
      accountData, // Pass user data to the view
    });
  } catch (err) {
    next(err)
  }
}


/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;


  const emailExists = await accountModel.checkExistingEmail(account_email);
  if (emailExists) {
    req.flash("notice", "Sorry, that email is already in use. Please choose a different one.");
    return res.status(400).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }


  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.");
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }


  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword // Use the hashed password here
  );


  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    return res.status(201).render("account/login", {
      title: "Login",
      nav,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed. Please try again.");
    return res.status(501).render("account/register", {
      title: "Registration",
      nav,
    });
  }
}


/* ****************************************
 *  Account Update View (GET)
 * *************************************** */
async function buildUpdate(req, res, next) {
  try {
    let nav = await utilities.getNav()
    const account_id = req.params.account_id
    const accountData = await accountModel.getAccountById(account_id) // Get account data using the account_id

    if (!accountData) {
      req.flash("notice", "Account not found.")
      return res.status(404).redirect("/account/")
    }

    res.render("account/update", {
      title: "Update Account Information",
      nav,
      account: accountData,
      flashMessage: req.flash("notice") || null,
      errors: null,
    })
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 *  Process Account Update (POST)
 * *************************************** */
async function updateAccount(req, res, next) {
  try {
    const { account_firstname, account_lastname, account_email, account_id } = req.body

    // Check if the email is being changed
    const accountData = await accountModel.getAccountById(account_id)
    if (account_email !== accountData.account_email) {
      const emailExists = await accountModel.checkExistingEmail(account_email)
      if (emailExists) {
        req.flash("notice", "Email address is already taken.");
        return res.status(400).render("account/update", {
          title: "Update Account Information",
          nav: await utilities.getNav(),
          account_firstname,
          account_lastname,
          account_email,
          account_id,
          flashMessage: req.flash("notice"),
          errors: [{ msg: "Email already taken." }],
        })
      }
    }

    // Update account info in the database
    const result = await accountModel.updateAccount(account_firstname, account_lastname, account_email, account_id)

    if (result) {
      req.flash("notice", "Your account information has been updated successfully.")

      // Fetch the updated data
      const updatedAccountData = await accountModel.getAccountById(account_id)

      // Update res.locals.accountData for rendering the updated page
      res.locals.accountData = updatedAccountData

      // Redirect back to the update page with the updated information
      return res.redirect(`/account/update/${account_id}`)
    } else {
      req.flash("notice", "There was an issue updating your account. Please try again.")
      return res.status(500).render("account/update", {
        title: "Update Account Information",
        nav: await utilities.getNav(),
        account_firstname,
        account_lastname,
        account_email,
        account_id,
        flashMessage: req.flash("notice"),
        errors: [{ msg: "Failed to update account." }],
      })
    }
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 *  Process Password Change (POST)
 * *************************************** */
async function updatePassword(req, res, next) {
  try {
    const { current_password, new_password, account_id } = req.body

    // Fetch account details
    const accountData = await accountModel.getAccountById(account_id)
    if (!accountData) {
      req.flash("notice", "Account not found.")
      return res.status(404).redirect("/account/")
    }

    // Verify the current password
    const isMatch = await bcrypt.compare(current_password, accountData.account_password)
    if (!isMatch) {
      req.flash("notice", "Current password is incorrect.")
      return res.status(400).render("account/update", {
        title: "Update Account Information",
        nav: await utilities.getNav(),
        flashMessage: req.flash("notice"),
        errors: [{ msg: "Incorrect current password." }],
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_id,
      });
    }

    // Validate the new password
    if (new_password.length < 8) {
      req.flash("notice", "Password must be at least 8 characters long.");
      return res.status(400).render("account/update", {
        title: "Update Account Information",
        nav: await utilities.getNav(),
        flashMessage: req.flash("notice"),
        errors: [{ msg: "Password must be at least 8 characters long." }],
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_id,
      })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(new_password, 10)

    // Update the password in the database
    const result = await accountModel.updatePassword(account_id, hashedPassword)

    if (result) {
      req.flash("notice", "Your password has been updated successfully.");
      return res.redirect("/account/")
    } else {
      req.flash("notice", "There was an issue updating your password. Please try again.");
      return res.status(500).render("account/update", {
        title: "Update Account Information",
        nav: await utilities.getNav(),
        flashMessage: req.flash("notice"),
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_id,
        errors: [{ msg: "Failed to update password." }],
      });
    }
  } catch (err) {
    next(err)
  }
}
  

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) { 
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again. Email Error");
    return res.status(401).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }

  try {

    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password);


    if (passwordMatch) {
      delete accountData.account_password; // Remove password from account data
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 });

   
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
      }

      
      return res.redirect("/account/");
    } else {
     
      req.flash("notice", "Please check your credentials and try again. Password Error");
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    // Handle unexpected errors
    console.error(error);
    req.flash("notice", "An error occurred. Please try again.");
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }
}




  module.exports = { 
    buildLogin,
    buildRegister, 
    registerAccount, 
    accountLogin,
    buildAccountManagement,
    updatePassword,
    buildUpdate,
    updateAccount
  }
