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
	 */
	constructor( form, definition ) {
		super( form, definition, ["size"] );

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
	renderFieldComponent() {
		const that = this;
		const { qualifiedName } = that;

		return {
			render: function( createElement ) {
				const initialValue = this.$store.getters.formReadInput( qualifiedName );

				return createElement( "input", {
					domProps: {
						type: "text",
						value: this[qualifiedName] || initialValue,
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

		if ( this.size.isBelowRange( value.length ) ) {
			errors.push( L10N.translations.VALIDATION.TOO_SHORT );
		}

		if ( this.size.isAboveRange( value.length ) ) {
			errors.push( L10N.translations.VALIDATION.TOO_LONG );
		}

		return errors;
	}
}
