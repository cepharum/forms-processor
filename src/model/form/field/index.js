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
import FormFieldInfoModel from "./info";
import FormFieldTextModel from "./text";
import FormFieldCheckBoxModel from "./checkbox";
import FormFieldRadioModel from "./radio";

let registry = null;

/**
 * Implements extensible registry of managers implementing specific behaviour
 * for named types of form fields.
 */
export default class FieldManagers {
	/**
	 * Fetches manager class implementing behaviour of selected type of form
	 * field.
	 *
	 * @param {string} type type value to be used in fields' definitions
	 * @returns {?FormFieldAbstractModel} manager class implementing behaviour of selected type of field, null on unknown type
	 */
	static findByType(type) {
		const _type = type.trim().toLowerCase();

		if (_type) {
			this.setup();
			if (registry.hasOwnProperty(_type)) {
				return registry[_type];
			}
		}

		return null;
	}

	/**
	 * Registers new type of field manager to be used with given type value.
	 *
	 * @param {string} type type value to be used in fields' definitions
	 * @param {FormFieldAbstractModel} manager manager class implementing behaviour of new type of fields
	 * @returns {void}
	 */
	static register(type, manager) {
		const _type = type.trim().toLowerCase();

		if (_type && manager instanceof FormFieldAbstractModel) {
			this.setup();

			registry[_type] = manager;
		}
	}

	/**
	 * Sets up registry with all field types provided by core implementation.
	 *
	 * @returns {void}
	 */
	static setup() {
		if (registry == null) {
			registry = {
				info: FormFieldInfoModel,
				text: FormFieldTextModel,
				checkbox: FormFieldCheckBoxModel,
				radio: FormFieldRadioModel
			};
		}
	}
}
