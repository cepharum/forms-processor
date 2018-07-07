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

		const reactiveInfo = {
			forms: new Array( sequence.length ),
		};

		Object.defineProperties( this, {
			/**
			 * Indicates if sequence is empty
			 *
			 * @name FormSequenceModel#isEmpty
			 * @property {boolean}
			 */
			isEmpty: {
				value: !sequence.length,
			},

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
			forms: { value: sequence.map( ( formDefinition, index ) => {
				const reactiveFormInfo = reactiveInfo.forms[index] = {};

				return new FormModel( this, formDefinition, index, reactiveFormInfo );
			} ) },
		} );


		let currentFormIndex = 0;
		let latestVisited = 0;

		Object.defineProperties( this, {
			/**
			 * Addresses current form in sequence of forms by its index.
			 *
			 * @name FormSequenceModel#currentIndex
			 * @property {int}
			 */
			currentIndex: {
				get: () => ( this.isEmpty ? -1 : currentFormIndex ),
				set: index => {
					if ( this.isEmpty ) {
						return;
					}

					const forms = this.forms;
					const numForms = forms.length;
					let validIndex = -1;

					if ( index < 0 || index >= numForms || !forms[index] ) {
						throw new TypeError( `rejecting selection of form by invalid index ${index}` );
					}

					index = parseInt( index );

					for ( let i = 0; i < numForms; i++ ) {
						const form = forms[i];

						if ( !form.pristine && !form.valid ) {
							break;
						}

						validIndex = i;
					}

					if ( index < validIndex ) {
						currentFormIndex = index;
						latestVisited = Math.max( latestVisited, index );
					}
				},
			},

			/**
			 * Provides instance managing current form in sequence of forms.
			 *
			 * @name FormSequenceModel#currentForm
			 * @property {FormModel}
			 * @readonly
			 */
			currentForm: {
				get: () => this.forms[currentFormIndex],
			},

			/**
			 * Addresses current form in sequence of forms by its name.
			 *
			 * @name FormSequenceModel#currentName
			 * @property {string}
			 */
			currentName: {
				get: () => this.forms[currentFormIndex].name,
				set: name => {
					const forms = this.forms;
					const numForms = forms.length;
					let nameIndex = -1;

					for ( let i = 0; i < numForms; i++ ) {
						if ( forms[i].name === name ) {
							nameIndex = i;
							break;
						}
					}

					if ( nameIndex < 0 ) {
						throw new TypeError( `rejecting selection of form by unknown name "${name}"` );
					}

					this.currentIndex = nameIndex;
				},
			},

			/**
			 * Finds index of first invalid form in sequence of forms.
			 *
			 * @name FormSequenceModel#firstInvalidIndex
			 * @property {int}
			 * @readonly
			 */
			firstInvalidIndex: {
				get: () => {
					const forms = this.forms;
					const numForms = forms.length;

					for ( let i = 0; i < numForms; i++ ) {
						if ( i > latestVisited ) {
							break;
						}

						const form = forms[i];

						if ( !form.pristine && !form.valid ) {
							return i;
						}
					}

					return -1;
				},
			},
		} );

		Object.defineProperties( this, {
			/**
			 * Provides component rendering forms of sequence.
			 *
			 * @name FormSequenceModel#formsComponent
			 * @property {{render:function}}
			 * @readonly
			 */
			formsComponent: { value: this._renderComponent() },

			/**
			 * Provides component rendering progress bar in sequence of forms.
			 *
			 * @name FormSequenceModel#progressComponent
			 * @property {{render:function}}
			 * @readonly
			 */
			progressComponent: { value: this._renderProgressComponent() },
		} );
	}

	/**
	 * Handles notification on named property of form having changed.
	 *
	 * This method is available to forms of sequence to notify sequence manager
	 * to update its components rendering contained forms.
	 *
	 * @note The method might be called w/o actually having updated value.
	 *
	 * @param {int} formIndex index of form in containing sequence of forms
	 * @param {string} infoName name of updated property
	 * @param {*} infoValue new value of updated property
	 * @returns {void}
	 */
	updateFormInfo( formIndex, infoName, infoValue ) {
		if ( formIndex < 0 || formIndex >= this.forms.length ) {
			throw new TypeError( `invalid index of form #${formIndex}` );
		}

		const components = [ this.progressComponent, this.formsComponent ];
		const numComponents = components.length;

		for ( let i = 0; i < numComponents; i++ ) {
			const component = components[i];
			if ( component ) {
				const info = component.forms[formIndex];

				if ( infoName in info ) {
					info[infoName] = infoValue;
					component.$set( component.forms, formIndex, info );
				}
			}
		}
	}

	/**
	 * Switches to next form in sequence of forms unless current form or any
	 * other previously visited form is invalid.
	 *
	 * @returns {boolean} true if advancing succeeded, false if first invalid form has been selected instead
	 */
	advance() {
		if ( !this.forms[this.currentIndex].valid ) {
			return false;
		}

		const index = this.firstInvalidIndex;
		if ( index < -1 ) {
			this.currentIndex++;

			return true;
		}

		this.currentIndex = index;

		return false;
	}

	/**
	 * Switches to previous form in sequence of forms.
	 *
	 * @returns {boolean} true if current form has been actually rewinded
	 */
	rewind() {
		const index = this.currentIndex;
		if ( index > 0 ) {
			this.currentIndex--;

			return true;
		}

		return false;
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
	 * Describes all forms in sequence by extracting selected properties per
	 * form to be available in components managed by sequence.
	 *
	 * @returns {Array<object>} lists extracted information per form
	 * @private
	 */
	_infos() {
		const forms = this.forms;
		const numForms = forms.length;

		const formsInfo = new Array( numForms );
		for ( let i = 0; i < numForms; i++ ) {
			const form = forms[i];

			formsInfo[i] = {
				name: form.name,
				label: form.label,
				pristine: form.pristine,
				valid: form.valid,
			};
		}

		return formsInfo;
	}

	/**
	 * Describes Vue component listing all forms in sequence.
	 *
	 * @returns {{render: function}} description of Vue component
	 * @protected
	 */
	_renderComponent() {
		const forms = this.forms;
		const numForms = forms.length;
		const components = new Array( numForms );

		for ( let i = 0; i < numForms; i++ ) {
			components[i] = forms[i].component;
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
	 * @protected
	 */
	_renderProgressComponent() {
		const numForms = this.forms.length;
		const formsInfo = this._infos();

		return {
			render: function( createElement ) {
				const forms = this.forms;
				const steps = new Array( numForms );

				for ( let i = 0; i < numForms; i++ ) {
					const form = forms[i];

					const classes = ["step"];
					classes.push( form.pristine ? "pristine" : "touched" );
					classes.push( form.valid ? "valid" : "invalid" );

					steps[i] = createElement( "a", {
						class: classes.join( " " ),
						"data-name": form.name,
					}, [
						createElement( "span", {
							class: "number",
						}, `${i + 1}` ),
						` ${form.label}`,
					] );
				}

				return createElement( "nav", {
					class: "steps",
				}, steps );
			},
			data: () => ( {
				forms: formsInfo,
			} ),
		};
	}
}
