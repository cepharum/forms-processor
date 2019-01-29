// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = { "Text fields with formats": browser => {
	browser
		.url( process.env.VUE_DEV_SERVER_URL + "#text-format/example.json" )
		.waitForElementVisible( ".form-name-sole", 5000 )
		.assert.elementPresent( ".field.name-IBAN" )
		.setValue( ".field.name-IBAN input[type=text]", "DE682105017" )
		.assert.elementNotPresent( ".field.name-IBAN .errors", "There should not be an error for to short inputs" )
		.setValue( ".field.name-IBAN input[type=text]", "00012345678" )
		.assert.elementNotPresent( ".field.name-IBAN .errors" )
		.setValue( ".field.name-IBAN input[type=text]", "0" )
		.assert.elementPresent( ".field.name-IBAN .errors" )
		.clearValue( ".field.name-IBAN input[type=text]" )
		.setValue( ".field.name-IBAN input[type=text]", "DE68210501700012345679" )
		.assert.elementPresent( ".field.name-IBAN .errors" )
		.clearValue( ".field.name-IBAN input[type=text]" )
		.setValue( ".field.name-IBAN input[type=text]", "DEF" )
		.assert.elementPresent( ".field.name-IBAN .errors" )
		.end();
} };
