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
 * Implements field type displaying set of checkboxes to choose one or more from.
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
				 * @name FormFieldCheckBoxModel#options
				 * @property {LabelledOptionsList}
				 * @readonly
				 */
				const _d = definitionValue == null ? [{
					label: this.selectLocalization( definitions.boxLabel ) || "",
					value: true,
				}] : definitionValue;

				if ( Array.isArray( _d ) ) {
					// handling array of options ...
					// support terms in either option's properties
					return Options.createOptions( _d, null, {
						localizer: map => this.selectLocalization( map ),
						termHandler: v => cbTermHandler( v, null, true ),
					} );
				}

				// handling simple definition of options using comma-separated string
				// support term in whole definition of list
				return cbTermHandler( _d, computed => {
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
		const that = this;
		const { form: { readValue, writeValue }, qualifiedName, type, multiple } = that;

		return {
			template: `
				<span class="checkbox options" :class="multiple ? 'multi' : 'single'">
					<span class="option" :class="{checked:isSet(item.value)}" v-for="(item, index) in options" :key="index">
						<input 
							:type="isRadio ? 'radio' : 'checkbox'"
							:id="!isRadio && multiple ? name + '.' + index : name"
							:name="name"
							:value="item.value"
							:checked="isSet(item.value)"
							@change="adjust( $event.target.checked, item.value )"
						/>

						<label :for="isRadio || multiple ? name + '.' + index : name" 
							@click="adjust( isRadio || !isSet( item.value ), item.value )">{{item.label == null ? item.value : item.label}}</label>
					</span>
				</span>
			`,
			data() {
				return {
					value: that.normalizeValue( readValue( qualifiedName ) ).value,
					name: qualifiedName,
				};
			},
			computed: {
				options() {
					return reactiveFieldInfo.options;
				},
				multiple() {
					return multiple && ( this.options && this.options.length > 1 );
				},
				isRadio() {
					return type === "radio" && !multiple && this.options && this.options.length > 1;
				},
			},
			methods: {
				isSet( value ) {
					const current = this.value;

					if ( Array.isArray( current ) ) {
						return current.indexOf( value ) > -1;
					}

					return current === value;
				},
				adjust( added, newValue ) {
					reactiveFieldInfo.pristine = false;

					const { value } = this;

					if ( Array.isArray( value ) ) {
						if ( added ) {
							if ( value.indexOf( newValue ) < 0 ) {
								value.push( newValue );
								writeValue( qualifiedName, value );
							}
						} else {
							const index = value.indexOf( newValue );
							if ( index > -1 ) {
								value.splice( index, 1 );
								writeValue( qualifiedName, value );
							}
						}
					} else if ( added ) {
						this.value = newValue;
						writeValue( qualifiedName, newValue );
					} else {
						this.value = null;
						writeValue( qualifiedName, null );
					}
				},
			},
		};
	}

	/** @inheritDoc */
	normalizeValue( value ) {
		const { multiple, options } = this;
		const actualMultiple = multiple && options && options.length > 1;

		const mapped = Array.isArray( value ) ? value.slice( 0, multiple ? 1 : value.length ) : value == null ? [] : [value];

		const values = Options.extractOptions( mapped, options );
		const labels = Options.extractOptions( mapped, options, true );

		return {
			value: actualMultiple ? values : values.length > 0 ? values[0] : null,
			formattedValue: actualMultiple ? labels : labels.length > 0 ? labels[0] : null,
		};
	}

	/** @inheritDoc */
	validate() {
		const { value } = this;
		const errors = [];

		if ( this.required ) {
			if ( value instanceof Array ) {
				if ( !value.length ) {
					errors.push( "@VALIDATION.MISSING_REQUIRED" );
				}
			} else if ( value == null ) {
				errors.push( "@VALIDATION.MISSING_REQUIRED" );
			}
		}

		return errors;
	}
}
