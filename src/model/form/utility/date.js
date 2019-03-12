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

import Range from "./range";

/**
 * @typedef {String} DateString String that is parsable with new Date(DateString)
 * @typedef {Date|DateString} DateInput
 */

/**
 * Implements representation of date/time supporting partially available
 * information.
 */
export class PartialDate extends Date {
	/** @inheritDoc */
	constructor( ...args ) {
		super( ...args );

		if ( args.length > 0 ) {
			this._year = this.getFullYear();
			this._month = this.getMonth();
			this._date = this.getDate();
			this._hours = this.getHours();
			this._minutes = this.getMinutes();
			this._seconds = this.getSeconds();
		} else {
			this._year = this._month = this._date = this._hours = this._minutes = this._seconds = NaN;
		}

		Object.defineProperties( this, {
			/**
			 * Indicates if instance provides complete date information.
			 *
			 * @name PartialDate#isCompleteDate
			 * @property boolean
			 * @readonly
			 */
			isCompleteDate: {
				get: () => !( isNaN( this._date ) || isNaN( this._month ) || isNaN( this._year ) ),
			},

			/**
			 * Indicates if instance provides complete date of time information.
			 *
			 * @name PartialDate#isCompleteTimeOfDay
			 * @property boolean
			 * @readonly
			 */
			isCompleteTimeOfDay: {
				get: () => !( isNaN( this._hours ) || isNaN( this._minutes ) || isNaN( this._seconds ) ),
			},
		} );
	}

	/** @inheritDoc */
	setFullYear( ...args ) {
		const result = super.setFullYear( ...args );

		this._year = this.getFullYear();

		if ( args.length > 1 ) {
			this._month = this.getMonth();
		}

		if ( args.length > 2 ) {
			this._date = this.getDate();
		}

		return result;
	}

	/** @inheritDoc */
	setMonth( ...args ) {
		const result = super.setMonth( ...args );

		this._month = this.getMonth();

		if ( args.length > 1 ) {
			this._date = this.getDate();
		}

		return result;
	}

	/** @inheritDoc */
	setDate( ...args ) {
		const result = super.setDate( ...args );

		this._date = this.getDate();

		return result;
	}

	/** @inheritDoc */
	setHours( ...args ) {
		const result = super.setHours( ...args );

		this._hours = this.getHours();

		if ( args.length > 1 ) {
			this._minutes = this.getMinutes();
		}

		if ( args.length > 2 ) {
			this._seconds = this.getSeconds();
		}

		return result;
	}

	/** @inheritDoc */
	setMinutes( ...args ) {
		const result = super.setMinutes( ...args );

		this._minutes = this.getMinutes();

		if ( args.length > 1 ) {
			this._seconds = this.getSeconds();
		}

		return result;
	}

	/** @inheritDoc */
	setSeconds( ...args ) {
		const result = super.setSeconds( ...args );

		this._seconds = this.getSeconds();

		return result;
	}
}

/**
 * Implements format validators checking whether some provided textual input is
 * complying with a certain format.
 *
 * In difference to patterns this validation includes checking value ranges etc.
 * Format checkers may succeed on partial input on demand, too.
 */
export class DateProcessor {
	/**
	 * @param{string[]|string} format single or array of dateFormats for example: yyyy-mm-dd
	 */
	constructor( format = "yyyy-mm-dd" ) {
		this.normalizer = {};
		this.format = [];

		this.addFormat( format );
	}

	/**
	 * adds formats and caches corresponding DateNormalizer and DateValidator
	 * @param{string[]|string} format single or array of dateFormats for example: yyyy-mm-dd
	 * @returns {void}
	 */
	addFormat( format ) {
		let input = format;
		if ( typeof input === "string" ) {
			input = [input];
		}

		if ( Array.isArray( input ) ) {
			for ( let index = 0, length = input.length; index < length; index++ ) {
				const formatString = input[index];

				if ( !this.normalizer[formatString] ) {
					this.format.push( formatString );
					this.normalizer[formatString] = new DateNormalizer( formatString );
				}
			}
		}
	}

