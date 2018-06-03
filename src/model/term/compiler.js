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

const TokenType = TermTokenizer.Types;


/**
 * Implements compiler converting sequence of tokens into function invocable for
 * processing term in context of some provided variable space.
 */
class TermCompiler {
	/**
	 * Compiles some sequence of tokens into Javascript function evaluating term
	 * in context of data provided on invoking that function.
	 *
	 * @param {Token[]} tokens sequence of tokens to compile
	 * @param {object<string,function>} functions set of functions available in term processing
	 * @returns {Function} Javascript function implementing term
	 */
	static compile( tokens, functions = {} ) {
		const reduced = this.reduceTokens( tokens, functions );
		const grouped = this.groupTokens( reduced );
		const code = this.compileTokens( grouped );

		return new Function( "data", "functions", `return ${code};` );
	}

	/**
	 * Reduces sequences of tokens addressing nested variable into single token
	 * and tags most resulting tokens for simplified processing in next step.
	 *
	 * @param {Token[]} tokens sequence of tokens to reduce and tag
	 * @param {object<string,function>} functions functions available in term processing
	 * @returns {TaggedToken[]} reduced and tagged set of tokens
	 */
	static reduceTokens( tokens, functions ) {
		const numTokens = tokens.length;
		const reduced = new Array( numTokens );
		let write = 0;

		for ( let read = 0; read < numTokens; read++ ) {
			const token = tokens[read];

			switch ( token.type ) {
				case TokenType.WHITESPACE :
					// compiler expects sequence of tokens not including any whitespace token
					throw new Error( `unexpected whitespace token at ${token.offset}` );

				case TokenType.DEREF_OPERATOR :
					throw new Error( `unexpected dereferencing operator at ${token.offset}` );

				case TokenType.UNARY_LOGIC_OPERATOR :
					if ( token.value === "!" ) {
						// logical negation of term -> detect and handle multiple occurrences
						const current = read;
						let advance;

						for ( advance = read + 1; advance < numTokens; advance++ ) {
							if ( tokens[advance].type !== TokenType.UNARY_LOGIC_OPERATOR ) {
								break;
							}
						}

						// always skip any additional occurrence of operator
						read = advance - 1;

						if ( ( advance - current ) % 2 === 0 ) {
							// even number of unary operators
							// -> unnecessary at all, so don't consume
							break;
						}

						// odd number of unary operators
						// -> consume first occurrence as-is below
					}

				// falls through
				case TokenType.BINARY_COMPARISON_OPERATOR :
				case TokenType.BINARY_ARITHMETIC_OPERATOR :
				case TokenType.BINARY_LOGIC_OPERATOR :
					token.operator = true;
					token.operand = false;
					token.path = null;
					token.literal = false;
					token.variable = false;
					token.function = false;

					reduced[write++] = token;
					break;

				case TokenType.LITERAL_STRING :
					token.value = token.value.slice( 1, -1 );

				// falls through
				case TokenType.LITERAL_INTEGER :
				case TokenType.LITERAL_FLOAT :
					token.operator = false;
					token.operand = true;
					token.path = null;
					token.literal = true;
					token.variable = false;
					token.function = false;

					reduced[write++] = token;
					break;

				case TokenType.KEYWORD : {
					token.operator = false;
					token.operand = true;

					let wantDeref, j;

					for ( j = read + 1, wantDeref = true; j < numTokens; j++, wantDeref = !wantDeref ) {
						const succeedingToken = tokens[j];
						if ( !succeedingToken || succeedingToken.type !== ( wantDeref ? TokenType.DEREF_OPERATOR : TokenType.KEYWORD ) ) {
							break;
						}
					}

					if ( !wantDeref ) {
						// fragment ended with deref operator -> need another keyword then
						throw new Error( `unexpected end of identifier at ${( tokens[j] || { offset: "end of code" } ).offset}` );
					}

					const size = j - read;

					if ( size > 1 ) {
						const numLevels = Math.ceil( size / 2 );
						const path = new Array( numLevels );

						for ( let r = read, w = 0; w < numLevels; r += 2, w++ ) {
							path[w] = tokens[r].value.toLowerCase();
						}

						token.value = tokens.slice( read, j ).map( t => t.value ).join( "" ).toLowerCase();
						token.path = path;

						token.literal = false;
						token.variable = true;
						token.function = false;
					} else {
						token.value = token.value.toLowerCase();

						switch ( token.value ) {
							case "true" :
							case "false" :
							case "null" :
								token.path = null;
								token.literal = true;
								token.variable = false;
								token.function = false;
								break;

							default : {
								const nextToken = tokens[j];
								const isInvoking = Boolean( nextToken && nextToken.type === TokenType.PARENTHESIS && nextToken.value === "(" );
								if ( isInvoking ) {
									if ( !functions.hasOwnProperty( token.value ) || typeof functions[token.value] !== "function" ) {
										throw new Error( `invocation of unknown function at ${token.offset}` );
									}
								}

								token.path = [token.value];
								token.literal = false;
								token.variable = !isInvoking;
								token.function = isInvoking;
							}
						}
					}

					reduced[write++] = token;
					read = j - 1;

					break;
				}

				default :
					token.operator = false;
					token.operand = false;
					token.path = null;
					token.literal = false;
					token.variable = false;
					token.function = false;

					reduced[write++] = token;
			}
		}

		reduced.splice( write );

		return reduced;
	}

