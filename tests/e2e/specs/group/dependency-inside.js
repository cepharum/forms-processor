// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = { "Group Field: contained field is updated on change of non-contained field": browser => {
	browser
		.url( process.env.VUE_DEV_SERVER_URL + "#persistent-input/example.json" )
		.waitForElementVisible( ".form-name-first", 5000 )
		.assert.elementPresent( ".field.name-lastname" )
		.assert.elementPresent( ".field.name-reported" )
		.assert.elementCount( ".field.name-reported .field", 4 )

		.clearValue( ".field.name-lastname input[type=text]" )
		.setValue( ".field.name-lastname input[type=text]", "Doe" )
		.pause( 100 )
		.assert.matchesText( ".field.name-reported .field.name-unnamed0003 .static-info", /\bDoe\b/ )

		.end();
} };