	/**
	 * Normalizes provided date information.
	 *
	 * @param{string} input date to validate for given format
	 * @param{object} options refers to object selecting optional customizations to date checking
	 * @returns {FormatCheckResult} validated textual input or list of errors if checking failed
	 */
	normalize( input, options = {} ) {
		const { format } = options;
		if ( format ) {
			this.addFormat( format );
		}

		let normalized = false;
		const errors = [];

		for ( let i = 0, l = this.format.length; i < l; i++ ) {
			const formatString = this.format[i];
			const normalizer = this.normalizer[formatString];

			try {
				normalized = normalizer.normalize( input, options );
			} catch ( e ) {
				errors.push( e );
			}
		}

		if ( normalized ) {
			return normalized;
		}

		throw new Error( errors );
	}

	/**
	 * normalize a date for given format
	 * @param{Date} input date to validate for given format
	 * @param{object} options refers to object selecting optional customizations to date checking
	 * @returns {FormatCheckResult} validated textual input or list of errors if checking failed
	 */
	validate( input, options ) {
		DateValidator.validate( input, options );
	}

	/**
	 * normalizes a selector to a Date
	 * @param{string} selector Date selector
	 * @param {DateInput[]} allowedWeekdays list of allowed weekDays
	 * @param {DateInput[]} notAllowedDates list of allowed dates
	 * @return {Date} normalized Date
	 */
	static normalizeSelector( selector, { allowedWeekdays = [ 1, 2, 3, 4, 5 ], notAllowedDates = [] } = {} ) {
		const date = new Date();
		if ( selector.toLowerCase() === "now" || selector.toLowerCase() === "today" ) {
			return date;
		}
		if ( /^-[0-9]+$/.test( selector ) ) {
			const offset = Number( selector.replace( "-", "" ) );
			date.setDate( date.getDate() - offset );
			return date;
		}

		if ( /^\+[0-9]+$/.test( selector ) ) {
			const offset = Number( selector.replace( "+", "" ) );
			date.setDate( date.getDate() + offset );
			return date;
		}
		if ( /^-[0-9]+M$/.test( selector ) ) {
			const offset = Number( selector.replace( "-", "" ).replace( "M", "" ) );
			date.setMonth( date.getMonth() - offset );
			date.setDate( 0 );
			return date;
		}
		if ( /^\+[0-9]+M$/.test( selector ) ) {
			const offset = Number( selector.replace( "+", "" ).replace( "M", "" ) );
			date.setMonth( date.getMonth() + offset );
			date.setDate( 0 );
			return date;
		}
		if ( /^-[0-9]+Y$/.test( selector ) ) {
			const offset = Number( selector.replace( "-", "" ).replace( "Y", "" ) );
			date.setFullYear( date.getFullYear() - offset );
			date.setDate( 0 );
			return date;
		}
		if ( /^\+[0-9]+Y$/.test( selector ) ) {
			const offset = Number( selector.replace( "+", "" ).replace( "Y", "" ) );
			date.setFullYear( date.getFullYear() + offset );
			date.setDate( 0 );
			return date;
		}
		if ( /^-[0-9]+BD$/.test( selector ) ) {
			const offset = Number( selector.replace( "-", "" ).replace( "BD", "" ) );
			let found = 0;

			while ( found < offset ) {
				date.setDate( date.getDate() - 1 );
				try {
					DateValidator.validate( date, { allowedWeekdays, notAllowedDates } );
					found++;
					// eslint-disable-next-line no-empty
				} catch ( e ) {}
			}
			return date;
		}
		if ( /^\+[0-9]+BD$/.test( selector ) ) {
			const offset = Number( selector.replace( "+", "" ).replace( "BD", "" ) );
			let found = 0;

			while ( found < offset ) {
				date.setDate( date.getDate() + 1 );
				try {
					DateValidator.validate( date, { allowedWeekdays, notAllowedDates } );
					found++;
					// eslint-disable-next-line no-empty
				} catch ( e ) {}
			}
			return date;
		}
		throw new Error( "Selector does not match" );
	}
}


/**
 *  provides the utility to parse a Date for a given Format
 */
