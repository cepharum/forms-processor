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
 * Matches string values representing boolean value `true`.
 *
 * @type {RegExp}
 */
const ptnTruthy = /^\s*(?:y(?:es)?|t(?:rue)?|1|on)?\s*$/i;

/**
 * Matches string values representing boolean value `false`.
 *
 * @type {RegExp}
 */
const ptnFalsy = /^\s*(?:no?|f(?:alse)?|0|off)?\s*$/i;


/**
 * Exposes set of methods for processing arbitrary data.
 */
export default class Data {
	/**
	 * Converts provided arbitrary value to boolean supporting several string
	 * values resulting in either `true` or `false`.
	 *
	 * @param {*} value value to be converted
	 * @param {true|false|null} defaultValue value to return in case of matching neither list of string literals describing boolean value
	 * @returns {?boolean} resulting value or null if `value` is representing neither boolean value while omitting default
	 */
	static normalizeToBoolean( value, defaultValue = null ) {
		if ( value === true || value === false ) {
			return value;
		}

		if ( ptnFalsy.test( value ) ) {
			return false;
		}

		if ( !defaultValue && ptnTruthy.test( value ) ) {
			return true;
		}

		return defaultValue == null ? null : Boolean( defaultValue );
	}
}
