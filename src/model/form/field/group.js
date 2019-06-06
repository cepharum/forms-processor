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
import Data from "../../../service/data";

/**
 * Manages multiple fields of form representing text input.
 */
export default class FormFieldGroupModel extends FormFieldAbstractModel {
	/** @inheritDoc */
	static presumeQualifiedNames( sequence, formName, fieldDefinition, fieldIndex ) {
		if ( !fieldDefinition.hasOwnProperty( "name" ) ) {
			fieldDefinition.name = `group${String( "000" + fieldIndex ).slice( -4 )}`;
		}

		const list = super.presumeQualifiedNames( sequence, formName, fieldDefinition, fieldIndex );

		const { fields } = fieldDefinition;

		if ( Array.isArray( fields ) ) {
			const fakeFormName = list[0];
			const numFields = fields.length;

			for ( let i = 0; i < numFields; i++ ) {
				const subFieldDefinition = fields[i];
				const subFieldManager = sequence.selectFieldManager( subFieldDefinition );
				if ( subFieldManager ) {
					list.splice( list.length, 0, ...subFieldManager.presumeQualifiedNames( sequence, fakeFormName, subFieldDefinition, i ) );
				}
			}
		}

		return list;
	}

	/** @inheritDoc */
	constructor( form, definition, fieldIndex, reactiveFieldInfo, customProperties = {}, container = null ) {
		if ( !definition.hasOwnProperty( "name" ) ) {
			definition.name = `group${String( "000" + fieldIndex ).slice( -4 )}`;
		}

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
					( _index => {
						const fieldDefinition = v[_index];

						if ( typeof fieldDefinition !== "object" ) {
							throw new Error( "provided invalid field description" );
						}

						const fieldType = fieldDefinition.type || "text";
						if ( !fieldsRegistry.hasOwnProperty( fieldType ) ) {
							throw new Error( "group of fields contains field of unknown type" );
						}

						reactiveFieldInfo.group[_index] = {};

						const fieldForm = Object.create( form );

						Object.defineProperties( fieldForm, {
							readValue: {
								value: name => {
									const field = fields[_index];

									let localIndex = name === field.qualifiedName ? _index : -1;
									if ( localIndex < 0 ) {
										for ( let i = 0; i < numFields; i++ ) {
											if ( i !== _index && name === fields[i].qualifiedName ) {
												localIndex = i;
												break;
											}
										}
									}

									if ( localIndex > -1 ) {
										const values = this.value;

										return values && typeof values === "object" ? values[fields[localIndex].name] : undefined;
									}

									return form.readValue( name );
								}
							},
							writeValue: {
								value: ( name, value ) => {
									const field = fields[_index];

									let localIndex = name === field.qualifiedName ? _index : -1;
									if ( localIndex < 0 ) {
										for ( let i = 0; i < numFields; i++ ) {
											if ( i !== _index && name === fields[i].qualifiedName ) {
												localIndex = i;
												break;
											}
										}
									}

									if ( localIndex > -1 ) {
										const values = this.value || {};

										values[fields[localIndex].name] = value;

										form.writeValue( this.qualifiedName, values );
									} else {
										form.writeValue( name, value );
									}
								}
							},
							name: { value: this.qualifiedName },
						} );

						fields[_index] = new fieldsRegistry[fieldType]( fieldForm, {
							...fieldDefinition,
							suppress: { errors: true },
						}, _index, reactiveFieldInfo.group[_index], {}, this );
					} )( di );
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
							normalized.eager = Data.normalizeToBoolean( v.eager );
						}
						break;

					case "string" :
						switch ( v.trim().toLowerCase() ) {
							case "eager" :
								normalized.eager = true;
								break;

							default :
								normalized.eager = Data.normalizeToBoolean( v, true );
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
	listDependencies() {
		const map = {};

		const deps = super.listDependencies();
		const numDeps = deps.length;

		for ( let i = 0; i < numDeps; i++ ) {
			map[deps[i]] = true;
		}


		const { fields } = this;
		const numFields = fields.length;

		for ( let i = 0; i < numFields; i++ ) {
			const dependsOn = fields[i].dependsOn;
			const numDependsOn = dependsOn.length;

			for ( let j = 0; j < numDependsOn; j++ ) {
				map[dependsOn[j]] = true;
			}
		}


		return Object.keys( map );
	}

	/** @inheritDoc */
	setValue( newValue ) {
		const isValue = newValue && typeof newValue === "object";
		const { fields } = this;
		const numFields = fields.length;

		if ( !( this._lockWrite > 0 ) ) {
			this._lockWrite = ( this._lockWrite || 0 ) + 1;

			for ( let i = 0; i < numFields; i++ ) {
				const field = fields[i];

				if ( field.constructor.isProvidingInput ) {
					field.setValue( isValue ? newValue[field.name] : null );
				}
			}

			this._lockWrite--;
		}
	}

	/** @inheritDoc */
	onUpdateValue( newValue, updatedFieldName = null ) {
		const { fields } = this;
		const numFields = fields.length;

		let validityChanged = super.onUpdateValue( newValue, updatedFieldName );

		for ( let i = 0; i < numFields; i++ ) {
			const field = fields[i];
			const newFieldValue = ( newValue && typeof newValue === "object" && newValue[field.name] ) || null;

			validityChanged |= field.onUpdateValue( newFieldValue, updatedFieldName === this.qualifiedName ? field.qualifiedName : null );
		}

		return validityChanged;
	}

	/** @inheritDoc */
	validate( live ) {
		const { fields } = this;
		const numFields = fields.length;

		const errors = super.validate( live );

		for ( let i = 0; i < numFields; i++ ) {
			const field = fields[i];

			if ( !field.pristine ) {
				const fieldIsValid = field.readValidState( { live } );
				if ( !fieldIsValid ) {
					const subErrors = field.errors;
					const numSubErrors = subErrors.length;

					for ( let j = 0; j < numSubErrors; j++ ) {
						errors.push( subErrors[j] );
					}
				}
			}
		}

		return errors;
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

					components[fieldIndex] = createElement( field.component, {
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
					} );
				}

				return createElement( "div", {
					class: "contained-fields"
				}, components );
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
