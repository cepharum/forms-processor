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

				reactiveFieldInfo.group = new Array( numFields );

				for ( let di = 0; di < numFields; di++ ) {
					const fieldDefinition = v[di];

					if ( typeof fieldDefinition !== "object" ) {
						throw new Error( "provided invalid field description" );
					}

					const fieldType = fieldDefinition.type || "text";
					if ( !fieldsRegistry.hasOwnProperty( fieldType ) ) {
						throw new Error( "group of fields contains field of unknown type" );
					}

					reactiveFieldInfo.group[di] = {};

					const fieldForm = Object.create( form );

					Object.defineProperties( fieldForm, {
						readValue: {
							value: name => {
								const field = fields[di];

								let localIndex = name === field.qualifiedName ? di : -1;
								if ( localIndex < 0 ) {
									for ( let i = 0; i < numFields; i++ ) {
										if ( i !== di && name === fields[i].qualifiedName ) {
											localIndex = i;
											break;
										}
									}
								}

								if ( localIndex > -1 ) {
									const values = form.readValue( this.qualifiedName );

									return Array.isArray( values ) ? values[localIndex] : undefined;
								}

								return form.readValue( name );
							}
						},
						writeValue: {
							value: ( name, value ) => {
								const field = fields[di];

								let localIndex = name === field.qualifiedName ? di : -1;
								if ( localIndex < 0 ) {
									for ( let i = 0; i < numFields; i++ ) {
										if ( i !== di && name === fields[i].qualifiedName ) {
											localIndex = i;
											break;
										}
									}
								}

								if ( localIndex > -1 ) {
									const updatedValues = new Array( numFields );
									for ( let i = 0; i < numFields; i++ ) {
										if ( i === localIndex ) {
											updatedValues[i] = value;
										} else {
											updatedValues[i] = fields[i].value;
										}
									}

									form.writeValue( this.qualifiedName, updatedValues );
								} else {
									form.writeValue( name, value );
								}
							}
						},
						name: { value: this.qualifiedName },
					} );

					if ( !fieldDefinition.name ) fieldDefinition.name = String( di );

					fields[di] = new fieldsRegistry[fieldType]( fieldForm, {
						...fieldDefinition,
						suppress: { errors: true },
					}, di, reactiveFieldInfo.group[di], null, this );
				}

				return { value: fields };
			},

			drop( v ) {
				/**
				 * Configures whether grouping field is dropping its _pristine_
				 * state eagerly or lazily.
				 *
				 * Eagerly dropping results in grouping field becoming _touched_
				 * as soon as one of its containing fields got touched. In
				 * opposition to that lazy dropping requires all contained
				 * fields to be touched so the group gets marked touched as well.
				 *
				 * @name FormFieldGroupModel#drop
				 * @property {{eager:boolean}}
				 * @readonly
				 */

				const normalized = {
					eager: true,
				};

				switch ( typeof v ) {
					case "object" :
						if ( Array.isArray( v ) ) {
							normalized.eager = v.findIndex( e => String( e ).trim().toLowerCase() === "eager" ) > -1;
						} else if ( v ) {
							normalized.eager = Boolean( v.eager );
						}
						break;

					case "string" :
						switch ( v.trim().toLowerCase() ) {
							case "eager" :
							default :
								normalized.eager = true;
								break;

							case "lazy" :
								normalized.eager = false;
								break;
						}
						break;
				}

				return { value: normalized };
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
		let write = 0;

		errors[write++] = super.validate( live );

		for ( let i = 0; i < numFields; i++ ) {
			const field = fields[i];

			if ( !field.pristine ) {
				errors[write++] = field.validate( live );
			}
		}

		errors.splice( write );

		return [].concat( ...errors );
	}

	/** @inheritDoc */
	renderFieldComponent( reactiveFieldInfo ) { // eslint-disable-line no-unused-vars
		const that = this;
		const { fields } = that;

		return {
			render( createElement ) {
				const numFields = fields.length;
				const components = new Array( numFields );

				for ( let fieldIndex = 0; fieldIndex < numFields; fieldIndex++ ) {
					const field = fields[fieldIndex];

					components[fieldIndex] = createElement( "div", {
						class: "multi-field-container",
					}, [
						createElement( field.component, {
							on: {
								input( newValue ) {
									this.value = newValue;

									const updatedValues = new Array( numFields );
									for ( let j = 0; j < numFields; j++ ) {
										if ( j === fieldIndex ) {
											updatedValues[j] = newValue;
										} else {
											updatedValues[j] = fields[j].value;
										}
									}

									this.$emit( "input", updatedValues );
								}
							}
						} ),
					] );
				}

				return createElement( "div", {}, components );
			},
		};
	}

	/**
	 * Marks current field _touched_.
	 *
	 * Grouping fields are considered pristine unless all its containing fields
	 * are marked touched.
	 *
	 * @param {boolean} force set true to force setting any field _touched_ (e.g. on clicking button "Next")
	 * @returns {void}
	 */
	touch( force = false ) {
		const { fields } = this;
		const numFields = fields.length;
		const lazyTouch = !this.drop.eager;

		this.$data.valid = null;

		for ( let i = 0; i < numFields; i++ ) {
			if ( force ) {
				// NOTE! This might result in infinite regression if any
				//       containing element forces touching of its container!
				fields[i].touch( true );
			} else if ( lazyTouch && fields[i].pristine ) {
				return;
			}
		}

		this.pristine = false;
	}
}
