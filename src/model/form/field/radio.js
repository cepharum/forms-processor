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
	/**
	 * @param {FormModel} form reference on form this field belongs to
	 * @param {object} definition definition of field
	 * @param {int} fieldIndex index of field in set of containing form's fields
	 * @param {object} reactiveFieldInfo provided object to contain reactive information of field
	 */
	constructor( form, definition, fieldIndex, reactiveFieldInfo ) {
		super( form, definition, fieldIndex, reactiveFieldInfo, ["size"] );
	}

	/** @inheritDoc */
	static get isInteractive() {
		return false;
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
		const options = [
			{ label: "Ja", value: true },
			"Nein",
			"Definitiv"
		];
		const selected = readValue( qualifiedName );

		return {
			render( createElement ) {
				return createElement( "span", {}, options.map( ( option, index ) => {
					let domProps = {};
					let label = "";
					let value = "";
					if ( option instanceof Object ) {
						const { id } = option;
						value = option.value;
						label = option.label || "";
						domProps = {
							type: "radio",
							name: qualifiedName,
							id: id || `${qualifiedName}.${index}`,
							value
						};
						if ( value === selected ) {
							domProps.checked = true;
						}
					}
					if ( typeof option === "string" ) {
						label = option;
						value = option;
						domProps = {
							type: "radio",
							name: qualifiedName,
							id: `${qualifiedName}.${index}`,
							value: option,

						};
						if ( option === selected ) {
							domProps.checked = true;
						}
					}
					return createElement( "span", {}, [
						createElement( "input", {
							domProps,
							on: {
								click: () => {
									reactiveFieldInfo.pristine = false;

									writeValue( qualifiedName, value );
									reactiveFieldInfo.value = value;

									this.$emit( "input", value );
									this.$parent.$emit( "input", value );
								},
							}
						} ),
						createElement( "label", {
							attrs: {
								for: domProps.id,
							},
						}, [label] )
					] );
				} ) );
			},
			data: () => reactiveFieldInfo,
		};
	}
}
