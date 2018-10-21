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
import Data from "../../../service/data";
import Options from "../utility/options";


/**
 * Implements abstract base class of managers handling certain type of field in
 * a form.
 */
export default class FormFieldCheckBoxModel extends FormFieldAbstractModel {
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
				 * @name FormFieldCheckBoxModel#options
				 * @property {Array<{value:string, label:string}>}
				 * @readonly
				 */
				return cbTermHandler( definitionValue, value => {
					const computed = Options.createOptions( value, null, map => this.selectLocalization( map ) );

					reactiveFieldInfo.checkboxes = computed;

					return computed;
				} );
			},

			multiple( definitionValue, _, qualifiedDefinition ) {
				/**
				 * Indicates whether user might select multiple options or not.
				 *
				 * @name FormFieldCheckBoxModel#multiple
				 * @property boolean
				 * @readonly
				 */
				return {
					value: definitionValue == null ? qualifiedDefinition.type !== "radio" : Data.normalizeToBoolean( definitionValue ),
				};
			}
		} );
	}

	/** @inheritDoc */
	validate() {
		const { value, required } = this;
		const errors = [];
		if ( required ) {
			if ( value instanceof Array ) {
				if ( !value.length ) {
					errors.push( "@VALIDATION.MISSING_REQUIRED" );
				}
			} else if ( !value ) {
				errors.push( "@VALIDATION.MISSING_REQUIRED" );
			}
		}
		return errors;
	}

	/** @inheritDoc */
	renderFieldComponent( reactiveFieldInfo ) {
		const that = this;
		const { form: { readValue, writeValue }, qualifiedName, type, value, options, multiple } = that;

		return {
			data: () => {
				return {
					qualifiedName,
					options: reactiveFieldInfo.checkboxes,
					type,
					value,
					multiple,
					update: true,
				};
			},
			computed: {
				_value: {
					get() {
						if ( this.update ) {
							this.update = false;

							if ( multiple ) {
								return readValue( qualifiedName ) || [];
							}

							return readValue( qualifiedName );
						}

						return undefined;
					},
					set( newValue ) {
						reactiveFieldInfo.pristine = false;

						const _v = newValue ? newValue : undefined;

						if ( _v !== this._value ) {
							writeValue( qualifiedName, _v );
							reactiveFieldInfo.value = _v;
							this.update = true;
						}
					},
				},
				inputType() {
					return ( !this.multiple || this.type === "radio" ) && ( options && options.length > 1 ) ? "radio" : "checkbox";
				}
			},
			template: `
				<span v-if="!options">
					<input type="checkbox" :id="qualifiedName" v-model="_value"/>
				</span>
				<span v-else>
					<span v-for="(entry, index) in options" :key="entry.id || qualifiedName + '.' + index">
						<input 
							:type="inputType"
							:name="qualifiedName"
							:label="entry.label"
							:id="entry.id || qualifiedName + '.' + index"
							:value="entry.value"
							v-model="_value"
						/>
						<label :for="entry.id || qualifiedName + '.' + index">
							{{entry.label || entry.value}}
						</label>
					</span>
				</span>
			`,
		};
	}
}
