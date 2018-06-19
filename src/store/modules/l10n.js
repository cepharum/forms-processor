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

export default {
	state: {
		locale: null,
		translations: {},
	},
	getters: {
		locale: state => state.locale || normalizeLocale( navigator.language ),
		l10n: state => state.translations,
	},
	mutations: {
		setTranslations( state, translations ) {
			if ( translations && typeof translations === "object" && !Array.isArray( translations ) ) {
				state.translations = translations;
			}
		},

		setLocale( state, locale ) {
			state.locale = normalizeLocale( locale );
		},
	},
	actions: {
		setLocale( { state, commit }, locale = null ) {
			const normalizedLocale = normalizeLocale( locale );

			if ( normalizedLocale === state.locale ) {
				return Promise.resolve();
			}

			let mapper;

			switch ( normalizedLocale ) {
				case "de" :
					mapper = import( "../../l10n/de" );
					break;

				default :
					mapper = import( "../../l10n/en" );
			}

			return mapper
				.then( generator => generator.default() )
				.then( translations => {
					commit( "setLocale", normalizedLocale );
					commit( "setTranslations", translations );
				} );
		},
	},
};

/**
 * Normalizes some provided locale tag.
 *
 * @param {string} locale locale tage to be normalized, e.g. "EN" or "de-de"
 * @returns {string} normalized locale tag, e.g. "en" or "de"
 */
function normalizeLocale( locale ) {
	return String( locale || "en" ).trim().toLowerCase().split( /[-;]/ ).shift();
}
