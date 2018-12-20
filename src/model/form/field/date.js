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
import DateProcessor from "../utility/date";
import Data from "../../../service/data";

/**
 * Implements field type that provides date based utility
 */
export default class FormFieldSelectModel extends FormFieldAbstractModel {
	/**
	 * @param {FormModel} form manages form containing this field
	 * @param {object} definition properties and constraints of single form field
	 * @param {int} fieldIndex index of field in set of containing form's fields
	 * @param {object} reactiveFieldInfo provided object to contain reactive information of field
	 * @param {CustomPropertyMap} customProperties defines custom properties to be exposed using custom property descriptor
	 */
	constructor( form, definition, fieldIndex, reactiveFieldInfo, customProperties ) {
		super( form, definition, fieldIndex, reactiveFieldInfo, {
			/**
			 * Generates property descriptor exposing format the date should have.
			 *
			 * @param {*} definitionValue value of property provided in definition of field
			 * @param {string} definitionName name of property provided in definition of field
			 * @returns {PropertyDescriptor} description on how to expose this property in context of field's instance
			 * @this {FormFieldSelectModel}
			 */
			format( definitionValue, definitionName ) {
				if( typeof definitionValue !== "string" ) {
					throw new TypeError( "String expected" );
				}
				return this.createGetter( definitionValue, definitionName );
			},

			/**
			 * Generates property descriptor exposing format the date should have.
			 *
			 * @param {*} definitionValue value of property provided in definition of field
			 * @param {string} definitionName name of property provided in definition of field
			 * @returns {PropertyDescriptor} description on how to expose this property in context of field's instance
			 * @this {FormFieldSelectModel}
			 */
			options( definitionValue, definitionName ) {
				return this.createGetter( definitionValue, definitionName );
			},

			...customProperties
		} );

		this.processor = new DateProcessor( this.format );
	}

	/** @inheritDoc */
	static get isInteractive() {
		return true;
	}

	/** @inheritDoc */
	normalizeValue( input, options = {} ) {
		if( this.format !== this.processor.format ) {
			this.processor = new DateProcessor( this.format, this.options );
		}
		return this.processor.normalize( input );
	}

	/** @inheritDoc */
	renderFieldComponent( reactiveFieldInfo ) {
		const that = this;
		const { form: { readValue, writeValue }, qualifiedName, multiple } = that;

		return {
			template: `
				<input v-model="formattedValue">
			`,
			data: () => {
				return {
					value: readValue( qualifiedName ),
				};
			},
			computed: {
				options() {
					return reactiveFieldInfo.options;
				},
				model: {
					get() {
						return that.normalizeValue( this.value );
					},
					set( newValue ) {
						reactiveFieldInfo.pristine = false;

						const normalized = that.normalizeValue( newValue );

						if ( !Data.isEquivalentArray( normalized, this.value ) ) {
							writeValue( qualifiedName, normalized );
							this.value = normalized;
						}
					},
				},
				multiple() {
					return multiple && ( this.options && this.options.length > 1 );
				},
			},
		};
	}

	/** @inheritDoc */
	validate( live ) {
		const errors = super.validate();

		const formattedValue = String( this.formattedValue == null ? "" : this.formattedValue ).trim();

		if ( this.required && ! formattedValue.length ) {
			errors.push( "@VALIDATION.MISSING_REQUIRED" );
		}

		if()

		return [ ...errors, ...dateErrors ];
	}

}
