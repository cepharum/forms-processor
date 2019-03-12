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

const SegmentPatterns = {
	m: /^([1-9]|0[1-9]|1[0-2])$/,
	mm: /^(0[1-9]|1[0-2])$/,
	d: /^([1-9]|0[1-9]|[1-2]\d|3[0-1])$/,
	dd: /^(0[1-9]|[1-2]\d|3[0-1])$/,
	yy: /^\d{2}$/,
	yyyy: /^\d{4}$/,
};

const PartialSegmentPatterns = {
	m: /^(\d?|0[1-9]|1[0-2])$/,
	mm: /^([0-1]?|0[1-9]|1[0-2])$/,
	d: /^(\d?|0[1-9]|[1-2]\d|3[0-1])$/,
	dd: /^([0-3]?|0[1-9]|[1-2]\d|3[0-1])$/,
	yy: /^(\d{0,2})$/,
	yyyy: /^\d{0,4}$/,
};

const FormatTypeToProperty = {
	m: "month",
	mm: "month",
	d: "day",
	dd: "day",
	yy: "year",
	yyyy: "year",
};

const DefaultBusinessDays = {
	1: true,
	2: true,
	3: true,
	4: true,
	5: true,
};

const DefaultHolidays = [];



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
			 * Indicates if instance provides incomplete date information.
			 *
			 * @name PartialDate#isIncompleteDate
			 * @property boolean
			 * @readonly
			 */
			isIncompleteDate: {
				get: () => isNaN( this._date ) || isNaN( this._month ) || isNaN( this._year ),
			},

			/**
			 * Indicates if instance provides incomplete date of time information.
			 *
			 * @name PartialDate#isIncompleteTimeOfDay
			 * @property boolean
			 * @readonly
			 */
			isIncompleteTimeOfDay: {
				get: () => isNaN( this._hours ) || isNaN( this._minutes ) || isNaN( this._seconds ),
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

	/**
	 * Detects if provided date describes same day as current instance obeying
	 * either date probably providing incomplete information limiting comparison
	 * to existing information.
	 *
	 * @param {Date} date date to compare current one with
	 * @return {boolean} true if both dates describe same day w/o obeying missing information in either date
	 */
	isSameDay( date ) {
		if ( !date || !( date instanceof Date ) ) {
			return false;
		}

		let y, m, d;

		if ( date instanceof PartialDate ) {
			y = date._year;
			m = date._month;
			d = date._date;
		} else {
			y = date.getFullYear();
			m = date.getMonth();
			d = date.getDate();
		}

		if ( !isNaN( this._year ) && !isNaN( y ) && this._year !== y ) {
			return false;
		}

		if ( !isNaN( this._month ) && !isNaN( m ) && this._month !== m ) {
			return false;
		}

		return isNaN( this._date ) || isNaN( d ) || this._date === d;
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
	 * Adds formats and caches corresponding DateNormalizer and DateValidator.
	 *
	 * @param{string[]|string} format single or array of dateFormats for example: yyyy-mm-dd
	 * @returns {this} fluent interface
	 */
	addFormat( format ) {
		const _formats = Array.isArray( format ) ? format : [format];
		const numFormats = _formats.length;

		for ( let index = 0; index < numFormats; index++ ) {
			const _format = _formats[index];

			if ( typeof _format === "string" && _format && !this.normalizer[_format] ) {
				this.format.push( _format );
				this.normalizer[_format] = new DateNormalizer( _format );
			}
		}

		return this;
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

		const formats = this.format;
		const numFormats = formats.length;
		let firstError = null;
		let bestIncompleteDate = null;

		for ( let i = 0, l = numFormats; i < l; i++ ) {
			const _format = formats[i];

			try {
				const date = this.normalizer[_format].normalize( input, options );
				if ( date ) {
					if ( !date.isIncompleteDate ) {
						return date;
					}

					if ( !bestIncompleteDate ) {
						bestIncompleteDate = date;
					}
				}
			} catch ( error ) {
				if ( !firstError ) {
					firstError = error;
				}
			}
		}

		if ( bestIncompleteDate ) {
			return bestIncompleteDate;
		}

		throw firstError;
	}

	/**
	 * Normalizes a date for given format.
	 *
	 * @param{Date} input date to validate for given format
	 * @param{object} options refers to object selecting optional customizations to date checking
	 * @returns {FormatCheckResult} validated textual input or list of errors if checking failed
	 */
	validate( input, options ) {
		return DateValidator.validate( input, options );
	}

	/**
	 * Parses provided input value for definition of business days.
	 *
	 * @param {string|string[]|int|int[]} input one or more days of week each selected by its index or its abbreviated English name
	 * @returns {object<int,boolean>} maps indices of found week days into boolean `true`
	 */
	static parseBusinessDays( input ) {
		const _days = Array.isArray( input ) ? input : [input];
		const numDays = _days.length;
		const parsed = {};
		const map = {
			sun: 0,
			mon: 1,
			tue: 2,
			wed: 3,
			thu: 4,
			fri: 5,
			sat: 6
		};

		for ( let i = 0; i < numDays; i++ ) {
			const _day = _days[i];

			const range = /^(?:([0-6])|([sunmotewdhfria]+))\s*-\s*(?:([0-6])|([sunmotewdhfria]+))$/i.exec( _day );
			if ( range ) {
				const from = range[1] ? parseInt( range[1] ) : map[range[2]];
				const thru = range[3] ? parseInt( range[3] ) : map[range[4]];

				if ( from > -1 && thru > -1 ) {
					for ( let j = Math.min( from, thru ); j <= Math.max( from, thru ); j++ ) {
						parsed[j] = true;
					}
				}
			} else {
				const index = parseInt( _day );
				if ( isNaN( index ) ) {
					const name = String( _day ).trim().toLowerCase();
					const mapped = map[name];

					if ( mapped != null ) {
						parsed[mapped] = true;
					}
				} else if ( index > -1 && index < 7 ) {
					parsed[index] = true;
				}
			}
		}

		return parsed;
	}

	/**
	 * Parses provided input value for definition of one or more holidays.
	 *
	 * @param {string|string[]|Date|Date[]} input one or more descriptions of (recurring) holidays
	 * @returns {PartialDate[]} maps indices of found week days into boolean `true`
	 */
	static parseHolidays( input ) {
		const _holidays = Array.isArray( input ) ? input : [input];
		const numHolidays = _holidays.length;
		const parsed = [];
		let write = 0;

		for ( let i = 0; i < numHolidays; i++ ) {
			const source = _holidays[i];
			if ( source instanceof Date ) {
				parsed[write++] = source;
				continue;
			}

			const match = /^(?:(\d{4})-)?(\d{2})-(\d{2})$/.exec( source );
			if ( match ) {
				const holiday = new PartialDate();

				if ( match[1] ) {
					holiday.setFullYear( match[1] );
				}

				holiday.setMonth( parseInt( match[2] ) - 1 );
				holiday.setDate( parseInt( match[3] ) );

				parsed[write++] = holiday;
			}
		}

		parsed.splice( write );

		return parsed;
	}

	/**
	 * Converts description of a date into according instance of Date.
	 *
	 * This method supports several input values for selecting/describing a date:
	 *
	 *  - Any provided instance of `Date` is returned as is.
	 *  - `now`, `today`, `tomorrow` and `yesterday` select either day accordingly.
	 *  - Strings describing timestamps supported by `Date.parse()` are supported.
	 *  - Providing number of seconds since Unix Epoch is supported.
	 *  - Relative distances to current date can be provided as string:
	 *    - Syntax is `+xu` or `-xu` or just `xu` with `x` being sequence of digits and `u` being unit.
	 *    - Supported units are:
	 *      - `d` for days (which is default when omitting unit)
	 *      - `w` for weeks
	 *      - `m` for months
	 *      - `y` for years
	 *    - In addition special units are supported:
	 *      - `bom` selects first day of month that would be selected when using unit `m`
	 *      - `eom` selects last day of month that would be selected when using unit `m`
	 *      - `boy` selects first day of year that would be selected when using unit `y`
	 *      - `eoy` selects last day of year that would be selected when using unit `y`
	 *      - `bd` selects _business days_ obeying provided set of weekdays considered business days and a list of holidays
	 *        - Use `DateProcessor.parseBusinessDays()` to prepare list of weekdays considered business days.
	 *        - Use `DateProcessor.parseHolidays()` to prepare list of holidays.
	 *  - All names and units are supported case-insensitively.
	 *
	 * @param {string|Date} selector description of a date
	 * @param {object<int,boolean>} businessDays map of permitted weekdays into boolean `true` for calculating relative business days
	 * @param {Date[]} holidays list of allowed dates
	 * @return {Date} instance of Date matching date described by provided selector
	 */
	static normalizeSelector( selector, { businessDays = DefaultBusinessDays, holidays = DefaultHolidays } = {} ) {
		if ( selector instanceof Date ) {
			return selector;
		}


		const now = new PartialDate();
		const _selector = selector == null ? null : String( selector ).toLowerCase();

		switch ( _selector ) {
			case "now" :
			case "today" :
				return now;

			case "tomorrow" :
				return new Date( now.getTime() + 86400000 );

			case "yesterday" :
				return new Date( now.getTime() - 86400000 );
		}


		const relative = /^([+-])?\s*?(\d+)\s*(d|m|y|bom|eom|boy|eoy|bd)?/.exec( _selector );
		if ( !relative ) {
			// does not look like relative description of a  date
			// -> try parsing as some actual date string
			const date = Date.parse( selector );
			if ( isNaN( date ) ) {
				throw new Error( "Invalid description of date." );
			}

			return date;
		}


		const [ , sign = "+", amount, unit ] = relative;

		if ( amount.length > 6 && unit == null ) {
			// got integer value considered number of seconds since Unix Epoch
			return new Date( parseInt( amount ) * 1000 );
		}


		let value = parseInt( `${sign}${amount}` );

		switch ( unit ) {
			case "d" :
			default :
				now.setDate( now.getDate() + value );
				return now;

			case "w" :
				now.setDate( now.getDate() + ( value * 7 ) );
				return now;

			case "m" :
				now.setMonth( now.getMonth() + value );
				return now;

			case "bom" :
				// choose first day of selected month
				now.setMonth( now.getMonth() + value );
				now.setDate( 1 );
				return now;

			case "eom" :
				// choose last day of selected month
				now.setMonth( now.getMonth() + value );
				now.setMonth( now.getMonth() + 1 );
				now.setDate( 0 );
				return now;

			case "y" :
				now.setFullYear( now.getFullYear() + value );
				return now;

			case "boy" :
				// choose first day of selected year
				now.setFullYear( now.getFullYear() + value );
				now.setMonth( 0 );
				now.setDate( 1 );
				return now;

			case "eoy" :
				// choose last day of selected year
				now.setFullYear( now.getFullYear() + value );
				now.setMonth( 11 );
				now.setDate( 31 );
				return now;

			case "bd" : {
				// iterate over dates looking for some business day with provided distance
				const step = value < 0 ? -1 : 1;
				const numHolidays = holidays.length;

				while ( value !== 0 ) {
					now.setDate( now.getDate() + step );

					if ( businessDays[now.getDay()] ) {
						let isHoliday = false;

						for ( let i = 0; i < numHolidays; i++ ) {
							if ( now.isSameDay( holidays[i] ) ) {
								isHoliday = true;
								break;
							}
						}

						if ( !isHoliday ) {
							value -= step;
						}
					}
				}

				return now;
			}
		}
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
			throw new Error( "Date format descriptor does not consist of up to three parts." );
		}

		const patterns = {};

		const identifiers = parts.map( part => {
			const _part = part.toLowerCase();
			const key = FormatTypeToProperty[_part];
			const regExp = {
				regular: SegmentPatterns[_part],
				acceptPartial: PartialSegmentPatterns[_part],
			};

			if ( !key || !regExp.regular || !regExp.acceptPartial ) {
				throw new TypeError( "invalid element in provided format pattern" );
			}

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

		const date = new PartialDate();

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
	 * Extracts the separator from a given format.
	 *
	 * @param{string} format string in the date format
	 * @return {string} separator of the identifier in a date format;
	 */
	static extractSeparator( format ) {
		let separator = false;

		for ( let index = 0, length = format.length; index < length; index++ ) {
			const char = format.charAt( index );

			if ( !isIdentifier( char ) ) {
				if ( separator && char !== separator ) {
					throw new Error( "Date format definition uses multiple different separators." );
				}

				separator = char;
			}
		}

		if ( separator ) {
			return separator;
		}

		throw new Error( "Date format does not contain any separator." );
	}
}


/**
 * provides the utility to parse a Date for a given Format
 */
export class DateValidator {
	/**
	 * Checks if a given date complies with an optional set of conditions.
	 *
	 * @param {DateInput} input date to validate
	 * @param {DateInput} minDate minimal Date
	 * @param {DateInput} maxDate maximal Date
	 * @param {object<int,boolean>} businessDays numeric values of the allowed weekdays
	 * @param {Date[]} holidays numeric values of the allowed weekdays
	 * @returns {FormatCheckResult} validated textual input or list of errors if checking failed
	 */
	static validate( input, { minDate = null, maxDate = null, businessDays = null, holidays = null } = {} ) {
		if ( typeof input !== "string" && !( input instanceof Date ) ) {
			throw new TypeError( "Input needs to be a Date or a string containing parsable date." );
		}

		const inputDate = new PartialDate( input );


		if ( minDate ) {
			let date = minDate;

			if ( typeof minDate === "string" ) {
				date = new Date( date );
			}
			if ( !( date instanceof Date ) ) {
				throw new TypeError( "minDate needs to be a Date or a parsable dateString" );
			}
			if ( Math.floor( inputDate.getTime() / 8.64e+7 ) < Math.floor( date.getTime() / 8.64e+7 ) ) {
				throw new Error( "Selected day is beyond earliest permitted day." );
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
				throw new Error( "Selected day is beyond latest permitted day." );
			}
		}

		if ( businessDays && !businessDays[inputDate.getDay()] ) {
			throw new Error( "Selected day of week is not a business day." );
		}

		if ( holidays ) {
			for ( let length = holidays.length, index = 0; index < length; index++ ) {
				if ( inputDate.isSameDay( holidays[index] ) ) {
					throw new Error( "Selected day is a holiday." );
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
