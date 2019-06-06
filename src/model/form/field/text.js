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

const sizeUnits = {
	char: [ "c", "character", "characters", "char", "chars" ],
	word: [ "w", "word", "words" ],
	line: [ "l", "line", "lines" ],
};


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
				 *        Examples:
				 *            10-40            content is valid iff text contains between 10 and 40 characters
				 *            10-40 chars        content is valid iff text contains between 10 and 40 characters
				 *            -5 words        content is valid iff text contains up to five words
				 *            [ "-200 chars", "-3 lines" ]
				 *                            content is valid iff text contains up to 200 characters in up to three lines
				 * @readonly
				 */

				const unitNames = Object.keys( sizeUnits );
				const _sizes = {};

				if ( Array.isArray( value ) && value.every( item => !isNaN( parseFloat( item ) ) && isFinite( item ) ) ) {
					Object.defineProperty( _sizes, "char", Object.assign( {
						enumerable: true
					}, termHandler( value, rawValue => new Range( rawValue ) ) ) );
				} else if ( ( Array.isArray( value ) && value.length > 0 ) || typeof value === "string" ) {
					const _values = Array.isArray( value ) ? value : [value];

					for ( let i = 0; i < _values.length; i++ ) {
						const matches = /^\s*(.+)\s+(\w+)\s*$/.exec( _values[i] );
						if ( matches ) {
							// The current option ends with a word.
							// Check if word is a known unit:
							let k, unitName;

							for ( k = 0; k < unitNames.length; k++ ) {
								unitName = unitNames[k];

								if ( sizeUnits[unitName].indexOf( matches[2] ) > -1 ) {
									break;
								}
							}

							if ( k < unitNames.length ) {
								Object.defineProperty( _sizes, unitName, Object.assign( {
									enumerable: true
								}, termHandler( matches[1], rawValue => new Range( rawValue ) ) ) );
								continue;
							}
						}

						Object.defineProperty( _sizes, "char", Object.assign( {
							enumerable: true
						}, termHandler( _values[i], rawValue => new Range( rawValue ) ) ) );
					}
				} else {
					Object.defineProperty( _sizes, "char", Object.assign( {
						enumerable: true
					}, termHandler( value, rawValue => new Range( rawValue ) ) ) );
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

			placeholder( value, name ) {
				/**
				 * Defines some text to be displayed in bounds of text input
				 * control unless user has entered some text already.
				 *
				 * @name FormFieldTextModel#placeholder
				 * @property {?string}
				 * @readonly
				 */
				return this.createGetter( value, name );
			},

			align( value, _, __, termHandler ) {
				/**
				 * Defines some desired alignment for content of text field.
				 *
				 * @name FormFieldTextModel#align
				 * @property {?string}
				 * @readonly
				 */
				return termHandler( this.selectLocalization( value ), rawValue => {
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

			prefix( value, name ) {
				/**
				 * Defines some static text to appear in front of text field.
				 *
				 * @name FormFieldTextModel#prefix
				 * @property {?string}
				 * @readonly
				 */
				return this.createGetter( value, name );
			},

			suffix( value, name ) {
				/**
				 * Defines some static text to appear next to the text field.
				 *
				 * @name FormFieldTextModel#suffix
				 * @property {?string}
				 * @readonly
				 */
				return this.createGetter( value, name );
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
				return termHandler( this.selectLocalization( value ), rawValue => {
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
				return termHandler( this.selectLocalization( value ), rawValue => {
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

			counter( value, _, __, termHandler ) {
				/**
				 * Configures field to show the number of used characters/ words/ lines under the input
				 *
				 * The displayed information depends on option 'size'.
				 *
				 * - Supported values are:
				 *   - `false` or some equivalent boolean string to hide counter
				 *   - `true` or some equivalent boolean string to count characters/ words/ lines
				 *   - `up` to count characters/ words/ lines
				 *   - `down` to count remaining characters/ words/ lines
				 *
				 * @name FormFieldTextModel#counter
				 * @property {boolean|string} value
				 * @readonly
				 */
				return termHandler( value, rawValue => {
					const _value = String( rawValue ).trim().toLowerCase();

					switch ( _value ) {
						case "up" :
						case "down" :
							return _value;

						default : {
							const asBoolean = Data.normalizeToBoolean( _value );

							if ( asBoolean != null ) {
								return asBoolean ? "up" : false;
							}

							return false;
						}
					}
				} );
			},

			...customProperties,
		}, container );


		const counts = {
			char: NaN,
			word: NaN,
			line: NaN,
		};

		Object.defineProperties( this, {
			/**
			 * Cached number of characters in field's value.
			 *
			 * @note This information doesn't auto-update but is updated on
			 *       validating text input.
			 *
			 * @name FormFieldTextModel#characterCount
			 * @property {int}
			 */
			characterCount: {
				get() { return counts.char; },
				set( value ) {
					const _v = parseInt( value );
					if ( _v > -1 ) {
						counts.char = _v;
					}
				},
			},

			/**
			 * Cached number of words in field's value.
			 *
			 * @note This information doesn't auto-update but is updated on
			 *       validating text input.
			 *
			 * @name FormFieldTextModel#wordCount
			 * @property {int}
			 */
			wordCount: {
				get() { return counts.word; },
				set( value ) {
					const _v = parseInt( value );
					if ( _v > -1 ) {
						counts.word = _v;
					}
				},
			},

			/**
			 * Cached number of lines in field's value.
			 *
			 * @note This information doesn't auto-update but is updated on
			 *       validating text input.
			 *
			 * @name FormFieldTextModel#lineCount
			 * @property {int}
			 */
			lineCount: {
				get() { return counts.line; },
				set( value ) {
					const _v = parseInt( value );
					if ( _v > -1 ) {
						counts.line = _v;
					}
				},
			},
		} );
	}

	/** @inheritDoc */
	initializeReactive( reactiveFieldInfo ) {
		super.initializeReactive( reactiveFieldInfo );

		reactiveFieldInfo.auxiliary = {
			mode: null,
			counts: {
				char: NaN,
				word: NaN,
				line: NaN,
			},
			values: {
				char: NaN,
				word: NaN,
				line: NaN,
			},
			states: {
				char: NaN,
				word: NaN,
				line: NaN,
			},
		};
	}

	/** @inheritDoc */
	updateFieldInformation( reactiveFieldInfo, onLocalUpdate ) {
		super.updateFieldInformation( reactiveFieldInfo, onLocalUpdate );

		if ( !onLocalUpdate ) {
			this.readValidState( { force: true } );
		}
	}

	/** @inheritDoc */
	renderAuxiliaryComponent() {
		const that = this;

		return {
			render( createElement ) {
				const { values, states } = this.context;
				const mode = that.counter;

				if ( !mode ) {
					return createElement( "" );
				}


				const unitNames = Object.keys( sizeUnits );
				const numUnitNames = unitNames.length;
				const counters = [];

				for ( let i = 0; i < numUnitNames; i++ ) {
					const unitName = unitNames[i];
					const value = values[unitName];
					const valid = states[unitName];

					if ( value != null ) {
						const key = unitName.toUpperCase();
						let text;

						if ( mode === "down" ) {
							switch ( value ) {
								case 0 :
									text = that.localize( `@COUNTER.${key}.NONE`, value );
									break;

								case 1 :
									text = that.localize( `@COUNTER.${key}.SINGLE`, value );
									break;

								case -1 :
									text = that.localize( `@COUNTER.${key}.NEGATIVE_SINGLE`, -value );
									break;

								default :
									if ( value < 0 ) {
										text = that.localize( `@COUNTER.${key}.NEGATIVE_MULTI`, -value );
									} else {
										text = that.localize( `@COUNTER.${key}.MULTI`, value );
									}
							}
						} else {
							switch ( value ) {
								case 0 :
									text = that.localize( `@COUNTER.${key}.NONE`, value );
									break;

								case 1 :
									text = that.localize( `@COUNTER.${key}.SINGLE`, value );
									break;

								default :
									text = that.localize( `@COUNTER.${key}.MULTI`, value );
									break;
							}
						}

						counters.push( createElement( "span", {
							class: [
								"unit-" + unitName,
								"counts-" + mode,
								valid ? "valid" : "invalid",
							],
						}, text ) );
					}
				}

				if ( counters.length ) {
					return createElement( "div", { class: [
						"counter",
						mode === "down" ? "count-down" : "count-up",
					], }, [
						createElement( "label", { class: "prompt" }, that.localize( `@COUNTER.PROMPT.${mode.toUpperCase()}` ) ),
						createElement( "span", {}, counters ),
					] );
				}

				return createElement( "" );
			},
			props: {
				context: {
					type: Object,
					required: true,
				},
			},
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


				return createElement( "div", { class: classes, }, elements );
			},
			data() {
				return reactiveFieldInfo;
			},
		};
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
	validate( live ) {
		const errors = super.validate();
		let value = String( this.value == null ? "" : this.value ).trim();

		// apply optional reducer to strip off characters ignored on validation
		const { reducer } = this;
		if ( reducer ) {
			// https://stackoverflow.com/a/16046903/3182819
			const numCaptures = ( new RegExp( reducer.source + "|" ) ).exec( "" ).length - 1;

			value = value.replace( reducer, ( _, ...captures ) => captures.slice( 0, numCaptures ).join( "" ) );
		}


		// always update all counters internally
		const { auxiliary } = this.$data;
		const { counts, values, states } = auxiliary;

		counts.char = value.length;
		counts.word = value.split( /\s+/ ).length;
		counts.line = value.split( /\r?\n/ ).length;

		let hasAnyCounter = false;


		// process all configured validations
		const required = this.required && !value.length;
		if ( required ) {
			errors.push( "@VALIDATION.MISSING_REQUIRED" );
		}


		const { counter: mode } = this;
		const unitNames = Object.keys( sizeUnits );
		const numUnitNames = unitNames.length;

		for ( let i = 0; i < numUnitNames; i++ ) {
			const unitName = unitNames[i];
			const size = this.size[unitName];
			const count = counts[unitName];

			values[unitName] = states[unitName] = null;

			if ( size ) {
				if ( !required ) {
					if ( !live && size.isBelowRange( count ) ) {
						errors.push( "@VALIDATION.TOO_SHORT" );
					}

					if ( size.isAboveRange( count ) ) {
						errors.push( "@VALIDATION.TOO_LONG" );
					}
				}

				if ( mode ) {
					const upper = size.upper;
					const countsUp = mode !== "down";

					if ( countsUp || isFinite( upper ) ) {
						hasAnyCounter = true;

						values[unitName] = countsUp ? count : upper - ( size.upperInclusive ? 0 : 1 ) - count;
						states[unitName] = count <= upper || count < size.lower;
					}
				}
			}
		}

		auxiliary.mode = mode === "down" ? "down" : "up";

		this.$data.additionalComponentClasses = hasAnyCounter ? "with-counter" : "without-counter";


		if ( !required ) {
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
