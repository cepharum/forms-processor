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

import Processors from "./model/form/processor";
import Fields from "./model/form/field";

/**
 * @typedef {object} FormsAPIExtensionsRegistry
 * @property {object<string,FormFieldAbstractModel>} fields maps custom field types to be supported
 * @property {object<string,FormProcessorAbstractModel>} processors maps custom input processors
 */

/**
 * @typedef {FormsAPIExtensionsRegistry} FormsAPIRegistry
 * @property {Array<Component>} components lists previously created form sequences
 */

/**
 * Implements API for controlling forms client embedded in a particular
 * website/project.
 */
export default class FormsAPI {
	/**
	 * Adds provided component to a list of components exposed in global context
	 * of current browser window.
	 *
	 * @note This method isn't changing anything if provided component has been
	 *       exposed before.
	 *
	 * @param {object} configuration configuration of forms and probable customizations to run
	 * @returns {void}
	 */
	runConfiguration( configuration ) {
		const { fields = {}, processors = {}, sequences = [] } = ( function( preConfiguration ) {
			if ( Array.isArray( preConfiguration ) ) {
				return {
					sequences: preConfiguration,
				};
			}

			if ( preConfiguration && typeof preConfiguration === "object" && Array.isArray( preConfiguration.sequences ) ) {
				return {
					processors: preConfiguration.processors || {},
					fields: preConfiguration.fields || {},
					sequences: preConfiguration.sequences,
				};
			}

			console.error( "ignoring invalid pre-definition of forms" ); // eslint-disable-line no-console

			return {};
		} )( configuration );


		const abstractField = Fields.abstract;
		const allFields = Object.assign( {}, Fields.map, fields );
		const fieldNames = Object.keys( allFields );
		const numFields = fieldNames.length;
		for ( let i = 0; i < numFields; i++ ) {
			const fieldName = fieldNames[i];
			const factory = allFields[fieldName];
			const field = typeof factory === "function" && !abstractField.isBaseClassOf( factory ) ? factory( abstractField ) : factory;

			this.addField( fieldName, field );
		}


		const abstractProcessor = Processors.abstract;
		const allProcessors = Object.assign( {}, Processors.map, processors );
		const processorNames = Object.keys( allProcessors );
		const numProcessors = processorNames.length;
		for ( let i = 0; i < numProcessors; i++ ) {
			const processorName = processorNames[i];
			const factory = allProcessors[processorName];
			const processor = typeof factory === "function" && !abstractProcessor.isBaseClassOf( factory ) ? factory( abstractProcessor ) : factory;

			this.addProcessor( processorName, processor );
		}


		const numSequences = sequences.length;
		for ( let i = 0; i < numSequences; i++ ) {
			const [ element, options = {} ] = sequences[i];

			this.create( element, options );
		}
	}

	/**
	 * @param {function(element: (HTMLElement|string), options: object=):Component} generator callback generating component attached to element
	 */
	constructor( generator ) {
		Object.defineProperties( this, {
			/**
			 * Provides generator function for creating instances of form
			 * component.
			 *
			 * @name FormsAPI#generator
			 * @property {function(element: (HTMLElement|string), options: object=):Component}
			 * @readonly
			 * @protected
			 */
			generator: { value: generator },

			/**
			 * Lists previously created form components and extension.
			 *
			 * @name FormsAPI#_registry
			 * @property {FormsAPIRegistry}
			 * @readonly
			 * @protected
			 */
			_registry: { value: {
				components: [],
				fields: {},
				processors: {},
			} },
		} );
	}

	/**
	 * Creates form component attached to selected element.
	 *
	 * Element is either selected by query applied on current document to find
	 * matching element or by reference.
	 *
	 * @param {HTMLElement|string} element reference on element to attach component to or string selecting that element
	 * @param {object} options options customizing this component instance
	 * @returns {Component} created component
	 */
	create( element, options = {} ) {
		let component = this.findOnElement( element );
		if ( !component ) {
			const individualRegistry = ( options && options.registry ) || {};

			component = this.generator( element, Object.assign( {}, options, {
				registry: {
					processors: Object.assign( {}, this._registry.processors, individualRegistry.processors ),
					fields: Object.assign( {}, this._registry.fields, individualRegistry.fields ),
				},
			} ) );

			this._registerComponent( component );
		}

		return component;
	}

