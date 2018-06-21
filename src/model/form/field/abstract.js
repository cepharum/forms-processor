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
	 * @param {FormModel} form manages form containing this field
	 * @param {object} definition properties and constraints of single form field
	 */
	constructor( form, definition ) {
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

					default :
						// handle all else definition properties
						propertyValue = propertyValue.trim();
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
			qualifiedName: { value: `${form.name}.${normalizedName}` },

			/**
			 * Lists paths of variables this field depends on due to terms used
			 * in field's definition.
			 *
			 * @name FormFieldAbstractModel#dependsOn
			 * @property {Array<string[]>}
			 * @readonly
			 */
			dependsOn: { value: Object.keys( collectedDependencies ) },
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
		const { label, required, visible, hint, type, qualifiedName, dependsOn } = that;

		return {
			components: {
				FieldComponent: this.renderFieldComponent(),
			},
			template: `
<div class="field" :class="[ required ? 'mandatory' : 'optional', 'type-${type}', 'name-${qualifiedName}' ]" v-if="required || visible">
	<span class="label">
		<label>{{label}}<span v-if="required" class="mandatory">*</span></label>
	</span>
	<span class="widget">
		<FieldComponent ref="fieldComponent" v-model="value" />
		<span class="hint" v-if="hint && hint.length">{{ hint }}</span>
	</span>
</div>
			`,
			data() {
				return {
					label,
					required,
					visible,
					hint,
					value: null,
				};
			},
			beforeMount() {
				this._unsubscribe = this.$store.subscribe( mutation => {
					if ( mutation.type === "writeInput" ) {
						const { name } = mutation.payload;

						if ( dependsOn.indexOf( name ) > -1 ) {
							that.updateComponentOnDataChanged( this );

							const field = this.$refs.fieldComponent;
							if ( field ) {
								const fieldUpdater = field.updateOnDataChanged;
								if ( typeof fieldUpdater === "function" ) {
									fieldUpdater();
								}
							}
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
}
