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
 * Implements map of functions available in term processing by default.
 *
 * @note Functions must be exposed with lowercase letters, only. Names are
 *       case-insensitive and thus term compiler is always looking for functions
 *       using lowercase version of provided name.
 */
module.exports = {
	/**
	 * Detects if any provided argument is set (neither `undefined` nor `null`).
	 *
	 * @param {*} args one of several arguments
	 * @returns {boolean} true if at least one provided argument is neither `undefined` nor `null`
	 */
	isset: ( ...args ) => args.some( i => i != null ),

	/**
	 * Casts provided arbitrary value to boolean value.
	 *
	 * @param {*} input arbitrary input value
	 * @returns {boolean} boolean value represented by provided value
	 */
	boolean: input => Boolean( input ),

	/**
	 * Casts provided arbitrary value to integer value.
	 *
	 * @param {*} input arbitrary input value
	 * @returns {int} integer value represented by provided value
	 */
	integer: input => parseInt( input ),

	/**
	 * Casts provided arbitrary value to floating point number.
	 *
	 * @param {*} input arbitrary input value
	 * @returns {float} floating point number represented by provided value
	 */
	number: input => Number( input ),

	/**
	 * Casts provided arbitrary value to string.
	 *
	 * @param {*} input arbitrary input value
	 * @returns {string} string representation of provided value
	 */
	string: input => String( input ),

	/**
	 * Removes all leading and trailing whitespace from string representation of
	 * provided value.
	 *
	 * @param {*} input arbitrary input value
	 * @returns {string} string representation of provided value w/ leading and trailing whitespace removed
	 */
	trim: input => String( input ).trim(),

	/**
	 * Removes all leading and trailing whitespace from string representation of
	 * provided value and replaces inner sequences of whitespace w/ single SPC
	 * characters.
	 *
	 * @param {*} input arbitrary input value
	 * @returns {string} string representation of provided value w/ leading and trailing whitespace removed
	 */
	normalize: input => String( input ).trim().replace( /\s+/g, " " ),

	/**
	 * Rounds provide value to selected precision.
	 *
	 * @param {*} input arbitrary input value
	 * @param {int} precision precision of result value in digits succeeding decimal separator
	 * @returns {number} rounded value
	 */
	round: ( input, precision = 0 ) => Math.round( input * Math.pow( 10, precision ) ) / Math.pow( 10, precision ),

	/**
	 * Concatenates string representations of all provided arguments.
	 *
	 * @param {*} args arbitrary data
	 * @returns {string} concatenation of all values' string representations
	 */
	concat: ( ...args ) => args.map( arg => String( arg ) ).join( "" ),

	/**
	 * Fetches number of elements in an array or number of characters in a
	 * string.
	 *
	 * @param {string|Array} data array or string to be inspected
	 * @returns {string} number of elements in array or number of characters in string
	 */
	length: data => ( data ? data.length || 0 : 0 ),

	/**
	 * Fetches element of array selected by its zero-based index.
	 *
	 * @param {Array} array set of items
	 * @param {int} index zero-based index of item to fetch
	 * @param {*} fallbackIfMissing value to return if selected item does not exist
	 * @returns {*} selected item of array, provided fallback or `null` if item is missing
	 */
	item: ( array, index, fallbackIfMissing = null ) => ( Array.isArray( array ) && index < array.length ? array[index] : fallbackIfMissing ),
};
