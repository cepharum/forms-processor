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
 * Implements abstract base class of managers handling certain type of field in
 * a form.
 */
export default class FormFieldAbstractModel {
	/**
	 * @param {FormSequenceModel} form manages whole sequence of forms this field is part of
	 * @param {object} definition properties and constraints of single form field
	 */
	constructor( form, definition ) {
		const { name } = definition;

		const terms = {};
		const getters = {};
		const ptnBinding = /({{[^}]+}})/;

		Object.keys( definition )
			.forEach( propertyName => {
				let propertyValue = definition[propertyName];

				switch ( propertyName ) {
					case "required" :
					case "visible" :
						terms[propertyName] = new TermProcessor( String( propertyValue ), {}, termCache );
						getters[propertyName] = { get: () => terms[propertyName].evaluate( form.data ) };
						break;

					default :
						propertyValue = propertyValue.trim();
						if ( propertyValue.charAt( 0 ) === "=" ) {
							terms[propertyName] = new TermProcessor( propertyValue.slice( 1 ), {}, termCache );
							getters[propertyName] = { get: () => terms[propertyName].evaluate( form.data ) };
						} else {
							const slices = propertyValue.split( ptnBinding );
							const numSlices = slices.length;
							let isDynamic = false;

							for ( let i = 0; i < numSlices; i++ ) {
								const slice = slices[i];
								const match = slice.match( ptnBinding );
								if ( match ) {
									slices[i] = new TermProcessor( slice.slice( 2, -2 ), {}, termCache );
									isDynamic = true;
								}
							}

							if ( isDynamic ) {
								getters[propertyName] = { get: () => {
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
								} };
							} else {
								getters[propertyName] = { value: propertyValue };
							}
						}
				}
			} );

		Object.defineProperties( this, Object.assign( getters, {
			name: { value: name },
		} ) );
	}

	/**
	 * Fetches description of a Vue component representing this field.
	 *
	 * @returns {object} description of Vue component
	 */
	renderComponent() {
		const { label } = this;

		return {
			render: function( createElement ) {
				return createElement( "div", {
					class: "field type-abstract",
				}, [
					createElement( "span", {
						class: "label",
					}, label ),
					createElement( "span", {
						class: "field",
					} ),
				] );
			},
		};
	}
}
