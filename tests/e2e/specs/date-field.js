// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
	"Navigation with fast-forward enabled": browser => {
		browser
			.url( process.env.VUE_DEV_SERVER_URL + "#date-field/example.json" )
			.waitForElementVisible( ".form-name-date-field", 5000 )

			.assert.elementPresent( ".field.name-test" )
			.assert.elementPresent( ".form-control button.submit" )
			.click( ".form-control button.submit" )
			.assert.elementPresent( ".name-test .widget .errors span.error" )

			.click( ".field.name-test .widget input" )

			.keys( [ "w", "o", "r", "l", "d" ] )
			.assert.value( ".field.name-test .widget input", "" )

			.keys( [ "2", "0" ] )
			.assert.value( ".field.name-test .widget input", "20" )
			.assert.elementPresent( ".name-test .widget .errors span.error" )

			.keys( ["-"] )
			.assert.elementNotPresent( ".name-test .widget .errors span.error" )
			.click( ".form-control button.submit" )
			.assert.elementPresent( ".name-test .widget .errors span.error" )

			.click( ".field.name-test .widget input" )

			.keys( [ "1", "2" ] )
			.assert.elementPresent( ".name-test .widget .errors span.error" )

			.clearValue( ".field.name-test .widget input" )
			.assert.elementPresent( ".name-test .widget .errors span.error" )

			.click( ".field.name-test .widget input" )

			.keys( [ "2", "0", "1", "9", "-", "0", "1" ] )
			.assert.elementNotPresent( ".name-test .widget .errors span.error" )

			.keys( [ "-", "0" ] )
			.assert.elementNotPresent( ".name-test .widget .errors span.error" )

			.click( ".form-control button.submit" )
			.assert.elementPresent( ".name-test .widget .errors span.error" )

			.click( ".field.name-test .widget input" )
			.keys( ["1"] )
			.assert.elementNotPresent( ".name-test .widget .errors span.error" )

			.click( ".form-control button.submit" )
			.assert.elementNotPresent( ".name-test .widget .errors span.error" );
	}
};
