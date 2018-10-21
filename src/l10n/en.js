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
		VALIDATION: {
			UNEXPECTED_ERROR: "Validation failed unexpectedly.",
			MISSING_REQUIRED: "This information is required.",
			TOO_SHORT: "Provided information is too short.",
			TOO_LONG: "Provided information is too long.",
			MISSING_SELECTION: "Selecting option is required.",
		},
		BUTTONS: {
			PREVIOUS: "Back",
			NEXT: "Next",
			SUBMIT: "Submit",
		},
		FORMATS: {
			IP4: {
				INVALID_CHARACTER: "An IPv4 address consists of decimal digits and periods, only.",
				INVALID_SIZE: "An IPv4 address is a sequence of four decimal numbers separated by single periods from each other.",
				INVALID_VALUE: "Every decimal number in an IPv4 address must be in range 0-255.",
			},
		},
	};
}
