// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
	"Navigation with fast-forward enabled": browser => {
		browser
			.url( process.env.VUE_DEV_SERVER_URL + "#auto-navigation/example.json" )
			.waitForElementVisible( ".form-name-step1", 5000 )

			.assert.elementPresent( ".field.name-data" )
			.assert.elementPresent( ".form-control .previous[disabled]" )
			.assert.elementPresent( ".form-control .next" )
			.assert.elementNotPresent( ".form-control .continue" )
			.click( ".field.name-data" )
			.keys( [ "h", "a", "l", "l", "o" ] )
			.click( ".form-control .next" )

			.waitForElementVisible( ".form-name-step2", 5000 )

			.assert.elementPresent( ".field.name-data" )
			.assert.elementPresent( ".form-control .previous:not([disabled])" )
			.assert.elementPresent( ".form-control .next" )
			.assert.elementNotPresent( ".form-control .continue" )
			.click( ".field.name-data" )
			.keys( [ "w", "o", "r", "l", "d" ] )
			.click( ".form-control .next" )

			.waitForElementVisible( ".form-name-step3", 5000 )

			.assert.elementPresent( ".field.name-data" )
			.assert.elementPresent( ".form-control .previous:not([disabled])" )
			.assert.elementPresent( ".form-control .next" )
			.assert.elementNotPresent( ".form-control .continue" )
			.click( ".form-control .previous" )

			.waitForElementVisible( ".form-name-step2", 5000 )

			.assert.elementPresent( ".field.name-data" )
			.assert.elementPresent( ".form-control .previous:not([disabled])" )
			.assert.elementPresent( ".form-control .next" )
			.assert.elementNotPresent( ".form-control .continue" )
			.click( ".form-control .previous" )

			.waitForElementVisible( ".form-name-step1", 5000 )

			.assert.elementPresent( ".field.name-data" )
			.assert.elementPresent( ".form-control .previous[disabled]" )
			.assert.elementPresent( ".form-control .next" )
			.assert.elementPresent( ".form-control .continue" )
			.click( ".form-control .next" )

			.waitForElementVisible( ".form-name-step2", 5000 )

			.assert.elementPresent( ".field.name-data" )
			.assert.elementPresent( ".form-control .previous:not([disabled])" )
			.assert.elementPresent( ".form-control .next" )
			.assert.elementNotPresent( ".form-control .continue" )
			.click( ".form-control .next" )

			.waitForElementVisible( ".form-name-step3", 5000 )

			.assert.elementPresent( ".field.name-data" )
			.assert.elementPresent( ".form-control .previous:not([disabled])" )
			.assert.elementPresent( ".form-control .next" )
			.assert.elementNotPresent( ".form-control .continue" )
			.click( ".form-control .previous" )

			.waitForElementVisible( ".form-name-step2", 5000 )

			.click( ".form-control .previous" )

			.waitForElementVisible( ".form-name-step1", 5000 )

			.click( ".form-control .continue" )

			.waitForElementVisible( ".form-name-step3", 5000 )

			.end();
	}
};
