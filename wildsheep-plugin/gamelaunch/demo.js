( function () {
	'use strict';

	const demoFrame = document.querySelector( '.demo-frame' );
	const playButton = document.querySelector( '.demo-frame__play' );
	const tokenMeta = document.querySelector( 'meta[name="demo-token"]' );

	if ( ! demoFrame || ! tokenMeta ) {
		return;
	}

	const gameID = playButton ? playButton.dataset.gameid : demoFrame.dataset.gameid;
	const demoToken = tokenMeta.content;

	function loadDemo() {
		if ( ! gameID ) {
			console.error( 'qtech-demo: no gameID found on the page.' );
			return;
		}

		fetch( 'demo.php', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Demo-Token': demoToken,
			},
			body: JSON.stringify( { gameID: gameID } ),
		} )
			.then( function ( response ) {
				return response.json().then( function ( data ) {
					return { ok: response.ok, data: data };
				} );
			} )
			.then( function ( result ) {
				if ( ! result.ok || ! result.data.game_url ) {
					console.error( 'qtech-demo: demo launch failed:', result.data );
					return;
				}

				demoFrame.innerHTML =
					'<iframe src="' + result.data.game_url + '" ' +
					'title="Game demo" allow="fullscreen; autoplay" loading="lazy"></iframe>';
			} )
			.catch( function ( error ) {
				console.error( 'qtech-demo: request error:', error );
			} );
	}

	// Auto-load the demo as soon as the page is ready.
	loadDemo();

	// Button still works too — e.g. to reload/retry the demo.
	if ( playButton ) {
		playButton.addEventListener( 'click', loadDemo );
	}
} )();