export class DateNormalizer {
	/**
	 * @param{string} initialFormat format that date should be parsed for
	 */
	constructor( initialFormat = "yyyy-mm-dd" ) {
		const format = initialFormat.toLowerCase();
		const separator = DateNormalizer.extractSeparator( format );
		const parts = format.split( separator );
		if ( parts.length > 3 ) {
			throw new Error( "This normalizer that consist of under 4 parts" );
		}
		const patterns = {};

		const identifiers = parts.map( part => {
			const key = this.getKeyForIdentifier( part );
			const regExp = {
				regular: this.getRegExpForIdentifier( part, false ),
				acceptPartial: this.getRegExpForIdentifier( part, true ),
			};
			patterns[key] = regExp;
			return {
				regExp,
				value: part,
				key,
			};
		} );

		const length = identifiers.length;
		const acceptPartialArray = new Array( length * 2 );
		for ( let identifierIndex = 0; identifierIndex < length; identifierIndex++ ) {
			const partialArray = new Array( identifierIndex + 1 );

			for ( let partialIndex = 0; partialIndex <= identifierIndex; partialIndex++ ) {
				const partialIdentifier = identifiers[partialIndex];

				if ( partialIndex < identifierIndex ) {
					partialArray[partialIndex] = partialIdentifier.regExp.regular.source.slice( 1, -1 );
				} else {
					const writeIndex = identifierIndex * 2;
					partialArray[partialIndex] = partialIdentifier.regExp.acceptPartial.source.slice( 1, -1 );
					acceptPartialArray[writeIndex] = partialArray.join( "\\" + separator );
					partialArray[partialIndex] = partialIdentifier.regExp.regular.source.slice( 1, -1 );
					acceptPartialArray[writeIndex + 1] = partialArray.join( "\\" + separator ) + "\\" + separator + "?";
				}
			}
		}

		patterns.complete = {
			regular: new RegExp( "^" + identifiers.map( identifier => `(${identifier.regExp.regular.source.replace( "^", "" ).replace( "$", "" )})` ).join( separator ) + "$" ),
			acceptPartial: new RegExp( "^(" + acceptPartialArray.join( "|" ) + ")$" ),
		};


		this.separator = separator;
		this.identifiers = identifiers;
		this.format = format;
		this.patterns = patterns;
	}


