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
	constructor(form, definition, fieldIndex, reactiveFieldInfo) {
		super(form, definition, fieldIndex, reactiveFieldInfo, ["options"]);

		Object.defineProperties(this, {
			/**
			 * @name options
			 * @property {Array<{value:string, label:string}>}
			 * @readonly
			 */
			options: {value: this.constructor.createOptions(definition.options)},
		});
	}

	static createOptions(definition) {
		if (!definition) {
			throw new TypeError("missing list of options to offer in a selector");
		}

		const options = typeof definition === "string" ? definition.trim().split(/\s*[,;]\s*/) : definition;
		if (!Array.isArray(options)) {
			throw new TypeError("not a list of options to offer in a selector");
		}

		const numOptions = options.length;
		const normalized = new Array(numOptions);
		let write = 0;

		for (let i = 0; i < numOptions; i++) {
			const item = options[i];

			if (!item) {
				continue;
			}

			switch (typeof item) {
				case "string" : {
					const value = item.trim();

					normalized[write++] = {
						value,
						label: value,
					};

					break;
				}

				case "object" : {
					if (!item.value) {
						throw new TypeError("invalid option to be provided in selector misses value");
					}

					const value = item.value.trim();

					normalized[write++] = {
						value,
						label: item.label == null ? value : String(item.label).trim(),
					};

					break;
				}
			}
		}

		normalized.splice(write);

		return normalized;
	}


	/** @inheritDoc */
	static get isInteractive() {
		return false;
	}

	/** @inheritDoc */
	_renderFieldComponent(reactiveFieldInfo) {
		const that = this;
		const {form: {readValue, writeValue}, qualifiedName} = that;
		let {options} = that;

		return {
			data: () => {
				return {
					options,
					reactiveFieldInfo,
					qualifiedName,
				}
			},
			computed: {
				_value() {
					return readValue(qualifiedName);
				}
			},
			methods: {
				clickHandler(value) {
					reactiveFieldInfo.pristine = false;

					if (reactiveFieldInfo.value !== value) {
						writeValue(qualifiedName, value);
						reactiveFieldInfo.value = value;

						this.$emit("input", value);
						this.$parent.$emit("input", value);
						options = options.slice(0);
					}
				}
			},
			template: `
			<span>
				<span v-for="(entry, index) in options" >
					<input
							:key="entry.id || qualifiedName + '.' + index" 
							type="radio"
							:name="qualifiedName"
							:label="entry.label"
							:id="entry.id || qualifiedName + '.' + index"
							:checked="entry.value === _value"
							v-on:click='clickHandler(entry.value)'
					/>
					<label v-on:click='clickHandler(entry.value)'>{{entry.label}}</label>
				</span>
			</span>`,
		};
	}
}
