// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = { "Radio Button: can be grouped with radio buttons in separate field": browser => {
	browser
		.url( process.env.VUE_DEV_SERVER_URL + "#persistent-input/example.json" )
		.waitForElementVisible( ".form-name-first", 5000 )
		.assert.elementPresent( ".field.name-colours" )
		.assert.elementPresent( ".field.name-no_colour" )

		.click( ".field.name-colours .option.no-1 input" )
		.pause( 100 )
		.assert.elementChecked( ".field.name-colours .option.no-1 input" )
		.assert.elementNotChecked( ".field.name-colours .option.no-2 input" )
		.assert.elementNotChecked( ".field.name-no_colour .option.no-1 input" )

		.click( ".field.name-colours .option.no-2 input" )
		.pause( 100 )
		.assert.elementNotChecked( ".field.name-colours .option.no-1 input" )
		.assert.elementChecked( ".field.name-colours .option.no-2 input" )
		.assert.elementNotChecked( ".field.name-no_colour .option.no-1 input" )

		.click( ".field.name-no_colour .option.no-1 input" )
		.pause( 100 )
		.assert.elementNotChecked( ".field.name-colours .option.no-1 input" )
		.assert.elementNotChecked( ".field.name-colours .option.no-2 input" )
		.assert.elementChecked( ".field.name-no_colour .option.no-1 input" )

		.click( ".field.name-colours .option.no-1 input" )
		.pause( 100 )
		.assert.elementChecked( ".field.name-colours .option.no-1 input" )
		.assert.elementNotChecked( ".field.name-colours .option.no-2 input" )
		.assert.elementNotChecked( ".field.name-no_colour .option.no-1 input" )

		.click( ".field.name-no_colour .option.no-1 input" )
		.pause( 100 )
		.assert.elementNotChecked( ".field.name-colours .option.no-1 input" )
		.assert.elementNotChecked( ".field.name-colours .option.no-2 input" )
		.assert.elementChecked( ".field.name-no_colour .option.no-1 input" )

		.click( ".field.name-colours .option.no-2 input" )
		.pause( 100 )
		.assert.elementNotChecked( ".field.name-colours .option.no-1 input" )
		.assert.elementChecked( ".field.name-colours .option.no-2 input" )
		.assert.elementNotChecked( ".field.name-no_colour .option.no-1 input" )

		.click( ".field.name-colours .option.no-1 input" )
		.pause( 100 )
		.assert.elementChecked( ".field.name-colours .option.no-1 input" )
		.assert.elementNotChecked( ".field.name-colours .option.no-2 input" )
		.assert.elementNotChecked( ".field.name-no_colour .option.no-1 input" )

		.end();
} };
