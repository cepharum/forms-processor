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

import TermProcessor from "../../term/processor";
import Pattern from "../utility/pattern";
import EventBus from "@/service/events";
import L10n from "@/service/l10n";
import Data from "@/service/data";

const termCache = new Map();

/**
 * Declares default values of commonly supported field properties.
 *
 * @type {object<string,string>}
 */
const DefaultProperties = {
	required: "false",
	visible: "true",
	type: "text",
};

/**
 * Matches definition of a binding occurring in a property's value.
 *
 * @type {RegExp}
 */
const ptnBinding = /({{[^}]+}})/;


/**
 * Implements abstract base class of managers handling certain type of field in
 * a form.
 */
export default class FormFieldAbstractModel {
	/**
	 * Indicates if current type of field is interactive thus providing any
	 * input data.
	 *
	 * @returns {boolean} true if fields of this type are generating input data
	 */
	static get isInteractive() {
		return false;
	}

	/**
	 * @param {FormModel} form manages form containing this field
	 * @param {object} definition properties and constraints of single form field
	 * @param {int} fieldIndex index of field in set of containing form's fields
	 * @param {object} reactiveFieldInfo provided object to contain reactive information of field
	 * @param {string[]} omitProperties lists properties of definition this
	 *        constructor should omit on processing so a derived constructor
	 *        might take care of it (some essential properties such as a field's
	 *        `type` and `name` can't be omitted this way)
	 */
	constructor( form, definition, fieldIndex, reactiveFieldInfo, omitProperties = [] ) {
		const { name } = definition;

		if ( !name ) {
			throw new TypeError( `missing field name in definition` );
		}

		const normalizedName = String( name ).trim().toLowerCase();


		/**
		 * @type {TermProcessor[]}
		 */
		const terms = [];

		/**
		 * @type {object<string,({value:*}|{get:function, set:function})>}
		 */
		const getters = {};

		const qualifiedDefinition = Object.assign( {}, DefaultProperties, definition );


		const propNames = Object.keys( qualifiedDefinition );
		const numProps = propNames.length;

		for ( let pni = 0; pni < numProps; pni++ ) {
			const propertyName = propNames[pni];
			let propertyValue = qualifiedDefinition[propertyName];

			switch ( propertyName ) {
				case "name" :
					// this property is being processed separately below
					break;

				case "qualifiedName" :
				case "form" :
				case "index" :
				case "dependsOn" :
				case "dependents" :
				case "value" :
				case "pristine" :
				case "valid" :
				case "errors" :
					// this property is reserved for internal use and thus isn't obeyed in a field's definition
					break;

				case "type" :
					// this property does not support computed values at all
					getters[propertyName] = { value: propertyValue };
					break;

				case "pattern" :
					if ( omitProperties.indexOf( propertyName ) < 0 ) {
						/**
						 * Exposes compiled pattern optionally defined on field.
						 *
						 * @name FormFieldAbstractModel#pattern
						 * @property {?CompiledPattern}
						 * @readonly
						 */
						getters[propertyName] = { value: propertyValue == null ? null : Pattern.compilePattern( propertyValue ) };
					}
					break;

				default :
					if ( omitProperties.indexOf( propertyName ) < 0 ) {
						// handle all else definition properties
						propertyValue = L10n.selectLocalized( propertyValue, form.locale );
						if ( propertyValue == null ) {
							break;
						}

						propertyValue = String( propertyValue ).trim();

						if ( propertyValue.charAt( 0 ) === "=" ) {
							const term = new TermProcessor( propertyValue.slice( 1 ), {}, termCache, qualifyVariable );
							terms.push( term );
							getters[propertyName] = {
								get: () => normalizeDefinitionValue( propertyName, term.evaluate( form.data ) ),
							};
						} else {
							const slices = propertyValue.split( ptnBinding );
							const numSlices = slices.length;
							let isDynamic = false;

							for ( let i = 0; i < numSlices; i++ ) {
								const slice = slices[i];
								const match = slice.match( ptnBinding );
								if ( match ) {
									const term = new TermProcessor( slice.slice( 2, -2 ), {}, termCache, qualifyVariable );
									terms.push( term );
									slices[i] = term;
									isDynamic = true;
								}
							}

							if ( isDynamic ) {
								getters[propertyName] = {
									get: () => {
										const rendered = new Array( numSlices );

										for ( let i = 0; i < numSlices; i++ ) {
											const slice = slices[i];

											if ( slice instanceof TermProcessor ) {
												rendered[i] = slice.evaluate( form.data );
											} else {
												rendered[i] = slice;
											}
										}

										const result = normalizeDefinitionValue( propertyName, rendered.join( "" ) );

										reactiveFieldInfo[propertyName] = result;

										return result;
									}
								};
							} else {
								propertyValue = normalizeDefinitionValue( propertyName, propertyValue );

								getters[propertyName] = { value: propertyValue };
								reactiveFieldInfo[propertyName] = propertyValue;
							}
						}
					}
			}
		}

		Object.defineProperties( this, getters );


		// collect combined dependencies of all terms processed before
		const collectedDependencies = {};
		for ( let i = 0, numTerms = terms.length; i < numTerms; i++ ) {
			const dependencies = terms[i].dependsOn;

			for ( let j = 0, numDependencies = dependencies.length; j < numDependencies; j++ ) {
				collectedDependencies[dependencies[j].join( "." )] = true;
			}
		}


		const formName = form.name;
		const qualifiedName = `${formName}.${normalizedName}`;
		let dependents = null;


		const initialValue = this.normalizeValue( this.initial );
		form.writeValue( qualifiedName, initialValue );


		// define some field information required to be reactive
		reactiveFieldInfo.required = this.required;
		reactiveFieldInfo.visible = this.visible;
		reactiveFieldInfo.pristine = true;
		reactiveFieldInfo.valid = null;
		reactiveFieldInfo.value = this.normalizeValue( this.initial );
		reactiveFieldInfo.label = this.label;
		reactiveFieldInfo.hint = this.hint;
		reactiveFieldInfo.errors = [];


		const hasInputValue = omitProperties.indexOf( "value" ) < 0;

		Object.defineProperties( this, {
			/**
			 * Provides reference on instance managing form containing field.
			 *
			 * @name FormFieldAbstractModel#form
			 * @property {FormModel}
			 * @readonly
			 */
			form: { value: form },

			/**
			 * Provides index of field in sequence of its containing form's
			 * fields.
			 *
			 * @name FormFieldAbstractModel#index
			 * @property {int}
			 * @readonly
			 */
			index: { value: parseInt( fieldIndex ) },

			/**
			 * Provides defined name of field.
			 *
			 * @name FormFieldAbstractModel#name
			 * @property {string}
			 * @readonly
			 */
			name: { value: normalizedName },

			/**
			 * Provides qualified name of field consisting of its containing
			 * form's name and its own name.
			 *
			 * @name FormFieldAbstractModel#qualifiedName
			 * @property {string}
			 * @readonly
			 */
			qualifiedName: { value: qualifiedName },

			/**
			 * Reads current value of field.
			 *
			 * @name FormFieldAbstractModel#value
			 * @property {*|undefined} current value of field, `undefined` if there is no value available for current field
			 */
			value: hasInputValue ? {
				get: () => form.readValue( qualifiedName ),
				set: value => form.writeValue( qualifiedName, value ),
			} : { value: undefined },

			/**
			 * Indicates whether this field is providing any input value.
			 *
			 * @name FormFieldAbstractModel#providesInput
			 * @property {Boolean}
			 * @readonly
			 */
			providesInput: { value: hasInputValue },

			/**
			 * Lists paths of variables this field depends on due to terms used
			 * in field's definition.
			 *
			 * @name FormFieldAbstractModel#dependsOn
			 * @property {Array<string[]>}
			 * @readonly
			 */
			dependsOn: { value: Object.keys( collectedDependencies ) },

			/**
			 * Lists names of fields depending on current one's value/state.
			 *
			 * @name FormFieldAbstractModel#dependents
			 * @property {string[]}
			 * @readonly
			 */
			dependents: {
				get: () => ( dependents == null ? [] : dependents ),
				set: dependingFieldNames => {
					if ( Array.isArray( dependingFieldNames ) ) {
						if ( dependents == null ) {
							dependents = dependingFieldNames;
						}
					}
				},
			},

			/**
			 * Indicates if field is considered valid, currently.
			 *
			 * @note By assigning any value (which is ignored) any previously
			 *       validation result is dropped.
			 *
			 * @name FormFieldAbstractModel#valid
			 * @property {boolean}
			 * @readonly
 			 */
			valid: {
				get: () => {
					if ( reactiveFieldInfo.valid == null ) {
						if ( reactiveFieldInfo.pristine ) {
							return true;
						}

						try {
							reactiveFieldInfo.errors = this.validate();
						} catch ( e ) {
							reactiveFieldInfo.errors = ["@VALIDATION.UNEXPECTED_ERROR"];
						}

						reactiveFieldInfo.valid = reactiveFieldInfo.errors.length === 0;
					}

					return reactiveFieldInfo.valid;
				},
			},

			/**
			 * Exposes information on current field being pristine or not.
			 *
			 * @note This information is basically read-only. It's possible to
			 *       write falsy value to explicitly mark field _touched_. This
			 *       is implicitly dropping cached information on field's
			 *       validity.
			 *
			 * @name FormFieldAbstractModel#pristine
			 * @property {boolean}
			 */
			pristine: {
				get: () => reactiveFieldInfo.pristine,
				set: value => {
					if ( value ) {
						throw new TypeError( `invalid request for marking field ${this.qualifiedName} as pristine` );
					}

					reactiveFieldInfo.pristine = false;
					reactiveFieldInfo.valid = null;
				},
			},

			/**
			 * Lists errors encountered during recent-most validation of field.
			 *
			 * @name FormFieldAbstractModel#errors
			 * @property {string[]}
			 * @readonly
 			 */
			errors: { get: () => reactiveFieldInfo.errors },

			/**
			 * Exposes reactive data of current field as used by any component
			 * used to present this field.
			 *
			 * @name FormFieldAbstractModel#$data
			 * @property {object<string,*>}
			 * @readonly
			 */
			$data: { value: reactiveFieldInfo },
		} );



		/**
		 * Qualifies variable names found in terms used in definition.
		 *
		 * @param {string[]} originalPath segments of path addressing variable as given in term
		 * @returns {string[]} optionally qualified list of segments for addressing some variable globally
		 */
		function qualifyVariable( originalPath ) {
			if ( originalPath.length === 1 ) {
				return [ form.name, originalPath[0] ];
			}

			return originalPath;
		}


		let component = null;

		Object.defineProperties( this, {
			/**
			 * Provides description of component representing current field.
			 *
			 * @name FormFieldAbstractModel#component
			 * @property {Component}
			 * @readonly
			 */
			component: { get() {
				if ( component == null ) {
					component = this._renderComponent( reactiveFieldInfo );
				}

				return component;
			} },
		} );
	}