	/**
	 * normalizes input that is in the given format to Date
	 * @param{string} input input that obeys the given format
	 * @param{boolean} acceptPartial set true to accept partial input
	 * @param{number} yearBuffer if "yy" is the year format, this is added to current year to decide which century to use
	 * @returns {Date} parsed date
	 */
	normalize( input = "", { acceptPartial = false, yearBuffer = 0 } = {} ) {
		const preparedInput = input;
		const parts = preparedInput.split( this.separator );
		const { complete } = this.patterns;
		const isValid = complete.acceptPartial.test( preparedInput );

		if ( !isValid ) {
			throw new Error( "invalid input provided" );
		}

		const isParsable = complete.regular.test( preparedInput );

		if ( !acceptPartial && !isParsable ) {
			throw new Error( "input is not complete" );
		}

		const date = new Date;
		if ( ( acceptPartial && isValid ) || isParsable ) {
			for ( let index = 0, length = parts.length; index < length; index++ ) {
				const part = parts[index];
				const identifier = this.identifiers[index];
				switch ( identifier.key ) {
					case "day" :
						date.setDate( Number( part ) );
						break;
					case "month" :
						date.setMonth( Number( part ) - 1 );
						break;
					case "year" :
						switch ( identifier.value ) {
							case "yy" : {
								const currentYear = date.getFullYear();
								const upperLimit = currentYear + yearBuffer;
								const lastTwoDigits = upperLimit % 100;
								const overFlow = upperLimit - lastTwoDigits;
								const year = Number( part );
								if ( lastTwoDigits >= year ) {
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
		}
		return date;
	}

	/**
	 * exracts the separator for a given format
	 * @param{string} format string in the date format
	 * @return {string} separator of the identifier in a date format;
	 */
	static extractSeparator( format ) {
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
		if ( !separator ) {
			throw new Error( "invalid format provided" );
		}
		return separator;
	}

	/**
	 *
	 * @param{string} string string that should be parsed
	 * @param{boolean} acceptPartial if the returned regEx should accept partial String
	 * @return {RegExp} RegExp that returns a RegEx
	 */
	getRegExpForIdentifier( string, acceptPartial = true ) {
		switch ( string.toLowerCase() ) {
			case "m" :
				if ( acceptPartial ) {
					return /^(\d?|0[1-9]|1[0-2])$/;
				}
				return /^([1-9]|0[1-9]|1[0-2])$/;
			case "mm" :
				if ( acceptPartial ) {
					return /^([0-1]?|0[1-9]|1[0-2])$/;
				}
				return /^(0[1-9]|1[0-2])$/;
			case "d" :
				if ( acceptPartial ) {
					return /^(\d?|0[1-9]|[1-2]\d|3[0-1])$/;
				}
				return /^([1-9]|0[1-9]|[1-2]\d|3[0-1])$/;
			case "dd" :
				if ( acceptPartial ) {
					return /^([0-3]?|0[1-9]|[1-2]\d|3[0-1])$/;
				}
				return /^(0[1-9]|[1-2]\d|3[0-1])$/;
			case "yy" :
				if ( acceptPartial ) {
					return /^(\d{0,2})$/;
				}
				return /^\d{2}$/;
			case "yyyy" :
				if ( acceptPartial ) {
					return /^\d{0,4}$/;
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
	getKeyForIdentifier( string ) {
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
}


/**
 * provides the utility to parse a Date for a given Format
 */
export class DateValidator {
	/**
	 * valide a given date
	 * @param {DateInput} input date to validate
	 * @param {object} options refers to object selecting optional customizations to date checking
	 * @param {DateInput} minDate minimal Date
	 * @param {DateInput} maxDate maximal Date
	 * @param {number[]} allowedWeekdays numeric values of the allowed weekdays
	 * @param {DateInput[]} notAllowedDates numeric values of the allowed weekdays
	 * @returns {FormatCheckResult} validated textual input or list of errors if checking failed
	 */
	static validate( input, { minDate, maxDate, allowedWeekdays, notAllowedDates } = {} ) {
		let inputDate = input;

		if ( typeof inputDate === "string" ) {
			inputDate = new Date( inputDate );
		}
		if ( !( inputDate instanceof Date ) ) {
			throw new TypeError( "Input needs to be a Date or a parsable dateString" );
		}

		if ( minDate ) {
			let date = minDate;

			if ( typeof minDate === "string" ) {
				date = new Date( date );
			}
			if ( !( date instanceof Date ) ) {
				throw new TypeError( "minDate needs to be a Date or a parsable dateString" );
			}
			if ( Math.floor( inputDate.getTime() / 8.64e+7 ) < Math.floor( date.getTime() / 8.64e+7 ) ) {
				throw new Error( "input does not satisfy minDate" );
			}
		}

		if ( maxDate ) {
			let date = maxDate;

			if ( typeof maxDate === "string" ) {
				date = new Date( date );
			}
			if ( !( date instanceof Date ) ) {
				throw new TypeError( "maxDate needs to be a Date or a parsable dateString" );
			}
			if ( Math.floor( inputDate.getTime() / 8.64e+7 ) > Math.floor( date.getTime() / 8.64e+7 ) ) {
				throw new Error( "input does not satisfy maxDate" );
			}
		}

		if ( allowedWeekdays ) {
			const weekday = inputDate.getDay();
			if ( allowedWeekdays instanceof Array && allowedWeekdays.length ) {
				let isOk = false;

				for ( let length = allowedWeekdays.length, index = 0; index < length; index++ ) {
					try {
						DateValidator.checkWeekday( weekday, allowedWeekdays[index] );
						isOk = true;
						// eslint-disable-next-line no-empty
					} catch ( e ) {}
				}
				if ( !isOk ) {
					throw new Error( "this weekday is not allowed" );
				}
			}
			DateValidator.checkWeekday( weekday, allowedWeekdays );
		}

		if ( notAllowedDates ) {
			for ( let length = notAllowedDates.length, index = 0; index < length; index++ ) {
				let date = notAllowedDates[index];

				if ( typeof date === "string" ) {
					date = new Date( date );
				}
				if ( !( date instanceof Date ) ) {
					throw new Error( "each entry of notAllowedDates must be a Date or a parsable dateString" );
				}
				if ( Math.floor( inputDate.getTime() / 8.64e+7 ) === Math.floor( date.getTime() / 8.64e+7 ) ) {
					throw new Error( "this date is not allowed" );
				}
			}
		}
	}

	/**
	 * validates a single weekday against a selector
	 * @param{Number} weekday the integer presentation of a weekday
	 * @param{Range|Number} selector selector that describes the limit of an allowed weekday
	 * @returns {void}
	 */
	static checkWeekday( weekday, selector ) {
		if ( typeof selector === "string" ) {
			const range = new Range( selector );
			if ( range.isAboveRange( weekday ) || range.isBelowRange( weekday ) ) {
				throw new Error( "this weekday is not allowed" );
			}
		}
		if ( typeof selector === "number" ) {
			if ( selector !== weekday ) {
				throw new Error( "this weekday is not allowed" );
			}
		}
	}
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
