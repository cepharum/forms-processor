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

import L10N from "../../../service/l10n";
import Range from "../utility/range";

import FormFieldAbstractModel from "./abstract";

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
	static normalizeValue( value ) {
		return value == null ? "" : String( value );
	}

	/** @inheritDoc */
	_renderFieldComponent() {
		const that = this;
		const { qualifiedName } = that;

		return {
			props: ["value"],
			render: function( createElement ) {
				return createElement( "input", {
					domProps: {
						type: "text",
						value: this.value,
					},
					on: {
						input: event => {
							const value = event.target.value;

							this.$store.dispatch( "writeInput", [ qualifiedName, that.constructor.normalizeValue( value ) ] );
							this.$emit( "input", value );
						},
					},
				} );
			},
		};
	}

	/** @inheritDoc */
	_validate() {
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

		return errors;
	}
}