	/**
	 * Exposes service handling localization of internationalized values so
	 * custom field extensions might access is via this provided abstract base
	 * class.
	 *
	 * @param {string|object<string,string>} internationalizedValue non-internationalized string or object mapping locale tag into one of several translation
	 * @returns {string} localized string
	 */
	selectLocalization( internationalizedValue ) {
		return L10n.selectLocalized( internationalizedValue, this.form.locale );
	}

	/**
	 * Handles change of a field's value by updating state of model accordingly.
	 *
	 * @param {*} store reference on store the adjustments took place in
	 * @param {*} newValue new value of field
	 * @param {?string} updatedFieldName name of updated field, null if current field was updated
	 * @returns {void}
	 */
	onUpdateValue( store, newValue, updatedFieldName = null ) {
		const data = this.$data;
		const itsMe = updatedFieldName == null;

		this.updateFieldInformation( data );

		if ( !itsMe && data.pristine ) {
			// some other field has been updated
			// -> my initial value might depend on it, so
			//    re-assign my initial unless field has been
			//    adjusted before
			store.dispatch( "form/writeInput", {
				name: this.qualifiedName,
				value: this.initial,
			} );
		}

		// changing current field or some field current one
		// depends on might affect validity of current field
		if ( !data.pristine ) {
			data.valid = null;
			const valid = this.valid; // eslint-disable-line no-unused-vars
		}

		if ( !itsMe ) {
			EventBus.$emit( "form:update", this.qualifiedName, updatedFieldName, newValue );
		}
	}

