// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
	"Most Simple Form": browser => {
		browser
			.url( process.env.VUE_DEV_SERVER_URL + "#most-simple/definition.js" )
			.waitForElementVisible( ".forms-processor", 5000 )
			.waitForElementVisible( "#some-input-1234", 5000 )
			.assert.elementPresent( ".form-progress" )
			.assert.elementPresent( ".form-content" )
			.assert.elementPresent( ".form-control" )
			.assert.elementCount( ".form .fields > .field", 1 )
			.end();
	}
};
