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

const ParserModes = {
	// processing leading whitespace in a line
	LEADING_SPACE: "leading",
	// requiring LF
	LF: "lf",
	// reading characters of unquoted property name
	NAME: "name",
	// reading characters of quoted property name searching for closing quote
	QUOTED_NAME: "qname",
	// reading single escaped characters in a quoted property name
	ESCAPED_QUOTED_NAME: "escqname",
	// searching for colon separating property's name from its value
	COLON: "colon",
	// reading characters of unquoted, unfolded property value
	VALUE: "value",
	// reading characters of unquoted, folded property value
	FOLDED_VALUE: "fvalue",
	// reading characters of quoted, unfolded property value searching for
	// closing quote
	QUOTED_VALUE: "qvalue",
	// reading single escaped characters in a quoted property value
	ESCAPED_QUOTED_VALUE: "escqvalue",
	// reading characters in a comment
	COMMENT: "comment",
	// skipping any trailing space while searching next linebreak
	LINEBREAK: "lb",
};

const Errors = {
	character: "invalid character",
	indentation: "invalid indentation",
	linebreak: "invalid linebreak",
	comment: "invalid comment",
	depth: "invalid depth of hierarchy",
	exists: "replacing existing property of same object",
	collection: "invalid mix of collections",
	folded: "invalid folded value",
	quote: "missing closing quote",
	eof: "unexpected end of file",
};

const EmptyObject = {};
const EmptyArray = [];

/**
 * Throws error due to parsing issue.
 *
 * @param {string} type partial message describing cause
 * @param {int} line index of line of code error was encountered in
 * @param {int} column index of column of code error was encountered at
 * @throws Error
 * @returns {void}
 */
function ParserError( type, line, column ) {
	throw new Error( `${type} in line ${line}, column ${column}` );
}

/**
 * Replaces discovered escape sequence with character represented by sequence.
 *
 * @param {*} _ ignored (assumed full match in pattern matching)
 * @param {string} code code following backslash
 * @return {string} character represented by escape sequence
 */
function escapes( _, code ) {
	switch ( code ) {
		case "n" : return "\n";
		case "t" : return "\t";
		case "f" : return "\f";
		case "v" : return "\v";

		default :
			return code;
	}
}

/**
 * Implements very basic YAML parser not complying with any standard most
 * probably.
 */
