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
import Pattern from "../utility/pattern";

/**
 * Declares default values of commonly supported field properties.
 *
 * @type {object<string,string>}
 */
const DefaultProperties = {
	required: "false",
	visible: "true",
	type: "radio",
	options: [],
};

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
	constructor(form, definition, fieldIndex, reactiveFieldInfo) {
		super(form, definition, fieldIndex, reactiveFieldInfo, ["size"]);
	}


	/** @inheritDoc */
	normalizeValue(value, options = {}) {
		if (value instanceof String) {
			return value !== "false";
		}

		return Boolean(value);
	}

	/** @inheritDoc */
	_renderFieldComponent(reactiveFieldInfo) {
		const that = this;
		const {form: {readValue, writeValue}, qualifiedName, options} = that;

		function renderOptions(createElement) {
			const numberOfOptions = options.length;
			const optionFields = [];
			for (let index = 0; index < numberOfOptions; index++) {
				const option = options[index];
				if (option instanceof Object) {
					const {value, label, name, id} = option;
					optionFields.push(
						createElement("input", {
							domProps: {
								type: "radio",
								name: name || label + index,
								id: id || label + index,
								value
							},
						}, [])
					);
				}
				if (option instanceof String) {
					optionFields.push(
						createElement("input", {
							domProps: {
								type: "radio",
								name: option,
								id: option + index,
								value: option,
							},
						})
					)
				}
			}
		}

		return {
			render(createElement) {
				return createElement("fieldset", {}, Array.concat([], renderOptions(createElement)));
			},
			data: () => reactiveFieldInfo,
		};
	}
}
