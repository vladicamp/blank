<?php
// demo.php — public endpoint the frontend calls to launch a demo game.
// Equivalent to the old REST route, minus WordPress.

session_start();
header( 'Content-Type: application/json' );

require_once __DIR__ . '/api-connect.php';

// --- CSRF-style check (replaces wp_verify_nonce) ---------------------------
// A token is generated per page-load session (see demo.html) and must be
// echoed back in the X-Demo-Token header. This isn't full WP-nonce parity,
// but it stops the endpoint being trivially called from a random third
// party page.
$sent_token = $_SERVER['HTTP_X_DEMO_TOKEN'] ?? '';

if ( empty( $_SESSION['demo_token'] ) || ! hash_equals( $_SESSION['demo_token'], $sent_token ) ) {
	http_response_code( 403 );
	echo json_encode( array( 'message' => 'Invalid or missing session token.' ) );
	exit;
}

// --- Read and validate input -----------------------------------------------
$input   = json_decode( file_get_contents( 'php://input' ), true );
$game_id = isset( $input['gameID'] ) ? preg_replace( '/[^A-Za-z0-9\-_]/', '', $input['gameID'] ) : '';

if ( empty( $game_id ) ) {
	http_response_code( 400 );
	echo json_encode( array( 'message' => 'Game ID is missing.' ) );
	exit;
}

// This plugin only ever talks to the WSO provider — prefix is a constant
// from config. For multi-provider setups, accept providerID from the
// frontend instead (see the Skill's provider-prefix-pattern.md).
$full_game_id = QTECH_PROVIDER_PREFIX . $game_id;

$payload = array(
	'currency'  => 'USD',
	'lang'      => 'en_US',
	'mode'      => 'demo',
	'device'    => 'desktop',
	'returnUrl' => ( isset( $_SERVER['HTTPS'] ) ? 'https://' : 'http://' ) . $_SERVER['HTTP_HOST'] . '/games',
);

$result = qtech_get_launch_url( $full_game_id, $payload );

if ( ! $result['ok'] ) {
	http_response_code( $result['status'] ?? 500 );
	echo json_encode( array( 'message' => $result['error'] ) );
	exit;
}

echo json_encode(
	array(
		'gameID'   => $full_game_id,
		'game_url' => $result['url'],
	)
);
