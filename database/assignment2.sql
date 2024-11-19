--insert account details--
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

--update accunt type---
UPDATE account
SET account_type = 'Admin'
WHERE  account_firstname = 'Tony' AND  account_lastname = 'Stark';

--delete first and last name ---
DELETE FROM account
WHERE account_firstname = 'Tony' AND account_lastname = 'Stark';


--update on inventory--
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

--using inner join----
SELECT 
    inv_make, 
    inv_model, 
    classification.classification_name
FROM 
    inventory
INNER JOIN 
    classification 
ON 
    inventory.classification_id = classification.classification_id
WHERE 
    classification.classification_name = 'Sport';


--replacement--
UPDATE inventory
SET 
    inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
