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

import { format } from "util";
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
				mapper = import( /* webpackChunkName: "l10n-de" */ "@/l10n/de" );
				break;

			default :
				mapper = import( /* webpackChunkName: "l10n-en" */ "@/l10n/en" );
		}

		return mapper.then( generator => generator.default() );
	}

	/**
	 * Resolves lookup in provided map applying optionally provided arguments to
	 * fill placeholders in string selected from map eventually.
	 *
	 * @param {object} map nested map of strings into strings associating lookup strings with localized translations
	 * @param {string} lookup period-separated sequence of lookup strings selecting leaf in provided hierarchy of translations
	 * @param {*} args list of arguments to be applied on selected translation for filling existing placeholders
	 * @return {?string} translated string or null if missing
	 */
	static translate( map, lookup, ...args ) {
		const segments = lookup.trim().split( /\s*\.\s*/ );
		const numSegments = segments.length;
		let _map = map;

		for ( let i = 0; i < numSegments; i++ ) {
			const segment = segments[i];

			if ( typeof _map === "object" && _map && _map[segment] ) {
				_map = _map[segment];
			} else {
				_map = null;
				break;
			}
		}

		if ( _map && args.length ) {
			_map = format( _map, ...args );
		}

		return _map;
	}

	/**
	 * Localizes a property's value if it looks like a value providing different
	 * actual values per locale.
	 *
	 * @param {object<string,string>|*} value value to be localized
	 * @param {string} desiredLocale locale to use
	 * @returns {string|*} localized or provided value
	 */
	static selectLocalized( value, desiredLocale ) {
		if ( typeof value === "object" && value && !Array.isArray( value ) ) {
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
