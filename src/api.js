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
	 * @param {function((string|HTMLElement), object=):Component} generator callback generating another forms component bound to selected element
	 * @returns {void}
	 */
	static expose( generator ) {
		if ( self.CepharumForms ) {
			const existing = self.CepharumForms;

			if ( existing instanceof this ) {
				return;
			}

			const manager = self.CepharumForms = new this( generator );

			if ( Array.isArray( existing ) ) {
				const numDefined = existing.length;
				for ( let i = 0; i < numDefined; i++ ) {
					const [ element, options = {} ] = existing[i];

					manager.create( element, options );
				}
			} else {
				console.error( "ignoring invalid pre-definition of forms" ); // eslint-disable-line no-console
			}
		} else {
			self.CepharumForms = new this( generator );
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
			 * Lists previously created form components.
			 *
			 * @name FormsAPI#registry
			 * @property {Array<Component>}
			 * @readonly
			 * @protected
			 */
			registry: { value: [] },
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
			component = this.generator( element, options );

			this._register( component );
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
	_register( form ) {
		const list = this.registry;
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
		const list = this.registry;

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
}
