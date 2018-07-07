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

import Property from "./utility/property";
import FieldManagers from "./field";

/**
 * Manages single form as described in provided definition.
 */
export default class FormModel {
	/**
	 * @param {FormSequenceModel} sequence refers to sequence this form belongs to
	 * @param {FormDefinition} definition current form's definition
	 * @param {int} index index of form in containing sequence of forms
	 * @param {object} reactiveFormInfo provides object to contain all reactive information on form
	 */
	constructor( sequence, definition, index, reactiveFormInfo ) {
		const { name = "", fields = [] } = definition;

		const label = Property.localizeValue( definition.label );
		const title = Property.localizeValue( definition.title );
		const description = Property.localizeValue( definition.description );

		const formName = ( name == null ? "" : String( name ) ).trim().toLowerCase();

		Object.defineProperties( this, {
			/**
			 * Provides index of form in containing sequence of forms.
			 *
			 * @name FormModel#index
			 * @property {int}
			 * @readonly
			 */
			index: { value: index },

			/**
			 * Provides name of form.
			 *
			 * A form's name is used on organizing and accessing data collected
			 * by this form. It should be unique in a sequence and comply with
			 * common syntax of keywords.
			 *
			 * @name FormModel#name
			 * @property {string}
			 * @readonly
			 */
			name: { value: formName },

			/**
			 * Provides label of form.
			 *
			 * A form's label is a brief label e.g. to be used in a progress bar
			 * to name steps in a sequence of forms.
			 *
			 * Form's title is provided if its label has been omitted.
			 *
			 * @name FormModel#label
			 * @property {string}
			 * @readonly
			 */
			label: { value: label || title },

			/**
			 * Provides title of form.
			 *
			 * A form's title is displayed as a headline above form when it is
			 * selected to be current in a sequence of forms.
			 *
			 * Form's label is provided if its title has been omitted.
			 *
			 * @name FormModel#title
			 * @property {string}
			 * @readonly
			 */
			title: { value: title || label },

			/**
			 * Provides description of form.
			 *
			 * @name FormModel#description
			 * @property {string}
			 * @readonly
			 */
			description: { value: description },

			/**
			 * Provides variable space of all forms in a sequence of forms.
			 *
			 * @name FormModel#data
			 * @property {object}
			 * @readonly
			 */
			data: { value: sequence.data },
		} );

		reactiveFormInfo.fields = new Array( fields.length );

		// define properties including code relying on properties defined before
		Object.defineProperties( this, {
			/**
			 * Lists fields of form.
			 *
			 * @name FormModel#fields
			 * @property {FormFieldAbstractModel[]}
			 * @readonly
			 */
			fields: { value: fields.map( ( field, fieldIndex ) => {
				const reactiveFieldInfo = reactiveFormInfo.fields[fieldIndex] = {};
				return createField( this, field, fieldIndex, reactiveFieldInfo );
			} ).filter( i => i ) },
		} );

		reactiveFormInfo.valid = null;
		reactiveFormInfo.pristine = true;

		Object.defineProperties( this, {
			/**
			 * Indicates if all fields of form are valid.
			 *
			 * @name FormModel#valid
			 * @property {Boolean}
			 * @readonly
			 */
			valid: {
				get: () => {
					const numFields = this.fields.length;
					let valid = true;

					for ( let i = 0; i < numFields; i++ ) {
						if ( !this.fields[i].valid ) {
							valid = false;
							break;
						}
					}

					if ( reactiveFormInfo.valid !== valid ) {
						reactiveFormInfo.valid = valid;
					}

					return valid;
				},
			},

			/**
			 * Marks if form is pristine and thus haven't been ever validated
			 * before.
			 *
			 * @name FormModel#pristine
			 * @property {boolean}
			 */
			pristine: {
				get: () => reactiveFormInfo.pristine,
				set: state => {
					const newPristine = Boolean( reactiveFormInfo.pristine && state );

					if ( reactiveFormInfo.pristine !== newPristine ) {
						reactiveFormInfo.pristine = newPristine;
					}
				},
			},
		} );

		Object.defineProperties( this, {
			/**
			 * Provides component rendering fields of form.
			 *
			 * @name FormModel#component
			 * @property {{render:function}}
			 * @readonly
			 */
			component: { value: this._renderComponent( reactiveFormInfo ) },
		} );
	}

	/**
	 * Renders description of Vue component listing all fields of form.
	 *
	 * @param {object} formInfo provides reactive information on form
	 * @returns {{render:function()}} description of Vue component
	 */
	_renderComponent( formInfo ) {
		const fields = this.fields;
		const numFields = fields.length;
		const components = new Array( numFields );

		for ( let i = 0; i < numFields; i++ ) {
			components[i] = fields[i].component;
		}

		const { name, title, description } = this;

		return {
			data() {
				return formInfo;
			},
			render: function( createElement ) {
				const elements = new Array( numFields );
				for ( let i = 0; i < numFields; i++ ) {
					elements[i] = createElement( components[i] );
				}

				const classes = [
					"form",
					this.pristine ? "pristine" : "touched",
					this.valid ? "valid" : "invalid",
				];

				return createElement( "div", {
					class: classes.join( " " ),
					"data-name": name,
				}, [
					createElement( "h2", title ),
					createElement( "p", description ),
					createElement( "div", {
						class: "fields",
					}, elements ),
				] );
			},
		};

	}
}


/**
 * Creates manager for field associated w/ provided form.
 *
 * @param {FormModel} form refers to form created field is going zo belong to
 * @param {object} fieldDefinition definition of field to create
 * @param {int} fieldIndex index of field in set of containing form's fields
 * @param {object} reactiveFieldInfo provided object to contain reactive information of field
 * @returns {?FormFieldAbstractModel} manager for handling defined field
 */
function createField( form, fieldDefinition, fieldIndex, reactiveFieldInfo ) {
	let { type = "text" } = fieldDefinition;

	type = type.trim().toLowerCase();

	if ( FieldManagers.hasOwnProperty( type ) ) {
		return new FieldManagers[type]( form, fieldDefinition, fieldIndex, reactiveFieldInfo );
	}

	console.error( `missing manager for handling form fields of type ${type}` ); // eslint-disable-line no-console

	return null;
}
