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
    })
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
    next(err)
  }
}


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

/* ***************************
 * Build Edit Inventory View
 * ************************** */
invCont.editInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id) // Collect inventory ID
  if (isNaN(inv_id)) {
    console.log("Invalid inv_id:", req.params.inv_id); // Log for debugging
    return res.status(400).send("Invalid vehicle ID");
  }

  let nav = await utilities.getNav()

  // Fetch the inventory data using the correct model function (getVehicleById)
  const itemData = await invModel.getVehicleById(inv_id)

  // If no data is found for the given inv_id, send a 404 error
  if (!itemData) {
    return res.status(404).render("404", {
      title: "Vehicle Not Found",
      nav
    })
  }

  // Generate the classification select dropdown using the existing utility function
  const classificationOptions = await utilities.getClassifications()

  // Combine make and model for the title
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  // Render the "edit-inventory" view and pass in the necessary data
  res.render("inventory/edit-inventory", {
    title: "Edit " + itemName, // Set the title to reflect the make and model of the vehicle
    nav,
    classificationOptions, // Pass the classification select dropdown as "classificationOptions"
    errors: null, // Initialize errors as null for now
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
    flashMessage: req.flash("notice"), // Add flash messages here
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}
module.exports = invCont