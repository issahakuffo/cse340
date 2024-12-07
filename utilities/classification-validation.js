const { body, validationResult } = require("express-validator");
const validate = {};

// Validation rules for Add Classification
validate.classificationValidationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Classification name is required.")
      .isAlphanumeric()
      .withMessage("Classification name must contain only letters and numbers.")
      .isLength({ min: 3 })
      .withMessage("Classification name must be at least 3 characters long."),
  ];
};

// Check classification data after validation
validate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav(); 
    res.render("inventory/add-classification", {
      errors: errors.array(),  
      title: "Add New Classification",
      nav,  
    });
    return;
  }
  next();  
};

module.exports = validate;