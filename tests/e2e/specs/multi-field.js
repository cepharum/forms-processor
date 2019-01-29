// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
	"Multi field form": browser => {
		browser
			.url( process.env.VUE_DEV_SERVER_URL + "/#multi-field/example.json" )
			.waitForElementVisible( ".forms-processor", 5000 )
			.waitForElementVisible( ".field.name-multiText", 5000 )
			.assert.elementPresent( ".field.name-multiText .name-0" )
			.assert.elementPresent( ".name-multiText .multi-field-container .remove[disabled]" )
			.assert.elementPresent( ".name-multiText .multi-field-container .add:not([disabled])" )
			.click( ".name-multiText .multi-field-container .add:not([disabled])" )
			.assert.elementPresent( ".name-multiText .multi-field-container .remove:not([disabled])" )
			.click( ".name-multiText .multi-field-container .add:not([disabled])" )
			.assert.elementPresent( ".name-multiText .multi-field-container .add[disabled]" )
			.click( ".name-multiText .multi-field-container .remove" )
			.assert.elementPresent( ".name-multiText .multi-field-container .remove:not([disabled])" )
			.assert.elementPresent( ".name-multiText .multi-field-container .add:not([disabled])" )
			.click( ".name-multiText .multi-field-container .remove" )
			.assert.elementPresent( ".name-multiText .multi-field-container .remove[disabled]" )
			.end();
	}
};
