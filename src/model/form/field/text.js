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

import FormFieldAbstractModel from "./abstract";
import Range from "../utility/range";
import Pattern from "../utility/pattern";
import Format from "../utility/format";
import Data from "../../../service/data";

const ptnPatternSyntax = /^\s*\/(.+)\/([gi]?)\s*$/i;
const ptnAmount = /^[1-9]\d*$/;

/**
 * Manages single field of form representing text input.
 */
export default class FormFieldTextModel extends FormFieldAbstractModel {
	/** @inheritDoc */
	constructor( form, definition, fieldIndex, reactiveFieldInfo, customProperties = {}, container = null ) {
		super( form, definition, fieldIndex, reactiveFieldInfo, {
			size( value, _, __, termHandler ) {
				/**
				 * Defines valid range of a value's length.
				 *
				 * @name FormFieldTextModel#size
				 * @property {Range}
				 * @readonly
				 */

				const _units = {
					"c:character:characters":	[ "c", "character", "characters" ],
					"c:char:chars":				[ "char", "chars" ],
					"w:word:words":				[ "w", "word", "words" ],
					"l:line:lines":				[ "l", "line", "lines" ],
				};

				const _sizes = {};

				if ( Array.isArray( value ) && value.every( item => !isNaN( parseFloat( item ) ) && isFinite( item ) ) ) {
					_sizes.c = {				/* eslint-disable key-spacing */
						range:		termHandler( value, rawValue => new Range( rawValue ) ).value,
						singular:	"character",
						plural:		"characters",
					};							/* eslint-enable key-spacing */
					return { value: _sizes };
				}

				if ( ( Array.isArray( value ) && value.length > 0 ) || typeof value === "string" ) {
					const _values = Array.isArray( value ) ? value : [value];
					for ( let i = 0; i < _values.length; i++ ) {
						const matches = /^\s*(.+)\s+(\w+)\s*$/.exec( _values[i] );
						if ( matches ) {
							// (The current range is followed by a word.)
							const _unitKeys = Object.keys( _units );
							let k;
							for ( k = 0; k < _unitKeys.length; k++ ) {
								if ( _units[_unitKeys[k]].indexof( matches[2] ) ) {
									break;
								}
							}
							if ( k < _unitKeys.length ) {
								const _unitInfo = _unitKeys[k].split( ":" );
								_sizes[_unitInfo[0]] = {	/* eslint-disable key-spacing */
									singular:	_unitInfo[1],
									plural:		_unitInfo[2],
									range:		termHandler( matches[1], rawValue => new Range( rawValue ) ).value,
								};							/* eslint-enable key-spacing */
								continue;
							}
						}
						_sizes.c = {				/* eslint-disable key-spacing */
							singular:	"character",
							plural:		"characters",
							range:		termHandler( _values[i], rawValue => new Range( rawValue ) ).value,
						};							/* eslint-enable key-spacing */
					}
				} else {
					_sizes.c = {				/* eslint-disable key-spacing */
						range:		termHandler( value, rawValue => new Range( rawValue ) ).value,
						singular:	"character",
						plural:		"characters",
					};							/* eslint-enable key-spacing */
				}

				return { value: _sizes };
			},

			upperCase( value, _, __, termHandler ) {
				/**
				 * Configures field to convert all input to upper-case letters
				 * if applicable.
				 *
				 * @name FormFieldTextModel#upperCase
				 * @property {boolean}
				 * @readonly
				 */
				return termHandler( value, rawValue => Data.normalizeToBoolean( rawValue ) );
			},

			lowerCase( value, _, __, termHandler ) {
				/**
				 * Configures field to convert all input to lower-case letters
				 * if applicable.
				 *
				 * @name FormFieldTextModel#lowerCase
				 * @property {boolean}
				 * @readonly
				 */
				return termHandler( value, rawValue => Data.normalizeToBoolean( rawValue ) );
			},

			pattern( value ) {
				/**
				 * Exposes compiled pattern optionally defined on field.
				 *
				 * @name FormFieldTextModel#pattern
				 * @property {?CompiledPattern}
				 * @readonly
				 */
				return { value: value == null ? null : Pattern.compilePattern( value ) };
			},

			normalization( value ) {
				/**
				 * Exposes normalization mode selected in field's definition.
				 *
				 * @name FormFieldTextModel#normalization
				 * @property {string}
				 * @readonly
				 */
				const _value = value == null ? "trim" : String( value ).trim().toLowerCase();

				switch ( _value ) {
					case "none" :
					case "trim" :
					case "reduce" :
						return { value: _value };

					default :
						throw new TypeError( `invalid normalization mode: ${value}` );
				}
			},

			placeholder( value, _, __, termHandler ) {
				/**
				 * Defines some text to be displayed in bounds of text input
				 * control unless user has entered some text already.
				 *
				 * @name FormFieldTextModel#placeholder
				 * @property {?string}
				 * @readonly
				 */
				return termHandler( value, rawValue => {
					const localized = this.selectLocalization( rawValue );

					return localized == null ? null : String( localized ).trim() || null;
				} );
			},

			align( value, _, __, termHandler ) {
				/**
				 * Defines some desired alignment for content of text field.
				 *
				 * @name FormFieldTextModel#align
				 * @property {?string}
				 * @readonly
				 */
				return termHandler( value, rawValue => {
					const _value = rawValue == null ? null : String( rawValue ).trim().toLowerCase() || null;

					switch ( _value ) {
						case "right" :
							return _value;

						case "left" :
						default :
							return "left";
					}
				} );
			},

			prefix( value, _, __, termHandler ) {
				/**
				 * Defines some static text to appear in front of text field.
				 *
				 * @name FormFieldTextModel#prefix
				 * @property {?string}
				 * @readonly
				 */
				return termHandler( value, rawValue => {
					return rawValue == null ? null : String( rawValue ).trim() || null;
				} );
			},

			suffix( value, _, __, termHandler ) {
				/**
				 * Defines some static text to appear next to the text field.
				 *
				 * @name FormFieldTextModel#suffix
				 * @property {?string}
				 * @readonly
				 */
				return termHandler( value, rawValue => {
					return rawValue == null ? null : String( rawValue ).trim() || null;
				} );
			},

			reducer( value, _, __, termHandler ) {
				/**
				 * Defines optional regular expression used to reduce input prior
				 * to its eventual validation.
				 *
				 * @name FormFieldTextModel#reducer
				 * @property {?RegExp}
				 * @readonly
				 */
				return termHandler( value, rawValue => {
					if ( rawValue == null ) {
						return null;
					}

					const stringValue = String( rawValue ).trim();
					if ( stringValue === "" ) {
						return null;
					}

					const match = ptnPatternSyntax.exec( stringValue );
					if ( match ) {
						return new RegExp( match[1], match[2] );
					}

					return new RegExp( stringValue );
				} );
			},

			regexp( value, _, __, termHandler ) {
				/**
				 * Defines optional regular expression input has to match.
				 *
				 * @name FormFieldTextModel#regexp
				 * @property {?RegExp}
				 * @readonly
				 */
				return termHandler( value, rawValue => {
					if ( rawValue == null ) {
						return null;
					}

					const stringValue = String( rawValue ).trim();
					if ( stringValue === "" ) {
						return null;
					}

					const match = ptnPatternSyntax.exec( stringValue );
					if ( match ) {
						return new RegExp( match[1], match[2] );
					}

					return new RegExp( stringValue );
				} );
			},

			multiline( value, _, __, termHandler ) {
				/**
				 * Configures field to use a multiline-input
				 *
				 * @name FormFieldTextModel#multiline
				 * @property {boolean}
				 * @readonly
				 */
				return termHandler( value, rawValue => Data.normalizeToBoolean( rawValue ) );
			},

			counter( value ) {
				/**
				 * Configures field to show the number of used characters/
				 * words/ lines under the input
				 *
				 * @name FormFieldTextModel#counter
				 * @property {boolean|string} value
				 *		Known values:
				 *			false					hide counter
				 *			true					count characters/ words/ lines (depends on option 'size')
				 *			up						count characters/ words/ lines (depends on option 'size')
				 *			down					count remaining characters/ words/ lines (depends on option 'size')
				 * @readonly
				 */
				const _values = String( value ).trim().toLowerCase().split( /\W/ );
				const _counter = { down: false, chars: false, words: false, lines: false };

				for ( let i = _values.length - 1; i >= 0; i-- ) {
					switch ( _values[i] ) {
						case "up" :
							_counter.down = false;
							break;
						case "down" :
							_counter.down = true;
							break;
						case "char" :
						case "chars" :
						case "character" :
						case "characters" :
							// eslint-disable-next-line no-extra-parens
							_counter.chars = ( i > 0 && ptnAmount.test( _values[i - 1] ) ) ? parseInt( _values[--i] ) : true;
							break;
						case "word" :
						case "words" :
							// eslint-disable-next-line no-extra-parens
							_counter.words = ( i > 0 && ptnAmount.test( _values[i - 1] ) ) ? parseInt( _values[--i] ) : true;
							break;
						case "line" :
						case "lines" :
							// eslint-disable-next-line no-extra-parens
							_counter.lines = ( i > 0 && ptnAmount.test( _values[i - 1] ) ) ? parseInt( _values[--i] ) : true;
							break;
						default :
							if ( ptnAmount.test( _values[i] ) ) {
								_counter.chars = parseInt( _values[i] );
								break;
							}
							if ( Data.normalizeToBoolean( _values[i] ) ) {
								return { value: { down: false, chars: true, words: false, lines: false } };
							}
							return { value: null };
					}
				}

				if ( _counter.chars || _counter.words || _counter.lines ) {
					return { value: _counter };
				}

				return { value: null };
			},

			...customProperties,
		}, container );
	}

