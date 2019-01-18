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
 * Manages multiple fields of form representing text input.
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
			fields( v ) {
				if( !Array.isArray( v ) || v.some( entry => !form.sequence.fields.hasOwnProperty( entry.type ) ) ) {
					throw new Error( "provided field of unknown type" );
				}
				return{ value: v };
			},

			initialSize( v ) {
				if( isNaN( v ) ) {
					throw new Error( "provided field of unknown type" );
				}
				return { value: Number( v ) };
			},

			amount( v ) {
				/**
				 * Defines valid range of the amount of text fields
				 *
				 * @name FormFieldTextModel#size
				 * @property {Range}
				 * @readonly
				 */
				return { value: new Range( v ) };
			},
			...customProperties,
		} );
	}

	/** @inheritDoc */
	normalizeValue( value, options = {} ) {
		const fixedValues = value || [];
		for( let index = 0, length = fixedValues.length; index < length; index ++ ) {
			fixedValues[index] = super.normalizeValue( fixedValues[index], options );
		}
		return {
			value: fixedValues.map( v => v.value ),
			formattedValue: fixedValues.map( v => v.formattedValue ),
		};
	}

	/** @inheritDoc */
	renderFieldComponent() {
		const that = this;
		const { form: { writeValue }, qualifiedName } = that;

		return {
			template: "",
			methods: {
				add() {
					const numOfItems = this.items.length;
					const numOfFields = this.fields.length;
					const field = this.fields[numOfItems % numOfFields];
					const sequence = this.form.sequence;
					const Manager = sequence.fields[field.type];
					const reactiveFieldInfo = {};
					this.items.push( {
						field: new Manager( this, sequence, field, numOfItems, reactiveFieldInfo ),
						reactiveFieldInfo
					} );
				}
			},
			data: {
				items: [],
			}
		};
	}


}