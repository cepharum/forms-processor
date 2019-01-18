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

/**
 * Manages single field of form representing text input.
 */
export default class FormFieldTextModel extends FormFieldAbstractModel {
	/**
	 * @param {FormModel} form reference on form this field belongs to
	 * @param {object} definition definition of field
	 * @param {int} fieldIndex index of field in set of containing form's fields
	 * @param {object} reactiveFieldInfo provided object to contain reactive information of field
	 * @param {CustomPropertyMap} customProperties defines custom properties to be exposed using custom property descriptor
	 */
	constructor( form, definition, fieldIndex, reactiveFieldInfo, customProperties ) {
		super( form, definition, fieldIndex, reactiveFieldInfo, {
			size( v ) {
				/**
				 * Defines valid range of a value's length.
				 *
				 * @name FormFieldTextModel#size
				 * @property {Range}
				 * @readonly
				 */
				return { value: new Range( v ) };
			},

			pattern( v ) {
				/**
				 * Exposes compiled pattern optionally defined on field.
				 *
				 * @name FormFieldTextModel#pattern
				 * @property {?CompiledPattern}
				 * @readonly
				 */
				return { value: v == null ? null : Pattern.compilePattern( v ) };
			},
			...customProperties,
		} );
	}

	/** @inheritDoc */
	static get isInteractive() {
		return true;
	}

	/** @inheritDoc */
	normalizeValue( value, options = {} ) {
		let fixedValue = value == null ? "" : String( value );
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

		return {
			value: fixedValue,
			formattedValue,
		};
	}

	/** @inheritDoc */
	renderFieldComponent( reactiveFieldInfo ) {
		const that = this;
		const { form: { writeValue }, qualifiedName } = that;

		let lastValue = null;

		return {
			render( createElement ) {
				return createElement( "input", {
					domProps: {
						type: "text",
						value: reactiveFieldInfo.formattedValue,
					},
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

							if ( value === this.value ) {
								return;
							}

							this.value = value;
							reactiveFieldInfo.pristine = false;

							writeValue( qualifiedName, value );
							reactiveFieldInfo.value = value;
							reactiveFieldInfo.formattedValue = formattedValue;

							this.$emit( "input", value );
							this.$parent.$emit( "input", value ); // FIXME is this required due to $emit always forwarded to "parent"
						},
					},
				} );
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
				const result = Format[format]( value, Boolean( live ), this );
				if ( result.errors ) {
					errors.splice( errors.length, 0, ...result.errors );
				}
			}
		}

		return errors;
	}
}
