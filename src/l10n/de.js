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
		COMMON: {
			EXPLAIN_REQUIRED: "= erforderliche Angabe"
		},
		PROMPT: {
			SELECTOR: "Bitte wählen...",
		},
		BLOCK_MESSAGE: "Bitte warten...",
		VALIDATION: {
			UNEXPECTED_ERROR: "Die Validierung scheiterte unerwartet.",
			INVALID: "Diese Angabe ist ungültig.",
			MISSING_REQUIRED: "Diese Angabe ist erforderlich.",
			MISSING_SELECTION: "Bitte treffen Sie hier eine Auswahl!",
			TOO_SHORT: "Ihre Angabe ist zu kurz.",
			TOO_LONG: "Ihre Angabe ist zu lang.",
			TOO_FEW: "Zu wenig Angaben getätigt",
			TOO_MANY: "Ihre Angabe enthält zu viele Elemente.",
			FILE: {
				TOO_LITTLE: "Sie haben zu wenige Dateien ausgewählt.",
				TOO_MANY: "Sie haben zu viele Dateien ausgewählt.",
				TOO_SMALL_TOTAL: "Die Gesamtgröße aller ausgewählten Dateien ist zu gering.",
				TOO_BIG_TOTAL: "Die Gesamtgröße aller ausgewählten Dateien ist zu hoch.",
				TOO_SMALL: "Die Größe der ausgewählten Datei ist zu gering.",
				TOO_BIG: "Die Größe der ausgewählten Datei ist zu hoch.",
			},
			DATE: {
				TOO_EARLY: "Das gewählte Datum liegt zu weit zurück.",
				TOO_LATE: "Das gewählte Datum liegt zu weit in der Zukunft.",
				DAY_NOT_ALLOWED: "Der gewählte Wochentag ist nicht erlaubt.",
				NOT_ALLOWED: "Das gewählte Datum ist nicht erlaubt.",
			},
			MIME_MISMATCH: "Sie haben eine Datei mit falschem Format ausgewählt.",
			PATTERN_MISMATCH: "Das Format Ihrer Angabe ist fehlerhaft.",
		},
		BUTTONS: {
			PREVIOUS: "Zurück",
			NEXT: "Weiter",
			CONTINUE: "Fortfahren",
			SUBMIT: "Absenden",
			ADD: "Hinzufügen",
			REMOVE: "Löschen",
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
			DATE: {
				INVALID_FORMAT: "Das Format Ihrer Angabe ist kein gültiges Datum.",
			},
			PHONE: {
				INVALID_CHARACTER: "Ihre Angabe enthält Zeichen, die in einer Telefonnummer unzulässig sind.",
				INVALID_FORMAT: "Das Format Ihrer Angabe ist keine gültige Telefonnummer.",
			},
			IBAN: {
				INVALID_CHARACTER: "Ihre Angabe enthält Zeichen, die in einer IBAN unzulässig sind.",
				INVALID_COUNTRY_CODE: "Ihre IBAN bestimmt ein unzulässiges Land.",
				INVALID_FORMAT: "Ihre Angabe entspricht nicht dem Format einer IBAN.",
				CHECKSUM_FAILED: "Die Prüfsumme der IBAN ist falsch. Bitte prüfen Sie auf mögliche Tippfehler!",
			},
			BIC: {
				INVALID_CHARACTER: "Ihre Angabe enthält Zeichen, die in einer BIC unzulässig sind.",
				INVALID_COUNTRY_CODE: "Ihre BIC bestimmt ein unzulässiges Land.",
				INVALID_FORMAT: "Das Format Ihrer Angabe ist keine gültige BIC.",
			},
		},
	};
}
