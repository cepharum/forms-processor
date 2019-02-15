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

import EventBus from "@/service/events";
import L10n from "@/service/l10n";
import Data from "@/service/data";
import CompileTerm from "../utility/process";
import { Processor } from "simple-terms";

const termCache = new Map();

/**
 * Declares default values of commonly supported field properties.
 *
 * @type {object<string,string>}
 */
const defaultProperties = {
	required: "false",
	visible: "true",
	type: "text",
};

/**
 * Lists reserved names of properties that mustn't be commonly processed
 * when used as a property name in field's definition.
 *
 * @type {string[]}
 */
const reserved = [
	"form",
	"index",
	"name",
	"originalName",
	"qualifiedName",
	"type",
	"value",
	"dependsOn",
	"dependents",
	"pristine",
	"valid",
	"errors",
];



/**
 * Defines callback function available for detecting embedded terms in a custom
 * value returning property descriptor.
 *
 * In addition this function is expected to privately know the name of a
 * property some provided value is originating from. It is thus implicitly
 * updating the reactive set of properties accordingly. However, if value
 * provided here isn't related to the definition property this function
 * considers to manage the argument `isSubValue` must be set true to prevent the
 * invoked function from updating reactive data using that property's name.
 *
 * @typedef {function( value:*, normalizer:function(*):*, isSubValue:boolean ):PropertyDescriptor} CustomPropertyLimitedTermHandler
 */

/**
 * Defines callback function available for detecting embedded terms in a custom
 * value returning property descriptor.
 *
 * In addition this function is expected to privately know the name of a
 * property some provided value is originating from. It is thus implicitly
 * updating the reactive set of properties accordingly. However, if value
 * provided here isn't related to the definition property this function
 * considers to manage the argument `isSubValue` must be set true to prevent the
 * invoked function from updating reactive data using that property's name.
 *
 * @typedef {function( value:*, normalizer:function(*):*, isSubValue:boolean ):PropertyDescriptor} CustomPropertyLimitedTermHandler
 */

/**
 * Defines callback to be invoked for explicitly updating some definition
 * property's value in field's reactive set of properties after having
 * (re-)computed it.
 *
 * @typedef {function(newValue:*)} CustomPropertyReactiveWriter
 */

/**
 * Defines signature of a function generating property descriptor for some
 * custom property.
 *
 * @typedef {function(
 *     value:*,
 *     name:string,
 *     definition:object<string,*>,
 *     termHandler:CustomPropertyLimitedTermHandler,
 *     reactiveWriter:CustomPropertyReactiveWriter
 * ):PropertyDescriptor} PropertyDescriptorFactory
 */

/**
 * Combines types of data supported by abstract base class of a field on
 * handling custom properties in a field's definition.
 *
 * @typedef {PropertyDescriptor|PropertyDescriptorFactory|*} CustomProperty
 */

