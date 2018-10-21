exports.assertion = function listOptionValues( selector, values ) {
	this.message = `Testing if selector element <${selector}> has options with values ${values.map( v => `"${v}"` ).join( ", " )}`;
	this.expected = values;
	this.pass = vals => vals.every( v => values.indexOf( v ) > -1 ) && values.every( v => vals.indexOf( v ) > -1 );
	this.value = res => JSON.parse( res.value ).map( v => String( v ) );

	/**
	 * Fetches values exposed via DOM API from all option elements contained in
	 * list element addressed by CSS selector.
	 *
	 * @param {string} _selector CSS selector
	 * @return {string} JSON-encoded array of values of selected list's options
	 */
	function evaluator( _selector ) {
		const options = document.querySelector( _selector ).querySelectorAll( "option" );
		return JSON.stringify( [].map.call( options, function( option ) { return option.value; } ) );
	}

	this.command = cb => this.api.execute( evaluator, [selector], cb );
};
