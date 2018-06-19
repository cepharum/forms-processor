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

import FormModel from "./form";

/**
 * Wraps definition of a sequence of forms.
 */
export default class FormSequenceModel {
	/**
	 * @param {object} definition definition of a sequence of forms
	 * @param {object} data variable space fed form fields
	 */
	constructor( definition, data ) {
		const { sequence = [] } = definition;

		Object.defineProperties( this, {
			/**
			 * Lists forms of sequence.
			 *
			 * @name FormSequenceModel#forms
			 * @property {FormModel[]}
			 * @readonly
			 */
			forms: { value: sequence.map( formDefinition => new FormModel( this, formDefinition ) ) },

			/**
			 * Provides variable space of all forms in a sequence of forms.
			 *
			 * @name FormSequenceModel#data
			 * @property {object}
			 * @readonly
			 */
			data: { value: data },
		} );
	}

	/**
	 * Fetches data record containing initial values of all defined fields.
	 *
	 * @returns {object<object<string,string>>} initial values of all fields per form
	 */
	getInitialData() {
		const data = {};

		this.forms.forEach( form => {
			data[form.name] = {};

			form.fields.forEach( field => {
				data[form.name][field.name] = field.initial;
			} );
		} );

		return data;
	}

	/**
	 * Renders description of Vue component listing all fields of form.
	 *
	 * @returns {{components, template: string}} description of Vue component
	 */
	renderComponent() {
		const forms = this.forms;
		const numForms = forms.length;
		const components = new Array( numForms );

		for ( let i = 0; i < numForms; i++ ) {
			components[i] = forms[i].renderComponent();
		}

		return {
			render: function( createElement ) {
				const elements = new Array( numForms );
				for ( let i = 0; i < numForms; i++ ) {
					elements[i] = createElement( components[i] );
				}

				const steps = new Array( numForms );
				for ( let i = 0; i < numForms; i++ ) {
					steps[i] = createElement( "a", {
						class: "nav-step",
					}, [
						createElement( "span", {
							class: "number",
						}, `${i + 1}` ),
						` ${forms[i].label}`,
					] );
				}

				return createElement( "div", {
					class: "form-sequence",
				}, [
					createElement( "nav", {
						class: "progress",
					}, steps ),
					createElement( "div", {
						class: "forms",
					}, elements ),
				] );
			},
		};
	}
}
