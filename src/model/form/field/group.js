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

/**
 * Manages multiple fields of form representing text input.
 */
export default class FormFieldGroupModel extends FormFieldAbstractModel {
	/**
	 * @param {FormModel} form reference on form this field belongs to
	 * @param {object} definition definition of field
	 * @param {int} fieldIndex index of field in set of containing form's fields
	 * @param {object} reactiveFieldInfo provided object to contain reactive information of field
	 * @param {CustomPropertyMap} customProperties defines custom properties to be exposed using custom property descriptor
	 */
	constructor( form, definition, fieldIndex, reactiveFieldInfo, customProperties ) {
		super( form, definition, fieldIndex, reactiveFieldInfo, {
			fields( v ) {
				if ( !Array.isArray( v ) ) {
					throw new Error( "no such array of grouped fields" );
				}

				const fieldsRegistry = form.sequence.registry.fields;

				const fields = v.map( ( field, index ) => {
					if ( typeof field !== "object" ) {
						throw new Error( "provided invalid field description" );
					}

					if ( !fieldsRegistry.hasOwnProperty( field.type || "text" ) ) {
						throw new Error( "group of fields contains field of unknown type" );
					}

					const fieldForm = Object.create( form );

					Object.defineProperties( fieldForm, {
						readValue: {
							value: () => this.fields[index].value
						},
						writeValue: {
							value: ( _, _value ) => {
								this.fields[index].value = _value;
								const value = this.fields.map( entry => entry.value );

								form.writeValue( this.qualifiedName, value );

								reactiveFieldInfo.value = reactiveFieldInfo.formattedValue = value;
								reactiveFieldInfo.pristine = false;
							}
						},
						name: { value: this.qualifiedName },
					} );

					if ( !field.name ) field.name = String( index );

					const Manager = fieldsRegistry[field.type || "text"];
					const fieldReactiveFieldInfo = {};

					return {
						reactiveFieldInfo: fieldReactiveFieldInfo,
						field: new Manager( fieldForm, Object.assign( {}, field, {
							suppress: { errors: true },
						} ), index, fieldReactiveFieldInfo ),
						value: null,
					};
				} );

				return { value: fields };
			},

			...customProperties,
		} );
	}

	/** @inheritDoc */
	static get isInteractive() {
		return true;
	}

	/** @inheritDoc */
	validate( live ) {
		const errors = super.validate( live );
		const fields = this.fields.map( entry => entry.field );

		for ( const entry of fields ) {
			errors.splice( errors.length, 0, ...entry.validate( live ) );
		}

		return errors;
	}

	/** @inheritDoc */
	renderFieldComponent( reactiveFieldInfo ) { // eslint-disable-line no-unused-vars
		const that = this;
		const { fields } = that;

		return {
			render( createElement ) {
				const components = fields.map( entry => {
					return createElement( "div", { class: "multi-field-container" }, [
						createElement( entry.field.component ),
					] );
				} );

				return createElement( "div", {}, components );
			},
		};
	}


}