	/** @inheritDoc */
	normalizeValue( value, options = {} ) {
		let fixedValue = value == null ? "" : String( value );

		const originalLength = fixedValue.length;
		const cursorAtEnd = options.at === originalLength;


		// adjust case
		if ( this.upperCase ) {
			fixedValue = fixedValue.toLocaleUpperCase();
		} else if ( this.lowerCase ) {
			fixedValue = fixedValue.toLocaleLowerCase();
		}

		if ( fixedValue.length !== originalLength && cursorAtEnd ) {
			options.at += fixedValue.length - originalLength;
		}


		// apply pattern
		let formattedValue = fixedValue;

		const pattern = this.pattern;
		if ( pattern ) {
			const { valuable, formatted } = Pattern.parse( fixedValue, pattern, {
				keepTrailingLiterals: !options.removing,
				cursorPosition: options.at,
			} );

			fixedValue = valuable.value;
			formattedValue = formatted.value;
			options.at = formatted.cursor;
		}


		// normalize whitespace
		switch ( this.normalization ) {
			case "trim" :
			case "reduce" : {
				const match = /^(\s*)(.*?)(\s*)$/.exec( fixedValue );
				if ( match ) {
					fixedValue = match[2];
				}
			}
		}

		switch ( this.normalization ) {
			case "reduce" : {
				const numChars = fixedValue.length;
				const chars = new Array( numChars );
				let write = 0;
				let reduced = false;

				for ( let i = 0, spaceBefore = false; i < numChars; i++ ) {
					const char = fixedValue.charAt( i );
					switch ( char ) {
						case " " :
						case "\t" :
						case "\r" :
						case "\n" :
						case "\v" :
						case "\f" :
							if ( spaceBefore ) {
								reduced = true;
							} else {
								spaceBefore = true;
								chars[write++] = char;
							}
							break;

						default :
							spaceBefore = false;
							chars[write++] = char;
					}
				}

				if ( reduced ) {
					chars.splice( write );

					fixedValue = chars.join( "" );
				}
			}
		}


		return {
			value: fixedValue,
			formattedValue,
		};
	}

