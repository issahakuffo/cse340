// Account Controller
const utilities = require("../utilities/")


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
  if (req.session.registered) {
    // Flash a message and redirect to the dashboard
    req.flash("notice", "Registration successful! Welcome to your dashboard.");
    req.session.registered = false; // Clear the flag after use
    return res.redirect("/dashboard");
  }
  res.render("account/register", {
    title: "Register",
    nav,
  })
}


  
  module.exports = { buildLogin, buildRegister }