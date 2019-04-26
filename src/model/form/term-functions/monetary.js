/**
 * (c) 2019 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 cepharum GmbH
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
 * Renders string from value interpreted as monetary value.
 *
 * @param {number} amount value to be rendered
 * @param {boolean} optionalFraction set to true if fraction shall disappear for non-fractional amounts
 * @return {string} description of monetary value
 */
export default function monetary( amount, optionalFraction = false ) {
	const match = /^([+-]?)(\d+)(?:.(\d+))?$/.exec( Math.round( amount * 100 ) / 100 );
	if ( !match ) {
		return "";
	}

	const fraction = ( ( match[3] || "" ) + "00" ).slice( 0, 2 );

	let _amount = match[2];
	for ( let pos = _amount.length - 3; pos > 0; pos -= 3 ) {
		_amount = _amount.substr( 0, pos ) + "." + _amount.substr( pos );
	}

	return _amount + ( !optionalFraction || fraction !== "00" ? "," + fraction : "" );
}