	/**
	 * Updates reactive information on current field probably re-evaluating
	 * terms used in definition of that information.
	 *
	 * @note Overload this method to extend list of properties to be
	 *       re-evaluated per type of field.
	 *
	 * @param {object} reactiveFieldInformation contains reactive properties of field
	 * @returns {void}
	 */
	updateFieldInformation( reactiveFieldInformation ) {
		reactiveFieldInformation.label = this.label;
		reactiveFieldInformation.hint = this.hint;
		reactiveFieldInformation.required = this.required;
		reactiveFieldInformation.visible = this.visible;
	}

	/**
	 * Fetches description of a Vue component representing this field.
	 *
	 * @param {object} reactiveFieldInfo provides object containing reactive information on field
	 * @returns {object} description of Vue component
	 */
	_renderFieldComponent( reactiveFieldInfo ) { // eslint-disable-line no-unused-vars
		return {
			render( createElement ) {
				return createElement( "<!-- abstract field -->" );
			},
		};
	}

	/**
	 * Provides definition of field's component.
	 *
	 * @param {object} reactiveFieldInfo provides object containing reactive information on field
	 * @returns {object} provides definition of field's component
	 */
	_renderComponent( reactiveFieldInfo ) {
		const that = this;
		const { type, qualifiedName } = this;

		return {
			components: {
				FieldComponent: this._renderFieldComponent( reactiveFieldInfo ),
			},
			template: `
<div v-if="required || visible" :class="[ 
	'field',
	'type-${type}', 
	'name-${qualifiedName}',
	required ? 'mandatory' : 'optional', 
	pristine ? 'pristine' : 'touched',
	valid ? 'valid' : 'invalid',
]">
	<span class="label">
		<label>{{label}}<span v-if="required" class="mandatory">*</span></label>
	</span>
	<span class="widget">
		<FieldComponent ref="fieldComponent" />
		<span class="hint" v-if="hint && hint.length">{{ hint }}</span>
		<span class="errors" v-if="errors.length">
			<span class="error" v-for="error in errors">{{ localize( error ) }}</span>
		</span>
	</span>
</div>
			`,
			data: () => reactiveFieldInfo,
			methods: {
				localize( lookup ) {
					if ( Array.isArray( lookup ) ) {
						const [ _lookup, args ] = lookup;

						return L10n.translate( this.$store.getters.l10n, _lookup, ...args );
					}

					if ( typeof lookup === "string" ) {
						const _lookup = lookup.trim();

						if ( _lookup[0] === "@" ) {
							return L10n.translate( this.$store.getters.l10n, _lookup.slice( 1 ) );
						}
					}

					return lookup;
				}
			},
			created() {
				this.__onGlobalFormAutoFocusEvent = () => {
					if ( that.form.autoFocusField === that ) {
						this.$nextTick( () => {
							const firstControl = this.$el.querySelector( "input, select, button" );

							if ( firstControl ) {
								firstControl.focus();

								if ( typeof firstControl.select === "function" ) {
									firstControl.select();
								}
							}
						} );
					}
				};

				EventBus.$on( "form:autofocus", this.__onGlobalFormAutoFocusEvent );
			},
			beforeMount() {
				if ( that.pristine ) {
					reactiveFieldInfo.value = that.normalizeValue( that.initial );
				}

				this.$on( "input", () => {
					if ( !this.pristine ) {
						this.valid = null;
						const valid = that.valid; // eslint-disable-line no-unused-vars
					}
				} );

				this.__onGlobalFormUpdateEvent = ( emittingQualifiedName, updatedFieldName, newValue ) => { // eslint-disable-line no-unused-vars
					if ( emittingQualifiedName === qualifiedName ) {
						const field = this.$refs.fieldComponent;
						if ( field ) {
							const fieldUpdater = field.updateOnDataChanged;
							if ( typeof fieldUpdater === "function" ) {
								fieldUpdater();
							}
						}
					}
				};

				EventBus.$on( "form:update", this.__onGlobalFormUpdateEvent );
			},
			beforeDestroy() {
				EventBus.$off( "form:update", this.__onGlobalFormUpdateEvent );
				EventBus.$off( "form:autofocus", this.__onGlobalFormAutoFocusEvent );
			},
		};
	}

