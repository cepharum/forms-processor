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
 * @typedef {object} FormatCheckResult
 * @property {string} [output] textual input passed into format checker, might be adjusted to comply w/ format
 * @property {string[]} [errors] lists errors encountered while checking format
 */

/**
 * Implements format validators checking whether some provided textual input is
 * complying with a certain format.
 *
 * In difference to patterns this validation includes checking value ranges etc.
 * Format checkers may succeed on partial input on demand, too.
 */
export default class Format {
	/**
	 * Validates if input contains valid IP-address.
	 *
	 * @param {string} input textual input to be validated
	 * @param {boolean} acceptPartial set true to accept partial input
	 * @param {object} options refers to object selecting optional customizations to format checking
	 * @returns {FormatCheckResult} validated textual input or list of errors if checking failed
	 */
	static ipv4( input, acceptPartial = false, options = {} ) { // eslint-disable-line no-unused-vars
		const fixedInput = String( input == null ? "" : input ).trim();

		if ( fixedInput.length === 0 ) {
			return { result: "" };
		}

		if ( /[^0-9.]/.test( fixedInput ) ) {
			return {
				errors: ["@FORMATS.IP4.INVALID_CHARACTER"],
			};
		}

		const bytes = fixedInput.split( "." );
		const numBytes = bytes.length;
		if ( numBytes > 4 || ( !acceptPartial && numBytes < 4 ) ) {
			return {
				errors: ["@FORMATS.IP4.INVALID_SIZE"],
			};
		}

		for ( let i = 0; i < numBytes; i++ ) {
			const byte = bytes[i] = parseInt( bytes[i] );
			if ( isNaN( byte ) || byte > 255 ) {
				return {
					errors: ["@FORMATS.IP4.INVALID_VALUE"],
				};
			}
		}

		return {
			output: bytes.join( "." ),
		};
	}
}
