const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get a single vehicle by ID
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.inv_id = $1`,
      [inv_id]
    )
    console.log(data.rows)
    return data.rows[0]
  } catch (error) {
    console.error("Error in getVehicleById:", error)
  }
}

/* ***************************
 * Add New Classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    // Insert the new classification into the classifications table
    const result = await pool.query(
      `INSERT INTO public.classification (classification_name) 
       VALUES ($1) 
       RETURNING classification_id, classification_name`,
      [classification_name]
    );

    // Return the inserted classification data (for potential confirmation or use)
    return result.rows[0];  
  } catch (error) {
    console.error("Error in addClassification: " + error)
    throw error; 
  }
}

/* ***************************
 * Add New inventory
 * ************************** */
async function addInventoryItem(vehicle) {
  try {
    const sql = `
      INSERT INTO public.inventory
      (classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
    const params = [
      vehicle.classification_id,
      vehicle.inv_make,
      vehicle.inv_model,
      vehicle.inv_year,
      vehicle.inv_description,
      vehicle.inv_image,
      vehicle.inv_thumbnail,
      vehicle.inv_price,
      vehicle.inv_miles,
      vehicle.inv_color,
    ];
    const result = await pool.query(sql, params)
    return result.rows[0]
  } catch (error) {
    console.error("Error adding inventory:", error)
    return null
  }
}


module.exports = { getClassifications, getInventoryByClassificationId, getVehicleById, addClassification, addInventoryItem }