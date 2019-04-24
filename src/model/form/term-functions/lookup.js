/**
 * (c) 2019 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 cepharum GmbH
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
 * Instance of object solely used to safely detect caller actually having
 * omitted some argument on invoking some function.
 *
 * @type {{}}
 */
const omitted = {};

/**
 * Looks up label of option matching given value in a set of options read from
 * named definition property of named field or current field.
 *
 * For conveniently looking up options of fields of type `checkbox`, `radio` or
 * `select` you can omit `fieldValue` to implicitly look up current value of
 * named field.
 *
 * @this FormFieldAbstractModel
 * @param {string} fieldName name of field options are defined on, omit for current field
 * @param {*} fieldValue value matching option to look up
 * @param {string} fieldProperty property of field's definition containing set of options
 * @return {null|string|object<string,string>} immediate or internationalized label of found option, null otherwise
 */
export default function lookup( fieldName = null, fieldValue = omitted, fieldProperty = "options" ) {
	let field;

	if ( fieldName == null ) {
		field = this; // eslint-disable-line consistent-this
	} else {
		const fieldKey = fieldName.toLowerCase();
		if ( this.advertiseDependency ) {
			this.advertiseDependency = fieldKey;
			return null;
		}

		field = this.sequence.fields[fieldKey];
		if ( !field ) {
			return null;
		}
	}

	const _value = fieldValue === omitted ? field.value : fieldValue;
	const map = field[fieldProperty];

	if ( Array.isArray( map ) ) {
		for ( let index = 0, length = map.length; index < length; index++ ) {
			const entry = map[index];

			if ( entry.value === _value ) {
				return entry.label;
			}
		}
	}

	if ( typeof map === "object" ) {
		return map.label;
	}

	return map;
}
