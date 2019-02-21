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
 * Exports function generating German translation of static strings.
 *
 * @returns {Promise<LocaleTranslationTree>|LocaleTranslationTree} map of German translations
 */
export default function() {
	return {
		LOADING: {
			WAIT_PROMPT: "Please wait!",
			WAIT_EXPLANATION: "Loading Form ...",
		},
		COMMON: {
			EXPLAIN_REQUIRED: "= required information"
		},
		VALIDATION: {
			UNEXPECTED_ERROR: "Validation failed unexpectedly.",
			MISSING_REQUIRED: "This information is required.",
			MISSING_SELECTION: "Selecting option is required.",
			TOO_SHORT: "Provided information is too short.",
			TOO_LONG: "Provided information is too long.",
			TOO_FEW: "The number of provided records is too low.",
			TOO_MANY: "The number of provided records is too high.",
			TOO_LITTLE_FILES: "You must select more files.",
			TOO_MANY_FILES: "You have selected too many files.",
			TOO_SMALL_FILES_TOTAL: "The total size of all selected files exceeds permitted minimum.",
			TOO_BIG_FILES_TOTAL: "The total size of all selected files exceeds permitted maximum.",
			TOO_SMALL_FILE: "The size of selected file exceeds permitted minimum.",
			TOO_BIG_FILE: "The size of selected file exceeds permitted maximum.",
			MIME_MISMATCH: "You've selected wrong type of file.",
			PATTERN_MISMATCH: "This information does not comply with required format.",
		},
		BUTTONS: {
			PREVIOUS: "Back",
			NEXT: "Next",
			CONTINUE: "Continue",
			SUBMIT: "Submit",
			ADD: "Add",
			REMOVE: "Remove",
		},
		FORMATS: {
			IP4: {
				INVALID_CHARACTER: "An IPv4 address consists of decimal digits and periods, only.",
				INVALID_SIZE: "An IPv4 address is a sequence of four decimal numbers separated by single periods from each other.",
				INVALID_VALUE: "Every decimal number in an IPv4 address must be in range 0-255.",
			},
			MAIL: {
				INVALID_FORMAT: "Your input does not look like a well-formed mail address.",
			},
			DATE: {
				INVALID_FORMAT: "Your input does not look like a well-formed date.",
			},
			PHONE: {
				INVALID_CHARACTER: "Your input contains characters that aren't permitted in a phone number.",
				INVALID_FORMAT: "Your input does not look like a well-formed phone number.",
			},
			IBAN: {
				INVALID_CHARACTER: "Your input contains characters that aren't valid in an IBAN.",
				INVALID_COUNTRY_CODE: "This IBAN is addressing an invalid country.",
				INVALID_FORMAT: "Your input does comply with the form of an IBAN.",
				CHECKSUM_FAILED: "Checksum test failed. Double-check for probable typo, please!",
			},
			BIC: {
				INVALID_CHARACTER: "Your input contains characters that aren't permitted in a well-formed BIC.",
				INVALID_COUNTRY_CODE: "The country code of your BIC is invalid.",
				INVALID_FORMAT: "Your input does not look like a well-formed BIC.",
			},
		},
	};
}
