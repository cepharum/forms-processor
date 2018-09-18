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
 * Provides support for fetching definition of form to process.
 */
export default class Definition {
	/**
	 * Fetches description of form selected by its ID from backend unless it has
	 * been fetched before using cached result in that case.
	 *
	 * @param {string} source unique ID of form to be described
	 * @returns {Promise<object>} promises fetched description
	 */
	static load( source ) {
		switch ( typeof source ) {
			case "string" :
				return fetch( source )
					.then( response => {
						if ( !response.ok ) {
							throw new Error( `fetching form description failed: ${response.status} ${response.statusText}` );
						}

						return response.json();
					} );

			case "object" :
				if ( source && !Array.isArray( source ) ) {
					return Promise.resolve( source );
				}

				// falls through
			default :
				return Promise.reject( new TypeError( "invalid source of form's definition" ) );
		}
	}
}
