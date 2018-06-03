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

const TermTokenizer = require( "./tokenizer" );
const TermCompiler = require( "./compiler" );
const TermFunctions = require( "./functions" );


/**
 * Implements handling of computable terms.
 */
class TermProcessor {
	/**
	 * @param {string} source source code of term
	 * @param {object<string,function>} customFunctions map of custom functions to support in term
	 */
	constructor( source, customFunctions = {} ) {
		Object.defineProperties( this, {
			/**
			 * Provides code of term as provided on term creation.
			 *
			 * @name Processor#code
			 * @property {string}
			 * @readonly
			 */
			source: { value: source },

			/**
			 * Evaluates term in context of a provided variable space.
			 *
			 * @name Processor#eval
			 * @property {function(data:object):*}
			 * @readonly
			 */
			code: { value: TermCompiler.compile( TermTokenizer.tokenizeString( source, true ), Object.assign( {}, TermFunctions, customFunctions ) ) },
		} );
	}

	/**
	 * Evaluates compiled term in context of provided data.
	 *
	 * @param {object<string,*>} data variable space exposing data available to evaluated term
	 * @returns {*} result of evaluating term
	 */
	evaluate( data = {} ) {
		return this.code( data, TermFunctions );
	}
}

module.exports = TermProcessor;
