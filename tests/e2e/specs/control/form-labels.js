// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

const { stringToUrl } = require( "../../tools" );

module.exports = {
	"Supporting custom labels for default buttons commonly defined for all forms": browser => {
		browser.url( stringToUrl( `
processors:
  - type: dump
mode:
  buttons:
    previous:
      tv: WRONG
      en: PREVIOUS-SEQUENCE
    next: NEXT-SEQUENCE
    continue: RESUME-SEQUENCE
    submit:
      tv: FAILED
      en: SUBMIT-SEQUENCE
sequence:
  - name: first
    fields:
      - name: input
    buttons:
      previous: 
        tv: WRONG
        en: PREVIOUS
      next: NEXT
      continue: CONTINUE
      submit:
        tv: FAILED
        en: SUBMIT
  - name: second
    fields:
      - name: input
    buttons:
      previous: 
        tv: WRONG
        en: PREVIOUS
  - name: third
    fields:
      - name: input
    buttons:
      previous: 
        tv: WRONG
        en: PREVIOUS
      next: NEXT
      continue: CONTINUE
      submit:
        tv: FAILED
        en: SUBMIT
` ) );

		browser.expect.element( ".form-name-first" ).to.be.visible.after( 5000 );

		browser.expect.element( ".form-control > .previous" ).text.to.be.equal( "" ); // fetching _visible_ text
		browser.expect.element( ".form-control > .next" ).text.to.be.equal( "NEXT" );
		browser.expect.element( ".form-control > .submit" ).not.to.be.present; // eslint-disable-line no-unused-expressions

		browser.click( ".form-control > .next" );

		browser.expect.element( ".form-name-second" ).to.be.visible.after( 5000 );

		browser.expect.element( ".form-control > .previous" ).text.to.be.equal( "PREVIOUS" );
		browser.expect.element( ".form-control > .next" ).text.to.be.equal( "NEXT-SEQUENCE" );
		browser.expect.element( ".form-control > .submit" ).not.to.be.present; // eslint-disable-line no-unused-expressions

		browser.click( ".form-control > .next" );

		browser.expect.element( ".form-name-third" ).to.be.visible.after( 5000 );

		browser.expect.element( ".form-control > .previous" ).text.to.be.equal( "PREVIOUS" );
		browser.expect.element( ".form-control > .next" ).not.to.be.present; // eslint-disable-line no-unused-expressions
		browser.expect.element( ".form-control > .submit" ).text.to.be.equal( "SUBMIT" );

		browser.end();
	}
};
