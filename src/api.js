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
import Data from "@/service/data";
import EventBus from "@/service/events";


/**
 * @typedef {object} FormsAPIExtensionsRegistry
 * @property {object<string,FormFieldAbstractModel>} fields maps custom field types to be supported
 * @property {object<string,FormProcessorAbstractModel>} processors maps custom input processors
 * @property {object<string,object>} translations map of locales into custom translation overlays
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
				translations: {},
			} },
		} );

		this.runConfiguration( {
			fields: Fields.map,
			processors: Processors.map,
			sequences: [],
		} );
	}

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
		const { fields = {}, processors = {}, translations = {}, sequences = [] } = ( function( preConfiguration ) {
			if ( Array.isArray( preConfiguration ) ) {
				return {
					sequences: preConfiguration,
				};
			}

			if ( preConfiguration && typeof preConfiguration === "object" && Array.isArray( preConfiguration.sequences ) ) {
				return {
					processors: preConfiguration.processors || {},
					fields: preConfiguration.fields || {},
					translations: preConfiguration.translations || {},
					sequences: preConfiguration.sequences,
				};
			}

			console.error( "Ignoring invalid pre-definition of forms." ); // eslint-disable-line no-console

			return {};
		} )( configuration );


		const fieldNames = Object.keys( fields );
		const numFields = fieldNames.length;
		for ( let i = 0; i < numFields; i++ ) {
			const name = fieldNames[i];

			this.addField( name, fields[name] );
		}

		const processorNames = Object.keys( processors );
		const numProcessors = processorNames.length;
		for ( let i = 0; i < numProcessors; i++ ) {
			const name = processorNames[i];

			this.addProcessor( name, processors[name] );
		}

		const translationNames = Object.keys( translations );
		const numTranslations = translationNames.length;
		for ( let i = 0; i < numTranslations; i++ ) {
			const name = translationNames[i];

			this.addTranslations( name, translations[name] );
		}

		const numSequences = sequences.length;
		for ( let i = 0; i < numSequences; i++ ) {
			const [ element, options = {} ] = sequences[i];

			this.create( element, options );
		}
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
					translations: Data.deepMerge( {}, this._registry.translations, individualRegistry.translations ),
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
	 * Drops previously created and cached forms processor component.
	 *
	 * @param {Component} component previously registered component to be dropped
	 * @returns {void}
	 */
	drop( component ) {
		if ( component ) {
			const list = this._registry.components;

			for ( let i = 0; i < list.length; i++ ) {
				const listedForm = list[i];
				if ( listedForm === component ) {
					list.splice( i--, 1 );
				}
			}
		}
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
	 * @param {class|function(class):class} implementationOrFactory implementation of custom field type or factory callback generating it
	 * @returns {FormsAPI} current forms manager for fluent interface
	 */
	addField( typeName, implementationOrFactory ) {
		const _name = String( typeName ).trim().toLowerCase();
		const registry = this._registry.fields;

		if ( registry.hasOwnProperty( _name ) ) {
			throw new TypeError( `Handler for fields of type "${typeName}" has been registered before.` );
		}

		const field = typeof implementationOrFactory === "function" && !Fields.abstract.isBaseClassOf( implementationOrFactory ) ? implementationOrFactory( Fields.abstract ) : implementationOrFactory;

		if ( !Fields.abstract.isBaseClassOf( field ) ) {
			throw new TypeError( `Handler for fields of type "${typeName}" isn't inheriting from abstract base class.` );
		}

		registry[_name] = field;

		return this;
	}

	/**
	 * Adds support for custom input processor.
	 *
	 * @param {string} name name of processor to use in a sequence's definition of input processors for including provided processor
	 * @param {class|function(class):class} implementationOrFactory implementation of custom field type or factory callback generating it
	 * @returns {FormsAPI} current forms manager for fluent interface
	 */
	addProcessor( name, implementationOrFactory ) {
		const _name = String( name ).trim().toLowerCase();
		const registry = this._registry.processors;

		if ( registry.hasOwnProperty( _name ) ) {
			throw new TypeError( `Input processor of type "${name}" has been registered before.` );
		}

		const processor = typeof implementationOrFactory === "function" && !Processors.abstract.isBaseClassOf( implementationOrFactory ) ? implementationOrFactory( Processors.abstract ) : implementationOrFactory;

		if ( !Processors.abstract.isBaseClassOf( processor ) ) {
			throw new TypeError( `Invalid input processor of type "${name}" rejected.` );
		}

		registry[_name] = processor;

		return this;
	}

	/**
	 * Adds provided translations for selected locale for use with forms
	 * processors created afterwards.
	 *
	 * @param {string} locale tag of locale provided translation should be used on
	 * @param {object} translationsOverlay hierarchical map of strings into strings or into next level of such a map
	 * @returns {FormsAPI} current forms manager for fluent interface
	 */
	addTranslations( locale, translationsOverlay ) {
		const { translations } = this._registry;

		if ( !translations[locale] ) {
			translations[locale] = {};
		}

		Data.deepMerge( translations[locale], translationsOverlay );

		return this;
	}

	/**
	 * Exposes class any custom type of field must be inherited from.
	 *
	 * @returns {FormFieldAbstractModel} base class for custom types of fields
	 */
	static get AbstractFieldModel() {
		return Fields.abstract;
	}

	/**
	 * Exposes class any custom input processor must be inherited from.
	 *
	 * @returns {FormProcessorAbstractModel} base class for custom input processor
	 */
	static get AbstractProcessorModel() {
		return Processors.abstract;
	}

	/**
	 * Exposes class any custom type of field must be inherited from.
	 *
	 * @returns {FormFieldAbstractModel} base class for custom types of fields
	 */
	get AbstractFieldModel() {
		return Fields.abstract;
	}

	/**
	 * Exposes class any custom input processor must be inherited from.
	 *
	 * @returns {FormProcessorAbstractModel} base class for custom input processor
	 */
	get AbstractProcessorModel() {
		return Processors.abstract;
	}

	/**
	 * Exposes internal event bus for listening to internal events of forms
	 * processor or triggering events.
	 *
	 * @returns {Component} empty vue component serving as internal event bus
	 */
	get events() {
		return EventBus;
	}
}
