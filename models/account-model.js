const pool = require("../database/")

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) { 
  try {
       const emailExists = await checkExistingEmail(account_email);
    if (emailExists) {
      throw new Error("Email is already in use. Please choose a different one.");
    }

      const sql = `
      INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) 
      VALUES ($1, $2, $3, $4, 'Client') 
      RETURNING *`;
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);

        return result.rows[0];
  } catch (error) {
    // Error reporting
    return error.message;
  }
}



/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT 1 FROM account WHERE account_email = $1 LIMIT 1"; 
    const result = await pool.query(sql, [account_email]);
    return result.rowCount > 0; // Return true if email exists, false otherwise
  } catch (error) {
    console.error(error); // Optionally log the error for debugging
    throw new Error("An error occurred while checking the email existence"); // Throw error for handling upstream
  }
}



/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      'SELECT * FROM account WHERE account_email = $1', [account_email]
    );

    // Check if no account is found
    if (result.rows.length === 0) {
      throw new Error("No matching email found");
    }

    return result.rows[0]; // Return the account if found
  } catch (error) {
    console.error(error); // Optionally log the error for debugging
    throw new Error("An error occurred while fetching the account");
  }
}


/* *****************************
 * Return account data using account_id
 * ***************************** */
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1',
      [account_id]
    )
    return result.rows[0] || null; // Return null if no matching account found
  } catch (error) {
    return new Error("Account not found")
  }
}

/* *****************************
 * Update account information
 * ***************************** */
async function updateAccount(account_firstname, account_lastname, account_email, account_id) {
  try {
    const sql = `
      UPDATE account 
      SET account_firstname = $1, account_lastname = $2, account_email = $3 
      WHERE account_id = $4
      RETURNING *`
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
    return result.rowCount > 0; // Returns true if an account was updated
  } catch (error) {
    return false
  }
}

/* *****************************
 * Update account password
 * ***************************** */
async function updatePassword(account_id, hashedPassword) {
  try {
    const sql = `
      UPDATE account 
      SET account_password = $1 
      WHERE account_id = $2 
      RETURNING *`
    const result = await pool.query(sql, [hashedPassword, account_id])

    // Verify the updated password is a hash by fetching the updated record
    if (result.rowCount > 0) {
      const updatedAccount = await getAccountById(account_id);
      if (updatedAccount && updatedAccount.account_password === hashedPassword) {
        return true // Password update succeeded and is verified as a hash
      }
    }
    return false // Password update failed or did not match
  } catch (error) {
    console.error("Error updating account password:", error)
    return false
  }
}



module.exports = { 
  registerAccount, 
  checkExistingEmail, 
  getAccountByEmail,
  getAccountById, 
  updateAccount, 
  updatePassword 
}
