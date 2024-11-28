const express = require("express")
const router = express.Router()

// Intentional error route
router.get("/cause-error", (req, res, next) => {
  try {
    // Simulate an error
    throw new Error("Intentional 500 error triggered.");
  } catch (err) {
    next(err) // Pass the error to the middleware
  }
});

module.exports = router;
