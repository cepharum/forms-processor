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

/**
 * Manages single field of form representing data input.
 */
export default class FormFieldUploadModel extends FormFieldAbstractModel {
	/**
	 * @param {FormModel} form reference on form this field belongs to
	 * @param {object} definition definition of field
	 * @param {int} fieldIndex index of field in set of containing form's fields
	 * @param {object} reactiveFieldInfo provided object to contain reactive information of field
	 * @param {CustomPropertyMap} customProperties defines custom properties to be exposed using custom property descriptor
	 */
	constructor( form, definition, fieldIndex, reactiveFieldInfo, customProperties, ) {
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

			amount( v ) {
				/**
				 * Defines valid range of a value's length.
				 *
				 * @name FormFieldTextModel#size
				 * @property {Range}
				 * @readonly
				 */
				return { value: new Range( v ) };
			},

			mimeType( definitionValue ) {
				/**
				 * requires mime Types
				 *
				 * @name FormFieldCheckBoxModel#multiple
				 * @property boolean
				 * @readonly
				 */
				return {
					value: definitionValue,
				};
			},

			label( definitionValue ) {
				/**
				 * Indicates whether user might select multiple options or not.
				 *
				 * @name FormFieldCheckBoxModel#multiple
				 * @property boolean
				 * @readonly
				 */
				return {
					value: definitionValue,
				};
			},

			...customProperties,
		} );
	}

	/** @inheritDoc */
	static get isInteractive() {
		return true;
	}

	/** @inheritDoc */
	renderFieldComponent( reactiveFieldInfo ) {
		const that = this;
		const { form: { readValue, writeValue }, qualifiedName } = that;

		return {
			template: `
				<span class="upload">
					<input 
						type="file"
						multiple
						:id="name"
						:name="name"
						v-on:change="fileSelected"/>
				</span>
			`,
			data: () => {
				return {
					files: [],
					name: qualifiedName,
				};
			},
			computed: {
			},
			methods: {
				fileSelected( e ) {
					if ( this.selectedCallback ) {
						if ( e.target.files ) {
							this.selectedCallback( e.target.files );
						} else {
							this.selectedCallback( null );
						}
					}
				},
				selectedCallback( fileArray ) {
					reactiveFieldInfo.pristine = false;

					if ( !fileArray ) {
						return;
					}
					for ( const entry of fileArray ) {
						const normalized = that.normalizeValue( entry );
						if( normalized ) this.files.push( normalized );
					}
					writeValue( qualifiedName, this.files );
				},
			},
		};
	}

	/** @inheritDoc */
	normalizeValue( value = {} ) {
		return value;
	}

	/** @inheritDoc */
	validate() {
		const errors = super.validate();
		const { value, mimeType } = this;

		if ( this.required && !value.length ) {
			errors.push( "@VALIDATION.MISSING_REQUIRED" );
		}

		if( value.some( el => el.type !== mimeType ) ) {
			errors.push( "@VALIDATION.WRONG_TYPE" );
		}

		if ( value.length ) {
			if ( this.amount.isBelowRange( value.length ) ) {
				errors.push( "@VALIDATION.TOO_SHORT" );
			}

			if ( this.amount.isAboveRange( value.length ) ) {
				errors.push( "@VALIDATION.TOO_LONG" );
			}
		}
		return errors;
	}
}
