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

	/**
	 * @param {FormModel} form reference on form this field belongs to
	 * @param {object} definition definition of field
	 * @param {int} fieldIndex index of field in set of containing form's fields
	 * @param {object} reactiveFieldInfo provided object to contain reactive information of field
	 */
	constructor(form, definition, fieldIndex, reactiveFieldInfo) {
		super(form, definition, fieldIndex, reactiveFieldInfo, {
			options(v) {
				/**
				 * @name options
				 * @property {Array<{value:string, label:string}>}
				 * @readonly
				 */
				return {
					value: this.constructor.createOptions(v),
				}
			},
			multiple(v) {
				let value = Boolean(v);
				if (v instanceof String) {
					value = (Boolean(v) && v !== "false");
				}
				return {
					value
				}
			}
		});
	}

	/** @inheritDoc */
	validate(live) {
		const {value, required} = this;
		const errors = [];
		if (required) {
			if (value instanceof Array) {
				if (!value.length) {
					errors.push("@VALIDATION.MISSING_REQUIRED")
				}
			} else if (!Boolean(value)) {
				errors.push("@VALIDATION.MISSING_REQUIRED");
			}
		}
		return errors;
	}

	static createOptions(definition) {
		if (!definition) {
			return undefined;
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
	renderFieldComponent( reactiveFieldInfo ) {
		const that = this;
		const {form: {readValue, writeValue}, qualifiedName, type, value, options, multiple} = that;

		return {
			data: () => {
				return {
					reactiveFieldInfo,
					qualifiedName,
					options,
					type,
					value,
					multiple,
					update: true,
				}
			},
			computed: {
				_value: {
					get() {
						if (this.update) {
							this.update = false;
							if (multiple) {
								return readValue(qualifiedName) || [];
							}
							return readValue(qualifiedName);
						}
					},
					set(newValue) {
						reactiveFieldInfo.pristine = false;
						if (!newValue) {
							newValue = undefined;
						}
						if (newValue !== this._value) {
							writeValue(qualifiedName, newValue);
							reactiveFieldInfo.value = newValue;
							this.update = true
						}
					},
				},
				inputType() {
					return ((!(this.multiple) || this.type === 'radio') && (options && options.length > 1)) ? 'radio' : 'checkbox'
				}
			},
			template: `
				<span v-if="!options">
					<input type="checkbox" :id="qualifiedName" v-model="_value"/>
				</span>
				<span v-else>
					<span v-for="(entry, index) in options" :key="entry.id || qualifiedName + '.' + index">
						<input 
							:type="inputType"
							:name="qualifiedName"
							:label="entry.label"
							:id="entry.id || qualifiedName + '.' + index"
							:value="entry.value"
							v-model="_value"
						/>
						<label :for="entry.id || qualifiedName + '.' + index">
							{{entry.label || entry.value}}
						</label>
					</span>
				</span>
			`,
		};
	}
}