	/**
	 * Converts sequence of tagged tokens into multi-level hierarchy of grouped
	 * tokens.
	 *
	 * @param {TaggedToken[]} tokens sequence of reduced and tagged tokens
	 * @returns {GroupedToken[]} hierarchy of grouped tokens
	 */
	static groupTokens( tokens ) {
		const stack = [{ group: "term", tokens: [] }];
		let previousToken = {};

		for ( let i = 0, numTokens = tokens.length; i < numTokens; i++ ) {
			const token = tokens[i];

			switch ( token.type ) {
				case TokenType.PARENTHESIS :
					switch ( token.value ) {
						case "(" :
							if ( previousToken.function ) {
								stack[0].tokens.pop();

								stack.unshift( {
									group: "function",
									name: previousToken.value,
									tokens: [],
									offset: token.offset,
								} );
							} else {
								stack.unshift( {
									group: "term",
									tokens: [],
									offset: token.offset,
								} );
							}
							break;

						case ")" : {
							if ( stack.length <= 1 ) {
								throw new Error( `unexpected closing parenthesis at ${token.offset}` );
							}

							const group = stack.shift();

							switch ( group.group ) {
								case "term" :
									switch ( group.tokens.length ) {
										case 0 :
											throw new Error( `invalid empty pair of parentheses at ${group.offset}` );

										case 1 :
											// remove unnecessary pair of parentheses
											stack[0].tokens.push( group.tokens[0] );
											break;

										default :
											stack[0].tokens.push( this.normalizeTermGroup( group ) );
									}
									break;

								case "function" :
									stack[0].tokens.push( this.normalizeFunctionGroup( group ) );
									break;

								default :
									throw new Error( `unexpected end of block at ${token.offset} started at ${stack[0].tokens[0].offset}` );
							}

							break;
						}
					}
					break;

				case TokenType.UNARY_LOGIC_OPERATOR :
					stack.unshift( {
						group: "unary",
						tokens: [token],
						offset: token.offset,
					} );

				// falls through
				default :
					stack[0].tokens.push( token );
			}


			const level = stack[0];
			if ( level.group === "unary" ) {
				if ( level.tokens.length > 1 ) {
					stack.shift();

					level.group = "term";

					stack[0].tokens.push( this.normalizeTermGroup( level ) );
				}
			}


			previousToken = token;
		}

		if ( stack.length > 1 ) {
			throw new Error( `unexpected end of code while processing block started at ${stack[0].offset}` );
		}

		return this.normalizeTermGroup( stack[0] ).tokens;
	}

	/**
	 * Validates if provided sequence of tokens is a valid sequence for a term.
	 *
	 * @param {RawGroup} group of raw tokens amounting to single term
	 * @returns {TermGroup} normalized group describing single term
	 * @throws Error on invalid token structure
	 */
	static normalizeTermGroup( group ) {
		const { tokens, offset } = group;
		const numTokens = tokens.length;

		if ( !numTokens ) {
			throw new Error( "invalid empty term" );
		}

		switch ( tokens[0].type ) {
			case TokenType.UNARY_LOGIC_OPERATOR :
				if ( numTokens < 2 ) {
					throw new Error( "invalid unary operator w/o operand" );
				}

				if ( numTokens > 2 ) {
					throw new Error( "invalid unary operator w/ multiple operands" );
				}

				if ( tokens[1].operand ) {
					break;
				}

				throw new Error( "invalid combination of unary operator w/ non-operand" );

			default :
				for ( let i = 0; i < numTokens; i++ ) {
					const token = tokens[i];

					if ( ( i % 2 ) === 0 ) {
						if ( !token.operand ) {
							throw new Error( `expecting operand in term at ${token.offset} but found ${token.type.toString()}` );
						}
					} else if ( token.operator ) {
						if ( token.type === TokenType.UNARY_LOGIC_OPERATOR ) {
							throw new Error( `unexpected unary operator ${token.value} in term at ${token.offset}` );
						}
					} else {
						throw new Error( `expecting operator in term at ${token.offset} but found ${token.group || token.type.toString()}` );
					}
				}
		}

		return {
			group: "term",
			tokens,
			offset,
			operand: true,
			operator: false,
			literal: false,
			path: null,
			variable: false,
			function: false,
		};
	}