	/**
	 * Adds some form component to internally managed list of registered
	 * components.
	 *
	 * @param {Component} form form component to be enlisted
	 * @returns {void}
	 */
	_registerComponent( form ) {
		const list = this._registry.components;
		const numForms = list.length;

		for ( let i = 0; i < numForms; i++ ) {
			const listedForm = list[i];
			if ( listedForm === form ) {
				return;
			}
		}

		list.push( form );
	}

	/**
	 * Searches list of registered form components for the one attached to
	 * provided element of current document.
	 *
	 * @param {HTMLElement} element some element of current document
	 * @return {?Component} matching form component or null if missing
	 */
	findOnElement( element ) {
		const list = this._registry.components;

		if ( Array.isArray( list ) ) {
			const numForms = list.length;

			for ( let i = 0; i < numForms; i++ ) {
				const form = list[i];
				if ( form && form.$el === element ) {
					return form;
				}
			}
		}

		return null;
	}

	/**
	 * Searches list of registered form components for the first one with
	 * selected name in its injection options.
	 *
	 * @param {string} name name of form component to select
	 * @return {?Component} matching form component or null if missing
	 */
	findByName( name ) {
		const list = this._registry.components;

		if ( Array.isArray( list ) ) {
			const numForms = list.length;

			for ( let i = 0; i < numForms; i++ ) {
				const form = list[i];
				if ( form && form.name === name ) {
					return form;
				}
			}
		}

		return null;
	}

	/**
	 * Adds support for custom type of field.
	 *
	 * @param {string} typeName name of type to use in field definition for addressing provided implementation
	 * @param {FormFieldAbstractModel} fieldImplementation implementation of custom field type
	 * @returns {FormsAPI} current forms manager for fluent interface
	 */
	addField( typeName, fieldImplementation ) {
		const _name = String( typeName ).trim().toLowerCase();
		const registry = this._registry.fields;

		if ( registry.hasOwnProperty( _name ) ) {
			throw new TypeError( `conflict: handler for fields of type "${typeName}" has been registered before` );
		}

		if ( !Fields.abstract.isBaseClassOf( fieldImplementation ) ) {
			throw new TypeError( `invalid handler for fields of type "${typeName}" rejected` );
		}

		registry[_name] = fieldImplementation;

		return this;
	}

	/**
	 * Adds support for custom input processor.
	 *
	 * @param {string} name name of processor to use in a sequence's definition of input processors for including provided processor
	 * @param {FormProcessorAbstractModel} processorImplementation implementation of custom input processor
	 * @returns {FormsAPI} current forms manager for fluent interface
	 */
	addProcessor( name, processorImplementation ) {
		const _name = String( name ).trim().toLowerCase();
		const registry = this._registry.processors;

		if ( registry.hasOwnProperty( _name ) ) {
			throw new TypeError( `conflict: input processor of type "${name}" has been registered before` );
		}

		if ( !Processors.abstract.isBaseClassOf( processorImplementation ) ) {
			throw new TypeError( `invalid input processor of type "${name}" rejected` );
		}

		registry[_name] = processorImplementation;

		return this;
	}

	/**
	 * Exposes class any custom type of field must be inherited from.
	 *
	 * @returns {FormFieldAbstractModel} base class for custom types of fields
	 */
	static AbstractFieldModel() {
		return Fields.abstract;
	}

	/**
	 * Exposes class any custom input processor must be inherited from.
	 *
	 * @returns {FormProcessorAbstractModel} base class for custom input processor
	 */
	static AbstractProcessorModel() {
		return Processors.abstract;
	}
}
