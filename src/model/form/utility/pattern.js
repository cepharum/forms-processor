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
 * @typedef {object} PatternStep
 * @property {string} type type name of current step
 */

/**
 * @typedef {PatternStep} ValuableCharacterPatternStep
 * @property {string} code code used to select one of several groups of characters to match current step
 * @property {RegExp} regexp regular expression matching valid character of current step
 * @property {function(string):string} formatter function optionally transforming matching input character
 * @property {boolean} optional marks if current step of pattern is optional or not
 * @property {boolean} multi marks if current step of pattern may apply to multiple input characters in a sequence
 */

/**
 * @typedef {PatternStep} LiteralCharacterPatternStep
 * @property {string} literals string containing all literal characters accepted in current step of pattern
 * @property {boolean} keep marks if literal should be kept in valuable string returned from Pattern.parse()
 */

/**
 * @typedef {object} CollectedLiteral
 * @property {string} code collected literal character
 * @property {boolean} keep marks if literal should be kept in valuable string returned from Pattern.parse()
 * @property {boolean} additional marks if literal has been collected in addition to any actual input
 * @property {int} index provides index into provided input this literal has been collected at
 */

/**
 * @typedef {Array<(ValuableCharacterPatternStep|LiteralCharacterPatternStep)>} CompiledPattern
 */

/**
 * @typedef {object} StringWithCursor
 * @property {string} value
 * @property {int} cursor index into string in `value` a cursor should be located at
 */

