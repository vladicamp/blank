<?php
// api-connect.php — token + launch-url requests, plain PHP + cURL,
// no WordPress dependencies.

require_once __DIR__ . '/../config/qtech-config.php';

/**
 * Fetches a fresh QTech access token.
 *
 * Short-lived, so this runs once per game-launch request — never cached
 * or reused across requests.
 *
 * @return array{ok: bool, token?: string, error?: string, status?: int}
 */
function qtech_get_token() {

	if ( ! defined( 'QTECH_BASE_URI' ) || ! defined( 'QTECH_USERNAME' ) || ! defined( 'QTECH_PASSWORD' ) ) {
		error_log( 'qtech: missing QTECH_* constants in config' );
		return array( 'ok' => false, 'error' => 'API credentials are not configured.' );
	}

	$query = http_build_query(
		array(
			'grant_type'    => 'password',
			'response_type' => 'token',
			'username'      => QTECH_USERNAME,
			'password'      => QTECH_PASSWORD,
		)
	);

	$token_url = rtrim( QTECH_BASE_URI, '/' ) . '/auth/token?' . $query;

	$ch = curl_init( $token_url );
	curl_setopt_array(
		$ch,
		array(
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_TIMEOUT        => 15,
			CURLOPT_HTTPHEADER     => array( 'Accept: application/json' ),
		)
	);

	$response  = curl_exec( $ch );
	$curl_err  = curl_error( $ch );
	$http_code = curl_getinfo( $ch, CURLINFO_HTTP_CODE );
	curl_close( $ch );

	if ( false === $response ) {
		error_log( 'qtech: token request failed (cURL): ' . $curl_err );
		return array( 'ok' => false, 'error' => 'Token request failed.' );
	}

	$body = json_decode( $response, true );

	if ( 200 !== $http_code || empty( $body['access_token'] ) ) {
		error_log( 'qtech: token request returned HTTP ' . $http_code . ' — ' . $response );
		return array( 'ok' => false, 'error' => 'Unable to retrieve API token.', 'status' => $http_code );
	}

	return array( 'ok' => true, 'token' => $body['access_token'] );
}

/**
 * Requests a game launch URL for a given game ID and payload.
 *
 * @param string $game_id Full game ID, including provider prefix.
 * @param array  $payload Launch parameters (currency, lang, mode, device, returnUrl).
 * @return array{ok: bool, url?: string, error?: string, status?: int}
 */
function qtech_get_launch_url( $game_id, $payload ) {

	$token_result = qtech_get_token();

	if ( ! $token_result['ok'] ) {
		return $token_result;
	}

	$launch_url = rtrim( QTECH_BASE_URI, '/' ) . '/games/' . rawurlencode( $game_id ) . '/launch-url';

	$ch = curl_init( $launch_url );
	curl_setopt_array(
		$ch,
		array(
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_TIMEOUT        => 15,
			CURLOPT_CUSTOMREQUEST  => 'POST',
			CURLOPT_POSTFIELDS     => json_encode( $payload ),
			CURLOPT_HTTPHEADER     => array(
				'Accept: application/json',
				'Content-Type: application/json',
				'Authorization: Bearer ' . $token_result['token'],
			),
		)
	);

	$response  = curl_exec( $ch );
	$curl_err  = curl_error( $ch );
	$http_code = curl_getinfo( $ch, CURLINFO_HTTP_CODE );
	curl_close( $ch );

	if ( false === $response ) {
		error_log( 'qtech: launch-url request failed (cURL): ' . $curl_err );
		return array( 'ok' => false, 'error' => 'Launch request failed.' );
	}

	$body = json_decode( $response, true );

	if ( 200 !== $http_code || empty( $body['url'] ) ) {
		error_log( 'qtech: launch-url request returned HTTP ' . $http_code . ' — ' . $response );
		return array( 'ok' => false, 'error' => 'Unable to launch game.', 'status' => $http_code );
	}

	return array( 'ok' => true, 'url' => $body['url'] );
}
