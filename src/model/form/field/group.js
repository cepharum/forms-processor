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
	/** @inheritDoc */
	constructor( form, definition, fieldIndex, reactiveFieldInfo, customProperties = {}, container = null ) {
		super( form, definition, fieldIndex, reactiveFieldInfo, {
			fields( v ) {
				if ( !Array.isArray( v ) ) {
					throw new Error( "no such array of grouped fields" );
				}

				const fieldsRegistry = form.sequence.registry.fields;

				const numFields = v.length;
				const fields = new Array( numFields );

				for ( let di = 0; di < numFields; di++ ) {
					const fieldDefinition = v[di];

					if ( typeof fieldDefinition !== "object" ) {
						throw new Error( "provided invalid field description" );
					}

					const fieldType = fieldDefinition.type || "text";
					if ( !fieldsRegistry.hasOwnProperty( fieldType ) ) {
						throw new Error( "group of fields contains field of unknown type" );
					}

					const fieldForm = Object.create( form );

					Object.defineProperties( fieldForm, {
						readValue: {
							value: () => fields[di].value
						},
						writeValue: {
							value: ( _, _value ) => {
								if ( _value === fields[di].value ) {
									fields[di].value = _value;

									const updatedValues = new Array( numFields );
									for ( let i = 0; i < numFields; i++ ) {
										updatedValues[i] = fields[i].value;
									}

									form.writeValue( this.qualifiedName, updatedValues );
								}
							}
						},
						name: { value: this.qualifiedName },
					} );

					if ( !fieldDefinition.name ) fieldDefinition.name = String( di );

					const Manager = fieldsRegistry[fieldType];
					const fieldReactiveFieldInfo = {};

					fields[di] = {
						reactiveFieldInfo: fieldReactiveFieldInfo,
						field: new Manager( fieldForm, Object.assign( {}, fieldDefinition, {
							suppress: { errors: true },
						} ), di, fieldReactiveFieldInfo, null, this ),
						value: null,
					};
				}

				return { value: fields };
			},

			...customProperties,
		}, container );
	}

	/** @inheritDoc */
	static get isInteractive() {
		return true;
	}

	/** @inheritDoc */
	validate( live ) {
		const { fields } = this;
		const numFields = fields.length;
		const errors = new Array( numFields + 1 );

		errors[0] = super.validate( live );
		for ( let i = 0; i < numFields; i++ ) {
			errors[i + 1] = fields.field.validate( live );
		}

		return [].concat( ...errors );
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
