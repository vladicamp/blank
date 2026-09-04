<?php
// session-token.php — include this at the TOP of demo.html (before any
// output) if you convert that file to demo.php, or output its result into
// a <meta> tag if the page stays static HTML with a tiny PHP include.

session_start();

if ( empty( $_SESSION['demo_token'] ) ) {
	$_SESSION['demo_token'] = bin2hex( random_bytes( 32 ) );
}
