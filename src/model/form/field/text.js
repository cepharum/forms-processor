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
import L10N from "../../../service/l10n";
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
	 */
	constructor( form, definition, fieldIndex, reactiveFieldInfo ) {
		super( form, definition, fieldIndex, reactiveFieldInfo, ["size"] );

		Object.defineProperties( this, {
			/**
			 * @name FormFieldTextModel#size
			 * @property {Range}
			 * @readonly
			 */
			size: { value: new Range( definition.size ) },
		} );
	}

	/** @inheritDoc */
	static get isInteractive() {
		return true;
	}

	/** @inheritDoc */
	normalizeValue( value, options = {} ) {
		let fixedValue = value == null ? "" : String( value );

		const pattern = this.pattern;
		if ( pattern ) {
			fixedValue = Pattern.parse( fixedValue, pattern, { keepTrailingLiterals: !options.removing } );
		}

		return fixedValue;
	}

	/** @inheritDoc */
	_renderFieldComponent( reactiveFieldInfo ) {
		const that = this;
		const { qualifiedName } = that;

		return {
			render( createElement ) {
				return createElement( "input", {
					domProps: {
						type: "text",
						value: this.value,
					},
					on: {
						input: event => {
							const options = {
								removing: event.target.value.length < ( ( this.value == null ? 0 : this.value.length ) || 0 ),
							};

							const value = that.normalizeValue( event.target.value, options );
							if ( value === this.value ) {
								event.target.value = value;
								return;
							}

							reactiveFieldInfo.pristine = false;
							that.form.pristine = false;

							this.$store.dispatch( "form/writeInput", {
								name: qualifiedName,
								value,
							} );

							this.$emit( "input", value );
						},
					},
				} );
			},
			data: () => reactiveFieldInfo,
		};
	}

	/** @inheritDoc */
	_validate( live ) {
		const errors = super._validate();

		const value = this.value.trim();

		if ( this.required && !value.length ) {
			errors.push( L10N.translations.VALIDATION.MISSING_REQUIRED );
		}

		if ( value.length ) {
			if ( this.size.isBelowRange( value.length ) ) {
				errors.push( L10N.translations.VALIDATION.TOO_SHORT );
			}

			if ( this.size.isAboveRange( value.length ) ) {
				errors.push( L10N.translations.VALIDATION.TOO_LONG );
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
