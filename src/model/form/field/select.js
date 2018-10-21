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
import Options from "../utility/options";


/**
 * Implements field type displaying list of options to choose one from.
 */
export default class SelectFieldType extends FormFieldAbstractModel {
	/** @inheritDoc */
	static get isInteractive() {
		return true;
	}

	/**
	 * @param {FormModel} form reference on form this field belongs to
	 * @param {object} definition definition of field
	 * @param {int} fieldIndex index of field in set of containing form's fields
	 * @param {object} reactiveFieldInfo provided object to contain reactive information of field
	 */
	constructor( form, definition, fieldIndex, reactiveFieldInfo ) {
		super( form, definition, fieldIndex, reactiveFieldInfo, {
			options( definitionValue, definitionName, definitions, cbTermHandler ) {
				/**
				 * @name SelectFieldType#options
				 * @property {Array<{value:string, label:string}>}
				 * @readonly
				 */
				return cbTermHandler( definitionValue, value => {
					const computed = Options.createOptions( value, null, map => this.selectLocalization( map ) );

					reactiveFieldInfo.listOptions = computed;

					return computed;
				} );
			},
		} );
	}

	/** @inheritDoc */
	renderFieldComponent( reactiveFieldInfo ) {
		const { form: { readValue, writeValue }, qualifiedName } = this;

		return {
			template: `<select v-model="value"><option v-for="item in options" :key="item.value" :value="item.value">{{item.label}}</option></select>`,
			data: () => {
				return {
					options: reactiveFieldInfo.listOptions,
					v: readValue( qualifiedName ),
				};
			},
			computed: {
				value: {
					get() {
						return this.v;
					},
					set( newValue ) {
						writeValue( qualifiedName, newValue );
						this.v = newValue;
					},
				}
			},
		};
	}

	/** @inheritDoc */
	validate() {
		const errors = [];

		if ( this.required && !this.value ) {
			errors.push( "@VALIDATION.MISSING_SELECTION" );
		}

		return errors;
	}
}