	/** @inheritDoc */
	renderFieldComponent( reactiveFieldInfo ) {
		const that = this;

		let lastValue = null;

		return {
			render( createElement ) {
				const elements = [];
				const classes = [
					"align-" + that.align,
				];

				if ( that.prefix == null ) {
					classes.push( "without-prefix" );
				} else {
					classes.push( "with-prefix" );
					elements.push( createElement( "span", {
						class: "prefix",
					}, that.prefix ) );
				}

				const domProps = {
					// type: "text",
					value: reactiveFieldInfo.formattedValue,
				};

				if ( that.disabled ) {
					domProps.disabled = true;
				}

				if ( that.placeholder != null ) {
					domProps.placeholder = that.placeholder + ( that.required && !that.label ? "*" : "" );
				}

				if ( that.multiline ) {
					elements.push( createElement( "textarea", {
						domProps,
						on: {
							input: event => {
								const { value: input, selectionStart } = event.target;

								const length = input.length;
								const options = {
									removing: lastValue != null && length < lastValue.length,
									at: selectionStart,
								};

								const { value, formattedValue } = that.normalizeValue( input, options );

								event.target.value = lastValue = formattedValue;
								event.target.setSelectionRange( options.at, options.at );

								// re-emit in scope of this field's type-specific
								// component (containing input element created here)
								this.$emit( "input", value );
							},
						},
					} ) );
				} else {
					domProps.type = "text";
					elements.push( createElement( "input", {
						domProps,
						on: {
							input: event => {
								const { value: input, selectionStart } = event.target;

								const length = input.length;
								const options = {
									removing: lastValue != null && length < lastValue.length,
									at: selectionStart,
								};

								const { value, formattedValue } = that.normalizeValue( input, options );

								event.target.value = lastValue = formattedValue;
								event.target.setSelectionRange( options.at, options.at );

								// re-emit in scope of this field's type-specific
								// component (containing input element created here)
								this.$emit( "input", value );
							},
						},
					} ) );
				}

				if ( that.suffix == null ) {
					classes.push( "without-suffix" );
				} else {
					classes.push( "with-suffix" );
					elements.push( createElement( "span", {
						class: "suffix",
					}, that.suffix ) );
				}

				if ( that.counter == null ) {
					return createElement( "div", { class: classes, }, elements );
				}

				return createElement( "div", { class: "with-counter" }, [
					createElement( "div", { class: classes, }, elements ),
					createElement( "div", { class: "counter" }, that.value.length )
				] );
			},
			data: () => reactiveFieldInfo,
		};
	}

