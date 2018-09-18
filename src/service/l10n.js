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

import { normalizeLocale } from "./utility/l10n";

/**
 * @typedef {object<string,string>} LocaleTranslationLeaf
 */

/**
 * @typedef {LocaleTranslationTree|LocaleTranslationLeaf} LocaleTranslationTree
 */


/**
 * Provides read-only access on current localization support.
 */
export default class Localization {
	/**
	 * Loads a map of translations for selected locale.
	 *
	 * @param {string} locale locale of translations to be loaded
	 * @return {Promise<object<string,string>>} promises translations of selected locale loaded
	 */
	static loadMap( locale ) {
		const normalized = normalizeLocale( locale );
		let mapper;

		switch ( normalized ) {
			case "de" :
				mapper = import( "@/l10n/de" );
				break;

			default :
				mapper = import( "@/l10n/en" );
		}

		return mapper.then( generator => generator.default() );
	}

	/**
	 * Localizes a property's value if it looks like a value providing different
	 * actual values per locale.
	 *
	 * @param {object<string,string>|*} value value to be localized
	 * @param {string} desiredLocale locale to use
	 * @returns {string|*} localized or provided value
	 */
	static localize( value, desiredLocale ) {
		if ( typeof value === "object" && value ) {
			const locales = Object.keys( value );
			let wildcard = null;
			let fallback = null;

			for ( let li = 0, numLocales = locales.length; li < numLocales; li++ ) {
				const locale = locales[li];
				const normalized = locale.trim().toLowerCase();

				if ( normalized === desiredLocale ) {
					return value[locale];
				}

				switch ( normalized ) {
					case "*" :
					case "any" :
						wildcard = value[locale];
						break;

					case "en" :
						fallback = value[locale];
						break;
				}
			}

			return wildcard == null ? fallback : wildcard;
		}

		return value;
	}
}
