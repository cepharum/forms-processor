// A custom Nightwatch assertion.
// The assertion name is the filename.
// Example usage:
//
//   browser.assert.elementCount(selector, count)
//
// For more information on custom assertions see:
// http://nightwatchjs.org/guide#writing-custom-assertions

exports.assertion = function elementCount( selector, count ) {
	this.message = `Testing if element <${selector}> exists ${count} ${count === 1 ? "time" : "times"}`;
	this.expected = count;
	this.pass = val => val === count;
	this.value = res => res.value;

	/**
	 * Counts number of elements matching provided CSS selector.
	 *
	 * @param {string} _selector CSS selector
	 * @return {number} number of elements matching provided CSS selector
	 */
	function evaluator( _selector ) {
		return document.querySelectorAll( _selector ).length;
	}

	this.command = cb => this.api.execute( evaluator, [selector], cb );
};
