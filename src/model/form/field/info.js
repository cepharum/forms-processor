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

import FormFieldAbstractModel from "./abstract";

/**
 * Manages single field of form representing non-editable text display.
 */
export default class FormFieldInfoModel extends FormFieldAbstractModel {
	/**
	 * @inheritDoc
	 */
	constructor( form, definition, fieldIndex, reactiveFieldInfo, customProperties = {}, container = null ) {
		super( form, definition, fieldIndex, reactiveFieldInfo, {
			text( _v, _, __, cbTermHandler ) {
				/**
				 * Exposes current content to be displayed in field.
				 *
				 * @name FormFieldInfoModel#text
				 * @property string
				 * @readonly
				 */
				return cbTermHandler( this.selectLocalization( _v ), rawValue => {
					return this.markdown ? this.markdown.render( rawValue ) : rawValue;
				} );
			},

			...customProperties,
		}, container );
	}

	/** @inheritDoc */
	renderFieldComponent( reactiveFieldInfo ) {
		return {
			render( createElement ) {
				if ( this.markdown ) {
					return createElement( "span", {
						class: "static-info markdown",
						domProps: {
							innerHTML: this.text,
						},
					} );
				}

				return createElement( "span", {
					class: "static-info",
				}, this.text );
			},
			data: () => reactiveFieldInfo,
		};
	}

	/** @inheritDoc */
	updateFieldInformation( reactiveFieldInfo, onLocalUpdate ) {
		super.updateFieldInformation( reactiveFieldInfo, onLocalUpdate );

		// read out another definition property that might have changed
		const dummy = this.text; // eslint-disable-line no-unused-vars
	}

	/** @inheritDoc */
	static get isProvidingInput() {
		return false;
	}
}
