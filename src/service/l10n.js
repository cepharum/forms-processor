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

import Store from "../store";
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
	 * Fetches normalized tag of current locale.
	 *
	 * @returns {string} locale tag, e.g. "de" or "en"
	 */
	static get currentLocale() {
		return Store.getters["l10n/current"];
	}

	/**
	 * Fetches current locale's translation map.
	 *
	 * @returns {LocaleTranslationTree} map of translations
	 */
	static get translations() {
		return Store.getters["l10n/map"];
	}

	/**
	 * @borrows Localization.translations as Localization.map
	 */
	static get map() {
		return Store.getters["l10n/map"];
	}

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
}
