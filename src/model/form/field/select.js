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
 * Implements field type displaying list of options to choose one from.
 */
export default class FormFieldSelectModel extends FormFieldAbstractModel {
	/** @inheritDoc */
	static get isInteractive() {
		return true;
	}

	/** @inheritDoc */
	constructor( form, definition, fieldIndex, reactiveFieldInfo, customProperties = {}, container = null ) {
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
						termHandler: v => cbTermHandler( v, null, true ),
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

			multiple( definitionValue ) {
				/**
				 * Indicates whether user might select multiple options or not.
				 *
				 * @name FormFieldCheckBoxModel#multiple
				 * @property boolean
				 * @readonly
				 */
				return {
					value: Data.normalizeToBoolean( definitionValue ),
				};
			},

			...customProperties,
		}, container );
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
		const { form: { readValue }, qualifiedName, multiple } = that;

		return {
			template: `
				<select v-model="model" v-if="!multiple" class="select" :class="multiple ? 'multi' : 'single'">
					<option v-for="( item, index ) in options" :key="index" :value="item.value">{{item.label}}</option>
				</select>
				<select v-model="model" v-else-if="multiple" multiple class="select" :class="multiple ? 'multi' : 'single'">
					<option v-for="( item, index ) in options" :key="index" :value="item.value">{{item.label}}</option>
				</select>
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
						return this.value;
					},
					set( newValue ) {
						that.touch();

						const { value: normalized } = that.normalizeValue( newValue );

						if ( !Data.isEquivalentArray( normalized, this.value ) ) {
							this.$emit( "input", normalized );
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
	normalizeValue( value ) {
		const options = this.options;

		const values = Options.extractOptions( value, options );
		const labels = Options.extractOptions( value, options, true );

		return {
			value: this.multiple ? values : values[0] || null,
			formattedValue: this.multiple ? labels : labels[0] || null
		};
	}

	/** @inheritDoc */
	validate() {
		const { value } = this;
		const errors = [];

		if ( this.required ) {
			if ( value instanceof Array ) {
				if ( !value.length ) {
					errors.push( "@VALIDATION.MISSING_SELECTION" );
				}
			} else if ( !value ) {
				errors.push( "@VALIDATION.MISSING_SELECTION" );
			}
		}

		return errors;
	}
}
