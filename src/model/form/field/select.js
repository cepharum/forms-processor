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
import L10n from "../../../service/l10n";
import Data from "../../../service/data";
import Options from "../utility/options";


/**
 * Implements field type displaying list of options to choose one from.
 */
export default class FormFieldSelectModel extends FormFieldAbstractModel {
	/** @inheritDoc */
	constructor( form, definition, fieldIndex, reactiveFieldInfo, customProperties = {}, container = null ) {
		super( form, definition, fieldIndex, reactiveFieldInfo, {
			options( definitionValue, _, __, termHandler ) {
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
						termHandler: v => termHandler( v, null, true ),
					} );
				}

				// handling simple definition of options using comma-separated string
				// support term in whole definition of list
				return termHandler( definitionValue, computed => {
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
				 * @name FormFieldSelectModel#multiple
				 * @property boolean
				 * @readonly
				 */
				return {
					value: Data.normalizeToBoolean( definitionValue ),
				};
			},

			prompt( definitionValue, _, __, termHandler ) {
				/**
				 * Provides label for optional list item usually prompting user
				 * to choose an option.
				 *
				 * @name FormFieldSelectModel#prompt
				 * @property string
				 * @readonly
				 */
				return termHandler( definitionValue, rawValue => {
					if ( rawValue == null ) {
						return null;
					}

					const asBoolean = Data.normalizeToBoolean( rawValue, null );
					if ( asBoolean === true ) {
						const { sequence } = this.form;

						return L10n.translate( sequence.translations, "PROMPT.SELECTOR" );
					}

					const localized = this.selectLocalization( rawValue );
					return localized == null ? null : String( localized ).trim();
				} );
			},

			...customProperties,
		}, container );
	}

	/** @inheritDoc */
	updateFieldInformation( reactiveFieldInfo, onLocalUpdate ) {
		super.updateFieldInformation( reactiveFieldInfo, onLocalUpdate );

		// read out field-specific definition values to cause updating reactive
		// data accordingly
		let dummy; // eslint-disable-line no-unused-vars

		if ( !onLocalUpdate ) {
			dummy = this.options;
		}

		dummy = this.prompt;
	}

	/** @inheritDoc */
	renderFieldComponent( reactiveFieldInfo ) {
		return {
			template: `
				<select v-model="value" 
				        :multiple="multi" 
				        class="select" 
				        :class="[multi ? 'multi' : 'single', value == null ? 'prompting' : 'selected']" 
				        :disabled="disabled" 
				        @change="updated">
					<option v-if="prompt && !disabled" disabled :value="null">{{ prompt }}</option>
					<option v-for="( item, index ) in options" :key="index" :value="item.value">{{item.label}}</option>
				</select>
			`,
			data: () => reactiveFieldInfo,
			computed: {
				multi() {
					return this.multiple && ( this.options && this.options.length > 1 );
				},
			},
			methods: {
				updated() {
					this.$nextTick( () => this.$emit( "input", this.value ) );
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

		if ( this.validity === false ) {
			errors.push( "@VALIDATION.INVALID" );
		}

		return errors;
	}
}
