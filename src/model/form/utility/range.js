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

const ptnSimpleRange = /^\s*([-+]?\d+(?:[,.]\d+)?)?\s*-\s*([-+]?\d+(?:[,.]\d+)?)?\s*(?:@\s*(\d+(?:[,.]\d+)?)\s*)?$/;
const ptnComplexRange = /^\s*([\][])\s*?([-+]?\d+(?:[,.]\d+)?)?\s*(?:\.{2,3}|[,;])\s*([-+]?\d+(?:[,.]\d+)?)?\s*([\][])?\s*(?:@\s*(\d+(?:[,.]\d+)?)\s*)?$/;
const ptnNumber = /^\s*[-+]?\d+(?:[,.]\d+)?\s*$/;


/**
 * Manages definition of a value range.
 */
export default class Range {
	/**
	 * @param {string} definition definition of a range
	 */
	constructor( definition ) {
		let lower = -Infinity;
		let lowerInclusive = true;
		let upper = Infinity;
		let upperInclusive = true;
		let granularity = 1;

		if ( Array.isArray( definition ) ) {
			switch ( definition.length ) {
				case 1 :
					if ( ptnNumber.test( definition[0] ) ) {
						lower = parseFloat( definition[0] );
					} else {
						throw new TypeError( "invalid lower boundary in definition of range" );
					}
					break;

				case 2 :
					if ( definition[0] == null && definition[1] == null ) {
						throw new TypeError( "invalid range definition" );
					}

					if ( definition[0] != null ) {
						if ( ptnNumber.test( definition[0] ) ) {
							lower = parseFloat( definition[0] );
						} else {
							throw new TypeError( "invalid lower boundary in definition of range" );
						}
					}

					if ( definition[1] != null ) {
						if ( ptnNumber.test( definition[1] ) ) {
							upper = parseFloat( definition[1] );
						} else {
							throw new TypeError( "invalid upper boundary in definition of range" );
						}
					}
					break;

				default :
					throw new TypeError( "invalid range definition" );
			}
		} else if ( typeof definition === "string" ) {
			let parsed = ptnSimpleRange.exec( definition );
			if ( parsed && ( parsed[1] != null || parsed[2] != null || parsed[3] != null ) ) {
				if ( parsed[1] ) {
					lower = parseFloat( parsed[1].replace( /,/, "." ) );
				}

				if ( parsed[2] ) {
					upper = parseFloat( parsed[2].replace( /,/, "." ) );
				}

				if ( parsed[3] ) {
					granularity = parseFloat( parsed[3].replace( /,/, "." ) );
				}
			} else {
				parsed = ptnComplexRange.exec( definition );
				if ( parsed && ( parsed[2] != null || parsed[3] != null || parsed[5] != null ) ) {
					if ( parsed[1] ) {
						lowerInclusive = parsed[1] === "[";
					}

					if ( parsed[2] ) {
						lower = parseFloat( parsed[2].replace( /,/, "." ) );
					}

					if ( parsed[3] ) {
						upper = parseFloat( parsed[3].replace( /,/, "." ) );
					}

					if ( parsed[4] ) {
						upperInclusive = parsed[1] === "]";
					}

					if ( parsed[5] ) {
						granularity = parseFloat( parsed[5].replace( /,/, "." ) );
					}
				} else {
					throw new TypeError( "invalid range definition" );
				}
			}
		} else if ( definition != null ) {
			throw new TypeError( "invalid range definition" );
		}


		if ( upper < lower ) {
			[ upper, lower ] = [ lower, upper ];
		}


		Object.defineProperties( this, {
			/**
			 * Exposes lower boundary of defined range.
			 *
			 * @name Range#lower
			 * @property [Number}
			 * @readonly
			 */
			lower: { value: lower },

			/**
			 * Marks if lower boundary is inclusive part of defined range.
			 *
			 * @name Range#lowerInclusive
			 * @property [boolean}
			 * @readonly
			 */
			lowerInclusive: { value: lowerInclusive },

			/**
			 * Exposes upper boundary of defined range.
			 *
			 * @name Range#upper
			 * @property [Number}
			 * @readonly
			 */
			upper: { value: upper },

			/**
			 * Marks if upper boundary is inclusive part of defined range.
			 *
			 * @name Range#upperInclusive
			 * @property [boolean}
			 * @readonly
			 */
			upperInclusive: { value: upperInclusive },

			/**
			 * Exposes defined granularity of valid values in defined range.
			 *
			 * @name Range#granularity
			 * @property [Number}
			 * @readonly
			 */
			granularity: { value: granularity },
		} );
	}

	/**
	 * Fixes provided value to be locked to defined granularity of range.
	 *
	 * @param {number} value locks provided value to nearest value matching defined granularity of range
	 * @returns {number} value locked to granularity
	 */
	granularize( value ) {
		const reference = this.lower > -Infinity ? this.lower : 0;

		return reference + ( Math.round( ( value - reference ) / this.granularity ) * this.granularity );
	}

	/**
	 * Detects if provided value is below defined range.
	 *
	 * @param {number} value value to be tested
	 * @returns {boolean} true if value is below defined range
	 */
	isBelowRange( value ) {
		return this.lowerInclusive ? value < this.lower : value <= this.lower;
	}

	/**
	 * Detects if provided value is above defined range.
	 *
	 * @param {number} value value to be tested
	 * @returns {boolean} true if value is above defined range
	 */
	isAboveRange( value ) {
		return this.upperInclusive ? value > this.upper : value >= this.upper;
	}
}
