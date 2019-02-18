// A custom Nightwatch assertion.
// The assertion name is the filename.
// Example usage:
//
//   browser.assert.elementCount(selector, count)
//
// For more information on custom assertions see:
// http://nightwatchjs.org/guide#writing-custom-assertions

exports.assertion = function elementNotChecked( selector ) {
	this.message = `Testing if element <${selector}> is not checked`;
	this.expected = false;
	this.pass = val => !val;
	this.value = res => res.value;

	/**
	 * Extracts `checked` attribute of first element matching provided selector.
	 *
	 * @param {string} _selector CSS selector
	 * @returns {?boolean} value of checked attribute of first matching element
	 */
	function evaluator( _selector ) {
		return ( document.querySelector( _selector ) || {} ).checked;
	}

	this.command = cb => this.api.execute( evaluator, [selector], cb );
};
