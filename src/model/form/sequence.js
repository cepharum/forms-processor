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

import L10n from "../../service/l10n";
import Data from "../../service/data";


/**
 * Wraps definition of a sequence of forms.
 */
export default class FormSequenceModel {
	/**
	 * @typedef {object} AuxiliaryInfo
	 * @param {function():string} locale callback invoked to fetch tag of current locale
	 * @param {function():LocaleTranslationTree} translations callback invoked to fetch map of current translations
	 * @param {Vue} events component for use with emitting/receiving events of current sequence
	 */

	/**
	 * @param {string} id permanently unique ID of current sequence of forms
	 * @param {object} definition definition of a sequence of forms
	 * @param {FormsAPIExtensionsRegistry} registry registry of available types of fields and input processors
	 * @param {function(string):*} read reads value of a named field
	 * @param {AuxiliaryInfo} auxiliary provides additional information
	 * @param {string} name temporarily unique ID of current sequence of forms in context of current HTML document
	 * @param {function(string,*)} write adjusts value of a named field
	 * @param {function():object<string,*>} data provides up-to-date reference on (read-only) storage managed by `read`/`write`
	 */
	constructor( { id, name }, definition, registry, { read, write, data }, auxiliary ) {
		const { mode = {}, sequence = [], processors = {} } = definition;
		const { buttons = {} } = mode;

		const numDefinedForms = sequence.length;
		const reactiveInfo = {
			forms: new Array( numDefinedForms ),
			currentIndex: Math.min( numDefinedForms - 1, 0 ),
		};

		if ( !id || typeof id !== "string" ) {
			throw new TypeError( "Invalid ID of sequence of forms." );
		}

		if ( !name || typeof name !== "string" ) {
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
			data: { get: data },

			/**
			 * Exposes optionally defined set of constants.
			 *
			 * @name FormSequenceModel#constants
			 * @property {object}
			 * @readonly
			 */
			constants: { value: definition.constants || {} },

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
			locale: { get: auxiliary.locale },

			/**
			 * Exposes current map of translations statically defined as part of
			 * forms processor.
			 *
			 * @name FormSequenceModel#translations
			 * @property {LocaleTranslationTree}
			 * @readonly
			 */
			translations: { get: auxiliary.translations },

			/**
			 * Exposes event bus of current sequence manager.
			 *
			 * This event bus is used to emit and listen for events related to
			 * current sequence of forms, only.
			 *
			 * @name FormSequenceModel#events
			 * @property Vue
			 * @readonly
			 */
			events: { value: auxiliary.events },

			/**
			 * Exposes registries of custom types of fields and custom input
			 * processors to be supported in processing current sequence of forms.
			 *
			 * @name FormSequenceModel#registry
			 * @property {FormsAPIExtensionsRegistry}
			 * @readonly
			 */
			registry: { value: Object.freeze( Object.assign( {}, {
				fields: Object.freeze( Object.assign( {}, registry.fields ) ),
				processors: Object.freeze( Object.assign( {}, registry.processors ) ),
				termFunctions: Object.freeze( Object.assign( {}, registry.termFunctions ) ),
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


		const presumedQualifiedNames = {};

		for ( let i = 0; i < numDefinedForms; i++ ) {
			const { name: _formName, fields } = sequence[i];
			const formName = _formName.toLowerCase();

			const numFields = Array.isArray( fields ) ? fields.length : 0;
			for ( let j = 0; j < numFields; j++ ) {
				const fieldDefinition = fields[j];

				const Manager = this.selectFieldManager( fieldDefinition );
				if ( Manager ) {
					const qualifiedNames = Manager.presumeQualifiedNames( this, formName, fieldDefinition, j );
					if ( Array.isArray( qualifiedNames ) ) {
						const numQualifiedNames = qualifiedNames.length;

						for ( let k = 0; k < numQualifiedNames; k++ ) {
							presumedQualifiedNames[qualifiedNames[k]] = true;
						}
					}
				}
			}
		}


		Object.defineProperties( this, {
			/**
			 * Provides dictionary of presumed qualified names of either field
			 * defined in current sequence.
			 *
			 * This is used by FormFieldAbstractModel on qualifying relative
			 * field names e.g. in terms used in either field's definition. Thus
			 * qualified names must be collected prematurely.
			 *
			 * @name FormSequenceModel#qualifiedNames
			 * @property {object<string,true>}
			 * @readonly
			 */
			qualifiedNames: { value: presumedQualifiedNames },
		} );



		// compile list of form managers (detecting namespace clashes)
		const numForms = sequence.length;
		const formManagers = new Array( numForms );
		const reactiveFormInfos = new Array( numForms );
		const names = {};
		let w = 0;

		for ( let r = 0; r < numForms; r++ ) {
			const formDefinition = sequence[r];
			const reactiveFormInfo = reactiveFormInfos[w] = {};
			const formManager = new FormModel( this, formDefinition, w, reactiveFormInfo );

			if ( formManager ) {
				const formName = formManager.name;

				if ( names.hasOwnProperty( formName ) ) {
					throw new TypeError( `double definition of form named "${formName}"` );
				}

				names[formName] = formManager;

				formManagers[w++] = formManager;
			}
		}

		formManagers.splice( w );
		reactiveFormInfos.splice( w );

		reactiveInfo.forms = reactiveFormInfos;



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
			forms: { value: formManagers },
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

					const { forms } = this;
					const _numForms = forms.length;
					const _index = parseInt( index );

					if ( _index < 0 || _index >= _numForms || !forms[_index] ) {
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
					const { forms } = this;
					const _numForms = forms.length;
					let nameIndex = -1;

					for ( let i = 0; i < _numForms; i++ ) {
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
					const { forms } = this;
					const _numForms = forms.length;

					for ( let i = 0; i < _numForms; i++ ) {
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
					const { forms } = this;
					const _numForms = forms.length;

					for ( let i = 0; i < _numForms; i++ ) {
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
					const { forms } = this;
					const _numForms = forms.length;

					for ( let i = 0; i < _numForms; i++ ) {
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

			/**
			 * Exposes custom labels for use with basically supported buttons
			 * unless either form is providing more specific customizations.
			 *
			 * @name FormModel#$button
			 * @property {object<string,string>}
			 * @readonly
			 */
			$buttons: { value: {
				previous: buttons.previous || null,
				next: buttons.next || null,
				continue: buttons.continue || null,
				submit: buttons.submit || null,
			} },
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
	 * Finds field using provided callback to detect desired field.
	 *
	 * @param {function(field:AbstractFieldModel):boolean} callback detects if provided field is the desired one
	 * @param {boolean} getName set true to get found field's name instead of its manager
	 * @return {?(AbstractFieldModel|string)} manager or name of found field, null if not found
	 */
	findField( callback, getName = false ) {
		if ( typeof callback !== "function" ) {
			throw new TypeError( "invalid callback for detecting field" );
		}

		const forms = this.forms;
		const numForms = forms.length;

		for ( let i = 0; i < numForms; i++ ) {
			const form = forms[i];
			const fields = form.fields;
			const numFields = fields.length;

			for ( let j = 0; j < numFields; j++ ) {
				const field = fields[j];

				if ( callback( field ) ) {
					return getName ? field.qualifiedName : field;
				}
			}
		}

		return null;
	}

	/**
	 * Qualifies section of configuration customizing operation modes of forms
	 * processor.
	 *
	 * @param {object} mode user-provided configuration of operation modes
	 * @returns {object} qualified configuration of operation modes
	 */
	static qualifyModeConfiguration( mode ) {
		if ( !mode.view ) {
			mode.view = {};
		}

		const { view } = mode;

		view.progress = Data.normalizeToBoolean( view.progress, true );
		view.explainRequired = String( view.explainRequired ).trim().toLowerCase() === "always" ? "always" : Data.normalizeToBoolean( view.explainRequired, true );

		mode.navigation = String( mode.navigation || "auto" ).trim().toLowerCase();

		if ( mode.localStore == null ) {
			mode.localStore = {
				enabled: false,
				id: null,
			};
		} else {
			if ( typeof mode.localStore !== "object" ) {
				throw new TypeError( "invalid configuration of local store" );
			}

			const { localStore } = mode;

			localStore.enabled = Data.normalizeToBoolean( localStore.enabled, true );

			if ( !localStore.id ) {
				localStore.enabled = false;
			} else if ( localStore.maxAge != null ) {
				const match = /^\s*(\d+)\s*([smhdw])\s*$/i.exec( localStore.maxAge );
				if ( match ) {
					const amount = parseInt( match[1] );

					switch ( match[2].toLowerCase() ) {
						case "s" : localStore.maxAge = amount * 1000; break;
						case "m" : localStore.maxAge = amount * 60 * 1000; break;
						case "h" : localStore.maxAge = amount * 60 * 60 * 1000; break;
						case "d" : localStore.maxAge = amount * 24 * 60 * 60 * 1000; break;
						case "w" : localStore.maxAge = amount * 7 * 24 * 60 * 60 * 1000; break;
					}
				} else if ( /^\s*\d+\s*$/.test( localStore.maxAge ) ) {
					localStore.maxAge = parseInt( localStore.maxAge ) * 1000;
				} else {
					throw new TypeError( "invalid configuration for maximum age of locally stored input" );
				}
			}
		}

		return mode;
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
	 * @param {boolean} toFirstUnfinished set true to advance
	 * @returns {boolean} true if advancing succeeded, false on meeting end of sequence or if first invalid form has been selected instead
	 */
	advance( toFirstUnfinished = false ) {
		const forms = this.forms;
		const currentIndex = this.currentIndex;
		const currentForm = forms[currentIndex];

		currentForm.finished = true;

		if ( !currentForm.readValidState( { live: false, force: true, includePristine: true } ) ) {
			this.handleAutoFocus();
			return false;
		}


		let index;

		switch ( this.mode.navigation ) {
			case "dumb" :
				index = currentIndex + 1;
				break;

			case "auto" :
			default :
				index = toFirstUnfinished ? this.firstUnfinishedIndex : currentIndex + 1;
				if ( index < 0 ) {
					index = currentIndex + 1;
				}
		}

		index = Math.min( Math.max( index, 0 ), forms.length - 1 );

		this.events.$emit( "sequence:advance", this.currentIndex, index );

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
		if ( this.currentIndex > 0 ) {
			this.events.$emit( "sequence:rewind", this.currentIndex, this.currentIndex - 1 );

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

		const { locale } = this;
		const originalData = this.deriveOriginallyNamedData( this.data );

		this.events.$emit( "sequence:submission:start", originalData );

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
					Promise.resolve( processors[currentIndex].process( data, this ) )
						.then( processed => {
							_process( processors, currentIndex + 1, processed );
						} )
						.catch( reject );
				}
			};

			return _process( this.processors, 0, originalData );
		} )
			.then( processedData => {
				this.events.$emit( "sequence:submission:done", processedData );

				return _prepareResultHandling( { success: true }, L10n.selectLocalized( this.mode.onSuccess, locale ), originalData, processedData );
			} )
			.catch( error => {
				this.events.$emit( "sequence:submission:failed", error );

				console.error( `Processing input failed: ${error.message}` ); // eslint-disable-line no-console

				throw Object.assign( error, _prepareResultHandling( { success: false }, L10n.selectLocalized( this.mode.onFailure, locale ), error ) );
			} );

		/**
		 * Feeds provided status descriptor with information on configured
		 * behaviour after succeeding/failing final processing of forms' input
		 * data.
		 *
		 * @param {object} status status descriptor controlling behaviour
		 * @param {*} config behaviour defined in configuration
		 * @param {*} args arguments passed on invoking function found in provided behaviour configuration
		 * @returns {object} provided status descriptor extended by behaviour control
		 * @private
		 */
		function _prepareResultHandling( status, config, ...args ) {
			const value = typeof config === "function" ? L10n.selectLocalization( config( this, ...args ), locale ) : config;

			switch ( typeof value ) {
				case "string" :
					if ( /^(?:[a-z]+:\/\/[^\s/]+\/?|\.?\/)/.test( value ) && !/\s/.test( value ) ) {
						status.redirect = value;
					} else {
						status.text = value;
					}
					break;

				case "object" :
					if ( value ) {
						if ( typeof value.event === "string" ) {
							status.event = {
								name: value.event,
								args: Array.isArray( value.args ) ? value.args.slice( 0 ) : Object.assign( {}, value.args ),
							};

							if ( status.success ) {
								const [ , processedData ] = args;

								status.event.data = Object.assign( {}, processedData );
							} else {
								const [error] = args;

								status.event.data = error;
							}
						}
					}
					break;
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
				if ( field.constructor.isProvidingInput ) {
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
			const dependencies = fieldsMap[fieldName].dependsOn;

			if ( Array.isArray( dependencies ) ) {
				const numDependencies = dependencies.length;

				for ( let j = 0; j < numDependencies; j++ ) {
					const dependency = dependencies[j];

					if ( !fieldsMap.hasOwnProperty( dependency ) ) {
						throw new TypeError( `invalid dependency on unknown field ${dependency}` );
					}

					if ( dependentsPerField.hasOwnProperty( dependency ) ) {
						dependentsPerField[dependency].push( fieldName );
					} else {
						dependentsPerField[dependency] = [fieldName];
					}

				}
			}
		}

		for ( let i = 0; i < numFields; i++ ) {
			const fieldName = fieldNames[i];

			if ( dependentsPerField.hasOwnProperty( fieldName ) ) {
				fieldsMap[fieldName].dependents = dependentsPerField[fieldName];
			} else {
				fieldsMap[fieldName].dependents = [];
			}
		}
	}

	/**
	 * Handles update of named field's value.
	 *
	 * @param {string} fieldName qualified name of field with updated value
	 * @param {*} updatedValue updated value of named field
	 * @returns {boolean} true if update of field has affected validity of updated field or any of its dependents
	 */
	onUpdateValue( fieldName, updatedValue ) {
		const { fields } = this;
		const field = fields[fieldName];

		if ( field ) {
			const containingForms = [];

			if ( field.onUpdateValue( updatedValue ) ) {
				containingForms.push( field.form );
			}

			const dependents = field.dependents;
			const numDependents = dependents.length;

			for ( let i = 0; i < numDependents; i++ ) {
				const dependent = fields[dependents[i]];

				if ( dependent && dependent !== field ) {
					if ( dependent.onUpdateValue( updatedValue, fieldName ) ) {
						if ( containingForms.indexOf( dependent.form ) < 0 ) {
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

	/**
	 * Initializes results of terms in either form of sequence.
	 *
	 * @returns {void}
	 */
	initializeTerms() {
		const { fields } = this;
		const fieldNames = Object.keys( fields );
		const numFields = fieldNames.length;

		for ( let i = 0; i < numFields; i++ ) {
			const fieldName = fieldNames[i];
			const field = fields[fieldName];

			this.onUpdateValue( fieldName, field.value );
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
		const { forms, showAllForms } = this;
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

						that.onUpdateValue( name, value );
					}
				} );
			},
			beforeDestroy() {
				if ( this._unsubscribe ) {
					this._unsubscribe();
				}
			},
			mounted() {
				this.$nextTick( () => that.handleAutoFocus() );
			},
			updated() {
				this.$nextTick( () => that.handleAutoFocus() );
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

					classes.push( formData.pristine ? "pristine" : "touched" );
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

				const percent = String( Math.round( currentIndex / numForms * 100 ) );

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
						createElement( "span", {
							style: {
								width: percent + "%",
							}
						} ),
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
							percent + "%",
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

				processors[write++] = new Implementation( definition, this );
			}
		}

		if ( !write ) {
			throw new TypeError( "Got empty list of input processors." );
		}

		processors.splice( write );

		return processors;
	}

	/**
	 * Creates manager for field associated w/ provided form.
	 *
	 * @param {FormModel} form refers to form created field is going zo belong to
	 * @param {object} fieldDefinition definition of field to create
	 * @param {int} fieldIndex index of field in set of containing form's fields
	 * @param {object} reactiveFieldInfo provided object to contain reactive information of field
	 * @returns {?FormFieldAbstractModel} manager for handling defined field
	 */
	createField( form, fieldDefinition, fieldIndex, reactiveFieldInfo ) {
		const Manager = this.selectFieldManager( fieldDefinition );
		if ( Manager ) {
			return new Manager( form, fieldDefinition, fieldIndex, reactiveFieldInfo );
		}

		console.error( `Missing manager for handling form fields of type ${fieldDefinition.type || "text"}.` ); // eslint-disable-line no-console

		return null;
	}

	/**
	 * Selects class implementing manager for type of field described in
	 * provided definition of a field.
	 *
	 * @param {object} fieldDefinition definition of a field
	 * @return {?class<FormFieldAbstractModel>} implementation of selected type of field, null if type is unknown
	 */
	selectFieldManager( fieldDefinition ) {
		const { type = "text" } = fieldDefinition;

		const normalized = String( type ).trim().toLowerCase();

		return this.registry.fields[normalized] || null;
	}

	/**
	 * Automatically focuses first one of currently available fields.
	 *
	 * @returns {void}
	 */
	handleAutoFocus() {
		this.events.$emit( "form:autofocus" );
	}
}
