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

import FormModel from "./form";

import EventBus from "@/service/events";
import L10n from "@/service/l10n";
import Data from "@/service/data";


/**
 * Wraps definition of a sequence of forms.
 */
export default class FormSequenceModel {
	/**
	 * @param {string} id permanently unique ID of current sequence of forms
	 * @param {object} definition definition of a sequence of forms
	 * @param {FormsAPIExtensionsRegistry} registry registry of available types of fields and input processors
	 * @param {string} name temporarily unique ID of current sequence of forms in context of current HTML document
	 * @param {function():string} localeFn callback invoked to fetch tag of current locale
	 * @param {function(string):*} read reads value of a named field
	 * @param {function(string,*)} write adjusts value of a named field
	 * @param {object<string,*>} data refers to (read-only) storage managed by `read`/`write`
	 */
	constructor( { id, name }, definition, registry, { read, write, data }, localeFn ) {
		const { mode = {}, sequence = [], processors = {} } = definition;

		const numDefinedForms = sequence.length;
		const reactiveInfo = {
			forms: new Array( numDefinedForms ),
			currentIndex: 0,
		};

		if ( typeof id !== "string" ) {
			throw new TypeError( "Invalid ID of sequence of forms." );
		}

		if ( typeof name !== "string" ) {
			throw new TypeError( "Invalid name of sequence of forms." );
		}

		Object.defineProperties( this, {
			/**
			 * Provides permanently unique ID of current sequence of forms.
			 *
			 * @name FormSequenceModel#id
			 * @property {string}
			 * @readonly
			 */
			id: { value: id },

			/**
			 * Provides temporarily unique ID of current sequence of forms in
			 * context of current HTML document.
			 *
			 * @name FormSequenceModel#name
			 * @property {string}
			 * @readonly
			 */
			name: { value: name },

			/**
			 * Indicates if sequence is empty
			 *
			 * @name FormSequenceModel#isEmpty
			 * @property {boolean}
			 */
			isEmpty: {
				value: numDefinedForms < 1,
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
			label: { get: () => {
				const locale = this.locale;
				return L10n.selectLocalized( definition.label, locale ) || L10n.selectLocalized( definition.title, locale );
			} },

			/**
			 * Provides title of sequence.
			 *
			 * The label is provided as fallback if title has been omitted.
			 *
			 * @name FormSequenceModel#title
			 * @property {string}
			 * @readonly
			 */
			title: { get: () => {
				const locale = this.locale;
				return L10n.selectLocalized( definition.title, locale ) || L10n.selectLocalized( definition.label, locale );
			} },

			/**
			 * Provides description of sequence.
			 *
			 * @name FormSequenceModel#description
			 * @property {string}
			 * @readonly
			 */
			description: { get: () => L10n.selectLocalized( definition.description, this.locale ) },

			/**
			 * Provides variable space of all forms in a sequence of forms.
			 *
			 * @name FormSequenceModel#data
			 * @property {object}
			 * @readonly
			 */
			data: { value: data },

			/**
			 * Reads value of a field selected by its name from storage.
			 *
			 * @name FormSequenceModel#readValue
			 * @property {function(name:string):*}
			 * @readonly
			 */
			readValue: { value: read },

			/**
			 * Adjusts value in storage containing all field's values.
			 *
			 * @name FormSequenceModel#writeValue
			 * @property {function(name:string, value:*):boolean}
			 * @readonly
			 */
			writeValue: { value: write },

			/**
			 * Indicates whether all forms should be simultaneously visible or
			 * not.
			 *
			 * @name FormSequenceModel#showAllForms
			 * @property {boolean}
			 * @readonly
			 */
			showAllForms: { value: Boolean( definition.showAllForms ) },

			/**
			 * Provides locale to use with sequence of forms.
			 *
			 * @name FormSequenceModel#locale
			 * @property {string}
			 * @readonly
			 */
			locale: { get: localeFn },

			/**
			 * Exposes registries of custom types of fields and custom input
			 * processors to be supported in processing current sequence of forms.
			 *
			 * @name FormSequenceModel#registry
			 * @property {{fields:object<string,FormFieldAbstractModel>, processors:object<string,FormProcessorAbstractModel>}}
			 * @readonly
			 */
			registry: { value: Object.freeze( Object.assign( {}, {
				fields: Object.freeze( Object.assign( {}, registry.fields ) ),
				processors: Object.freeze( Object.assign( {}, registry.processors ) ),
				translations: Object.freeze( Object.assign( {}, registry.translations ) ),
			} ) ) },

			/**
			 * Exposes definition of modes for processing sequence of forms.
			 *
			 * @name FormSequenceModel#mode
			 * @property {object}
			 * @readonly
			 */
			mode: { value: Data.deepClone( this.constructor.qualifyModeConfiguration( mode ), true ) },
		} );


		// defer definition of additional properties requiring public access
		// on those defined before
		Object.defineProperties( this, {
			/**
			 * Exposes sequence of processors all form's input should pass on
			 * user submitting last form of sequence.
			 *
			 * @name FormSequenceModel#processors
			 * @property {object[]}
			 * @readonly
			 */
			processors: { value: this.createProcessors( processors ) },

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


		Object.defineProperties( this, {
			/**
			 * Maps qualified names of every field into the controller instance
			 * managing either field.
			 *
			 * @name FormSequenceModel#fields
			 * @property {object<string,FormFieldAbstractModel>}
			 * @readonly
			 */
			fields: { value: this._createFieldsMap() },
		} );

		this.distributeListsOfDependents();


		let latestVisited = 0;

		Object.defineProperties( this, {
			/**
			 * Addresses current form in sequence of forms by its index.
			 *
			 * @name FormSequenceModel#currentIndex
			 * @property {int}
			 */
			currentIndex: {
				get: () => ( this.isEmpty ? -1 : reactiveInfo.currentIndex ),
				set: index => {
					if ( this.isEmpty ) {
						return;
					}

					const forms = this.forms;
					const numForms = forms.length;

					const _index = parseInt( index );

					if ( _index < 0 || _index >= numForms || !forms[_index] ) {
						throw new TypeError( `Invalid request for selecting form with index ${_index} out of bounds.` );
					}

					const maxPermittedIndex = this.firstUnfinishedIndex;
					if ( ( maxPermittedIndex < 0 || _index <= maxPermittedIndex ) && _index !== reactiveInfo.currentIndex ) {
						reactiveInfo.currentIndex = _index;
						latestVisited = Math.max( latestVisited, _index );
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
				get: () => this.forms[reactiveInfo.currentIndex],
			},

			/**
			 * Addresses current form in sequence of forms by its name.
			 *
			 * @name FormSequenceModel#currentName
			 * @property {string}
			 */
			currentName: {
				get: () => this.forms[reactiveInfo.currentIndex].name,
				set: newName => {
					const forms = this.forms;
					const numForms = forms.length;
					let nameIndex = -1;

					for ( let i = 0; i < numForms; i++ ) {
						if ( forms[i].name === newName ) {
							nameIndex = i;
							break;
						}
					}

					if ( nameIndex < 0 ) {
						throw new TypeError( `Rejecting selection of form by unknown name "${newName}".` );
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

						if ( form.pristine || !form.valid ) {
							return i;
						}
					}

					return -1;
				},
			},

			/**
			 * Finds index of first unfinished form in sequence of forms.
			 *
			 * An unfinished form is either pristine due to having at least one
			 * pristine field or is invalid due to having at least one invalid
			 * field. In either case the form needs a review.
			 *
			 * @name FormSequenceModel#firstInvalidIndex
			 * @property {int}
			 * @readonly
			 */
			firstUnfinishedIndex: {
				get: () => {
					const forms = this.forms;
					const numForms = forms.length;

					for ( let i = 0; i < numForms; i++ ) {
						const form = forms[i];

						if ( !form.finished || !form.valid ) {
							return i;
						}
					}

					return -1;
				},
			},

			/**
			 * Indicates if all forms of sequence are finished and valid.
			 *
			 * @name FormSequenceModel#finished
			 * @property {boolean}
			 * @readonly
			 */
			finished: {
				get: () => {
					const forms = this.forms;
					const numForms = forms.length;

					for ( let i = 0; i < numForms; i++ ) {
						const form = forms[i];

						if ( !form.finished || !form.valid ) {
							return false;
						}
					}

					return true;
				},
			}
		} );

		Object.defineProperties( this, {
			/**
			 * Provides component rendering forms of sequence.
			 *
			 * @name FormSequenceModel#formsComponent
			 * @property {{render:function}}
			 * @readonly
			 */
			formsComponent: { value: this.renderComponent( reactiveInfo ) },

			/**
			 * Provides component rendering progress bar in sequence of forms.
			 *
			 * @name FormSequenceModel#progressComponent
			 * @property {{render:function}}
			 * @readonly
			 */
			progressComponent: { value: this.renderProgressComponent( reactiveInfo ) },
		} );
	}

	/**
	 * Creates object mapping from any declared field's qualified name into the
	 * controller managing either field in model.
	 *
	 * @returns {object<string,FormFieldAbstractModel>} maps qualified names of every field into either field's controller
	 * @protected
	 */
	_createFieldsMap() {
		const forms = this.forms;
		const numForms = forms.length;
		const map = {};

		for ( let i = 0; i < numForms; i++ ) {
			const form = forms[i];
			const fields = form.fields;
			const numFields = fields.length;

			for ( let j = 0; j < numFields; j++ ) {
				const field = fields[j];

				map[field.qualifiedName] = field;
			}
		}

		return map;
	}

	/**
	 * Qualifies section of configuration customizing operation modes of forms
	 * processor.
	 *
	 * @param {object} input user-provided configuration of operation modes
	 * @returns {object} qualified configuration of operation modes
	 */
	static qualifyModeConfiguration( input ) {
		if ( !input.view ) {
			input.view = {};
		}

		input.view.progress = Data.normalizeToBoolean( input.view.progress, true );

		return input;
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
			throw new TypeError( `Invalid index of form #${formIndex}.` );
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
	 * @returns {boolean} true if advancing succeeded, false on meeting end of sequence or if first invalid form has been selected instead
	 */
	advance() {
		const forms = this.forms;
		const currentIndex = this.currentIndex;
		const currentForm = forms[currentIndex];

		currentForm.finished = true;

		if ( !currentForm.readValidState( { live: false, force: true, includePristine: true } ) ) {
			EventBus.$emit( "form:autofocus" );
			return false;
		}


		const index = this.firstUnfinishedIndex;
		if ( index < 0 ) {
			this.currentIndex = Math.min( currentIndex + 1, forms.length - 1 );

			return this.currentIndex > currentIndex;
		}

		const isAdvancing = index > this.currentIndex;
		this.currentIndex = index;

		return isAdvancing;
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
	 * Submits form input by passing all defined input processors. Submission is
	 * rejected unless all forms of sequence are marked _valid_.
	 *
	 * @returns {Promise} promises successful submissions of input
	 */
	submit() {
		this.advance();

		if ( !this.finished ) {
			return Promise.reject( new Error( "Forms aren't finished, yet." ) );
		}

		const originalData = this.deriveOriginallyNamedData( this.data );

		return new Promise( ( resolve, reject ) => {
			/**
			 * Invokes single processor to handle provided input data.
			 *
			 * @param {FormProcessorAbstractModel[]} processors sequence of processors
			 * @param {int} currentIndex index of processor in sequence of processors to be invoked
			 * @param {object<string,object<string,*>>} data all input data of forms
			 * @returns {void}
			 */
			const _process = ( processors, currentIndex, data ) => {
				if ( currentIndex >= processors.length ) {
					resolve( data );
				} else {
					processors[currentIndex].process( data, this )
						.then( processed => {
							_process( processors, currentIndex + 1, processed );
						} )
						.catch( reject );
				}
			};

			return _process( this.processors, 0, originalData );
		} )
			.then( () => _prepareResultHandling( { success: true }, L10n.selectLocalized( this.mode.onSuccess, this.locale ), originalData ) )
			.catch( error => {
				console.error( `Processing input failed: ${error.message}` ); // eslint-disable-line no-console

				throw Object.assign( error, _prepareResultHandling( { success: false }, L10n.selectLocalized( this.mode.onFailure, this.locale ), error ) );
			} );

		/**
		 * Feeds provided status descriptor with information on configured
		 * behaviour after succeeding/failing final processing of forms' input
		 * data.
		 *
		 * @param {object} status status descriptor controlling behaviour
		 * @param {*} configuredBehaviour behaviour defined in configuration
		 * @param {*} args arguments passed on invoking function found in provided behaviour configuration
		 * @returns {object} provided status descriptor extended by behaviour control
		 * @private
		 */
		function _prepareResultHandling( status, configuredBehaviour, ...args ) {
			const value = typeof configuredBehaviour === "function" ? configuredBehaviour( this, ...args ) : configuredBehaviour;

			const normalized = L10n.selectLocalized( value );
			if ( typeof normalized === "string" ) {
				if ( /^(?:[a-z]+:\/\/[^/]+\/?|\.?\/)/.test( normalized ) && !/\s/.test( normalized ) ) {
					status.redirect = normalized;
				} else {
					status.text = normalized;
				}
			}

			return status;
		}
	}

	/**
	 * Extracts all fields' data from provided set of raw data using every
	 * field's original name as used in forms' definition.
	 *
	 * Internally, names get lower-cased to have case-insensitive terms.
	 * However, from an external point of view resulting data should be provided
	 * complying with given definition more strictly.
	 *
	 * @param {object<string,object<string,*>>} rawData raw input data
	 * @returns {object<string,object<string,*>>} all fields' data using either field's original name
	 */
	deriveOriginallyNamedData( rawData ) {
		const formsData = {};

		this.forms.forEach( form => {
			const internalFormName = form.name;
			const originalFormName = form.originalName;

			if ( !rawData.hasOwnProperty( internalFormName ) ) {
				return;
			}

			const target = formsData[originalFormName] = {};
			const source = rawData[internalFormName];

			form.fields.forEach( field => {
				if ( field.constructor.isInteractive ) {
					const internalFieldName = field.name;
					const originalFieldName = field.originalName;

					if ( !field.noResult ) {
						const value = source[internalFieldName] || null;
						if ( this.mode.fullResult || value !== null ) {
							target[originalFieldName] = value;
						}
					}
				}
			} );
		} );

		return formsData;
	}

	/**
	 * Fetches data record containing initial values of all defined fields.
	 *
	 * @returns {object<object<string,*>>} initial values of all fields per form
	 */
	getInitialData() {
		const data = {};

		this.forms.forEach( form => {
			const formName = form.name;

			data[formName] = {};

			form.fields.forEach( field => {
				if ( field.constructor.isInteractive ) {
					data[formName][field.name] = field.normalizeValue( field.initial );
				}
			} );
		} );

		return data;
	}

	/**
	 * Creates reverse map of dependencies list fields per field depending on
	 * the latter and assigns the resulting list to either field with
	 * dependencies.
	 *
	 * @returns {void}
	 */
	distributeListsOfDependents() {
		const fieldsMap = this.fields;
		const fieldNames = Object.keys( fieldsMap );
		const numFields = fieldNames.length;

		const dependentsPerField = {};

		for ( let i = 0; i < numFields; i++ ) {
			const fieldName = fieldNames[i];
			const field = fieldsMap[fieldName];

			const dependencies = field.dependsOn;
			if ( Array.isArray( dependencies ) ) {
				const numDependencies = dependencies.length;

				for ( let j = 0; j < numDependencies; j++ ) {
					const dependency = dependencies[j];

					if ( !dependentsPerField.hasOwnProperty( dependency ) ) {
						dependentsPerField[dependency] = [];
					}

					dependentsPerField[dependency].push( fieldName );
				}
			}
		}

		const keys = Object.keys( dependentsPerField );
		const numKeys = keys.length;

		for ( let i = 0; i < numKeys; i++ ) {
			const key = keys[i];

			fieldsMap[key].dependents = dependentsPerField[key];
		}
	}

	/**
	 * Describes Vue component listing all forms in sequence or just the current
	 * form in sequence.
	 *
	 * @param {object} data reactive data of sequence
	 * @returns {{render: function}} description of Vue component
	 * @protected
	 */
	renderComponent( data ) {
		const that = this;
		const { forms, showAllForms, fields } = this;
		const numForms = forms.length;
		const components = new Array( numForms );

		for ( let i = 0; i < numForms; i++ ) {
			components[i] = forms[i].component;
		}

		return {
			render: function( createElement ) {
				const formElements = showAllForms ? new Array( numForms ) : [];

				if ( showAllForms ) {
					for ( let i = 0; i < numForms; i++ ) {
						formElements[i] = createElement( components[i] );
					}
				} else {
					formElements.push( createElement( components[that.currentIndex] ) );
				}

				return createElement( "div", {
					class: "form-sequence",
				}, [
					createElement( "div", {
						class: "forms",
					}, formElements ),
				] );
			},
			data: () => data,
			beforeMount() {
				this._unsubscribe = this.$store.subscribe( mutation => {
					if ( mutation.type === "form/writeInput" ) {
						const { name, value } = mutation.payload;

						const field = fields[name];
						if ( field ) {
							const containingForms = [];

							if ( field.onUpdateValue( this.$store, value ) ) {
								containingForms.push( field.form );
							}

							const dependents = field.dependents;
							const numDependents = dependents.length;

							for ( let i = 0; i < numDependents; i++ ) {
								const dependent = fields[dependents[i]];
								if ( dependent ) {
									if ( dependent.onUpdateValue( this.$store, value, name ) ) {
										if ( containingForms.indexOf( dependent.form ) > -1 ) {
											containingForms.push( dependent.form );
										}
									}
								}
							}

							if ( containingForms.length > 0 ) {
								for ( let i = 0; i < containingForms.length; i++ ) {
									containingForms[i].readValidState();
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
			mounted() {
				this.$nextTick( () => { EventBus.$emit( "form:autofocus" ); } );
			},
			updated() {
				this.$nextTick( () => { EventBus.$emit( "form:autofocus" ); } );
			},
		};
	}

	/**
	 * Describes Vue component rendering progress in sequence of forms.
	 *
	 * @param {{forms:Array<object>, currentIndex:int}} data reactive data of sequence
	 * @returns {{render: function}} description of Vue component
	 * @protected
	 */
	renderProgressComponent( data ) {
		const formsDefinition = this.forms;

		return {
			render: function( createElement ) {
				const formsData = this.forms;
				const numForms = formsDefinition.length;
				const steps = new Array( numForms );
				const currentIndex = this.currentIndex;

				for ( let i = 0; i < numForms; i++ ) {
					const formDefinition = formsDefinition[i];
					const formData = formsData[i];

					const classes = ["step"];

					classes.push( formData.pristine ? "pristine" : "affected" );
					classes.push( formData.valid ? "valid" : "invalid" );

					if ( i === currentIndex ) {
						classes.push( "active" );
					} else if ( i < currentIndex ) {
						classes.push( "before-active" );
						classes.push( `distance-${currentIndex - i}` );
					} else if ( i > currentIndex ) {
						classes.push( "after-active" );
						classes.push( `distance-${i - currentIndex}` );
					}

					steps[i] = createElement( "a", {
						class: classes.join( " " ),
						"data-name": formDefinition.name,
					}, [
						createElement( "span", {
							class: "number",
						}, `${i + 1}` ),
						createElement( "label", {
							class: "label",
						}, ` ${formDefinition.label}` ),
					] );
				}

				return createElement( "nav", {
					class: "progress-bar",
				}, [
					createElement( "div", {
						class: "steps",
					}, [
						createElement( "div", {
							class: "items",
						}, steps ),
					] ),
					createElement( "div", {
						class: "info",
					}, [
						createElement( "div", {
							class: "counters",
						}, [
							createElement( "span", {
								class: "current",
							}, String( currentIndex + 1 ) ),
							createElement( "span", {
								class: "separator",
							}, "/" ),
							createElement( "span", {
								class: "number",
							}, String( numForms ) ),
						] ),
						createElement( "div", {
							class: "percent",
						}, [
							String( Math.round( currentIndex / numForms * 100 ) + "%" ),
						] ),
					] ),
				] );
			},
			data: () => data,
		};
	}

	/**
	 * Converts list of input processor definitions into list of according
	 * processor instances.
	 *
	 * @param {object[]} definitions list of processor definition
	 * @returns {FormProcessorAbstractModel[]} instances of defined processors
	 */
	createProcessors( definitions ) {
		if ( !Array.isArray( definitions ) ) {
			throw new TypeError( "Invalid list of processor definitions rejected." );
		}

		const registry = this.registry.processors;
		const numDefinitions = definitions.length;
		const processors = new Array( numDefinitions );
		let write = 0;

		for ( let i = 0; i < numDefinitions; i++ ) {
			const definition = definitions[i];

			if ( definition ) {
				const typeName = String( definition.type || "send" ).trim().toLowerCase();
				const Implementation = registry[typeName];

				if ( !Implementation ) {
					throw new TypeError( `Definition of unknown input processor "${typeName}" rejected.` );
				}

				processors[write++] = new Implementation( definition );
			}
		}

		if ( !write ) {
			throw new TypeError( "Got empty list of input processors." );
		}

		processors.splice( write );

		return processors;
	}
}