	/**
	 * Normalizes provided input value in compliance with current type of field.
	 *
	 * @param {*} value some input value or similar
	 * @param {object} options additional options
	 * @returns {*} normalized value
	 */
	normalizeValue( value, options = {} ) { // eslint-disable-line no-unused-vars
		return value;
	}

	/**
	 * Validates current state of field.
	 *
	 * @note This method is automatically invoked on updating this field's data.
	 *       As a result the properties `valid` and `errors` are updated. You
	 *       basically should rely on those properties instead of invoking this
	 *       method (explicitly again).
	 *
	 * @param {boolean} live indicates whether validation occurs live while user is providing input
	 * @returns {string[]} lists validation error messages, empty list indicates valid field
	 */
	validate( live = false ) { // eslint-disable-line no-unused-vars
		return [];
	}

	/**
	 * Sets up provided constructor function to represent "sub-class" of current
	 * one.
	 *
	 * @note This method is provided to simplify pre-ES6 inheritance on
	 *       registering custom types of fields.
	 *
	 * @param {function} subClassConstructor constructor function
	 * @returns {function} provided constructor function
	 */
	static makeInherit( subClassConstructor ) {
		const subProto = subClassConstructor.prototype = Object.create( this.prototype );
		subProto.constructor = subClassConstructor;
		subProto.$super = this;

		return subClassConstructor;
	}

	/**
	 * Indicates if current class is a base class of provided one.
	 *
	 * @param {function|class} subClass some class to be tested for inheriting from current one
	 * @returns {boolean} true if current one is base class of provided one
	 */
	static isBaseClassOf( subClass ) {
		let iter = subClass.prototype;

		while ( iter ) {
			if ( iter.constructor === this ) {
				return true;
			}

			iter = Object.getPrototypeOf( iter );
		}

		return false;
	}
}

/**
 * Converts provided arbitrary value of a definition to type expected for named
 * definition property.
 *
 * @param {string} name name of definition property provided value is associated with
 * @param {*} value some arbitrary value
 * @returns {*} normalized value for use with named definition property
 */
function normalizeDefinitionValue( name, value ) {
	switch ( name ) {
		case "label" :
		case "hint" :
			return String( value );

		case "required" :
		case "visible" :
			switch ( typeof value ) {
				case "string" :
					return Data.normalizeToBoolean( value );

				default :
					return Boolean( value );
			}

		default :
			return value;
	}
}
