/**
 * (c) 2018 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2018 cepharum GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @author: cepharum
 */

/**
 * Provides helpers for working with a list of options to choose from e.g. in a
 * selector or in a set of checkboxes, buttons or radio buttons.
 */
export default class Options {
	/**
	 * Extracts normalized array of options to be listed in selector.
	 *
	 * @param {string|array<{label:string, value:string}>} definition options as provided in field's definition
	 * @param {array<{label:string, value:string}>} fallback to return if `definition` is missing/unset
	 * @param {function(string):string} localizer optional callback selecting matching translation from a map of available localizations
	 * @return {array<{label:string, value:string}>} normalized list of option descriptors for listing in selector
	 */
	static createOptions( definition, fallback = null, localizer = null ) {
		if ( !definition ) {
			if ( fallback == null ) {
				throw new TypeError( "Missing list of options to offer in a selector." );
			}

			return fallback;
		}

		const options = typeof definition === "string" ? definition.trim().split( /\s*[,;]\s*/ ) : definition;
		if ( !Array.isArray( options ) ) {
			throw new TypeError( "Normalized definition of selectable options does not result in a list." );
		}

		const numOptions = options.length;
		const normalized = new Array( numOptions );
		let write = 0;

		for ( let i = 0; i < numOptions; i++ ) {
			const item = options[i];

			if ( !item ) {
				continue;
			}

			switch ( typeof item ) {
				case "string" : {
					const value = item.trim();

					normalized[write++] = {
						value,
						label: value,
					};

					break;
				}

				case "object" : {
					if ( !item.value ) {
						throw new TypeError( "Rejecting selectable option due to missing value." );
					}

					const value = item.value.trim();

					normalized[write++] = {
						value,
						label: item.label == null ? value : localizer ? localizer( item.label ) : String( item.label ).trim(),
					};

					break;
				}
			}
		}

		normalized.splice( write );

		return normalized;
	}
}
