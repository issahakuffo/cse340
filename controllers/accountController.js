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
    console.log("buildLogin")
    let nav = await utilities.getNav()
    if (req.session.loggedIn) {
      req.flash("notice", "You have successfully logged in!.")
      return res.redirect("/account")
    }
    res.render("account/login", {
      title: "Login",
      nav,
      loggedIn: req.session.loggedIn || false,
    })
  }

  /* ****************************************
*  Deliver logout 
* *************************************** */
async function buildLogout(req, res, next) { 
    console.log("buildLogout")
    let nav = await utilities.getNav();

    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
        // Handle session destruction error
        return res.status(500).send("Failed to log out.");
        }

        // Clear the JWT cookie if it exists
        res.clearCookie("jwt");

        req.session.loggedIn = false;
        req.session.user = null;        

        // Optionally render a logout confirmation page or redirect directly
        // Render the logout confirmation page
        res.render("/acount/login", {
        title: "Logout",
        nav,
        loggedIn: req.session.loggedIn || false,
        message: "You have been logged out successfully.",
        });

      
    });
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
*  Deliver registration-admin view  WK 6
* *************************************** */
async function buildRegisterAdmin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register-admin", {
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
  
  // Destructure the incoming request body to get the necessary fields
  let { account_firstname, account_lastname, account_email, account_password, account_type } = req.body;
  
  // If account_type is not provided, default it to 'Client'
  if (!account_type) {
    account_type = 'Client';  // Default account_type
  }

  // Check if the email already exists
  const emailExists = await accountModel.checkExistingEmail(account_email);
  if (emailExists) {
    req.flash("notice", "Sorry, that email is already in use. Please choose a different one.");
    return res.status(400).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  // Hash the password
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

  // Register the account
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword,  // Use the hashed password here
    account_type     // Pass account_type to register the user's type
  );

  // Handle the registration result
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
  console.log("accountLogin!")

  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  try {
    // Fetch user data by email
    const accountData = await accountModel.getAccountByEmail(account_email);

    // Check if account data exists
    if (!accountData) {
      req.flash("notice", "Please check your credentials and try again. Email Error");
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password);

    if (passwordMatch) {
      // Remove password from the account data before creating a token
      delete accountData.account_password; 

      // Generate JWT token
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 });

      // Set cookie options
      const cookieOptions = {
        httpOnly: true, 
        maxAge: 3600 * 1000, // 1 hour
        sameSite: 'Lax', // SameSite to prevent CSRF
      };

      // Set secure cookie in production environment
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, cookieOptions);
      } else {
        res.cookie("jwt", accessToken, { ...cookieOptions, secure: true }); // Secure cookies in production
      }

      // Set session variables for tracking login state
      req.session.loggedIn = true;
      req.session.user = accountData;

      // Redirect to the appropriate page after login
      const redirectUrl = req.session.redirectTo || '/account/';
      res.redirect(redirectUrl);

      // Optionally clear the redirect URL after redirect
      delete req.session.redirectTo;
    } else {
      req.flash("notice", "Please check your credentials and try again. Password Error");
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        loggedIn : req.session.loggedIn || false
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


async function accountLogout(req, res) {
  console.log("accountLogout was called!")

  let nav = await utilities.getNav();
  // Clear the session data
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to destroy session" });
    }
    res.clearCookie("sessionId"); // Clear the session cookie

    // Clear the JWT cookie
    res.clearCookie("jwt", { httpOnly: true, sameSite: 'Lax', secure: process.env.NODE_ENV !== 'development' });

    // Redirect to the login page or home page
    return res.redirect("/account/login");
  });
}





  module.exports = { 
    buildLogin,
    buildLogout,
    buildRegister, 
    registerAccount, 
    accountLogin,
    accountLogout,    
    buildAccountManagement,
    updatePassword,
    buildUpdate,
    updateAccount,
    buildRegisterAdmin
  }