	/** @inheritDoc */
	validate( live ) {
		const errors = super.validate();


		let value = String( this.value == null ? "" : this.value ).trim();

		// apply optional reducer to strip off characters to be ignored on validating
		const { reducer } = this;
		if ( reducer ) {
			// https://stackoverflow.com/a/16046903/3182819
			const numCaptures = ( new RegExp( reducer.source + "|" ) ).exec( "" ).length - 1;

			value = value.replace( reducer, ( _, ...captures ) => captures.slice( 0, numCaptures ).join( "" ) );
		}

		const counting = {
			c:	value.length,
			w:	( value.match( /\S+/g ) || [] ).length,
			l:	( value.match( /\r\n?|\n/g ) || [] ).length + 1,
		};

		// perform basic validations
		if ( this.required && !value.length ) {
			errors.push( "@VALIDATION.MISSING_REQUIRED" );
		} else {
			const _sizeGroups = Object.keys( this.size );
			for ( let i = 0; i < _sizeGroups.length; i++ ) {
				if ( !counting.hasOwnProperty( _sizeGroups[i] ) ) {
					throw new TypeError( `unknown size-group: ${_sizeGroups[i]}` );
				}
				if ( !live && this.size[_sizeGroups[i]].range.isBelowRange( counting[_sizeGroups[i]] ) ) {
					errors.push( "@VALIDATION.TOO_SHORT" );
				}
				if ( this.size[_sizeGroups[i]].range.isAboveRange( counting[_sizeGroups[i]] ) ) {
					errors.push( "@VALIDATION.TOO_LONG" );
				}
			}

			// check for complying with optionally selected format
			let { format } = this;
			if ( format ) {
				format = String( format ).trim().toLowerCase();

				if ( typeof Format[format] === "function" ) {
					const result = Format[format]( value, Boolean( live ), this, { countryCodes: this.countryCodes } );
					if ( result.errors ) {
						errors.splice( errors.length, 0, ...result.errors );
					}
				}
			}


			// check for complying with custom pattern
			if ( !live ) {
				const { regexp } = this;

				if ( regexp && !regexp.test( value ) ) {
					errors.push( "@VALIDATION.PATTERN_MISMATCH" );
				}
			}
		}


		return errors;
	}
}
