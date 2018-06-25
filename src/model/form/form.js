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
	 */
	constructor( sequence, definition ) {
		const { name = "", fields = [] } = definition;

		const label = Property.localizeValue( definition.label );
		const title = Property.localizeValue( definition.title );
		const description = Property.localizeValue( definition.description );

		const formName = ( name == null ? "" : String( name ) ).trim().toLowerCase();

		Object.defineProperties( this, {
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

		// define properties including code relying on properties defined before
		Object.defineProperties( this, {
			/**
			 * Lists fields of form.
			 *
			 * @name FormModel#fields
			 * @property {FormFieldAbstractModel[]}
			 * @readonly
			 */
			fields: { value: fields.map( field => createField( this, field ) ).filter( i => i ) },
		} );
	}

	/**
	 * Renders description of Vue component listing all fields of form.
	 *
	 * @returns {{render:function()}} description of Vue component
	 */
	renderComponent() {
		const fields = this.fields;
		const numFields = fields.length;
		const components = new Array( numFields );

		for ( let i = 0; i < numFields; i++ ) {
			components[i] = fields[i].renderComponent();
		}

		const { title, description } = this;

		return {
			render: function( createElement ) {
				const elements = new Array( numFields );
				for ( let i = 0; i < numFields; i++ ) {
					elements[i] = createElement( components[i] );
				}

				return createElement( "div", {
					class: "form",
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
 * @returns {?FormFieldAbstractModel} manager for handling defined field
 */
function createField( form, fieldDefinition ) {
	let { type = "text" } = fieldDefinition;

	type = type.trim().toLowerCase();

	if ( FieldManagers.hasOwnProperty( type ) ) {
		return new FieldManagers[type]( form, fieldDefinition );
	}

	console.error( `missing manager for handling form fields of type ${type}` ); // eslint-disable-line no-console

	return null;
}