export default class YAML {
	/**
	 * Extracts data structure from provided string assumed to contain some YAML
	 * code.
	 *
	 * @param {string} code string assumed to contain YAML code
	 * @returns {object} data structure described by YAML code
	 */
	static parse( code ) {
		if ( typeof code !== "string" ) {
			return typeof code === "object" && code ? code : null;
		}

		const numCharacters = code.length;
		const stack = [{
			depth: 0,
			selector: null,
			ref: {},
		}];

		let mode = ParserModes.LEADING_SPACE;
		let node = null;
		let line = 1;
		let column = 1;
		let startBlock = 0;


		for ( let cursor = 0; cursor < numCharacters; cursor++, column++ ) {
			const ch = code[cursor];

			switch ( mode ) {
				case ParserModes.LEADING_SPACE :
					switch ( ch ) {
						case " " :
						case "\t" :
							break;

						case "\r" :
							mode = ParserModes.LF;
							break;

						case "\n" :
							startBlock = cursor + 1;
							break;

						case "#" :
							mode = ParserModes.COMMENT;
							break;

						default : {
							const indentation = cursor - startBlock;

							if ( node ) {
								if ( node.folded ) {
									if ( indentation > node.depth ) {
										// line is folded continuation of previous line
										if ( node.value == null ) { // eslint-disable-line max-depth
											node.foldedIndentation = indentation - node.depth;
										}

										startBlock += node.depth;

										mode = ParserModes.FOLDED_VALUE;
										break;
									}

									// previous folded node has actually ended
									// at most recently passed line break
									this.consume( node, stack );
									node = null;
								}
							}


							node = {
								depth: indentation,
								line,
								column,
							};

							startBlock = cursor;

							switch ( ch ) {
								case "'" :
								case '"' :
									mode = ParserModes.QUOTED_NAME;
									break;

								case "-" :
									node.array = true;

									mode = ParserModes.VALUE;
									startBlock = cursor + 1;
									break;

								default :
									mode = ParserModes.NAME;
									cursor--;
									column--;
							}
						}
					}
					break;

				case ParserModes.LF :
					// requiring LF (having read CR before)
					if ( ch !== "\n" ) {
						ParserError( Errors.linebreak, line, column );
					}

					mode = ParserModes.LEADING_SPACE;

					startBlock = cursor + 1;
					break;

				case ParserModes.NAME :
					// passing regular content of a non-quoted property name
					// while searching for colon marking end of name
					switch ( ch ) {
						case ":" :
							node.name = code.substring( startBlock, cursor ).trim();
							mode = ParserModes.VALUE;
							startBlock = cursor + 1;
							break;

						case " " :
						case "\t" : {
							node.name = code.substring( startBlock, cursor ).trim();
							mode = ParserModes.COLON;
							break;
						}

						case "\r" :
						case "\n" :
							ParserError( Errors.linebreak, line, column );
							break;

						case "#" :
							ParserError( Errors.comment, line, column );
							break;

						default :
							if ( /[a-zA-Z0-9_]/.test( ch ) ) {
								break;
							}

							ParserError( Errors.character, line, column );
					}
					break;

				case ParserModes.QUOTED_NAME :
					// passing regular content of a quoted property name while
					// searching for closing quotes
					switch ( ch ) {
						case "\\" :
							mode = ParserModes.ESCAPED_QUOTED_NAME;
							break;

						case "\r" :
						case "\n" :
							ParserError( Errors.linebreak, line, column );
							break;

						case code[startBlock] :
							node.name = code.substring( startBlock + 1, cursor ).replace( /\\(.)/g, escapes );
							mode = ParserModes.COLON;
							break;
					}
					break;

				case ParserModes.ESCAPED_QUOTED_NAME :
					// ignoring single character in a quoted name
					switch ( ch ) {
						case "\r" :
						case "\n" :
							ParserError( Errors.linebreak, line, column );
							break;

						default :
							mode = ParserModes.QUOTED_NAME;
					}
					break;

				case ParserModes.COLON :
					// searching for colon separating name from value
					switch ( ch ) {
						case ":" :
							node.name = code.substring( startBlock, cursor );
							mode = ParserModes.VALUE;
							startBlock = cursor + 1;
							break;

						case " " :
						case "\t" :
							break;

						case "\r" :
						case "\n" :
							ParserError( Errors.linebreak, line, column );
							break;

						case "#" :
							ParserError( Errors.comment, line, column );
							break;

						default :
							ParserError( Errors.character, line, column );
					}
					break;

				case ParserModes.VALUE :
					switch ( ch ) {
						case "#" :
							node.value = code.substring( startBlock, cursor ).trim();
							mode = ParserModes.COMMENT;
							break;

						case "'" :
						case '"' :
							if ( !/\S/.test( code.substring( startBlock, cursor ) ) ) {
								mode = ParserModes.QUOTED_VALUE;
								startBlock = node.quotedValue = cursor;
							}
							break;

						case "\r" :
							node.value = code.substring( startBlock, cursor ).trim();
							mode = ParserModes.LF;
							break;

						case "\n" :
							node.value = code.substring( startBlock, cursor ).trim();
							mode = ParserModes.LEADING_SPACE;

							startBlock = cursor + 1;
							break;

						case ":" :
							if ( node.array ) {
								const passed = code.substring( startBlock, cursor );
								const trimmed = passed.trim();

								if ( /^[a-zA-Z0-9_]+$/.test( trimmed ) ) {
									node.value = EmptyObject;
									this.consume( node, stack );

									node = {
										depth: node.depth + 1 + passed.match( /^\s*/ )[0].length,
										name: trimmed,
										line,
										column,
									};

									startBlock = cursor + 1;

									break;
								}

								ParserError( Errors.character, line, column );
							}
							break;

						case "-" :
							if ( node.array ) {
								const passed = code.substring( startBlock, cursor );
								const trimmed = passed.trim();

								if ( !trimmed.length ) {
									node.value = EmptyArray;
									this.consume( node, stack );

									node = {
										depth: node.depth + 1 + passed.match( /^\s*/ )[0].length,
										array: true,
										line,
										column,
									};

									startBlock = cursor + 1;

									break;
								}

								ParserError( Errors.character, line, column );
							}
							break;
					}

					switch ( node.value ) {
						case ">" :
						case ">-" :
						case ">+" :
						case "|" :
						case "|-" :
						case "|+" :
							node.folded = node.value;
							node.value = null;
							break;

						case null :
						case undefined :
							break;

						case "" :
							// assume another line with deeper indentation
							node.value = EmptyObject;

							// falls through
						default :
							this.consume( node, stack );
							node = null;
					}

					break;

				case ParserModes.QUOTED_VALUE :
					// passing regular content of a quoted value while searching
					// for closing quotes
					switch ( ch ) {
						case "\\" :
							mode = ParserModes.ESCAPED_QUOTED_VALUE;
							break;

						case "\r" :
						case "\n" :
							ParserError( Errors.linebreak, line, column );
							break;

						case code[startBlock] :
							node.value = code.substring( startBlock + 1, cursor ).replace( /\\(.)/g, escapes );

							mode = ParserModes.LINEBREAK;
							startBlock = cursor + 1;
							break;
					}
					break;

				case ParserModes.ESCAPED_QUOTED_VALUE :
					// ignoring single character in a quoted name
					switch ( ch ) {
						case "\r" :
						case "\n" :
							ParserError( Errors.linebreak, line, column );
							break;

						default :
							mode = ParserModes.QUOTED_VALUE;
					}
					break;

				case ParserModes.FOLDED_VALUE : {
					// reading another line of a folded value's content
					let isCrLf = false;

					switch ( ch ) {
						case "\r" :
							isCrLf = true;
							// falls through

						case "\n" : {
							const _pre = code.substr( startBlock, node.foldedIndentation );
							let _line = code.substring( startBlock + node.foldedIndentation, cursor );

							const match = /\S/.exec( _pre );
							if ( match ) {
								const diff = node.foldedIndentation - match.index;
								let padding = "";

								for ( let n = 0; n < diff; n++ ) {
									padding += " ";
								}

								node.value = node.value.replace( /(^|\n[^\n]+)/g, "$1" + padding );

								node.foldedIndentation = match.index;

								_line = _pre.substr( match.index ) + _line;
							}

							node.value = ( node.value == null ? "" : node.value ) + _line;

							if ( isCrLf ) {
								mode = ParserModes.LF;
							} else {
								mode = ParserModes.LEADING_SPACE;

								startBlock = cursor + 1;
							}
							break;
						}
					}
					break;
				}

				case ParserModes.COMMENT :
					switch ( ch ) {
						case "\r" :
							mode = ParserModes.LF;
							break;

						case "\n" :
							mode = ParserModes.LEADING_SPACE;

							startBlock = cursor + 1;
					}
					break;

				case ParserModes.LINEBREAK :
					// skipping trailing whitespace after some quoted value
					// while searching next linebreak
					switch ( ch ) {
						case " " :
						case "\t" :
							break;

						case "\r" :
							this.consume( node, stack );
							node = null;

							mode = ParserModes.LF;
							break;

						case "\n" :
							this.consume( node, stack );
							node = null;

							mode = ParserModes.LEADING_SPACE;

							startBlock = cursor + 1;
							break;

						case "#" :
							this.consume( node, stack );
							node = null;

							mode = ParserModes.COMMENT;
							break;

						case ":" :
							if ( node.array && typeof node.value === "string" ) {
								const trimmed = node.value;

								if ( /^[a-zA-Z0-9_]+$/.test( trimmed ) ) {
									node.value = EmptyObject;
									this.consume( node, stack );

									node = {
										depth: node.startQuote + 1 + node.value.match( /^\s*/ )[0].length,
										name: trimmed,
										line,
										column,
									};

									mode = ParserModes.VALUE;
									startBlock = cursor + 1;

									break;
								}
							}

							ParserError( Errors.character, line, column );
							break;

						default :
							ParserError( Errors.character, line, column );
					}
					break;
			}

			if ( ch === "\n" ) {
				if ( node && node.folded && node.value != null ) {
					node.value += "\n";
				}

				line++;
				column = 0;
			}
		}

		switch ( mode ) {
			case ParserModes.VALUE :
				node.value = code.substring( startBlock ).trim();
				switch ( node.value ) {
					case "|" :
					case ">" :
						ParserError( Errors.folder, line, column );
						break;

					case "" :
						// assume another line with deeper indentation
						node.value = EmptyObject;

					// falls through
					default :
						this.consume( node, stack );
						node = null;
				}
				break;

			case ParserModes.LINEBREAK :
				this.consume( node, stack );
				break;

			case ParserModes.LEADING_SPACE :
				break;

			case ParserModes.QUOTED_NAME :
			case ParserModes.ESCAPED_QUOTED_NAME :
			case ParserModes.QUOTED_VALUE :
			case ParserModes.ESCAPED_QUOTED_VALUE :
				ParserError( Errors.quote, line, column );
				break;

			default :
				ParserError( Errors.eof, line, column );
		}

		return stack[stack.length - 1].ref;
	}

