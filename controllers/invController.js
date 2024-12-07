const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { validationResult } = require("express-validator")

const invCont = {}

/* ***************************
 *  Build Inventory Management View
 * *************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classificationOptions = await utilities.getClassifications();  

    res.render("inventory/management", {
      title: "Vehicle Management",
      nav,
      flashMessage: req.flash("notice") || null,  // Display flash messages if any
      classificationOptions, 
    });
  } catch (err) {
    next(err)
  }
}

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
    const vehicle = await invModel.getVehicleById(inv_id)

    if (vehicle) {
      // Build vehicle detail HTML using the utility function
      const vehicleHTML = utilities.buildVehicleDetailHTML(vehicle)
      const nav = await utilities.getNav(); // Include navigation for consistency

      // Render the vehicle detail page
      res.render("./inventory/detail", {
        title: `${vehicle.inv_make} ${vehicle.inv_model}`,
        nav,
        content: vehicleHTML,
        vehicle: vehicle
      })
    } else {
      // Render a 404 error page if no vehicle is found
      const nav = await utilities.getNav();
      res.status(404).render("error", {
        title: "404 - Vehicle Not Found",
        nav,
        message: "The vehicle you are looking for does not exist.",
      
      })
    }
  } catch (err) {
    console.error("Error in getInventoryDetail:", err)
    next(err); // Pass the error to Express's error handler
  }
}


/* ***************************
 * Show Add Classification Form
 * *************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      flashMessage: req.flash("notice") || null,  // Display flash message if exists
      errors: null,  // No errors initially
    });
  } catch (err) {
    next(err)
  }
};

/* ***************************
 * Add New Classification
 * *************************** */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body;

  // Simple validation (ensure no special characters or spaces)
  if (!/^[A-Za-z0-9]+$/.test(classification_name)) {
    req.flash("notice", "The classification name must only contain letters and numbers.")
    return res.status(400).render("inventory/add-classification", {
      title: "Add New Classification",
      nav: await utilities.getNav(),
      flashMessage: req.flash("notice"),
      errors: [{ msg: "Invalid classification name." }],
    })
  }

  try {
    const result = await invModel.addClassification(classification_name);  // Insert into database

    if (result) {
      req.flash("notice", `Classification "${classification_name}" added successfully!`)
      return res.redirect("/inv/")
    } else {
      req.flash("notice", "Failed to add classification.")
      return res.status(500).render("inventory/add-classification", {
        title: "Add New Classification",
        nav: await utilities.getNav(),
        errors: [{ msg: "Something went wrong. Please try again." }],
      })
    }
  } catch (err) {
    next(err)
  }
}

/* ***************************
 * Build Add Inventory View
 * *************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationOptions = await utilities.getClassifications();

    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      flashMessage: req.flash("notice") || null,  // Display flash message if exists
      classificationOptions,
      errors: null,  // No initial errors
      classification_id: req.body.classification_id || '',
      inv_make: req.body.inv_make || '',
      inv_model: req.body.inv_model || '',
      inv_year: req.body.inv_year || '',
      inv_description: req.body.inv_description || '',
      inv_image: req.body.inv_image || '/images/vehicles/no-image.png',
      inv_thumbnail: req.body.inv_thumbnail || '/images/vehicles/no-image-tn.png',
      inv_price: req.body.inv_price || '',
      inv_miles: req.body.inv_miles || '',
      inv_color: req.body.inv_color || '',
    });
  } catch (err) {
    next(err);
  }
};

/* ***************************
 * Process Add Inventory Form Submission
 * *************************** */
invCont.addInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    } = req.body;

    const errors = validationResult(req);  // Get validation errors
    if (!errors.isEmpty()) {
      return res.status(400).render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        flashMessage: req.flash("notice") || null,  // Display flash message if exists
        errors: errors.array(),
        classificationOptions: await utilities.getClassifications(),
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
      });
    }

    const result = await invModel.addInventoryItem({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    });

    if (result) {
      req.flash("notice", "Vehicle successfully added.")
      return res.redirect("/inv");
    } else {
      req.flash("notice", "Failed to add vehicle. Please try again.");
      return res.status(500).render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationOptions: await utilities.getClassifications(),
        errors: null,
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
      });
    }
  } catch (err) {
    next(err)
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}




module.exports = invCont