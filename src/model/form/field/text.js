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
import L10n from "@/service/l10n";
import Data from "../../../service/data";

const ptnPatternSyntax = /^\s*\/(.+)\/([gi]?)\s*$/i;

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
				 * @property {Range|string|Array} value
				 *		Examples:
				 *			10-40			content is valid iff text contains between 10 and 40 characters
				 *			10-40 chars		content is valid iff text contains between 10 and 40 characters
				 *			-5 words		content is valid iff text contains up to five words
				 *			[ "-200 chars", "-3 lines" ]
				 *							content is valid iff text contains up to 200 characters in up to three lines
				 * @readonly
				 */

				const _units = {
					CHAR:	[ "c", "character", "characters", "char", "chars" ],
					WORD:	[ "w", "word", "words" ],
					LINE:	[ "l", "line", "lines" ],
				};

				const _sizes = {};

				if ( Array.isArray( value ) && value.every( item => !isNaN( parseFloat( item ) ) && isFinite( item ) ) ) {
					_sizes.CHAR = termHandler( value, rawValue => new Range( rawValue ) ).value;
					return { value: _sizes };
				}

				if ( ( Array.isArray( value ) && value.length > 0 ) || typeof value === "string" ) {
					const _values = Array.isArray( value ) ? value : [value];
					for ( let i = 0; i < _values.length; i++ ) {
						const matches = /^\s*(.+)\s+(\w+)\s*$/.exec( _values[i] );
						if ( matches ) {
							// (The current option ends with a word.)
							// Check if word is a known unit:
							const _unitKeys = Object.keys( _units );
							let k;
							for ( k = 0; k < _unitKeys.length; k++ ) {
								if ( _units[_unitKeys[k]].indexOf( matches[2] ) > -1 ) {
									break;
								}
							}
							if ( k < _unitKeys.length ) {
								_sizes[_unitKeys[k]] = termHandler( matches[1], rawValue => new Range( rawValue ) ).value;
								continue;
							}
						}
						_sizes.CHAR = termHandler( _values[i], rawValue => new Range( rawValue ) ).value;
					}
				} else {
					_sizes.CHAR = termHandler( value, rawValue => new Range( rawValue ) ).value;
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
				 * Configures field to show the number of used characters/ words/ lines under the input
				 *
				 * The displayed information depends on option 'size'.
				 *
				 * @name FormFieldTextModel#counter
				 * @property {boolean|string} value
				 *		Known values:
				 *			false					hide counter
				 *			true					count characters/ words/ lines
				 *			up						count characters/ words/ lines
				 *			down					count remaining characters/ words/ lines
				 * @readonly
				 */
				const _value = String( value ).trim().toLowerCase();

				switch ( _value ) {
					case "up" :
					case "down" :
						return { value: { mode: _value, caption: null } };
					default :
						return { value: { mode: Data.normalizeToBoolean( _value ), caption: null } };
				}
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
					"align-" + this.align,
				];

				if ( this.prefix == null ) {
					classes.push( "without-prefix" );
				} else {
					classes.push( "with-prefix" );
					elements.push( createElement( "span", {
						class: "prefix",
					}, this.prefix ) );
				}

				const domProps = {
					value: reactiveFieldInfo.formattedValue,
				};

				if ( this.disabled ) {
					domProps.disabled = true;
				}

				if ( this.placeholder != null ) {
					domProps.placeholder = this.placeholder + ( this.required && !this.label ? "*" : "" );
				}

				if ( !that.multiline ) {
					domProps.type = "text";
				}

				elements.push( createElement( that.multiline ? "textarea" : "input", {
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

				if ( this.suffix == null ) {
					classes.push( "without-suffix" );
				} else {
					classes.push( "with-suffix" );
					elements.push( createElement( "span", {
						class: "suffix",
					}, this.suffix ) );
				}

				const _counter = [];
				if ( that.counter.mode ) {
					const _sizeGroups = Object.keys( that.size );

					const translate = ( id, ...args ) => {
						const argCount = ( L10n.translate( this.$store.getters.l10n, id ).replace( "%%", "" ).match( /%s|%d|%j/g ) || [] ).length;

						args.splice( argCount );
						args.unshift( id );
						args.unshift( this.$store.getters.l10n );

						return L10n.translate.apply( this, args );
					};

					let value = String( this.value == null ? "" : this.value ).trim();
					// apply optional reducer to strip off characters to be ignored on validating
					const { reducer } = this;
					if ( reducer ) {
						// https://stackoverflow.com/a/16046903/3182819
						const numCaptures = ( new RegExp( reducer.source + "|" ) ).exec( "" ).length - 1;
						value = value.replace( reducer, ( _, ...captures ) => captures.slice( 0, numCaptures ).join( "" ) );
					}

					if ( that.counter.mode === "down" ) {
						for ( let i = 0; i < _sizeGroups.length; i++ ) {
							if ( !isFinite( that.size[_sizeGroups[i]].upper ) ) {
								continue;
							}
							// eslint-disable-next-line no-extra-parens
							let n = that.size[_sizeGroups[i]].upper - ( that.size[_sizeGroups[i]].upperInclusive ? 0 : 1 );
							switch ( _sizeGroups[i] ) {
								case "CHAR" :	n -= value.length;										break;
								case "WORD" :	n -= ( value.match( /\S+/g ) || [] ).length;			break;
								case "LINE" :	n -= ( value.match( /\r\n?|\n/g ) || [] ).length + 1;	break;
								default :	throw new TypeError( `unknown size-group: ${_sizeGroups[i]}` );
							}
							if ( _counter.length > 0 ) {
								_counter.push( ", " );
							}
							switch ( n ) {
								case 0 :
									_counter.push( translate( `COUNTER.${_sizeGroups[i]}_NONE`, n ) );
									break;
								case 1 :
									_counter.push( translate( `COUNTER.${_sizeGroups[i]}_SINGLE`, n ) );
									break;
								case -1 :
									_counter.push( "<span class=\"invalid\">" + translate( `COUNTER.${_sizeGroups[i]}_NEGATIVE_SINGLE`, -n ) + "</span>" );
									break;
								default :
									if ( n < 0 ) {
										_counter.push( "<span class=\"invalid\">" + translate( `COUNTER.${_sizeGroups[i]}_NEGATIVE_MULTI`, -n ) + "</span>" );
									} else {
										_counter.push( translate( `COUNTER.${_sizeGroups[i]}_MULTI`, n ) );
									}
							}
						}
						if ( _counter.length > 0 ) {
							this.counter.caption = translate( "COUNTER.DOWN", _counter.join( "" ) );
						}
					} else {
						for ( let i = 0; i < _sizeGroups.length; i++ ) {
							let n;
							switch ( _sizeGroups[i] ) {
								default :
								case "CHAR" :	n = value.length;										break;
								case "WORD" :	n = ( value.match( /\S+/g ) || [] ).length;				break;
								case "LINE" :	n = ( value.match( /\r\n?|\n/g ) || [] ).length + 1;	break;
							}
							if ( _counter.length > 0 ) {
								_counter.push( ", " );
							}
							let s;
							switch ( n ) {
								case 0 :	s = translate( `COUNTER.${_sizeGroups[i]}_NONE`, n );	break;
								case 1 :	s = translate( `COUNTER.${_sizeGroups[i]}_SINGLE`, n );	break;
								default :	s = translate( `COUNTER.${_sizeGroups[i]}_MULTI`, n );	break;
							}
							if (
								isFinite( that.size[_sizeGroups[i]].upper ) &&
								n > ( that.size[_sizeGroups[i]].upper - ( that.size[_sizeGroups[i]].upperInclusive ? 0 : 1 ) )
							) {
								_counter.push( `<span class="invalid">${s}</span>` );
							} else {
								_counter.push( s );
							}
						}
						if ( _counter.length > 0 ) {
							this.counter.caption = translate( "COUNTER.UP", _counter.join( "" ) );
						}
					}

					classes.push( "with-counter" );
				}

				return createElement( "div", { class: classes, }, elements );
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
			CHAR:	value.length,
			WORD:	( value.match( /\S+/g ) || [] ).length,
			LINE:	( value.match( /\r\n?|\n/g ) || [] ).length + 1,
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
				if ( !live && this.size[_sizeGroups[i]].isBelowRange( counting[_sizeGroups[i]] ) ) {
					errors.push( "@VALIDATION.TOO_SHORT" );
				}
				if ( this.size[_sizeGroups[i]].isAboveRange( counting[_sizeGroups[i]] ) ) {
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
