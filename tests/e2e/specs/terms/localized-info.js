// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

const { stringToUrl } = require( "../../tools" );

module.exports = {
	"Supporting terms in localized text of a static field": browser => {
		browser.url( stringToUrl( `
processors:
  - type: dump
sequence:
  - name: sole
    fields:
      - name: sole
        initial: processed
      - type: info
        classes: localized-result
        text:
          en: {{sole.sole}}
      - type: info
        classes: non-localized-result
        text: {{sole.sole}}
` ) );

		browser.expect.element( ".form-name-sole" ).to.be.visible.after( 5000 );
		browser.expect.element( ".field.name-sole" ).to.be.present; // eslint-disable-line no-unused-expressions
		browser.expect.element( ".field.non-localized-result" ).to.be.present; // eslint-disable-line no-unused-expressions
		browser.expect.element( ".field.non-localized-result" ).text.to.contain( "processed" );
		browser.expect.element( ".field.localized-result" ).to.be.present; // eslint-disable-line no-unused-expressions
		browser.expect.element( ".field.localized-result" ).text.to.contain( "processed" );

		browser.end();
	}
};