	/**
	 * Collects provided node in given context.
	 *
	 * @param {object} node description of parsed node to be collected
	 * @param {object} contextStack LIFO queue of objects to consume data
	 * @returns {void}
	 */
	static consume( node, contextStack ) {
		const { depth } = node;

		if ( !isNaN( parseInt( depth ) ) ) {
			for ( ;; ) {
				const frame = contextStack[0];
				if ( !frame ) {
					ParserError( Errors.depth, node.line, node.column );
					return;
				}

				const frameDepth = frame.depth;

				if ( isNaN( frameDepth ) ) {
					// started new level before without knowing its level
					// -> adopting level of now provided node
					frame.depth = depth;
					break;
				}

				if ( frameDepth === depth ) {
					// found existing frame matching node's indentation
					break;
				}

				if ( frameDepth < depth ) {
					ParserError( Errors.indentation, node.line, node.column );
				}

				contextStack.shift();
			}
		}


		// found existing frame with less indentation than node in stack
		// sorted by indentation
		switch ( node.value ) {
			case EmptyArray :
			case EmptyObject : {
				// got proper node marking start of another level of hierarchy
				// -> put another frame with node's indentation onto stack
				const ref = contextStack[0].ref;
				const isArray = Array.isArray( ref );
				const selector = isArray ? ref.length : node.name;
				const sub = node.value === EmptyArray ? [] : {};

				contextStack.unshift( {
					depth: NaN,
					selector,
					ref: sub,
				} );

				if ( isArray ) {
					ref.push( sub );
				} else {
					ref[node.name] = sub;
				}

				return;
			}
		}


		let collector = contextStack[0].ref;

		if ( node.array ^ Array.isArray( collector ) ) {
			// mismatching type of collection at current level of hierarchy
			if ( Object.keys( collector ).length > 0 ) {
				ParserError( Errors.collection, node.line, node.column );
				return;
			}

			// need to switch current level's type of collection
			const { selector } = contextStack[0];

			if ( node.array ) {
				collector = contextStack[0].ref = [];
			} else {
				collector = contextStack[0].ref = {};
			}

			if ( selector && contextStack.length > 1 ) {
				contextStack[1].ref[selector] = contextStack[0].ref;
			}
		}

		switch ( node.value ) {
			case EmptyObject :
			case EmptyArray :
				ParserError( Errors.indentation, node.line, node.column );
				break;

			default :
				if ( node.folded ) {
					const mode = /^([|>])([+-])?$/.exec( node.folded );
					node.value = node.value.replace( /(\n\s*$)|(?:\n([^ \t]))/g, ( _, end, inner ) => {
						if ( end ) {
							switch ( mode[2] ) {
								case "+" :
									return end;

								case "-" :
									return "";

								default :
									return "\n";
							}
						}

						return ( mode[1] === ">" ? inner === "\n" ? "" : " " : "\n" ) + inner;
					} );
				} else if ( !node.quotedValue ) {
					const trimmedValue = node.value.trim();

					if ( trimmedValue === "null" ) {
						node.value = null;
					} else if ( /^y(?:es)?|true|on$/i.test( trimmedValue ) ) {
						node.value = true;
					} else if ( /^no?|false|off$/i.test( trimmedValue ) ) {
						node.value = false;
					} else if ( /^[+-]?\d(?:\.[d]+)?$/i.test( trimmedValue ) ) {
						node.value = parseFloat( trimmedValue );
					} else {
						node.value = trimmedValue;
					}
				}
		}

		if ( node.array ) {
			collector.push( node.value );
		} else {
			collector[node.name] = node.value;
		}
	}
}
