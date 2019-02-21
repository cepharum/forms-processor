// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = { "Group Field: non-contained field is updated on change of contained field": browser => {
	browser
		.url( process.env.VUE_DEV_SERVER_URL + "#persistent-input/example.json" )
		.waitForElementVisible( ".form-name-first", 5000 )
		.assert.elementPresent( ".field.name-unnamed0001" )
		.assert.elementPresent( ".field.name-colours" )
		.assert.elementPresent( ".field.name-reported .field.name-confirmed" )

		.click( ".field.name-colours .option.no-1 input" )
		.pause( 100 )

		.execute( function( selector, attributeName ) {
			return document.querySelector( selector )[attributeName];
		}, [ ".field.name-confirmed .option.no-1 input", "checked" ], function( result ) {
			if ( result.value ) {
				this
					.click( ".field.name-confirmed .option.no-1 input" )
					.pause( 100 );
			}

			this
				.assert.matchesText( ".field.name-unnamed0001 .static-info", /is not confirmed/ )
				.pause( 100 )

				.click( ".field.name-confirmed .option.no-1 input" )
				.pause( 100 )
				.assert.matchesText( ".field.name-unnamed0001 .static-info", /is confirmed/ )

				.click( ".field.name-confirmed .option.no-1 input" )
				.pause( 100 )
				.assert.matchesText( ".field.name-unnamed0001 .static-info", /is not confirmed/ )

				.end();
		} );
} };
