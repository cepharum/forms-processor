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
 * Implements format validators checking whether some provided textual input is
 * complying with a certain format.
 *
 * In difference to patterns this validation includes checking value ranges etc.
 * Format checkers may succeed on partial input on demand, too.
 */
export default class DateProcessor {
	/**
	 * validate a date for given format
	 * @param{string} input date to validate for given format
	 * @param{string} format format to validate against
	 * @param{boolean} acceptPartial set true to accept partial input
	 * @param{object} options refers to object selecting optional customizations to date checking
	 * @returns {FormatCheckResult} validated textual input or list of errors if checking failed
	 */
	static normalize( input, format = "yyyy-mm-dd", acceptPartial = false, options = {} ) {
		const Normalizer = new DateNormalizer( format, acceptPartial );
		return {
			output: Normalizer.normalize( input, options ),
		};
	}
}

/**
 *  provides the utility to parse a Date for a given Format
 */
export class DateNormalizer {
	/**
	 * @param{string} format format that date should be parsed for
	 * @param{boolean} acceptPartial set true to accept partial input
	 */
	constructor( format = "yyyy-mm-dd", acceptPartial ) {
		const keys = [];
		const separator = extractSeparator( format );

		const identifiers = format.split( separator );

		const formatParser = identifiers.map( identifier => {
			keys.push( getKeyForIdentifier( identifier ) );
			return getRegExpForIdentifier( identifier, acceptPartial );
		} );

		const patterns = {};
		for ( let index = 0, length = keys.length; index < length; index++ ) {
			patterns[keys[index]] = formatParser[index];
		}
		patterns.complete = new RegExp( "^" + formatParser.map( RegExp => `(${RegExp.source.replace( "^","" ).replace( "$", "" )})` ).join( separator ) + "$" );

		Object.assign( this, {
			separator,
			keys,
			identifiers,
			format,
			patterns,
		} );
	}

	/**
	 * normalizes input that is in the given format to Date
	 * @param{string} input input that obeys the given format
	 * @param{number} yearBuffer if "yy" is the year format, this is added to current year to decide which century to use
	 * @returns {Date} parsed date
	 */
	normalize( input, { yearBuffer = 0 } ) {
		const parts = input.split( this.separator );
		if( !this.patterns.complete.test( input ) ) {
			throw new TypeError( "date input does not match format" );
		}
		const date = new Date;
		for( let index = 0, length = parts.length; index < length; index++ ) {
			const key = this.keys[index];
			const part = parts[index];
			const identifier = this.identifiers[index];
			switch( key ) {
				case "day" :
					date.setDate( Number( part ) );
					break;
				case "month" :
					date.setMonth( Number( part ) - 1 );
					break;
				case "year" :
					switch( identifier ) {
						case "yy" : {
							const currentYear = date.getFullYear();
							const upperLimit = currentYear + yearBuffer;
							const lastTwoDigits = upperLimit % 100;
							const overFlow = upperLimit - lastTwoDigits;
							const year = Number( part );
							if( lastTwoDigits >= year ) {
								date.setFullYear( year + overFlow );
							} else {
								date.setFullYear( year + overFlow - 100 );
							}
							break;
						}
						case "yyyy" :
							date.setFullYear( Number( part ) );
							break;
						default :
							throw new TypeError( "invalid format detected" );
					}
					break;
				default :
					throw new TypeError( "invalid input detected" );
			}
		}
		return date;
	}
}

/**
 * exracts the seperator for a given format
 * @param{string} format string in the date format
 * @return {string} seperator of the identifier in a date format;
 */
function extractSeparator( format ) {
	/**
	 * @type {boolean|string}
	 */
	let separator = false;
	for ( let index = 0, length = format.length; index < length; index++ ) {
		const char = format.charAt( index );
		if ( !isIdentifier( char ) ) {
			if ( separator && char !== separator ) {
				throw new Error( "invalid format provided: separators not uniform" );
			} else {
				separator = char;
			}
		}
	}
	if( !separator ) {
		throw new Error( "invalid format provided" );
	}
	return separator;
}

/**
 * checkes if a char is a valid identifier
 * @param{string} char char to check
 * @return {boolean} true if char is valid
 */
function isIdentifier( char ) {
	const identifier = char.toLowerCase();
	return identifier === "y" || identifier === "m" || identifier === "d";
}

/**
 *
 * @param{string} string string that should be parsed
 * @param{boolean} acceptPartial if the returned regEx should accept partial String
 * @return {RegExp} RegExp that returns a RegEx
 */
function getRegExpForIdentifier( string, acceptPartial = true ) {
	switch ( string.toLowerCase() ) {
		case "m" :
			return /^\d|0\d|1[0-2]$/;
		case "mm" :
			if( acceptPartial ) {
				return getRegExpForIdentifier( "m" );
			}
			return /^0\d|1[0-2]$/;
		case "d" :
			return /^\d|[0-2]\d|3[0-1]$/;
		case "dd" :
			if( acceptPartial ) {
				return getRegExpForIdentifier( "d" );
			}
			return /^[0-2]\d|3[0-1]$/;
		case "yy" :
			if( acceptPartial ) {
				return /^\d|\d{1,2}$/;
			}
			return /^\d{2}$/;
		case "yyyy" :
			if( acceptPartial ) {
				return new RegExp( `^${getRegExpForIdentifier( "yy" ).source}|\\d{1,3}|\\d{1,4}$` );
			}
			return /^\d{4}$/;
		default :
			throw new Error( "unexpected date format identifier" );
	}
}

/**
 *
 * @param{string} string string that should be parsed
 * @return {String} Key of the identifier
 */
function getKeyForIdentifier( string ) {
	const identifier = string.toLowerCase();
	switch ( identifier ) {
		case "m" :
		case "mm" :
			return "month";
		case "d" :
		case "dd" :
			return "day";
		case "yy" :
		case "yyyy" :
			return "year";
		default :
			throw new Error( "unexpected date format identifier" );
	}
}
