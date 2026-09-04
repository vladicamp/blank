<?php
// contact/contact-handler.php — processes the contact form submission.

header( 'Content-Type: application/json' );

require_once __DIR__ . '/../config/qtech-config.php';

// --- Only accept POST -------------------------------------------------
if ( $_SERVER['REQUEST_METHOD'] !== 'POST' ) {
	http_response_code( 405 );
	echo json_encode( array( 'message' => 'Method not allowed.' ) );
	exit;
}

// --- Collect + sanitize input ------------------------------------------
$first_name = trim( filter_input( INPUT_POST, 'first_name', FILTER_SANITIZE_SPECIAL_CHARS ) ?? '' );
$last_name  = trim( filter_input( INPUT_POST, 'last_name', FILTER_SANITIZE_SPECIAL_CHARS ) ?? '' );
$email      = trim( filter_input( INPUT_POST, 'email', FILTER_SANITIZE_EMAIL ) ?? '' );
$message    = trim( filter_input( INPUT_POST, 'message', FILTER_SANITIZE_SPECIAL_CHARS ) ?? '' );
$game       = trim( filter_input( INPUT_POST, 'game', FILTER_SANITIZE_SPECIAL_CHARS ) ?? '' );
$recaptcha  = $_POST['g-recaptcha-response'] ?? '';

$errors = array();

if ( '' === $first_name ) {
	$errors[] = 'First name is required.';
}
if ( '' === $last_name ) {
	$errors[] = 'Last name is required.';
}
if ( '' === $email || ! filter_var( $email, FILTER_VALIDATE_EMAIL ) ) {
	$errors[] = 'A valid email is required.';
}
// Note: the "message" field is optional on the real form (no required
// attribute on the textarea), so it's not validated here.
if ( '' === $recaptcha ) {
	$errors[] = 'Please complete the reCAPTCHA.';
}

if ( ! empty( $errors ) ) {
	http_response_code( 400 );
	echo json_encode( array( 'message' => implode( ' ', $errors ) ) );
	exit;
}

// --- Verify reCAPTCHA server-side ---------------------------------------
$verify = qtech_verify_recaptcha( $recaptcha );

if ( ! $verify['ok'] ) {
	http_response_code( 400 );
	echo json_encode( array( 'message' => 'reCAPTCHA verification failed. Please try again.' ) );
	exit;
}

// --- Build + send the email ----------------------------------------------
// Never put user input directly into headers (name/email) — that's how
// header-injection / email-spoofing attacks happen. We use the visitor's
// email only as Reply-To, sanitized, and never in the From header.
$to      = CONTACT_FORM_TO;
$subject = 'New demo request from ' . $first_name . ' ' . $last_name;

$body  = "You received a new demo request:\n\n";
if ( '' !== $game ) {
	$body .= "Game: {$game}\n";
}
$body .= "Name: {$first_name} {$last_name}\n";
$body .= "Email: {$email}\n\n";
$body .= "Message:\n" . ( '' !== $message ? $message : '(no message provided)' ) . "\n";

// From must be an address on your own domain for deliverability — most
// cPanel mail setups reject or flag a From address that isn't local.
$headers   = array();
$headers[] = 'From: no-reply@qtechgame.com';
$headers[] = 'Reply-To: ' . filter_var( $email, FILTER_SANITIZE_EMAIL );
$headers[] = 'X-Mailer: PHP/' . phpversion();

$sent = mail( $to, $subject, $body, implode( "\r\n", $headers ) );

if ( ! $sent ) {
	error_log( 'contact-form: mail() failed sending to ' . $to );
	http_response_code( 500 );
	echo json_encode( array( 'message' => 'Something went wrong sending your message. Please try again later.' ) );
	exit;
}

echo json_encode( array( 'message' => 'Thanks — your message has been sent!' ) );

/**
 * Verifies a reCAPTCHA v2 response token with Google's siteverify API.
 *
 * @param string $token The g-recaptcha-response value from the form.
 * @return array{ok: bool}
 */
function qtech_verify_recaptcha( $token ) {

	$ch = curl_init( 'https://www.google.com/recaptcha/api/siteverify' );
	curl_setopt_array(
		$ch,
		array(
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_TIMEOUT        => 10,
			CURLOPT_POST           => true,
			CURLOPT_POSTFIELDS     => http_build_query(
				array(
					'secret'   => RECAPTCHA_SECRET_KEY,
					'response' => $token,
					'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
				)
			),
		)
	);

	$response = curl_exec( $ch );
	$curl_err = curl_error( $ch );
	curl_close( $ch );

	if ( false === $response ) {
		error_log( 'contact-form: recaptcha verify request failed: ' . $curl_err );
		return array( 'ok' => false );
	}

	$result = json_decode( $response, true );

	return array( 'ok' => ! empty( $result['success'] ) );
}
