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
export default class FormFieldSelectModel extends FormFieldAbstractModel {
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
			/**
			 * Generates property descriptor exposing options to choose from in
			 * list control.
			 *
			 * @param {*} definitionValue value of property provided in definition of field
			 * @param {string} definitionName name of property provided in definition of field
			 * @param {object<string,*>} definitions all properties of qualified definition of field
			 * @param {CustomPropertyLimitedTermHandler} cbTermHandler term handler detecting computable terms in a provided string returning property map
			 * @returns {PropertyDescriptor} description on how to expose this property in context of field's instance
			 * @this {FormFieldSelectModel}
			 */
			options( definitionValue, definitionName, definitions, cbTermHandler ) {
				/**
				 * @name FormFieldSelectModel#options
				 * @property {LabelledOptionsList}
				 * @readonly
				 */
				if ( Array.isArray( definitionValue ) ) {
					// handling array of options ...
					// support terms in either option's properties
					return Options.createOptions( definitionValue, null, {
						localizer: map => this.selectLocalization( map ),
						termHandler: v => cbTermHandler( v, _v => String( _v ), true ),
					} );
				}

				// handling simple definition of options using comma-separated string
				// support term in whole definition of list
				return cbTermHandler( definitionValue, computed => {
					if ( computed == null ) {
						return [];
					}

					const normalized = Options.createOptions( computed );
					if ( normalized.get ) {
						return normalized.get();
					}

					return normalized.value;
				} );
			},
		} );
	}

	/** @inheritDoc */
	updateFieldInformation( reactiveFieldInfo, onLocalUpdate ) {
		super.updateFieldInformation( reactiveFieldInfo, onLocalUpdate );

		if ( !onLocalUpdate ) {
			reactiveFieldInfo.options = this.options;
		}
	}

	/** @inheritDoc */
	initializeReactive( reactiveFieldInfo ) {
		const initial = super.initializeReactive( reactiveFieldInfo );

		reactiveFieldInfo.options = this.options;
		return initial;
	}

	/** @inheritDoc */
	renderFieldComponent( reactiveFieldInfo ) {
		const { form: { readValue, writeValue }, qualifiedName } = this;

		return {
			template: `<select v-model="value"><option v-for="item in options" :key="item.value" :value="item.value">{{item.label}}</option></select>`,
			data: () => {
				return {
					v: readValue( qualifiedName ),
				};
			},
			computed: {
				options() {
					return reactiveFieldInfo.options;
				},
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
