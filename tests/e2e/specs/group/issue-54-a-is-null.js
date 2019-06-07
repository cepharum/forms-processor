// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

const { stringToUrl } = require( "../../tools" );

module.exports = {
	"Validation does not fail unexpectedly when reloading page with pre-filled set of grouped text fields.": browser => {
		browser.url( stringToUrl( `
mode:
  localStore:
    id: 1
    maxAge: 30
processors:
  - type: dump
sequence:
  - name: sole
    fields:
      - type: group
        fields:
          - name: first
` ) );

		browser.expect.element( ".form-name-sole" ).to.be.visible.after( 5000 );

		browser.setValue( ".field.name-first input[type=text]", "some text", () => {
			browser.refresh( () => {
				browser.expect.element( ".form-name-sole" ).to.be.visible.after( 5000 );

				browser.expect.element( ".field.name-first" ).to.be.present; // eslint-disable-line no-unused-expressions

				browser.getValue( ".field.name-first input[type=text]", function( result ) {
					this.assert.equal( result.value, "some text" );
				} );

				browser.expect.element( ".field.name-first.valid" ).to.be.present; // eslint-disable-line no-unused-expressions

				browser.end();
			} );
		} );
	}
};