/**
 * Defines a map of custom properties' names used in a field's definition into
 * descriptors or handlers creating exposure for value of either definition
 * property.
 *
 * @typedef {object<string,CustomProperty>} CustomPropertyMap
 */



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
	 * @param {CustomPropertyMap} customProperties defines custom properties to be exposed using custom property descriptor
	 * @param {FormFieldAbstractModel} container reference on manager of field container containing current field
	 */
	constructor( form, definition, fieldIndex, reactiveFieldInfo, customProperties = {}, container = null ) {
		const { name } = definition;
		if ( !name ) {
			throw new TypeError( "Missing field name in definition." );
		}


		/*
		 * --- expose essential properties of field ---------------------------
		 */

		const originalName = String( name ).trim();
		const normalizedName = originalName.toLowerCase();
		const formName = form.name;
		const qualifiedName = `${formName}.${normalizedName}`;

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
			 * Provides original name of field which is the name used in field's
			 * definition.
			 *
			 * Any derived name in properties `name` and `qualifiedName` use all
			 * lower-case variant of this original name to relax addressing
			 * issues e.g. in processed terms. This original name is used to
			 * name HTML components as well as on processing data.
			 *
			 * @name FormFieldAbstractModel#originalName
			 * @property {string}
			 * @readonly
			 */
			originalName: { value: originalName },

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
			value: this.constructor.isInteractive ? {
				get: () => form.readValue( qualifiedName ),
				set: value => form.writeValue( qualifiedName, value ),
			} : { value: undefined },

			/**
			 * Exposes any field containing current one.
			 *
			 * @name FormFieldAbstractModel#container
			 * @property {?FormFieldAbstractModel}
			 * @readonly
			 */
			container: { value: container || null },
		} );


		/*
		 * --- expose dynamic and custom properties of field ------------------
		 */

		/**
		 * Collects terms used in context of current field's definition.
		 *
		 * @type {Processor[]}
		 */
		const terms = [];

		/**
		 * Collects eventually exposed properties of field.
		 *
		 * @type {PropertyDescriptorMap}
		 */
		const getters = {};

		/**
		 * Qualifies caller-provided definition to always include some default
		 * elements.
		 *
		 * @type {object}
		 */
		const qualifiedDefinition = Object.assign( {}, defaultProperties, definition );


		Object.defineProperties( this, {
			/**
			 * Creates getter for provided value which might contain a computable
			 * term to be processed on every access on returned getter.
			 *
			 * @name FormFieldAbstractModel#createGetter
			 * @property {function}
			 * @param {?string} value value to be provided by resulting getter, inspected for optionally containing term
			 * @param {string=} key name of this value in optionally provided data set, used on computing contained term
			 * @param {object=} data set containing up-to-date value (e.g. on computing term) as well as any other value available in a term,
			 *        omit or set null to implicitly use set of all reactive values of current field
			 * @param {function(string):string} normalizer callback invoked to normalize provided or any computed value,
			 *        omit or set null to implicitly use static method `normalizeDefinitionValue()`
			 * @return {{value:string}|{get:function():string}} partial property descriptor containing either static value or dynamic getter
			 */
			createGetter: {
				value: ( value, key, data = null, normalizer = null ) => {
					return handleComputableValue( value, key,
						data || reactiveFieldInfo,
						normalizer || ( v => this.constructor.normalizeDefinitionValue( v, key, qualifiedDefinition ) ) );
				},
			},
		} );

		{
			const propNames = Object.keys( qualifiedDefinition );
			const numProps = propNames.length;

			for ( let pni = 0; pni < numProps; pni++ ) {
				const propertyName = propNames[pni];
				let propertyValue = qualifiedDefinition[propertyName];

				switch ( propertyName ) {
					case "type" :
						// this property is essential, can't be computed and
						// requires certain type of value
						if ( typeof propertyValue !== "string" || !propertyValue.trim().length ) {
							throw new TypeError( `Rejecting invalid type of field ${qualifiedName}.` );
						}

						getters[propertyName] = { value: propertyValue };
						break;

					default :
						if ( reserved.indexOf( propertyName ) < 0 ) {
							// handle non-reserved properties of definition in a common way

							if ( customProperties.hasOwnProperty( propertyName ) ) {
								// got some custom descriptor of property to expose
								const descriptor = customProperties[propertyName];
								if ( descriptor !== undefined ) {
									customProperties[propertyName] = undefined;

									handleCustomProperty.call( this, descriptor, propertyValue, propertyName );
								}
							} else {
								switch ( propertyName ) {
									case "suppress" :
										break;

									default :
										propertyValue = L10n.selectLocalized( propertyValue, form.locale );
								}

								if ( propertyValue != null ) {
									getters[propertyName] = handleComputableValue( propertyValue, propertyName,
										reactiveFieldInfo, v => this.constructor.normalizeDefinitionValue( v, propertyName, qualifiedDefinition ) );
								}
							}
						}
				}
			}
		}

		{ // make sure to transfer "default" behaviour of custom properties due to lacking definition mentioning it
			const propNames = Object.keys( customProperties );
			const numProps = propNames.length;

			for ( let pni = 0; pni < numProps; pni++ ) {
				const propertyName = propNames[pni];
				const descriptor = customProperties[propertyName];

				if ( reserved.indexOf( propertyName ) < 0 ) {
					if ( descriptor !== undefined && !getters.hasOwnProperty( propertyName ) ) {
						handleCustomProperty.call( this, descriptor, undefined, propertyName );
					}
				}
			}
		}

		Object.defineProperties( this, getters );


		/*
		 * --- expose dependencies and reactive data of field -----------------
		 */

		// collect combined dependencies of all terms processed before
		const collectedDependencies = {};
		for ( let i = 0, numTerms = terms.length; i < numTerms; i++ ) {
			const dependencies = terms[i].dependsOn;

			for ( let j = 0, numDependencies = dependencies.length; j < numDependencies; j++ ) {
				collectedDependencies[dependencies[j].slice( 0, 2 ).join( "." )] = true;
			}
		}


		/**
		 * Lists names of fields depending on current one.
		 *
		 * This list is to be fed by fields detecting themselves to depend on
		 * current one.
		 *
		 * @type {null|string[]}
		 */
		let dependents = null;

		/**
		 * Caches reference on component created to render current field.
		 *
		 * @type {?Component}
		 */
		let component = null;


		// qualify provided variable space to be reactive data of current field
		// in context of containing form's reactive data
		reactiveFieldInfo.required = null;
		reactiveFieldInfo.visible = null;
		reactiveFieldInfo.pristine = true;
		reactiveFieldInfo.valid = null;
		reactiveFieldInfo.value = null;
		reactiveFieldInfo.label = null;
		reactiveFieldInfo.hint = null;
		reactiveFieldInfo.errors = [];


		Object.defineProperties( this, {
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
			valid: { get: this.readValidState, },

			/**
			 * Exposes information on current field being pristine or not.
			 *
			 * @note This information is basically read-only. It's possible to
			 *       write falsy value to explicitly mark field _affected_. This
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
						throw new TypeError( `Invalid request for marking field ${this.qualifiedName} as pristine rejected.` );
					}

					reactiveFieldInfo.pristine = false;
					reactiveFieldInfo.valid = null;

					if ( container ) {
						container.touch();
					}
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
			$data: {
				get: () => {
					form.writeValue( qualifiedName, this.initializeReactive( reactiveFieldInfo ) );

					Object.defineProperties( this, {
						$data: { value: reactiveFieldInfo },
					} );

					return reactiveFieldInfo;
				},
				configurable: true,
			},

			/**
			 * Provides description of component representing current field.
			 *
			 * @name FormFieldAbstractModel#component
			 * @property {Component}
			 * @readonly
			 */
			component: {
				get() {
					if ( component == null ) {
						component = this.renderComponent( this.$data );
					}

					return component;
				},
				configurable: true,
			},
		} );


		/**
		 * Resolves variable name found in terms used in definition converting
		 * local references into global ones using a field's qualified name.
		 *
		 * @param {string[]} originalPath segments of path addressing variable as given in term
		 * @returns {string[]} optionally qualified list of segments for addressing some variable globally
		 */
		function resolveVariableName( originalPath ) {
			if ( originalPath.length === 1 ) {
				return [ form.name, originalPath[0] ];
			}

			const { qualifiedNames } = form.sequence;
			const [ major, minor ] = originalPath;

			if ( !qualifiedNames.has( `${major}.${minor}`.toLowerCase() ) ) {
				if ( !qualifiedNames.has( `${form.name}.${major}`.toLowerCase() ) ) {
					throw new TypeError( `invalid dependency on unknown field ${originalPath.join( "." )}` );
				}

				return [form.name].concat( originalPath );
			}

			return originalPath;
		}

		/**
		 * Inspects provided value for containing one or more terms returning
		 * evaluating function if there is at least one term or the normalized
		 * value otherwise.
		 *
		 * @param {?string} value value to be inspected for optionally containing term
		 * @param {string=} key name of value in optionally provided data set
		 * @param {object=} data container of up-to-date value with provided key as its name
		 * @param {function(string):string} normalizer callback invoked to normalize provided or any computed value
		 * @return {{value:string}|{get:function():string}} partial property descriptor containing either static value or dynamic getter
		 */
		function handleComputableValue( value, key, data = null, normalizer = null ) {
			const customFunctions = {
				lookup( fieldValue, fieldName, fieldProperty ) {
					const fieldKey = fieldName.toLowerCase();
					const field = form.sequence.fields[fieldKey];
					const map = field[fieldProperty];
					if( Array.isArray( map ) ) {
						for ( let index = 0, length = map.length; index < length; index++ ) {
							const entry = map[index];
							if( entry.value === fieldValue ) {
								return entry.label;
							}
						}
					}
					if( typeof map === "object" ) {
						return map.label;
					}
					return map;
				}
			};


			const compiled = CompileTerm.compileString( value, customFunctions, termCache, resolveVariableName );

			if ( Array.isArray( compiled ) ) {
				// value _might contain_ one or more computable terms
				const numSlices = compiled.length;
				let hasTerm = false;

				for ( let i = 0; i < numSlices; i++ ) {
					const slice = compiled[i];

					if ( slice instanceof Processor ) {
						terms.push( slice );
						hasTerm = true;
					}
				}

				if ( hasTerm ) {
					// value _is containing_ one or more computable terms
					return { get: () => {
						const rendered = new Array( numSlices );

						for ( let i = 0; i < numSlices; i++ ) {
							const slice = compiled[i];

							if ( typeof slice === "object" ) {
								rendered[i] = slice.evaluate( form.data );
							} else {
								rendered[i] = slice;
							}
						}

						const computed = normalizer ? normalizer( rendered.join( "" ) ) : rendered.join( "" );

						if ( data ) {
							data[key] = computed;
						}

						return computed;
					} };
				}
			}

			if ( compiled instanceof Processor ) {
				// value completely consists of a sole term's source
				terms.push( compiled );

				return { get: () => {
					const computed = compiled.evaluate( form.data );
					const normalized = normalizer ? normalizer( computed ) : computed;

					if ( data ) {
						data[key] = normalized;
					}

					return normalized;
				} };
			}

			// value doesn't contain any computable term
			// got static value
			// -> deliver normalized value
			const normalized = normalizer ? normalizer( value ) : value;

			if ( data ) {
				data[key] = normalized;
			}

			return { value: normalized };
		}

		/**
		 * Handles integration of defined property using some custom property
		 * descriptor or some factory to generate this descriptor as provided
		 * by caller.
		 *
		 * @param {CustomPropertyMap} customProperty property descriptor to use, factory to create that or some fixed value
		 * @param {*} definedValue value of property found in definition
		 * @param {string} propertyName name of definition property to be integrated
		 * @returns {void}
		 */
		function handleCustomProperty( customProperty, definedValue, propertyName ) {
			if ( typeof customProperty === "function" ) {
				// got generator for custom property's description
				const description = customProperty.call( this,
					definedValue,
					propertyName,
					qualifiedDefinition,
					( value, normalizer, isSubValue = false ) => handleComputableValue(
						value,
						propertyName,
						isSubValue ? null : reactiveFieldInfo,
						normalizer
					),
					value => { reactiveFieldInfo[propertyName] = value; }
				);

				if ( description !== undefined ) { // eslint-disable-line max-depth
					if ( description.get ) {
						const originalGet = description.get;
						description.get = function() {
							const original = originalGet.call( this );
							reactiveFieldInfo[propertyName] = original;
							return original;
						};
						reactiveFieldInfo[propertyName] = originalGet();
					} else {
						reactiveFieldInfo[propertyName] = description.value;
					}

					getters[propertyName] = description;
				}
			} else if ( typeof customProperty.get === "function" ) {
				// got custom property's description containing getter function
				getters[propertyName] = customProperty;
				reactiveFieldInfo[propertyName] = customProperty.get();
			} else if ( customProperty.hasOwnProperty( "value" ) ) {
				// got custom property's description containing fixed value
				getters[propertyName] = customProperty;
				reactiveFieldInfo[propertyName] = customProperty.value;
			} else {
				// got fixed value of custom property
				getters[propertyName] = { value: customProperty };
				reactiveFieldInfo[propertyName] = customProperty;
			}
		}
	}

	/**
	 * Detects whether current field is valid or not.
	 *
	 * This method is used by property FormFieldAbstractModel#valid internally,
	 * but exposed separately to support parameter provision.
	 *
	 * @param {boolean} live true if validation is read due to user changing value of field, false if user tries to advance in sequence of forms
	 * @param {boolean} force set true to prevent use of cached result of previous validation
	 * @param {boolean} includePristine set true to validate pristine fields as well
	 * @param {boolean} showErrors controls whether error messages of failed validations should be displayed/written in reactive data of field
	 * @returns {boolean} true if form is considered valid, false otherwise
	 */
	readValidState( { live = true, force = false, includePristine = false, showErrors = true } = {} ) {
		const data = this.$data;

		if ( !includePristine && data.pristine ) {
			return true;
		}

		if ( force || data.valid == null ) {
			let errors;

			try {
				errors = Data.unique( this.validate( live ) );
			} catch ( e ) {
				errors = ["@VALIDATION.UNEXPECTED_ERROR"];
			}

			if ( showErrors ) {
				// support validate() returning special error message `true` to
				// drop field's validity w/o actually showing some error message
				data.errors = errors.filter( error => error !== true );
			}

			const isValid = errors.length === 0;

			if ( !data.pristine ) {
				// don't adjust mark on a pristine field's validity so it won't
				// be visually reflected in GUI and to ensure it is re-validated
				// first time after becoming affected
				data.valid = isValid;
			}

			return isValid;
		}

		return data.valid;
	}

	/**
	 * Initializes data in provided set of reactive data of field.
	 *
	 * @param {object} reactiveFieldInfo reactive variable space e.g. used by field's component
	 * @returns {*} initial value of field as used on initializing reactive data
	 * @protected
	 */
	initializeReactive( reactiveFieldInfo ) {
		const { value, formattedValue } = this.normalizeValue( this.initial );

		reactiveFieldInfo.required = this.required;
		reactiveFieldInfo.visible = this.visible;
		reactiveFieldInfo.label = this.label;
		reactiveFieldInfo.hint = this.hint;
		reactiveFieldInfo.value = value;
		reactiveFieldInfo.formattedValue = formattedValue;

		return value;
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
	 * Marks current field touched.
	 *
	 * NOTE! This method should be preferred over adjusting property `pristine`
	 *       so containers might observe pristine fields and derive its own
	 *       state using some custom algorithm.
	 *
	 * @param {boolean} force set true to force setting any field _touched_ (e.g. on clicking button "Next")
	 * @returns {void}
	 */
	touch( force = false ) { // eslint-disable-line no-unused-vars
		this.pristine = false;
	}

	/**
	 * Handles change of a field's value by updating state of model accordingly.
	 *
	 * @param {*} store reference on store the adjustments took place in
	 * @param {*} newValue new value of field
	 * @param {?string} updatedFieldName name of updated field, null if current field was updated
	 * @returns {boolean} true if validity of field has changed
	 */
	onUpdateValue( store, newValue, updatedFieldName = null ) {
		const data = this.$data;
		const oldValidity = data.valid;
		const itsMe = updatedFieldName == null;

		this.updateFieldInformation( data, itsMe );

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
			this.readValidState( { force: true } );
		}

		if ( !itsMe ) {
			EventBus.$emit( "form:update", this.qualifiedName, updatedFieldName, newValue );
		}

		return oldValidity !== data.valid;
	}

	/**
	 * Updates reactive information on current field probably re-evaluating
	 * terms used in definition of that information.
	 *
	 * @note Overload this method to extend list of properties to be
	 *       re-evaluated per type of field.
	 *
	 * @param {object} reactiveFieldInformation contains reactive properties of field
	 * @param {boolean} onLocalUpdate if true method is invoked due to recent change of current field itself,
	 *        otherwise it's been an update of field this one depends on
	 * @returns {void}
	 */
	updateFieldInformation( reactiveFieldInformation, onLocalUpdate ) { // eslint-disable-line no-unused-vars
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
	renderFieldComponent( reactiveFieldInfo ) { // eslint-disable-line no-unused-vars
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
	renderComponent( reactiveFieldInfo ) {
		const that = this;
		const { type, originalName, name, qualifiedName, classes, form: { writeValue } } = this;

		this.initializeReactive( reactiveFieldInfo );

		return {
			components: {
				FieldComponent: this.renderFieldComponent( reactiveFieldInfo ),
			},
			computed: {
				componentClasses() {
					return [
						`field`,
						`type-${type}`,
						`name-${originalName}`,
						`nname-${name}`,
						`qname-${qualifiedName.replace( /\./g, "_" )}`,
						this.required ? "mandatory" : "optional",
						this.pristine ? "pristine" : "affected",
						this.label ? "with-label" : "without-label",
						this.valid ? "valid" : "invalid",
						this.showErrors ? "show-errors" : "suppress-errors",
						this.showLabels ? "show-labels" : "suppress-labels",
					].concat( classes );
				},
				showErrors() {
					return !that.suppress || !that.suppress.errors;
				},
				showLabels() {
					return !that.suppress || !that.suppress.labels;
				},
			},
			template: `
<div v-if="required || visible" :class="componentClasses">
	<span class="label" v-if="showLabels">
		<label>{{label}}<span v-if="required" class="mandatory">*</span></label>
	</span>
	<span class="widget">
		<FieldComponent ref="fieldComponent" @input="onInput" />
		<span class="hint" v-if="hint && hint.length">{{ hint }}</span>
		<span class="errors" v-if="showErrors && errors.length">
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
				},
				onInput( newValue ) {
					that.touch();

					writeValue( qualifiedName, newValue );
					this.value = newValue;
				},
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
					const { value, formattedValue } = that.normalizeValue( that.initial );

					reactiveFieldInfo.value = value;
					reactiveFieldInfo.formattedValue = formattedValue;
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
	 * Converts provided arbitrary value of a definition to type expected for named
	 * definition property.
	 *
	 * @param {*} value some arbitrary value
	 * @param {string} name name of definition property provided value is associated with
	 * @param {object<string,*>} definitions qualified set of a field's definition properties
	 * @returns {*} normalized value for use with named definition property
	 */
	static normalizeDefinitionValue( value, name, definitions ) { // eslint-disable-line no-unused-vars
		switch ( name ) {
			case "classes" :
				return typeof value === "string" ? value.trim().split( /\s*[,;][,;\s]*/ ) : value;

			case "label" :
			case "hint" :
				return String( value );

			case "suppress" : {
				let _value = value;

				if ( typeof _value === "string" ) {
					_value = _value.trim().split( /\s*,[,\s]*/ );
				}

				if ( Array.isArray( _value ) ) {
					const object = {};
					const numValues = _value.length;

					for ( let i = 0; i < numValues; i++ ) {
						const v = _value[i];

						if ( v != null ) {
							object[String( numValues[i] ).toLowerCase()] = true;
						}
					}

					return object;
				}

				return value && typeof value == "object" ? value : {};
			}

			case "required" :
			case "visible" :
				switch ( typeof value ) {
					case "string" : {
						const boolean = Data.normalizeToBoolean( value );
						return boolean == null ? value.trim().length > 0 : boolean;
					}

					default :
						return Boolean( value );
				}

			default :
				return value;
		}
	}

	/**
	 * Normalizes provided input value in compliance with current type of field.
	 *
	 * @param {*} value some input value or similar
	 * @param {object} options additional options
	 * @returns {*} normalized value
	 */
	normalizeValue( value, options = {} ) { // eslint-disable-line no-unused-vars
		return { value, formattedValue: value };
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
		const errors = [];
		const { value, required } = this;

		if ( required && ( value == null || value === "" ) ) {
			errors.push( "@VALIDATION.MISSING_REQUIRED" );
		}

		return errors;
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
