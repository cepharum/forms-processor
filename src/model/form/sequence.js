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

/**
 * Wraps definition of a sequence of forms.
 */
export default class FormSequenceModel {
	/**
	 * @param {object} definition definition of a sequence of forms
	 * @param {function(string):*} read reads value of a named field
	 * @param {function():string} localeFn callback invoked to fetch tag of current locale
	 * @param {function(string,*)} write adjusts value of a named field
	 * @param {object<string,*>} data refers to storage managed by `read`/`write`
	 */
	constructor( definition, { read, write, data }, localeFn ) {
		const { sequence = [] } = definition;

		const reactiveInfo = {
			forms: new Array( sequence.length ),
			currentIndex: 0,
		};

		Object.defineProperties( this, {
			/**
			 * Indicates if sequence is empty
			 *
			 * @name FormSequenceModel#isEmpty
			 * @property {boolean}
			 */
			isEmpty: {
				value: !sequence.length,
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
				const locale = localeFn();
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
				const locale = localeFn();
				return L10n.selectLocalized( definition.title, locale ) || L10n.selectLocalized( definition.label, locale );
			} },

			/**
			 * Provides description of sequence.
			 *
			 * @name FormSequenceModel#description
			 * @property {string}
			 * @readonly
			 */
			description: { get: () => L10n.selectLocalized( definition.description, localeFn() ) },

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
		} );


		// defer definition of additional properties requiring public access
		// on those defined before
		Object.defineProperties( this, {
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
						throw new TypeError( `invalid request for selecting form with index ${_index} out of bounds` );
					}

					const maxPermittedIndex = this.firstUnfinishedIndex;
					if ( _index <= maxPermittedIndex && _index !== reactiveInfo.currentIndex ) {
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
				set: name => {
					const forms = this.forms;
					const numForms = forms.length;
					let nameIndex = -1;

					for ( let i = 0; i < numForms; i++ ) {
						if ( forms[i].name === name ) {
							nameIndex = i;
							break;
						}
					}

					if ( nameIndex < 0 ) {
						throw new TypeError( `rejecting selection of form by unknown name "${name}"` );
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

					return 0;
				},
			},
		} );

		Object.defineProperties( this, {
			/**
			 * Provides component rendering forms of sequence.
			 *
			 * @name FormSequenceModel#formsComponent
			 * @property {{render:function}}
			 * @readonly
			 */
			formsComponent: { value: this._renderComponent( reactiveInfo ) },

			/**
			 * Provides component rendering progress bar in sequence of forms.
			 *
			 * @name FormSequenceModel#progressComponent
			 * @property {{render:function}}
			 * @readonly
			 */
			progressComponent: { value: this._renderProgressComponent( reactiveInfo ) },
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
			throw new TypeError( `invalid index of form #${formIndex}` );
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
	 * @returns {boolean} true if advancing succeeded, false if first invalid form has been selected instead
	 */
	advance() {
		const currentIndex = this.currentIndex;
		const form = this.forms[currentIndex];

		form.finished = true;

		if ( !form.valid ) {
			EventBus.$emit( "form:autofocus" );
			return false;
		}


		const index = this.firstUnfinishedIndex;
		if ( index < -1 ) {
			this.currentIndex = currentIndex + 1;

			return true;
		}

		const isAdvancing = index === this.currentIndex + 1;
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
	_renderComponent( data ) {
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
							field.onUpdateValue( this.$store, value );

							const dependents = field.dependents;
							const numDependents = dependents.length;

							for ( let i = 0; i < numDependents; i++ ) {
								const dependent = fields[dependents[i]];
								if ( dependent ) {
									dependent.onUpdateValue( this.$store, value, name );
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
	_renderProgressComponent( data ) {
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
}
