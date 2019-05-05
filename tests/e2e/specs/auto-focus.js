// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

const { formToUrl } = require( "../tools" );

module.exports = {
	"Controlling auto-focusing field": browser => {
		browser.url( formToUrl( {
			processors: [{ type: "dump" }],
			sequence: [
				{
					name: "a",
					fields: [
						{
							name: "a",
						}
					],
				},
				{
					name: "b",
					autofocus: "no",
					fields: [
						{
							name: "b",
						}
					],
				},
			]
		} ) );

		browser.expect.element( ".form-name-a" ).to.be.visible.after( 5000 );

		browser.assert.elementFocused( ".field.name-a input[type=text]" );

		browser.click( ".form-control .next" );

		browser.expect.element( ".field.name-b input[type=text]" ).to.be.visible.after( 500 );

		browser.assert.elementNotFocused( ".field.name-b input[type=text]" );

		browser.end();
	}
};
