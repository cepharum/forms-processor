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
			WAIT_PROMPT: "Bitte warten.",
			WAIT_EXPLANATION: "Das Formular wird geladen.",
		},
		VALIDATION: {
			UNEXPECTED_ERROR: "Die Validierung scheiterte unerwartet.",
			MISSING_REQUIRED: "Diese Angabe ist erforderlich.",
			TOO_SHORT: "Ihre Angabe ist zu kurz.",
			TOO_LONG: "Ihre Angabe ist zu lang.",
			TOO_MANY: "Sie haben zu viel gewählt.",
			TOO_LITTLE: "Sie haben zu wenig gewählt",
			MISSING_SELECTION: "Bitte treffen Sie hier eine Auswahl!",
			WRONG_TYPE: "Ihre Eingabe hat den falschen Typ",
		},
		BUTTONS: {
			PREVIOUS: "Zurück",
			NEXT: "Weiter",
			CONTINUE: "Fortfahren",
			SUBMIT: "Absenden",
		},
		FORMATS: {
			IP4: {
				INVALID_CHARACTER: "Eine IPv4-Adresse besteht nur aus Dezimalziffern und Punkten.",
				INVALID_SIZE: "Eine IPv4-Adresse besteht aus vier durch einzelne Punkte getrennten Zahlen.",
				INVALID_VALUE: "In einer IPv4-Adresse sind nur Zahlen im Bereich 0 bis 255 zulässig.",
			},
			MAIL: {
				INVALID_FORMAT: "Das Format Ihrer Angabe ist keine gültige E-Mail-Adresse.",
			},
			PHONE: {
				INVALID_CHARACTER: "Ihre Angabe enthält Zeichen, die in einer Telefonnummer unzulässig sind.",
				INVALID_FORMAT: "Das Format Ihrer Angabe ist keine gültige Telefonnummer.",
			},
		},
	};
}
