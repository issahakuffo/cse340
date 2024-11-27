const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory detail view
 * *************************** */
invCont.getInventoryDetail = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id;
    // Fetch vehicle details by ID from the model
    const vehicle = await invModel.getVehicleById(inv_id);

    if (vehicle) {
      // Build vehicle detail HTML using the utility function
      const vehicleHTML = utilities.buildVehicleDetailHTML(vehicle);
      const nav = await utilities.getNav(); // Include navigation for consistency

      // Render the vehicle detail page
      res.render("./inventory/detail", {
        title: `${vehicle.inv_make} ${vehicle.inv_model}`,
        nav,
        content: vehicleHTML,
        vehicle: vehicle
      });
    } else {
      // Render a 404 error page if no vehicle is found
      const nav = await utilities.getNav();
      res.status(404).render("error", {
        title: "404 - Vehicle Not Found",
        nav,
        message: "The vehicle you are looking for does not exist.",
      
      });
    }
  } catch (err) {
    console.error("Error in getInventoryDetail:", err);
    next(err); // Pass the error to Express's error handler
  }
};


module.exports = invCont