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

		const label = Property.localizeValue( definition.label );
		const title = Property.localizeValue( definition.title );
		const description = Property.localizeValue( definition.description );

		Object.defineProperties( this, {
			/**
			 * Provides label of sequence.
			 *
			 * The title is provided as fallback if label has been omitted.
			 *
			 * @name FormSequenceModel#label
			 * @property {string}
			 * @readonly
			 */
			label: { value: label || title },

			/**
			 * Provides title of sequence.
			 *
			 * The label is provided as fallback if title has been omitted.
			 *
			 * @name FormSequenceModel#title
			 * @property {string}
			 * @readonly
			 */
			title: { value: title || label },

			/**
			 * Provides description of sequence.
			 *
			 * @name FormSequenceModel#description
			 * @property {string}
			 * @readonly
			 */
			description: { value: description },

			/**
			 * Provides variable space of all forms in a sequence of forms.
			 *
			 * @name FormSequenceModel#data
			 * @property {object}
			 * @readonly
			 */
			data: { value: data },
		} );

		// defer definition of additional properties requiring public access
		// on those defined before
		Object.defineProperties( this, {
			/**
			 * Lists forms of sequence.
			 *
			 * @name FormSequenceModel#forms
			 * @property {FormModel[]}
			 * @readonly
			 */
			forms: { value: sequence.map( formDefinition => new FormModel( this, formDefinition ) ) },
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
			const formName = form.name;

			data[formName] = {};

			form.fields.forEach( field => {
				if ( field.constructor.isInteractive ) {
					data[formName][field.name] = field.constructor.normalizeValue( field.initial );
				}
			} );
		} );

		return data;
	}

	/**
	 * Describes Vue component listing all forms in sequence.
	 *
	 * @returns {{render: function}} description of Vue component
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

				return createElement( "div", {
					class: "form-sequence",
				}, [
					createElement( "div", {
						class: "forms",
					}, elements ),
				] );
			},
		};
	}

	/**
	 * Describes Vue component rendering progress in sequence of forms.
	 *
	 * @returns {{render: function}} description of Vue component
	 */
	renderProgressComponent() {
		const forms = this.forms;
		const numForms = forms.length;
		const components = new Array( numForms );

		for ( let i = 0; i < numForms; i++ ) {
			components[i] = forms[i].renderComponent();
		}

		return {
			render: function( createElement ) {
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
				] );
			},
		};
	}

	/**
	 * Describes Vue component rendering controls for sequentially navigating
	 * through the sequence of forms.
	 *
	 * @returns {{render: function}} description of Vue component
	 */
	renderControlComponent() {
		const forms = this.forms;
		const numForms = forms.length;
		const components = new Array( numForms );

		for ( let i = 0; i < numForms; i++ ) {
			components[i] = forms[i].renderComponent();
		}

		return {
			render: function( createElement ) {
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
				] );
			},
		};
	}
}
