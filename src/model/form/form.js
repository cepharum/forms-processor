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

const FieldManagers = require( "./field" );

/**
 * Manages single form as described in provided definition.
 */
class FormModel {
	/**
	 * @param {FormSequenceModel} sequence refers to sequence this form belongs to
	 * @param {FormDefinition} definition current form's definition
	 */
	constructor( sequence, definition ) {
		const { label = "", description = "", fields = [] } = definition;

		Object.defineProperties( this, {
			/**
			 * Provides label of form.
			 *
			 * @name FormModel#description
			 * @property {string}
			 * @readonly
			 */
			label: { value: label },

			/**
			 * Provides description of form.
			 *
			 * @name FormModel#description
			 * @property {string}
			 * @readonly
			 */
			description: { value: description },

			/**
			 * Lists fields of form.
			 *
			 * @name FormModel#fields
			 * @property {FormFieldAbstractModel[]}
			 * @readonly
			 */
			fields: { value: fields.map( field => createField( this, field ) ).filter( i => i ) },

			/**
			 * Provides variable space of all forms in a sequence of forms.
			 *
			 * @name FormModel#data
			 * @property {object}
			 * @readonly
			 */
			data: { value: sequence.data },
		} );
	}

	renderFields() {
		const fields = this.fields;
		const numFields = fields.length;

		const components = {};
		const templates = new Array( numFields );

		for ( let i = 0; i < numFields; i++ ) {
			const name = `field-${i}`;
			templates.push( `<${name}/>` );
			components[name] = this.fields[i];
		}

		return {
			components,
			template: `<div class="fields">${templates.join( "" )}</div>`,
		};
	}
}

module.exports = FormModel;


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
