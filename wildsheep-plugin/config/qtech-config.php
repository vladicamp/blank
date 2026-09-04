<?php
// config/qtech-config.php
//
// Keep this file OUTSIDE public_html if your cPanel account structure
// allows it (e.g. one level up, alongside public_html). If it must live
// inside public_html, make sure the .htaccess rule in this same folder
// (see qtech-config.htaccess) is in place to block direct browser access.

define( 'QTECH_BASE_URI', 'https://api-int.qtplatform.com/v1/' );
define( 'QTECH_USERNAME', 'your-username' );
define( 'QTECH_PASSWORD', 'your-password' );

// Static provider prefix — this site only launches WSO-provider games.
// If you ever need multiple providers, remove this constant and accept a
// providerID parameter from the frontend instead (see api-connect.php).
define( 'QTECH_PROVIDER_PREFIX', 'WSO-' );

// --- Contact form -----------------------------------------------------
// Where form submissions get emailed.
define( 'CONTACT_FORM_TO', 'vlad@qtechgames.com' );

// reCAPTCHA v2 keys — from https://www.google.com/recaptcha/admin
// SITE_KEY is public (goes in the HTML). SECRET_KEY is private — treat it
// like a password, same as the QTech credentials above.
define( 'RECAPTCHA_SITE_KEY', 'YOUR_SITE_KEY_HERE' );
define( 'RECAPTCHA_SECRET_KEY', 'YOUR_SECRET_KEY_HERE' );
