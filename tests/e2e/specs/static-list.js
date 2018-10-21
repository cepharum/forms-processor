// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
	"Most Simple Form": browser => {
		const { Keys } = browser;

		// console.log( Keys );

		browser
			.url( process.env.VUE_DEV_SERVER_URL + "#static-list/definition.js" )
			.waitForElementVisible( ".form-name-staticList", 5000 )

			.assert.elementPresent( ".field.name-stringList" )
			.assert.listOptionValues( ".field.name-stringList", [ "one", "two", "three" ] )
			.assert.listOptionLabels( ".field.name-stringList", [ "one", "two", "three" ] )

			.assert.elementPresent( ".field.name-optionsList" )
			.assert.listOptionValues( ".field.name-optionsList", [ "one", "two", "three" ] )
			.assert.listOptionLabels( ".field.name-optionsList", [ "One!", "Two!", "Three!" ] )

			.assert.elementPresent( ".field.name-requiredStringList" )
			.assert.listOptionValues( ".field.name-requiredStringList", [ "one", "two", "three" ] )
			.assert.listOptionLabels( ".field.name-requiredStringList", [ "one", "two", "three" ] )

			.assert.elementPresent( ".field.name-requiredOptionsList" )
			.assert.listOptionValues( ".field.name-requiredOptionsList", [ "one", "two", "three" ] )
			.assert.listOptionLabels( ".field.name-requiredOptionsList", [ "One!", "Two!", "Three!" ] )

			.assert.elementPresent( ".field.name-dependingStringList" )
			.assert.listOptionValues( ".field.name-dependingStringList", [ "one", "two", "three" ] )
			.assert.listOptionLabels( ".field.name-dependingStringList", [ "one", "two", "three" ] )

			.assert.elementPresent( ".field.name-dependingOptionsList" )
			.assert.listOptionValues( ".field.name-dependingOptionsList", [ "one", "two", "three" ] )
			.assert.listOptionLabels( ".field.name-dependingOptionsList", [ "One!", "Two!", "Three!" ] )

			.assert.elementNotPresent( ".field.name-dependingStringList.mandatory" )
			.assert.elementNotPresent( ".field.name-dependingOptionsList.mandatory" )

			.click( ".field.name-stringList" )
			.keys( [ Keys.ARROW_UP, Keys.ARROW_UP, Keys.ARROW_UP ] )
			.pause( 100 )
			.click( ".field.name-stringList .label" )
			.waitForElementPresent( ".field.name-dependingStringList.mandatory", 5000 )
			.assert.elementPresent( ".field.name-dependingStringList.mandatory" )
			.assert.elementNotPresent( ".field.name-dependingOptionsList.mandatory" )

			.click( ".field.name-stringList" )
			.keys( [ Keys.ARROW_UP, Keys.ARROW_UP, Keys.ARROW_UP, Keys.ARROW_DOWN ] )
			.pause( 100 )
			.click( ".field.name-stringList .label" )
			.waitForElementNotPresent( ".field.name-dependingStringList.mandatory", 5000 )
			.assert.elementNotPresent( ".field.name-dependingStringList.mandatory" )
			.assert.elementPresent( ".field.name-dependingOptionsList.mandatory" )

			.click( ".field.name-stringList" )
			.keys( [ Keys.ARROW_UP, Keys.ARROW_UP, Keys.ARROW_UP, Keys.ARROW_DOWN, Keys.ARROW_DOWN ] )
			.pause( 100 )
			.click( ".field.name-stringList .label" )
			.waitForElementNotPresent( ".field.name-dependingOptionsList.mandatory", 5000 )
			.assert.elementNotPresent( ".field.name-dependingStringList.mandatory" )
			.assert.elementNotPresent( ".field.name-dependingOptionsList.mandatory" )

			.end();
	}
};
