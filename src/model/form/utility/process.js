/**
 * (c) 2019 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 cepharum GmbH
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

import { Processor } from "simple-terms";

/**
 * Matches definition of a binding occurring in a property's value.
 *
 * @type {RegExp}
 */
const ptnBinding = /({{[^}]+}})/;

/**
 * Commonly provides code for compiling strings into computable data.
 */
export default class CompileTerm {
	/**
	 * Tests if provided string contains any computable term returning compiled
	 * term on a whole-term string and list of literal strings and in-between
	 * terms when containing term bindings.
	 *
	 * @param {string} source string to be compiled if required
	 * @param {object<string,function>} functions set of custom functions to expose in terms
	 * @param {Map<string,Processor>} cache maps term source into previously compiled terms for either source
	 * @param {function(string):string} resolveVariableName gets called if available to qualify name of a variable
	 * @return {string|Processor|Array<(string|Processor)>} literal string when not containing term, term instance if
	 *         all string was a single term's source, slices of literals and term instances if source contained one or
	 *         more terms' sources
	 */
	static compileString( source, functions = {}, cache = null, resolveVariableName = null ) {
		if ( source == null ) {
			return null;
		}

		const _source = String( source ).trim();
		if ( _source.charAt( 0 ) === "=" ) {
			// whole value contains term -> deliver
			return new Processor( _source.slice( 1 ), functions, cache, resolveVariableName );
		}


		// test if value contains bindings (terms wrapped in double curly braces)
		const slices = String( source ).split( ptnBinding );
		const numSlices = slices.length;
		let isDynamic = false;

		for ( let i = 0; i < numSlices; i++ ) { // eslint-disable-line max-depth
			const slice = slices[i];
			const match = slice.match( ptnBinding );
			if ( match ) {
				slices[i] = new Processor( slice.slice( 2, -2 ), functions, cache, resolveVariableName );
				isDynamic = true;
			}
		}

		return isDynamic ? slices : source;
	}
}
