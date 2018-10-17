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
 * Implements abstract base class of managers handling certain type of field in
 * a form.
 */
export default class FormFieldCheckBoxModel extends FormFieldAbstractModel {
	/** @inheritDoc */
	static get isInteractive() {
		return true;
	}


	/** @inheritDoc */
	normalizeValue( value, options = {} ) { // eslint-disable-line no-unused-vars
		if ( value instanceof String ) {
			return value !== "false";
		}

		return Boolean( value );
	}

	/** @inheritDoc */
	_renderFieldComponent( reactiveFieldInfo ) {
		const that = this;
		const { form: { readValue, writeValue }, qualifiedName } = that;

		return {
			render( createElement ) {
				return createElement( "input", {
					domProps: {
						type: "checkbox",
						checked: readValue( qualifiedName ),
					},
					on: {
						click: event => {
							const value = that.normalizeValue( event.target.checked );
							event.target.checked = value;

							if ( value === this.value ) {
								event.target.checked = value;
								return;
							}

							this.value = value;
							reactiveFieldInfo.pristine = false;

							writeValue( qualifiedName, value );
							reactiveFieldInfo.value = value;

							this.$emit( "input", value );
							this.$parent.$emit( "input", value );
						},
					},
				} );
			},
			data: () => reactiveFieldInfo,
		};
	}
}
