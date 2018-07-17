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
 * @typedef {Array<({code:string, regexp:RegExp, formatter:function(string):string, optional:boolean}|string[])>} CompiledPattern
 */

/**
 * Provides utilities to format string according to some pattern definition.
 */
export default class Pattern {
	/**
	 * Returns map of special characters used in pattern definitions into
	 * regular expressions performing related matching.
	 *
	 * @returns {object<string,RegExp>} map of pattern characters into regular expressions
	 */
	static get regularExpressions() {
		return {
			X: /^[a-z]$/i,
			x: /^[a-z]$/i,
			"#": /^[0-9]$/,
		};
	}

	/**
	 * Returns map of special characters used in pattern definitions into
	 * methods formatting some provided character accordingly.
	 *
	 * @returns {object<string,function(string):string>} map of pattern characters into formatters
	 */
	static get formatters() {
		return {
			X: ch => String( ch ).toLocaleUpperCase(),
			x: ch => String( ch ).toLocaleLowerCase(),
			"#": ch => String( parseInt( ch ) || 0 ),
		};
	}

	/**
	 * Compiles provided pattern to be used for parsing and/or formatting some
	 * string expected to comply w/ given pattern.
	 *
	 * @param {string} pattern pattern to be compiled
	 * @param {boolean} ignoreTrailingLiterals set true to prevent exception on pattern ending w/ literal characters
	 * @param {boolean} keepTrailingLiterals set true to keep trailing literals in compiled pattern
	 * @returns {CompiledPattern} lists elements of compiled pattern
	 */
	static compilePattern( pattern, { ignoreTrailingLiterals = true, keepTrailingLiterals = false } = {} ) {
		const matchers = this.regularExpressions;
		const formatters = this.formatters;

		const trimmedPattern = String( pattern == null ? "" : pattern ).trim().replace( /\s+/g, " " );
		const numPattern = trimmedPattern.length;

		const steps = [];
		let lastFunctionalIndex = -1;

		for ( let matcherCode = null, i = 0; i < numPattern; i++ ) {
			const code = trimmedPattern[i];

			if ( matchers[code] == null ) {
				if ( code === "?" ) {
					if ( matcherCode == null ) {
						throw new TypeError( `invalid optional functional in pattern w/o preceding functional at "${trimmedPattern.substr( i )}"` );
					}

					lastFunctionalIndex = steps.length;

					steps.push( {
						code: matcherCode,
						regexp: matchers[matcherCode],
						format: formatters[matcherCode],
						optional: true,
					} );
				} else {
					matcherCode = null;

					if ( code === "[" ) {
						const literals = [];
						let end;

						for ( end = i + 1; end < numPattern; end++ ) {
							const literal = trimmedPattern[end];

							if ( literal === "]" && literals.length ) {
								break;
							}

							literals.push( literal );
						}

						if ( end === numPattern ) {
							throw new TypeError( `unclosed group of optional literals` );
						}

						steps.push( literals );
						i = end;
					} else {
						steps.push( [code] );
					}
				}
			} else {
				matcherCode = code;

				lastFunctionalIndex = steps.length;

				steps.push( {
					code,
					regexp: matchers[code],
					format: formatters[code],
					optional: false,
				} );
			}
		}

		if ( lastFunctionalIndex < numPattern - 1 ) {
			if ( ignoreTrailingLiterals ) {
				if ( !keepTrailingLiterals ) {
					steps.splice( lastFunctionalIndex + 1 );
				}
			} else {
				throw new TypeError( "pattern must not end w/ literal characters" );
			}
		}

		return steps;
	}