	/**
	 * Validates and normalizes a group of raw if provided sequence of tokens is a valid sequence for a
	 * function invocation.
	 *
	 * @param {RawGroup} group group of raw tokens amounting to invocation of a function
	 * @returns {FunctionGroup} normalized group of tokens describing invocation of a function
	 * @throws Error on invalid token structure
	 */
	static normalizeFunctionGroup( group ) {
		const { name, tokens, offset } = group;
		const args = [];

		// split provided sequence of tokens into sequences of tokens per
		// argument to function
		const numTokens = tokens.length;
		let start = 0;

		for ( let i = 0; i < numTokens; i++ ) {
			if ( tokens[i].type === TokenType.COMMA ) {
				if ( i > start ) {
					args.push( tokens.slice( start, i ) );
				} else {
					args.push( null );
				}

				start = i + 1;
			}
		}

		if ( numTokens > start ) {
			args.push( tokens.slice( start ) );
		}


		// ignore trailing commata
		let end = args.length;
		for ( ; end >= 0; end-- ) {
			if ( args[end] != null ) {
				break;
			}
		}

		args.splice( end + 1 );


		// replace further empty arguments w/ literal value `null`, normalize
		// all provided arguments as term
		for ( let i = 0, numArgs = args.length; i < numArgs; i++ ) {
			const arg = args[i];

			if ( arg == null ) {
				args[i] = {
					type: TokenType.KEYWORD,
					value: "null",
					operand: true,
					operator: false,
					literal: true,
					path: null,
					variable: false,
					function: false,
				};
			} else {
				args[i] = this.normalizeTermGroup( {
					group: "term",
					tokens: arg,
					offset: arg[0].offset,
				} );
			}
		}


		return {
			group: "function",
			name,
			args,
			offset,
			operand: true,
			operator: false,
			literal: false,
			path: null,
			variable: false,
			function: false, // seems odd, but this tag is used to mark raw token naming some function
		};
	}

	/**
	 * Compiles sequence of reduced, tagged and grouped tokens into source code
	 * of a Javascript function's body.
	 *
	 * @param {GroupedToken[]} tokens reduced, tagged and grouped set of tokens
	 * @returns {string} source code of Javascript function's body processing term
	 */
	static compileTokens( tokens ) {
		const numTokens = tokens.length;
		const code = new Array( numTokens );

		for ( let i = 0; i < numTokens; i++ ) {
			const token = tokens[i];

			switch ( token.group ) {
				case "term" :
					code[i] = `(${this.compileTokens( token.tokens )})`;
					break;

				case "function" : {
					const numArgs = token.args.length;
					const args = new Array( numArgs );

					for ( let j = 0; j < numArgs; j++ ) {
						const source = token.args[j];

						args[j] = this.compileTokens( source.group ? source.tokens : [source] );
					}

					code[i] = `(functions["${token.name.replace( /"/g, '\\"' )}"](${args.join( "," )}))`;
					break;
				}

				default :
					switch ( token.type ) {
						case TokenType.BINARY_COMPARISON_OPERATOR :
							if ( token.value === "<>" ) {
								code[i] = "!=";
							} else {
								code[i] = token.value;
							}
							break;

						case TokenType.KEYWORD :
							if ( token.literal ) {
								code[i] = token.value;
							} else {
								code[i] = "data";

								for ( let j = 0, segments = token.path, numSegments = segments.length; j < numSegments; j++ ) {
									if ( j === numSegments - 1 ) {
										code[i] = `(${code[i]}["${segments[j].replace( /"/g, '\\"' )}"])`;
									} else {
										code[i] = `(${code[i]}["${segments[j].replace( /"/g, '\\"' )}"]||{})`;
									}
								}
							}
							break;

						default :
							code[i] = token.value;
					}
			}
		}

		return code.join( "" );
	}
}

module.exports = TermCompiler;


/**
 * @typedef {Token} TaggedToken
 * @property {boolean} operator marks if token represents an operator
 * @property {boolean} operand marks if token represents an operand
 * @property {?string[]} path provides segments in a multi-level reference to variable
 * @property {boolean} literal marks if token represents literal value
 * @property {boolean} variable marks if token is addressing variable in data provided on term processing
 * @property {boolean} function marks if token is addressing function for invocation
 */

/**
 * @typedef {TermGroup|FunctionGroup} TokenGroup
 */

/**
 * @typedef {object} RawGroup
 * @property {string} group indicates type of group, either "term" or "function"
 * @property {GroupedToken[]} tokens sequence of tokens amounting to group
 * @property {int} [offset] index into source code of first character in this group
 * @property {string} [name] name of a function in a group going to describe function invocation
 */

/**
 * @typedef {TaggedToken} TermGroup
 * @property {string} group marks current group as such, using value "term"
 * @property {GroupedToken[]} tokens sequence of tokens amounting to term
 * @property {int} offset index into source code of first character in this group
 */

/**
 * @typedef {TaggedToken} FunctionGroup
 * @property {string} group marks current group as such, using value "function"
 * @property {string} name name of function to invoke
 * @property {(TaggedToken|TermGroup)[]} args list of arguments to provide on invocation of function
 * @property {int} offset index into source code of first character in this group
 */

/**
 * @typedef {TaggedToken|TokenGroup} GroupedToken
 */
