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
import Markdown from "../utility/markdown";


/**
 * Implements field type displaying set of checkboxes to choose one or more from.
 */
export default class FormFieldCheckBoxModel extends FormFieldAbstractModel {
	/**
	 * @inheritDoc
	 */
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
			},

			group( definitionValue ) {
				/**
				 * Provides name of group this control belongs to.
				 *
				 * Naming a group is basically useful in combination with radio
				 * buttons implemented in separate fields. If radio buttons of
				 * multiple fields are associated with the same group name on
				 * page then only one button in the whole group can be selected.
				 *
				 * @name FormFieldCheckBoxModel#group
				 * @property string
				 * @readonly
				 */
				return {
					value: typeof definitionValue === "string" && definitionValue ? definitionValue.trim() : null,
				};
			},

			...customProperties,
		}, container );
	}

	/** @inheritDoc */
	renderFieldComponent( reactiveFieldInfo ) {
		const that = this;
		const { form: { sequence: { events } }, qualifiedName, group, type } = that;

		return {
			template: `
				<div class="checkbox options" :class="fieldClasses">
					<span class="option" :class="{checked:isSet(item.value), ['no-'+(index+1)]: true}" v-for="(item, index) in options" :key="index">
						<input
							:type="isRadio ? 'radio' : 'checkbox'"
							:id="individualId( index )"
							:name="groupName"
							:value="item.value"
							:checked="isSet(item.value)"
							:disabled="disabled"
							@change="adjust( $event.target.checked, item.value )"
						/>

						<label v-if="markdown" class="markdown" :for="individualId( index )"
							@click="adjust( isRadio || !isSet( item.value ), item.value )" v-html="item.renderedLabel"></label>
						<label v-else :for="individualId( index )"
							@click="adjust( isRadio || !isSet( item.value ), item.value )">{{item.label == null ? item.value : item.label}}</label>
					</span>
				</div>
			`,
			data: () => reactiveFieldInfo,
			computed: {
				fieldClasses() {
					const multi = this.supportsMultiSelection;
					const numOptions = this.options.length;

					return {
						"multi-select": multi,
						"single-select": !multi,
						multi: numOptions > 1,
						single: numOptions < 2
					};
				},
				normalizedName() {
					return qualifiedName.replace( /\./g, "_" );
				},
				groupName() {
					return group == null ? qualifiedName : group;
				},
				individualId() {
					return index => `${this.normalizedName}.${index}`;
				},
				supportsMultiSelection() {
					return this.multiple && ( this.options && this.options.length > 1 );
				},
				isRadio() {
					return type === "radio" && !this.multiple && this.options && ( this.options.length > 1 || group != null );
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
					that.touch();

					const { value } = this;

					if ( group != null && !this.supportsMultiSelection && added ) {
						events.$emit( `form:group:${group}`, qualifiedName, newValue );
					}

					if ( Array.isArray( value ) ) {
						if ( added ) {
							if ( value.indexOf( newValue ) < 0 ) {
								value.push( newValue );

								this.$emit( "input", value );
							}
						} else {
							const index = value.indexOf( newValue );
							if ( index > -1 ) {
								value.splice( index, 1 );

								this.$emit( "input", value );
							}
						}
					} else if ( added ) {
						this.$emit( "input", newValue );
					} else {
						this.$emit( "input", null );
					}
				},
			},
			beforeMount() {
				if ( group && !this.supportsMultiSelection ) {
					this.__groupChangeListener = fieldName => {
						if ( fieldName !== qualifiedName && this.value ) {
							this.adjust( false, null );
						}
					};

					events.$on( `form:group:${group}`, this.__groupChangeListener );
				}

				if ( this.options && this.markdown ) {
					for ( let i = 0; i < this.options.length; i++ ) {
						let label = Markdown.getRenderer( this.markdown === true ? "default" : this.markdown ).render( this.options[i].label || this.options[i].value );
						const matches = /^\s*<p>(.*)<\/p>\s*$/.exec( label );
						if ( matches ) {
							label = matches[1];
						}
						this.options[i].renderedLabel = label;
					}
				}
			},
			beforeDestroy() {
				if ( group && !this.supportsMultiSelection ) {
					events.$off( `form:group:${group}`, this.__groupChangeListener );
				}
			}
		};
	}

	/** @inheritDoc */
	normalizeValue( value ) {
		const { multiple, options } = this;
		const actualMultiple = multiple && options && options.length > 1;

		const mapped = Array.isArray( value ) ? value.slice( 0, multiple ? value.length : 1 ) : value == null ? [] : [value];

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

		if ( this.validity === false ) {
			errors.push( "@VALIDATION.INVALID" );
		}

		return errors;
	}
}
