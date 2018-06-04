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
 * Lists supported types of tokens.
 *
 * @name TokenTypes
 * @type {object<string,Symbol>}
 */
const TokenTypes = Object.freeze( {
	WHITESPACE: Symbol( "whitespace" ),
	KEYWORD: Symbol( "keyword" ),
	BINARY_COMPARISON_OPERATOR: Symbol( "binary_comparison_operator" ),
	BINARY_ARITHMETIC_OPERATOR: Symbol( "binary_arithmetic_operator" ),
	BINARY_LOGIC_OPERATOR: Symbol( "binary_logic_operator" ),
	UNARY_LOGIC_OPERATOR: Symbol( "unary_operator" ),
	DEREF_OPERATOR: Symbol( "deref_operator" ),
	PARENTHESIS: Symbol( "parenthesis" ),
	LITERAL_INTEGER: Symbol( "literal_integer" ),
	LITERAL_FLOAT: Symbol( "literal_float" ),
	LITERAL_STRING: Symbol( "literal_string" ),
	COMMA: Symbol( "comma" ),
} );

/**
 * Lists supported operators consisting of two characters.
 *
 * @type {string[]}
 */
const DoubleCharOperators = [
	"==",
	">=",
	"<=",
	"<>",
	"&&",
	"||",
];

/**
 * Converts string of characters into string of tokens.
 */
class TermTokenizer {
	/**
	 * Exposes all types of tokens supported by tokenizer.
	 *
	 * @returns {object<string,Symbol>} list of supported token types
	 */
	static get Types() { return TokenTypes; }

	/**
	 * Converts provided string of characters into sequence of tokens.
	 *
	 * @param {string} code string of characters
	 * @param {boolean} omitWhitespace set true to exclude whitespace tokens from resulting sequence
	 * @returns {Token[]} resulting sequence of tokens
	 */
	static tokenizeString( code, omitWhitespace = false ) {
		const tokens = [];
		const length = code.length;
		let cursor = 0;
		let start = 0;
		let type = null;
		let newType = null;
		let previousChar = null;

		for ( ; cursor < length; cursor++ ) {
			newType = type;

			const currentChar = code.charAt( cursor );

			switch ( type ) {
				case TokenTypes.LITERAL_STRING :
					if ( currentChar === code.charAt( start ) ) {
						tokens.push( {
							type,
							value: code.substring( start, cursor + 1 ),
							offset: start,
						} );

						newType = type = null;
						start = cursor + 1;
					}
					break;

				default :
					switch ( currentChar ) {
						case " " :
						case "\r" :
						case "\n" :
						case "\t" :
						case "\f" :
							newType = TokenTypes.WHITESPACE;
							break;

						case "=" :
						case "<" :
						case ">" :
							newType = TokenTypes.BINARY_COMPARISON_OPERATOR;
							break;

						case "/" :
						case "*" :
						case "+" :
						case "-" :
							newType = TokenTypes.BINARY_ARITHMETIC_OPERATOR;
							break;

						case "&" :
						case "|" :
							newType = TokenTypes.BINARY_LOGIC_OPERATOR;
							break;

						case "!" :
							newType = TokenTypes.UNARY_LOGIC_OPERATOR;
							break;

						case "," :
							newType = TokenTypes.COMMA;
							break;

						case "." :
							switch ( type ) {
								case TokenTypes.LITERAL_INTEGER :
									newType = type = TokenTypes.LITERAL_FLOAT;
									break;

								case TokenTypes.BINARY_ARITHMETIC_OPERATOR :
									switch ( code.charAt( cursor - 1 ) ) {
										case "+" :
										case "-" :
											newType = type = TokenTypes.LITERAL_FLOAT;
											break;

										default :
											newType = TokenTypes.DEREF_OPERATOR;
									}
									break;

								default :
									newType = TokenTypes.DEREF_OPERATOR;
							}
							break;

						case "(" :
						case ")" :
							newType = TokenTypes.PARENTHESIS;
							break;

						case "0" :
						case "1" :
						case "2" :
						case "3" :
						case "4" :
						case "5" :
						case "6" :
						case "7" :
						case "8" :
						case "9" :
							switch ( type ) {
								case TokenTypes.BINARY_ARITHMETIC_OPERATOR :
									switch ( code.charAt( cursor - 1 ) ) {
										case "+" :
										case "-" :
											type = TokenTypes.LITERAL_INTEGER;
									}

									newType = TokenTypes.LITERAL_INTEGER;
									break;

								case TokenTypes.DEREF_OPERATOR :
									newType = type = TokenTypes.LITERAL_FLOAT;
									break;

								case TokenTypes.KEYWORD :
								case TokenTypes.LITERAL_FLOAT :
									break;

								default :
									newType = TokenTypes.LITERAL_INTEGER;
							}
							break;

						case "\"" :
						case "'" :
							newType = TokenTypes.LITERAL_STRING;
							break;

						default : {
							const cp = code.codePointAt( cursor );
							if ( ( cp >= 0x41 && cp <= 0x5a ) || ( cp >= 0x61 && cp <= 0x7a ) || cp === 0x5f ) {
								// latin letters and underscore
								newType = TokenTypes.KEYWORD;
							}
						}
					}
			}

			if ( newType === type ) {
				// assumption: cursor > start

				switch ( newType ) {
					case TokenTypes.BINARY_COMPARISON_OPERATOR :
					case TokenTypes.BINARY_ARITHMETIC_OPERATOR :
					case TokenTypes.BINARY_LOGIC_OPERATOR : {
						// assumption: cursor == start + 1
						if ( DoubleCharOperators.indexOf( previousChar + currentChar ) > -1 ) {
							// consume double-character binary operator
							tokens.push( {
								type,
								value: code.substring( start, cursor + 1 ),
								offset: start,
							} );

							type = null;
							start = cursor + 1;
						} else {
							// consume non-combinable operator detected before
							tokens.push( {
								type,
								value: code.substring( start, cursor ),
								offset: start,
							} );

							start = cursor;
						}
						break;
					}
				}
			} else {
				// current character belongs to different type of token
				// -> consume any previously processed token
				if ( start !== cursor ) {
					if ( !omitWhitespace || type !== TokenTypes.WHITESPACE ) {
						tokens.push( {
							type,
							value: code.substring( start, cursor ),
							offset: start,
						} );
					}
				}

				switch ( newType ) {
					case TokenTypes.PARENTHESIS :
					case TokenTypes.UNARY_LOGIC_OPERATOR :
					case TokenTypes.COMMA :
						// instantly consume current token, too
						tokens.push( {
							type: newType,
							value: code.substr( cursor, 1 ),
							offset: cursor,
						} );

						start = cursor + 1;
						type = newType = null;
						break;

					default :
						start = cursor;
						type = newType;
				}
			}

			previousChar = currentChar;
		}

		if ( start !== cursor ) {
			if ( !omitWhitespace || type !== TokenTypes.WHITESPACE ) {
				tokens.push( {
					type,
					value: code.substring( start, cursor ),
					offset: start,
				} );
			}
		}

		return tokens;
	}
}

module.exports = TermTokenizer;


/**
 * @typedef {object} Token
 * @property {int} type type of token
 * @property {string} value value of token
 * @property {int} offset extracted token's index into source code
 */
