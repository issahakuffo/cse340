const { body, validationResult } = require("express-validator");
const utilities = require("../utilities");

const validateInventory = {};

/* **************************************
 * Inventory Data Validation Rules
 ************************************* */
validateInventory.inventoryValidationRules = () => {
  return [
    body("classification_id").notEmpty().withMessage("Classification is required."),
    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),
    body("inv_year")
      .isNumeric()
      .withMessage("Year must be a number.")
      .isLength({ min: 4, max: 4 })
      .withMessage("Year must be a 4-digit number."),
    body("inv_price").isNumeric().notEmpty().withMessage("Price is required."),
    body("inv_description").trim().notEmpty().withMessage("Description is required."),
    body("inv_image").trim().notEmpty().withMessage("Image URL is required."),
    body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail URL is required."),
    body("inv_miles")
      .isNumeric()
      .withMessage("Miles must be a valid number.")
      .notEmpty()
      .withMessage("Mileage is required."),
    body("inv_color").trim().notEmpty().withMessage("Color is required."),
  ];
};

/* **************************************
 * Check Inventory Data (For Adding Inventory)
 ************************************* */
validateInventory.checkInventoryData = async (req, res, next) => {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_miles,
    inv_color,
  } = req.body;

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationOptions = await utilities.getClassifications();

    res.render("inventory/add-inventory", {
      errors: errors.array(),
      title: "Add Inventory",
      nav,
      classificationOptions,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_miles,
      inv_color,
    });
    return;
  }
  next();
};

/* **************************************
 * Check Update Inventory Data
 ************************************* */
validateInventory.checkUpdateData = async (req, res, next) => {
  const {
    inv_id,
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

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationOptions = await utilities.getClassifications();

    res.render("inventory/edit-inventory", {
      errors: errors.array(),
      title: `Edit ${inv_make} ${inv_model}`,  // Title updated to match the edit view title
      nav,
      classificationOptions,
      inv_id,  // Add inv_id to the data being passed to the view
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
    return;
  }
  next();
};

module.exports = validateInventory;