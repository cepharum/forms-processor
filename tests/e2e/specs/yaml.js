// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

const { stringToUrl } = require( "../tools" );

module.exports = {
	"Supporting definition of forms with YAML": browser => {
		browser.url( stringToUrl( `
processors:
  - type: dump
sequence:
  - name: sole
    fields:
      - name: sole
        label: Field
` ) );

		browser.expect.element( ".form-name-sole" ).to.be.visible.after( 5000 );
		browser.expect.element( ".field.name-sole" ).to.be.visible;

		browser.end();
	}
};
