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
 * Maps a country's code into the length of the country-specific IBAN format.
 *
 * @type {object<string,number>}
 */
const countryCodeMap = {
	EG: 27,
	AL: 28,
	DZ: 24,
	AD: 24,
	AO: 25,
	AZ: 28,
	BH: 22,
	BE: 16,
	BJ: 28,
	BA: 20,
	BR: 29,
	VG: 24,
	BG: 22,
	BF: 27,
	BI: 16,
	CR: 22,
	CI: 28,
	DK: 18,
	DE: 22,
	DO: 28,
	SV: 28,
	EE: 20,
	FO: 18,
	FI: 18,
	FR: 27,
	GA: 27,
	GE: 22,
	GI: 23,
	GR: 27,
	GL: 18,
	GT: 28,
	IQ: 23,
	IR: 26,
	IE: 22,
	IS: 26,
	IL: 23,
	IT: 27,
	JO: 30,
	CM: 27,
	CV: 25,
	KZ: 20,
	QA: 29,
	CG: 27,
	XK: 20,
	HR: 21,
	KW: 30,
	LV: 21,
	LB: 28,
	LI: 21,
	LT: 20,
	LU: 20,
	MG: 27,
	ML: 28,
	MT: 31,
	MR: 27,
	MU: 30,
	MK: 19,
	MD: 24,
	MC: 27,
	ME: 22,
	MZ: 25,
	NL: 18,
	NO: 15,
	AT: 20,
	TL: 23,
	PK: 24,
	PS: 29,
	PL: 28,
	PT: 25,
	RO: 24,
	SM: 27,
	ST: 25,
	SA: 24,
	SE: 24,
	CH: 21,
	SN: 28,
	RS: 22,
	SC: 31,
	SK: 24,
	SI: 19,
	ES: 24,
	LC: 32,
	CZ: 24,
	TN: 24,
	TR: 26,
	UA: 29,
	HU: 28,
	VA: 22,
	AE: 23,
	GB: 22,
	BY: 28,
	CY: 28,
	CF: 27,
};


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

		if ( fixedInput === "" ) {
			return { output: "" };
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

	/**
	 * Validates if input contains well-formed mail address.
	 *
	 * @param {string} input textual input to be validated
	 * @param {boolean} acceptPartial set true to accept partial input
	 * @param {object} options refers to object selecting optional customizations to format checking
	 * @returns {FormatCheckResult} validated textual input or list of errors if checking failed
	 */
	static mail( input, acceptPartial = false, options = {} ) { // eslint-disable-line no-unused-vars
		const fixedInput = String( input == null ? "" : input ).trim();

		if ( fixedInput === "" ) {
			return { output: "" };
		}

		if ( /^[.@+]|^[^@]*\+.*\+|^[^@]*\.\.|@.*@|\s|@.+\.\.|@\.|@.*[=%+]/.test( fixedInput ) ) {
			return {
				errors: ["@FORMATS.MAIL.INVALID_FORMAT"],
			};
		}

		if ( !acceptPartial ) {
			if ( !/^[^@=\s]+@(?:[^.=+%@\s]+\.)+[a-z]{2,32}$/.test( fixedInput ) ) {
				return {
					errors: ["@FORMATS.MAIL.INVALID_FORMAT"],
				};
			}
		}

		return {
			output: fixedInput,
		};
	}

	/**
	 * Validates if input contains well-formed phone number.
	 *
	 * @param {string} input textual input to be validated
	 * @param {boolean} acceptPartial set true to accept partial input
	 * @param {object} options refers to object selecting optional customizations to format checking
	 * @returns {FormatCheckResult} validated textual input or list of errors if checking failed
	 */
	static phone( input, acceptPartial = false, options = {} ) { // eslint-disable-line no-unused-vars
		const fixedInput = String( input == null ? "" : input ).replace( /\s+/g, "" );

		if ( fixedInput === "" ) {
			return { output: "" };
		}

		const invalidCharacters = fixedInput.replace( /[\d)(+.-]/g, "" );
		if ( invalidCharacters.length > 0 ) {
			return {
				errors: ["@FORMATS.PHONE.INVALID_CHARACTER"],
			};
		}

		if ( /^.+\+|([)(+.-]){2}/.test( fixedInput ) ) {
			return {
				errors: ["@FORMATS.PHONE.INVALID_FORMAT"],
			};
		}

		return {
			output: fixedInput,
		};
	}

	/**
	 * Validates if input contains well-formed IBAN.
	 *
	 * @param {string} input textual input to be validated
	 * @param {boolean} acceptPartial set true to accept partial input
	 * @param {object} options refers to object selecting optional customizations to format checking
	 * @returns {FormatCheckResult} validated textual input or list of errors if checking failed
	 */
	static iban( input, acceptPartial = false, { countryCodes = [] } = {} ) { // eslint-disable-line no-unused-vars
		const fixedInput = String( input == null ? "" : input ).replace( /\s+/g, "" ).toUpperCase();

		if ( fixedInput.length === 0 ) {
			return { output: "" };
		}

		if ( /[^\dA-Z]/.test( fixedInput ) ) {
			return {
				errors: ["@FORMATS.IBAN.INVALID_CHARACTER"],
			};
		}

		const result = /^[A-Z]$|^([A-Z]{2})(\d*)$/.exec( fixedInput );
		if ( !result ) {
			return {
				errors: ["@FORMATS.IBAN.INVALID_FORMAT"],
			};
		}

		if ( !result[1] ) {
			if ( acceptPartial ) {
				return { output: fixedInput };
			}

			return {
				errors: ["@FORMATS.IBAN.INVALID_FORMAT"],
			};
		}


		const checkSum = result[2].slice( 0, 2 );
		const bban = result[2].slice( 2 );
		const countryCode = result[1];

		if ( countryCodes.length && !countryCodes.some( entry => {
			return entry.toUpperCase() === countryCode;
		} ) ) {
			return {
				errors: ["@FORMATS.IBAN.INVALID_COUNTRY_CODE"],
			};
		}

		const validLength = countryCodeMap[countryCode];

		if ( fixedInput.length < validLength ) {
			if ( acceptPartial ) {
				return { output: fixedInput };
			}

			return {
				errors: ["@VALIDATION.TOO_SHORT"]
			};

		}

		if ( fixedInput.length > validLength ) {
			return {
				errors: ["@VALIDATION.TOO_LONG"]
			};
		}

		const formattedIBAN = bban + countryCode + checkSum;
		const splitIban = formattedIBAN.split( "" );

		let bigInt = "";

		for ( let index = 0, length = splitIban.length; index < length; index++ ) {
			const ch = splitIban[index];
			switch ( ch ) {
				case "0" :
				case "1" :
				case "2" :
				case "3" :
				case "4" :
				case "5" :
				case "6" :
				case "7" :
				case "8" :
				case "9" :
					bigInt += ch;
					break;
				default :
					bigInt += String( ch.charCodeAt( 0 ) - 55 );
			}
		}

		let modulo = "";

		while ( bigInt.length ) {
			modulo += bigInt.charAt( 0 );
			bigInt = bigInt.slice( 1 );

			const value = Number( modulo );
			if ( value >= 97 ) {
				modulo = "";
				bigInt = String( value % 97 ) + bigInt;
			}
		}

		if ( modulo !== "1" ) {
			return {
				errors: ["@FORMATS.IBAN.CHECKSUM_FAILED"],
			};
		}

		return {
			output: fixedInput,
		};
	}

	/**
	 * Validates if input contains well-formed IBAN.
	 *
	 * @param {string} input textual input to be validated
	 * @param {boolean} acceptPartial set true to accept partial input
	 * @param {object} options refers to object selecting optional customizations to format checking
	 * @returns {FormatCheckResult} validated textual input or list of errors if checking failed
	 */
	static bic( input, acceptPartial = false, { countryCodes = [] } = {} ) { // eslint-disable-line no-unused-vars
		const fixedInput = input == null ? "" : String( input ).trim().toUpperCase();

		if ( fixedInput === "" ) {
			return { output: "" };
		}

		const regEx = /^([a-z]{4})([a-z]{2})([2-9a-z][a-np-z0-9])([0-9a-wy-z][0-9a-z]{2}|x{0,3})$/i;
		const partial = /^([a-z]{0,6}|[a-z]{6}(([2-9a-z]|[2-9a-z][a-np-z0-9])?|[2-9a-z][a-np-z0-9]([0-9a-wy-z][0-9a-z]{0,2}|xx{0,2})?))$/i;
		const length = fixedInput.length;

		if ( length > 11 ) {
			return {
				errors: ["@VALIDATION.TOO_LONG"]
			};
		}

		if ( length >= 6 ) {
			const countryCode = fixedInput.slice( 4, 6 ).toUpperCase();

			if ( countryCodes.length && !countryCodes.some( entry => entry.toUpperCase() === countryCode ) ) {
				return {
					errors: ["@FORMATS.BIC.INVALID_COUNTRY_CODE"],
				};
			}
		}

		if ( acceptPartial ) {
			if ( !partial.test( fixedInput ) ) {
				if ( length === 11 && length === 8 ) {
					return {
						errors: ["@FORMATS.BIC.INVALID_FORMAT"],
					};
				}
				return {
					errors: ["@FORMATS.BIC.INVALID_CHARACTER"],
				};

			}
		} else {
			if ( length !== 8 && length !== 11 ) {
				return {
					errors: ["@VALIDATION.TOO_SHORT"]
				};
			}

			if ( !regEx.test( fixedInput ) ) {
				return {
					errors: ["@FORMATS.BIC.INVALID_FORMAT"],
				};
			}
		}

		return {
			output: fixedInput,
		};
	}
}
