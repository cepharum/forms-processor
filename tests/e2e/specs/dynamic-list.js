// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
	"Lists with dynamic options": browser => {
		const { Keys } = browser;

		// console.log( Keys );

		browser
			.url( process.env.VUE_DEV_SERVER_URL + "#dynamic-list/definition.js" )
			.waitForElementVisible( ".form-name-dynamicList", 5000 )

			.assert.elementPresent( ".field.name-items" )
			.assert.elementPresent( ".field.name-stringList" )
			.assert.elementPresent( ".field.name-itemA" )
			.assert.elementPresent( ".field.name-itemB" )
			.assert.elementPresent( ".field.name-itemC" )
			.assert.elementPresent( ".field.name-optionsList" )

			.clearValue( ".field.name-items input[type=text]" )
			.pause( 100 )
			.setValue( ".field.name-items input[type=text]", " first , second, last " )
			.pause( 100 )
			.assert.listOptionValues( ".field.name-stringList", [ "first", "second", "last" ] )
			.assert.listOptionLabels( ".field.name-stringList", [ "first", "second", "last" ] )

			.clearValue( ".field.name-items input[type=text]" )
			.pause( 100 )
			.setValue( ".field.name-items input[type=text]", " alpha, beta " )
			.pause( 100 )
			.assert.listOptionValues( ".field.name-stringList", [ "alpha", "beta" ] )
			.assert.listOptionLabels( ".field.name-stringList", [ "alpha", "beta" ] )

			.assert.listOptionValues( ".field.name-optionsList", [ "one", "two", "three" ] )

			.clearValue( ".field.name-itemA input[type=text]" )
			.pause( 100 )
			.setValue( ".field.name-itemA input[type=text]", "eins  " )
			.pause( 100 )
			.clearValue( ".field.name-itemB input[type=text]" )
			.pause( 100 )
			.setValue( ".field.name-itemB input[type=text]", "  zwei " )
			.pause( 100 )
			.clearValue( ".field.name-itemC input[type=text]" )
			.pause( 100 )
			.setValue( ".field.name-itemC input[type=text]", " drei" )
			.pause( 100 )

			.assert.listOptionValues( ".field.name-optionsList", [ "eins", "zwei", "drei" ] )

			.click( ".field.name-stringList" )
			.keys( [ Keys.ARROW_UP, Keys.ARROW_UP, Keys.ARROW_UP ], () => browser.click( ".field.name-stringList .label" ) )
			.pause( 100 )
			.assert.listOptionLabels( ".field.name-optionsList", [ "alpha", "alpha", "alpha" ] )

			.click( ".field.name-stringList" )
			.keys( [ Keys.ARROW_UP, Keys.ARROW_UP, Keys.ARROW_UP, Keys.ARROW_DOWN ], () => browser.click( ".field.name-stringList .label" ) )
			.pause( 100 )
			.assert.listOptionLabels( ".field.name-optionsList", [ "beta", "beta", "beta" ] )

			.end();
	}
};
