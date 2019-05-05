// A custom Nightwatch assertion.
// The assertion name is the filename.
// Example usage:
//
//   browser.assert.elementCount(selector, count)
//
// For more information on custom assertions see:
// http://nightwatchjs.org/guide#writing-custom-assertions

exports.assertion = function elementChecked( selector ) {
	this.message = `Testing if element <${selector}> is focused/active`;
	this.expected = true;

	this.pass = val => Boolean( val );
	this.value = res => res.value;

	this.command = cb => this.api.execute( function( _selector ) {
		return ( document.querySelector( _selector ) || {} ) === document.activeElement;
	}, [selector], cb );
};
