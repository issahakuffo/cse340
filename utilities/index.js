const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* *******************************
 * Get Classifications from DB
 ******************************* */
Util.getClassifications = async function () {
  try {
    const result = await invModel.getClassifications();  // Query the classifications from the database
    return result.rows;  // Return the rows of classification data
  } catch (error) {
    console.error("Error fetching classifications:", error);
    throw new Error("Unable to fetch classifications");
  }
};

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ***************************************
 * Build the vehicle details HTML view
 *************************************** */
Util.buildVehicleDetailHTML = function (vehicle) {
  let vehicleHTML = "<div class='vehicle-details'>";

  vehicleHTML += "<h1>" + vehicle.inv_make + " " + vehicle.inv_model + "</h1>";
  vehicleHTML += "<h3>Price: $" + new Intl.NumberFormat("en-US").format(vehicle.inv_price) + "</h3>";
  vehicleHTML += "<p><strong>Year:</strong> " + vehicle.inv_year + "</p>";
  vehicleHTML += "<p><strong>Color:</strong> " + vehicle.inv_color + "</p>";
  vehicleHTML += "<p><strong>Mileage:</strong> " + new Intl.NumberFormat("en-US").format(vehicle.inv_miles) + " miles</p>";
  vehicleHTML += "<p><strong>Stock Number:</strong> " + vehicle.inv_stock + "</p>";
  vehicleHTML += "<p><strong>Location:</strong> " + vehicle.inv_location + "</p>";

  // Display description if available
  if (vehicle.inv_description) {
    vehicleHTML += "<p><strong>Description:</strong> " + vehicle.inv_description + "</p>";
  }

  // Display the vehicle thumbnail image
  vehicleHTML +=
    "<img src='" +
    vehicle.inv_image +
    "' alt='Image of " +
    vehicle.inv_make +
    " " +
    vehicle.inv_model +
    "' />";

  // Add a link to navigate back to the listing of vehicles
  vehicleHTML +=
    "<p><a href='/inv/type/" +
    vehicle.classification_id +
    "'>Back to vehicle listing</a></p>";

  vehicleHTML += "</div>"; // Close the vehicle details div

  return vehicleHTML;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util