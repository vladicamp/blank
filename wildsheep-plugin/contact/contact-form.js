( function () {
	'use strict';

	const form = document.getElementById( 'request-demo-form' );

	if ( ! form ) {
		return;
	}

	const status = form.querySelector( '.form-status' );

	form.addEventListener( 'submit', function ( event ) {
		event.preventDefault();

		if ( status ) {
			status.textContent = 'Sending...';
		}

		fetch( 'contact-handler.php', {
			method: 'POST',
			body: new FormData( form ),
		} )
			.then( function ( response ) {
				return response.json().then( function ( data ) {
					return { ok: response.ok, data: data };
				} );
			} )
			.then( function ( result ) {
				if ( status ) {
					status.textContent = result.data.message;
				}

				if ( result.ok ) {
					form.reset();
					if ( window.grecaptcha ) {
						window.grecaptcha.reset();
					}
				}
			} )
			.catch( function () {
				if ( status ) {
					status.textContent = 'Something went wrong. Please try again.';
				}
			} );
	} );
} )();