/**
 * @typedef {object} PatternParserResult
 * @property {StringWithCursor} valuable provides valuable part of parsed string (e.g. for further processing)
 * @property {StringWithCursor} formatted provides formatted part of parsed string (e.g. for displaying)
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
			A: /^[a-z]$/i,
			a: /^[a-z]$/i,
			X: /^[0-9a-f]$/i,
			x: /^[0-9a-f]$/i,
			W: /^[0-9a-z]$/i,
			w: /^[0-9a-z]$/i,
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
			A: ch => String( ch ).toLocaleUpperCase(),
			a: ch => String( ch ).toLocaleLowerCase(),
			X: ch => String( ch ).toLocaleUpperCase(),
			x: ch => String( ch ).toLocaleLowerCase(),
			W: ch => String( ch ).toLocaleUpperCase(),
			w: ch => String( ch ).toLocaleLowerCase(),
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
		let lastValuableIndex = -1;
		let escaped = false;

		for ( let i = 0; i < numPattern; i++ ) {
			const code = trimmedPattern[i];

			if ( escaped ) {
				steps.push( {
					type: "literal",
					literals: code,
					keep: false,
				} );

				escaped = false;
			} else if ( matchers[code] == null ) {
				switch ( code ) {
					case "\\" :
						escaped = true;
						break;

					case "!" : {
						const numSteps = steps.length;
						if ( numSteps > 0 ) {
							const previousStep = steps[numSteps - 1];
							if ( previousStep.type === "literal" ) {
								previousStep.keep = true;
							} else {
								throw new TypeError( `Rejecting exclamation mark succeeding valuable character at index ${i} of pattern "${trimmedPattern}".` );
							}
						} else {
							throw new TypeError( `Rejecting exclamation mark in leading position of pattern "${trimmedPattern}".` );
						}

						break;
					}

					case "?" :
					case "*" :
					case "+" : {
						const lastStepIndex = steps.length - 1;
						const lastStep = lastStepIndex > -1 ? steps[lastStepIndex] : null;

						if ( lastStep == null || lastStep.type !== "valuable" ) {
							throw new TypeError( `Rejecting quantifier ${code} not succeeding valuable character at index ${i} of pattern "${trimmedPattern}".` ); // eslint-disable-line max-len
						}

						if ( lastStep.optional ) {
							if ( lastStep.multi || code !== "?" ) {
								throw new TypeError( `Rejecting quantifier ${code} succeeding another quantifier at index ${i} of pattern "${trimmedPattern}".` ); // eslint-disable-line max-len
							}

							const valuableCode = lastStep.code;

							lastValuableIndex = steps.length;

							steps.push( {
								type: "valuable",
								code: valuableCode,
								regexp: matchers[valuableCode],
								format: formatters[valuableCode],
								optional: code !== "+",
								multi: code !== "?",
							} );
						} else {
							if ( lastStep.multi ) {
								throw new TypeError( `Rejecting quantifier ${code} succeeding quantifier '+' at index ${i} of pattern "${trimmedPattern}".` ); // eslint-disable-line max-len
							}

							lastStep.optional = code !== "+";
							lastStep.multi = code !== "?";
						}

						break;
					}

					case "[" : {
						let literals = "";
						let end;

						for ( end = i + 1; end < numPattern; end++ ) {
							const literal = trimmedPattern[end];

							if ( literal === "]" && literals.length ) {
								break;
							}

							literals += literal;
						}

						if ( end === numPattern ) {
							throw new TypeError( `Unclosed group of optional literals rejected.` );
						}

						steps.push( {
							type: "literal",
							literals: literals,
							keep: false,
						} );

						i = end;

						break;
					}

					default : {
						steps.push( {
							type: "literal",
							literals: code,
							keep: false,
						} );
					}
				}
			} else {
				lastValuableIndex = steps.length;

				steps.push( {
					type: "valuable",
					code: code,
					regexp: matchers[code],
					format: formatters[code],
					optional: false,
					multi: false,
				} );
			}
		}

		if ( escaped ) {
			throw new TypeError( "missing character to be escaped by preceding backslash" );
		}

		if ( lastValuableIndex < numPattern - 1 ) {
			if ( ignoreTrailingLiterals ) {
				if ( !keepTrailingLiterals ) {
					steps.splice( lastValuableIndex + 1 );
				}
			} else {
				throw new TypeError( "Pattern must not end w/ literal characters." );
			}
		}

		return steps;
	}

	/**
	 * Parses input string for matching provided pattern extracting essential
	 * characters.
	 *
	 * Sequences of whitespace are reduced to single SPC characters.
	 *
	 * @param {string} input input string to be parsed
	 * @param {string|CompiledPattern} pattern description of pattern to be matched by input
	 * @param {boolean} ignoreInvalid set true to ignore invalid input characters in any position instead of throwing exception
	 * @param {boolean} keepTrailingLiterals requests to keep literal characters matching pattern at end of resulting string
	 * @param {int} cursorPosition index of cursor's current position into provided input
	 * @param {boolean} ignoreMissing set false to validate whether some input satisfies all valuable characters of pattern or not
	 * @returns {PatternParserResult} results of filtering/formatting input according to pattern
	 */
	static parse( input, pattern, { ignoreInvalid = true, keepTrailingLiterals = true, cursorPosition = Infinity, ignoreMissing = true } = {} ) {
		const fixedInput = input == null ? "" : String( input );
		const numInput = fixedInput.length;

		let _pattern = pattern;
		if ( typeof _pattern === "string" ) {
			_pattern = this.compilePattern( _pattern );
		} else if ( !Array.isArray( _pattern ) ) {
			throw new TypeError( "Invalid or missing pattern rejected." );
		}
		const numPattern = _pattern.length;

		let _cursorPosition = Math.max( 0, Math.min( numInput, parseInt( cursorPosition ) ) );
		if ( isNaN( _cursorPosition ) || _cursorPosition > numInput ) {
			_cursorPosition = numInput;
		}

		const valuable = {
			value: "",
			cursor: _cursorPosition,
		};

		const formatted = {
			value: "",
			cursor: _cursorPosition,
		};

		const ptnSpace = /\s/;
		const numLeadingSpace = ( /^\s+/.exec( fixedInput ) || [""] )[0].length;
		const numTrailingSpace = ( /\s+$/.exec( fixedInput ) || [""] )[0].length;

		let tail = [];
		let inputIndex;
		let patternIndex;
		let spaceBefore = null;


		for ( inputIndex = 0, patternIndex = 0; inputIndex < numInput; inputIndex++ ) {
			let char = fixedInput[inputIndex];

			// replace sequence of whitespace with single SPC
			if ( ptnSpace.test( char ) ) {
				const skipCurrent = spaceBefore !== false;
				spaceBefore = true;

				if ( skipCurrent ) {
					if ( _cursorPosition > inputIndex ) {
						valuable.cursor--;
						formatted.cursor--;
					}

					continue;
				}

				char = " ";
			} else {
				spaceBefore = false;
			}


			// find next step of pattern to be used with current input character
			let nextStepIndex = -1;

			for ( let i = patternIndex; i < numPattern && nextStepIndex < 0; i++ ) {
				const step = _pattern[i];

				switch ( step.type ) {
					case "literal" :
						if ( step.literals.indexOf( char ) > -1 ) {
							nextStepIndex = i;
						}
						break;

					case "valuable" :
						if ( step.regexp.test( char ) || !step.optional ) {
							nextStepIndex = i;
						}
						break;
				}
			}


			if ( nextStepIndex > -1 ) {
				const step = _pattern[nextStepIndex];

				switch ( step.type ) {
					case "literal" :
						if ( step.literals.indexOf( char ) > -1 ) {
							// it's matching that literal, indeed
							tail.push( {
								code: char,
								keep: step.keep,
								index: inputIndex,
								additional: false,
							} );

							patternIndex = nextStepIndex + 1;

							continue;
						}
						break;

					case "valuable" :
						if ( step.regexp.test( char ) ) {
							for ( ; patternIndex < nextStepIndex; patternIndex++ ) {
								const subStep = _pattern[patternIndex];
								if ( subStep.type === "literal" ) {
									tail.push( {
										code: subStep.literals[0],
										keep: subStep.keep,
										index: inputIndex,
										additional: true,
									} );
								}
							}

							integrateLiterals( tail, valuable, formatted );

							tail = [];

							formatted.value += step.format( char );
							valuable.value += char;

							if ( !step.multi ) {
								patternIndex++;
							}

							continue;
						}
						break;
				}
			}


			// current character isn't expected at all
			if ( !ignoreInvalid ) {
				if ( !spaceBefore || ( inputIndex >= numLeadingSpace && inputIndex < numInput - 1 - numTrailingSpace ) ) {
					throw new TypeError( `Rejecting invalid additional input "${char}" at "${fixedInput.substr( inputIndex )}".` );
				}
			}

			if ( _cursorPosition > inputIndex ) {
				valuable.cursor--;
				formatted.cursor--;
			}
		}


		if ( !ignoreMissing ) {
			for ( ; patternIndex < numPattern; patternIndex++ ) {
				const subStep = _pattern[patternIndex];
				if ( subStep.type === "valuable" && !subStep.optional ) {
					throw new TypeError( `Missing expected additional input matching at least ${subStep.regexp}.` );
				}
			}
		}

		const numTailLiterals = tail.length;
		if ( numTailLiterals > 0 ) {
			if ( keepTrailingLiterals ) {
				integrateLiterals( tail, valuable, formatted );
			} else {
				for ( let i = 0; i < numTailLiterals; i++ ) {
					const { index, additional } = tail[i];

					if ( _cursorPosition > index ) {
						formatted.cursor--;

						if ( !additional ) {
							valuable.cursor--;
						}
					}
				}
			}
		}


		return {
			valuable,
			formatted,
		};


		/**
		 * Appends sequence of intermittently collected literals to end of
		 * either resulting string as desired.
		 *
		 * @param {CollectedLiteral[]} literals descriptions of either literal to be appended
		 * @param {{value:string, cursor:int}} valuable resulting data limited to valuable elements
		 * @param {{value:string, cursor:int}} formatted resulting data including all literals required due to pattern
		 * @returns {void}
		 */
		function integrateLiterals( literals, valuable, formatted ) { // eslint-disable-line no-shadow
			const numLiterals = literals.length;

			for ( let i = 0; i < numLiterals; i++ ) {
				const { code, keep, index, additional } = literals[i];

				formatted.value += code;
				if ( _cursorPosition >= index && additional ) {
					formatted.cursor++;
				}

				if ( keep ) {
					valuable.value += code;
					if ( _cursorPosition >= index && additional ) {
						valuable.cursor++;
					}
				} else if ( _cursorPosition > index && !additional ) {
					valuable.cursor--;
				}
			}
		}
	}
}
