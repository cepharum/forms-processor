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
				return termHandler( value, rawValue => new Range( rawValue ) );
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
					return rawValue == null ? null : String( rawValue ).trim() || null;
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
					type: "text",
					value: reactiveFieldInfo.formattedValue,
				};

				if ( that.placeholder != null ) {
					domProps.placeholder = that.placeholder;
				}

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

				if ( that.suffix == null ) {
					classes.push( "without-suffix" );
				} else {
					classes.push( "with-suffix" );
					elements.push( createElement( "span", {
						class: "suffix",
					}, that.suffix ) );
				}

				return createElement( "div", { class: classes, }, elements );
			},
			data: () => reactiveFieldInfo,
		};
	}

	/** @inheritDoc */
	validate( live ) {
		const errors = super.validate();

		const value = String( this.value == null ? "" : this.value ).trim();

		if ( this.required && !value.length ) {
			errors.push( "@VALIDATION.MISSING_REQUIRED" );
		}

		if ( value.length ) {
			if ( this.size.isBelowRange( value.length ) ) {
				errors.push( "@VALIDATION.TOO_SHORT" );
			}

			if ( this.size.isAboveRange( value.length ) ) {
				errors.push( "@VALIDATION.TOO_LONG" );
			}
		}

		let format = this.format;
		if ( format ) {
			format = String( format ).trim().toLowerCase();

			if ( typeof Format[format] === "function" ) {
				const result = Format[format]( value, Boolean( live ), this, { countryCodes: this.countryCodes } );
				if ( result.errors ) {
					errors.splice( errors.length, 0, ...result.errors );
				}
			}
		}

		return errors;
	}
}
