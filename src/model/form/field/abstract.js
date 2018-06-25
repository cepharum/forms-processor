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

import L10N from "../../../service/l10n";

import TermProcessor from "../../term/processor";
import Property from "../utility/property";

const termCache = new Map();

/**
 * Declares default values of commonly supported field properties.
 *
 * @type {object<string,string>}
 */
const DefaultProperties = {
	required: "false",
	visible: "true",
};

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
	 * @param {string[]} omitProperties lists properties of definition to omit
	 */
	constructor( form, definition, omitProperties = [] ) {
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

		const ptnBinding = /({{[^}]+}})/;

		const qualifiedDefinition = Object.assign( DefaultProperties, definition );

		/**
		 * Lists errors encountered in recent-most validation of field. Value is
		 * null if there was no previous validation or any previous validation
		 * isn't uptodate anymore.
		 *
		 * @type {null|string[]}
		 */
		let validationErrors = null;


		Object.keys( qualifiedDefinition )
			.forEach( propertyName => {
				let propertyValue = qualifiedDefinition[propertyName];

				switch ( propertyName ) {
					case "required" :
					case "visible" : {
						// listed definition properties are always considered to hold a term for evaluation
						const term = new TermProcessor( String( propertyValue ), {}, termCache, qualifyVariable );
						terms.push( term );
						getters[propertyName] = { get: () => term.evaluate( form.data ) };
						break;
					}

					case "name" :
					case "qualifiedName" :
						// ignore these properties here for being processed explicitly below
						break;

					case "value" :
					case "valid" :
					case "errors" :
						// ignore these properties here for being reserved properties for internal use
						break;

					default :
						if ( omitProperties.indexOf( propertyName ) > -1 ) {
							break;
						}

						// handle all else definition properties
						propertyValue = Property.localizeValue( propertyValue );
						if ( propertyValue == null ) {
							break;
						}

						propertyValue = String( propertyValue ).trim();

						if ( propertyValue.charAt( 0 ) === "=" ) {
							const term = new TermProcessor( propertyValue.slice( 1 ), {}, termCache, qualifyVariable );
							terms.push( term );
							getters[propertyName] = { get: () => term.evaluate( form.data ) };
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

										return rendered.join( "" );
									}
								};
							} else {
								getters[propertyName] = { value: propertyValue };
							}
						}
				}
			} );


		// collect combined dependencies of all terms processed before
		const collectedDependencies = {};
		for ( let i = 0, numTerms = terms.length; i < numTerms; i++ ) {
			const dependencies = terms[i].dependsOn;

			for ( let j = 0, numDependencies = dependencies.length; j < numDependencies; j++ ) {
				collectedDependencies[dependencies[j].join( "." )] = true;
			}
		}


		const formName = form.name;
		const formData = form.data;

		Object.defineProperties( this, Object.assign( getters, {
			/**
			 * Provides reference on instance managing form containing field.
			 *
			 * @name FormFieldAbstractModel#form
			 * @property {FormModel}
			 * @readonly
			 */
			form: { value: form },

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
			qualifiedName: { value: `${formName}.${normalizedName}` },

			/**
			 * Reads current value of field.
			 *
			 * @name FormFieldAbstractModel#value
			 * @property {*|undefined} current value of field, `undefined` if there is no value available for current field
			 * @readonly
			 */
			value: {
				get: () => {
					if ( formData.hasOwnProperty( formName ) ) {
						const formSectionData = formData[formName];
						if ( formSectionData && typeof formSectionData === "object" ) {
							if ( normalizedName in formSectionData ) {
								return formSectionData[normalizedName];
							}
						}
					}

					return this.constructor.normalizeValue( this.initial );
				},
			},

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
			 * Indicates if field is considered valid, currently.
			 *
			 * @note By assigning any value (which is ignored) any previously
			 *       validation result is dropped.
			 *
			 * @name FormFieldAbstractModel#valid
			 * @property {boolean}
 			 */
			valid: {
				get: () => {
					if ( validationErrors == null ) {
						try {
							validationErrors = this._validate();
						} catch ( e ) {
							validationErrors = [L10N.translations.VALIDATION.UNEXPECTED_ERROR];
						}
					}

					return !validationErrors.length;
				},
				set: () => {
					validationErrors = null;
				},
			},

			/**
			 * Lists errors encountered during recent-most validation of field.
			 *
			 * @name FormFieldAbstractModel#errors
			 * @property {string[]}
			 * @readonly
 			 */
			errors: { get: () => {
				if ( validationErrors == null ) {
					validationErrors = this._validate();
				}

				return validationErrors;
			} },
		} ) );



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
	}

	/**
	 * Updates reactive properties of component provided by renderComponent().
	 *
	 * @param {object} component refers to component to be updated
	 * @returns {void}
	 */
	updateComponentOnDataChanged( component ) {
		/* eslint-disable no-param-reassign */
		component.label = this.label;
		component.required = this.required;
		component.visible = this.visible;
		component.hint = this.hint;
		/* eslint-enable no-param-reassign */
	}

	/**
	 * Fetches description of a Vue component representing this field.
	 *
	 * @returns {object} description of Vue component
	 */
	renderFieldComponent() {
		return {
			render: function( createElement ) {
				return createElement( "<!-------->" );
			},
		};
	}

	/**
	 * Provides definition of field's component.
	 *
	 * @returns {object} provides definition of field's component
	 */
	renderComponent() {
		const that = this;
		const {
			label, required, visible, hint, valid, errors, type, qualifiedName,
			dependsOn,
		} = that;

		return {
			components: {
				FieldComponent: this.renderFieldComponent(),
			},
			template: `
<div v-if="required || visible" :class="[ 
	'field',
	'type-${type}', 
	'name-${qualifiedName}',
	required ? 'mandatory' : 'optional', 
	valid ? 'valid' : 'invalid',
]">
	<span class="label">
		<label>{{label}}<span v-if="required" class="mandatory">*</span></label>
	</span>
	<span class="widget">
		<FieldComponent ref="fieldComponent" v-model="value" />
		<span class="hint" v-if="hint && hint.length">{{ hint }}</span>
		<span class="errors" v-if="errors.length">
			<span v-for="error in errors">{{ error }}</span>
		</span>
	</span>
</div>
			`,
			data() {
				return {
					label,
					required,
					visible,
					hint,
					valid,
					errors,
					value: null,
				};
			},
			beforeMount() {
				this._unsubscribe = this.$store.subscribe( mutation => {
					if ( mutation.type === "writeInput" ) {
						const { name } = mutation.payload;

						if ( dependsOn.indexOf( name ) > -1 ) {
							that.valid = null; // drop previous validation of field

							that.updateComponentOnDataChanged( this );

							const field = this.$refs.fieldComponent;
							if ( field ) {
								const fieldUpdater = field.updateOnDataChanged;
								if ( typeof fieldUpdater === "function" ) {
									fieldUpdater();
								}
							}
						}

						if ( name === qualifiedName ) {
							that.valid = null; // drop previous validation of field

							this.valid = this.pristine || that.valid;
							this.errors = this.pristine ? [] : that.errors;
						}
					}
				} );
			},
			beforeDestroy() {
				if ( this._unsubscribe ) {
					this._unsubscribe();
				}
			},
		};
	}

	/**
	 * Normalizes provided input value in compliance with current type of field.
	 *
	 * @param {*} value some input value or similar
	 * @returns {*} normalized value
	 */
	static normalizeValue( value ) {
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
	 * @returns {string[]} lists validation error messages, empty list indicates valid field
	 */
	_validate() {
		return [];
	}
}
