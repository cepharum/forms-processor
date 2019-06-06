// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

const { stringToUrl } = require( "../../tools" );

module.exports = {
	"Properly links initial values of grouped fields on one page with values of grouped fields on another page": browser => {
		browser.url( stringToUrl( `
processors:
  - type: dump
sequence:
  - name: first
    fields:
      - name: provider
      - type: group
        name: group
        fields:
          - name: subprovider
  - name: second
    fields:
      - name: consumer
        initial: {{first.provider}}
      - name: extracting_consumer
        initial: {{first.group.subprovider}}
      - type: group
        name: group
        fields:
          - name: subconsumer
            initial: {{first.group.subprovider}}
          - name: injecting_consumer
            initial: {{first.provider}}
` ) );

		browser.expect.element( ".form-name-first" ).to.be.visible.after( 5000 );

		browser.setValue( ".field.name-provider input[type=text]", "provider", () => {
			browser.setValue( ".field.name-subprovider input[type=text]", "subprovider", () => {
				browser.click( ".form-control .next" );

				browser.expect.element( ".form-name-second" ).to.be.visible.after( 1000 );

				browser.expect.element( ".field.name-consumer" ).to.be.present; // eslint-disable-line no-unused-expressions
				browser.expect.element( ".field.name-extracting_consumer" ).to.be.present; // eslint-disable-line no-unused-expressions
				browser.expect.element( ".field.name-subconsumer" ).to.be.present; // eslint-disable-line no-unused-expressions
				browser.expect.element( ".field.name-injecting_consumer" ).to.be.present; // eslint-disable-line no-unused-expressions

				browser.getValue( ".field.name-consumer input[type=text]", function( result ) {
					this.assert.equal( result.value, "provider" );
				} );

				browser.getValue( ".field.name-extracting_consumer input[type=text]", function( result ) {
					this.assert.equal( result.value, "subprovider" );
				} );

				browser.getValue( ".field.name-subconsumer input[type=text]", function( result ) {
					this.assert.equal( result.value, "subprovider" );
				} );

				browser.getValue( ".field.name-injecting_consumer input[type=text]", function( result ) {
					this.assert.equal( result.value, "provider" );
				} );

				browser.end();
			} );
		} );
	}
};
