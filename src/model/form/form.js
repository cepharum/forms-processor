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

import L10n from "@/service/l10n";

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

		const originalName = ( name == null ? "" : String( name ) ).trim();
		const formName = originalName.toLowerCase();

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
			 * Provides original name of form as provided in definition.
			 *
			 * A form's defined name is converted to lower-case characters to
			 * internally simplify addressing e.g. in terms. The original name
			 * is used to mark form's elements in HTML as well in the resulting
			 * set of gathered data provided for processing.
			 *
			 * @name FormModel#originalName
			 * @property {string}
			 * @readonly
			 */
			originalName: { value: originalName },

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
			label: { get: () => {
				const locale = sequence.locale;
				return L10n.selectLocalized( definition.label, locale ) || L10n.selectLocalized( definition.title, locale );
			} },

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
			title: { get: () => {
				const locale = sequence.locale;
				return L10n.selectLocalized( definition.title, locale ) || L10n.selectLocalized( definition.label, locale );
			} },

			/**
			 * Provides description of form.
			 *
			 * @name FormModel#description
			 * @property {string}
			 * @readonly
			 */
			description: { get: () => L10n.selectLocalized( definition.description, sequence.locale ) },

			/**
			 * Provides current locale.
			 *
			 * @name FormModel#locale
			 * @property {string}
			 * @readonly
			 */
			locale: { get: () => sequence.locale },

			/**
			 * Provides variable space of all forms in a sequence of forms.
			 *
			 * @name FormModel#data
			 * @property {object}
			 * @readonly
			 */
			data: { value: sequence.data },

			/**
			 * Reads value of a field selected by its name from storage.
			 *
			 * @name FormModel#readValue
			 * @property {function(name:string):*}
			 * @readonly
			 */
			readValue: { value: sequence.readValue },

			/**
			 * Adjusts value in storage containing all field's values.
			 *
			 * @name FormModel#writeValue
			 * @property {function(name:string, value:*):boolean}
			 * @readonly
			 */
			writeValue: { value: sequence.writeValue },
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
				return createField( this, sequence, field, fieldIndex, reactiveFieldInfo );
			} ).filter( i => i ) },
		} );

		reactiveFormInfo.valid = null;
		reactiveFormInfo.pristine = true;
		reactiveFormInfo.finished = false;

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
						const field = this.fields[i];

						if ( !field.valid ) {
							valid = false;
							break;
						}

						if ( field.pristine ) {
							// pristine fields are basically marked "valid" due
							// to haven't been touched so far
							// -> but form's validity always depends on those
							//    fields, too
							if ( field.validate().length > 0 ) {
								valid = false;
								break;
							}
						}
					}

					if ( reactiveFormInfo.valid !== valid ) {
						reactiveFormInfo.valid = valid;

						if ( !valid ) {
							reactiveFormInfo.finished = false;
						}
					}

					return valid;
				},
			},

			/**
			 * Marks if form is pristine thus consisting of pristine fields,
			 * only.
			 *
			 * @name FormModel#pristine
			 * @property {boolean}
			 * @readonly
			 */
			pristine: {
				get: () => {
					const numFields = this.fields.length;
					let pristine = true;

					for ( let i = 0; i < numFields; i++ ) {
						const field = this.fields[i];

						if ( !field.pristine ) {
							pristine = false;
							break;
						}
					}

					if ( reactiveFormInfo.pristine !== pristine ) {
						reactiveFormInfo.pristine = pristine;
					}

					return pristine;
				},
				set: value => {
					if ( value ) {
						throw new TypeError( `invalid request for marking form #${this.index} as pristine` );
					}

					const numFields = this.fields.length;
					for ( let i = 0; i < numFields; i++ ) {
						this.fields[i].pristine = false;
					}
				},
			},

			/**
			 * Marks if form is finished and thus doesn't need to be edited by
			 * user anymore.
			 *
			 * @name FormModel#finished
			 * @property {boolean}
			 */
			finished: {
				get: () => reactiveFormInfo.finished,
				set: value => {
					let _value = value;

					if ( _value ) {
						this.pristine = false;

						if ( !this.valid ) {
							_value = false;
						}
					}

					_value = Boolean( _value );

					if ( reactiveFormInfo.finished !== _value ) {
						reactiveFormInfo.finished = _value;
					}
				},
			},

			/**
			 * Fetches reference on field of form to be focused automatically.
			 *
			 * This is either first invalid field or first field of form, if all
			 * fields of form are valid.
			 *
			 * @name FormModel#autoFocusField
			 * @property {?FormFieldAbstractModel}
			 * @readonly
			 */
			autoFocusField: {
				get: () => {
					const fieldInstances = this.fields;
					const numFields = fieldInstances.length;

					for ( let i = 0; i < numFields; i++ ) {
						const field = fieldInstances[i];

						if ( !field.valid ) {
							return field;
						}
					}

					return fieldInstances[0] || null;
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

		const { originalName, name, title, description } = this;

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
					`form-name-${originalName}`,
					`form-nname-${name}`,
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
 * @param {FormSequenceModel} sequence model controlling sequence of forms
 * @param {object} fieldDefinition definition of field to create
 * @param {int} fieldIndex index of field in set of containing form's fields
 * @param {object} reactiveFieldInfo provided object to contain reactive information of field
 * @returns {?FormFieldAbstractModel} manager for handling defined field
 */
function createField( form, sequence, fieldDefinition, fieldIndex, reactiveFieldInfo ) {
	const { type = "text" } = fieldDefinition;

	const normalized = String( type ).trim().toLowerCase();
	const Manager = sequence.registry.fields[normalized];
	if ( Manager ) {
		return new Manager( form, fieldDefinition, fieldIndex, reactiveFieldInfo );
	}

	console.error( `missing manager for handling form fields of type ${type}` ); // eslint-disable-line no-console

	return null;
}