	/**
	 * Parses input string for matching provided pattern extracting essential
	 * characters.
	 *
	 * This method is always ignoring any leading or trailing whitespace in
	 * provided input string or pattern. Sequences of whitespace are reduced to
	 * single SPC characters.
	 *
	 * @param {string} input input string to be parsed
	 * @param {string|CompiledPattern} pattern description of pattern to be matched by input
	 * @param {boolean} keepLiterals requests to keep literal elements of pattern in resulting string
	 * @param {boolean} ignoreInvalid set true to ignore invalid input characters in any position instead of throwing exception
	 * @param {boolean} keepTrailingLiterals requests to keep literal characters matching pattern at end of resulting string
	 * @returns {string} sequence of essential characters matching provided pattern
	 */
	static parse( input, pattern, { keepLiterals = true, ignoreInvalid = true, keepTrailingLiterals = true } = {} ) {
		let extracted = "";

		const fixedInput = String( input == null ? "" : input ).replace( /\s+/g, " " );
		const numInput = fixedInput.length;

		let tail = "";
		let inputIndex;
		let patternIndex;

		let nextLiteral = null;
		let nextLiteralIndex = null;
		let nextMatcher = null;
		let nextMatcherIndex = null;

		if ( typeof pattern === "string" ) {
			pattern = this.compilePattern( pattern );
		} else if ( !Array.isArray( pattern ) ) {
			throw new TypeError( "invalid or missing pattern" );
		}

		const numPattern = pattern.length;

		for ( inputIndex = 0, patternIndex = 0; inputIndex < numInput && patternIndex < numPattern; inputIndex++ ) {

			// make sure know next expected literal/functional character
			for ( let i = patternIndex; i < numPattern && ( nextLiteral == null || nextMatcher == null ); i++ ) {
				const step = pattern[i];

				if ( nextLiteral == null ) {
					if ( Array.isArray( step ) ) {
						nextLiteral = step;
						nextLiteralIndex = i;
					}
				}

				if ( nextMatcher == null ) {
					if ( step.regexp ) {
						nextMatcher = step;
						nextMatcherIndex = i;
					}
				}
			}

			if ( nextLiteral == null ) {
				nextLiteralIndex = numPattern;
			}

			if ( nextMatcher == null ) {
				nextMatcherIndex = numPattern;
			}


			if ( nextMatcher != null ) {
				// expecting more input sooner or later
				const char = fixedInput[inputIndex];

				if ( nextMatcher.regexp.test( char ) ) {
					const formattedChar = nextMatcher.format( char );

					for ( ; nextLiteralIndex < nextMatcherIndex; nextLiteralIndex++ ) {
						if ( keepLiterals ) {
							const subStep = pattern[nextLiteralIndex];
							if ( Array.isArray( subStep ) ) {
								tail += subStep[0];
							}
						}

						nextLiteral = null;
					}

					nextMatcher = null;
					patternIndex = nextMatcherIndex + 1;

					extracted += tail + formattedChar;
					tail = "";
				} else if ( nextLiteral && nextLiteral.indexOf( char ) > -1 ) {
					let acceptLiteral = true;

					for ( let i = nextMatcherIndex; i < nextLiteralIndex; i++ ) {
						const stepRef = pattern[i];

						if ( !Array.isArray( stepRef ) && !stepRef.optional ) {
							acceptLiteral = false;
							break;
						}
					}

					if ( acceptLiteral ) {
						if ( nextMatcherIndex < nextLiteralIndex ) {
							nextMatcher = null;
						}

						if ( keepLiterals ) {
							tail += char;
						}

						nextLiteral = null;
						patternIndex = nextLiteralIndex + 1;
					} else if ( !ignoreInvalid ) {
						throw new TypeError( `premature encounter of literal character ${char} at "${fixedInput.substr( inputIndex )}"` );
					}
				} else if ( !ignoreInvalid ) {
					if ( char !== " " || inputIndex > 0 ) {
						throw new TypeError( `unexpected literal character ${char} at "${fixedInput.substr( inputIndex )}"` );
					}
				}
			}
		}

		if ( !ignoreInvalid ) {
			if ( inputIndex < numInput && fixedInput.substr( inputIndex ).trim().length > 0 ) {
				throw new TypeError( `invalid additional input "${fixedInput.substr( inputIndex )}"` );
			}

			for ( ; patternIndex < numPattern; patternIndex++ ) {
				const subStep = pattern[patternIndex];
				if ( !Array.isArray( subStep ) && !subStep.optional ) {
					throw new TypeError( `expecting additional input matching at least ${subStep.regexp}` );
				}
			}
		}

		if ( keepLiterals && keepTrailingLiterals ) {
			return extracted + tail;
		}

		return extracted;
	}
}
