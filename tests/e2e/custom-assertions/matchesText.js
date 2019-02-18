// A custom Nightwatch assertion.
// The assertion name is the filename.
// Example usage:
//
//   browser.assert.elementCount(selector, count)
//
// For more information on custom assertions see:
// http://nightwatchjs.org/guide#writing-custom-assertions

exports.assertion = function matchesText( selector, pattern ) {
	this.message = `Testing if element <${selector}> has textual content matching ${pattern}`;
	this.expected = pattern;
	this.pass = val => pattern.test( val );
	this.value = res => res.value;

	/**
	 * Extracts textual content of first element matching provided selector.
	 *
	 * @param {string} _selector CSS selector
	 * @returns {string} textual content of first matching element
	 */
	function evaluator( _selector ) {
		return ( document.querySelector( _selector ) || {} ).textContent;
	}

	this.command = cb => this.api.execute( evaluator, [selector], cb );
};
