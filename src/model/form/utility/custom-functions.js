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

import L10n from "../../../service/l10n";


/**
 * Instance of object solely used to safely detect caller actually having
 * omitted some argument on invoking some function.
 *
 * @type {{}}
 */
const omitted = {};

/**
 * Provides set of custom function bound to instance of forms-processor
 * available in terms used in definition of forms.
 *
 * @param {FormSequenceModel} sequence instance of forms-processor
 * @returns {object<string,function>} functions bound to provided instance of forms-processor for use in terms
 */
export default function customFunctionsGenerator( sequence ) {
	return {
		/**
		 * Looks up label of option matching given value in a set of
		 * options defined on a named.
		 *
		 * For conveniently looking up options of fields of type
		 * `checkbox`, `radio` or `select` you can omit `fieldValue` to
		 * implicitly look up current value of named field.
		 *
		 * @param {string} fieldName name of field options are defined on
		 * @param {*} fieldValue value matching option to look up
		 * @param {string} fieldProperty property of field's definition containing set of options
		 * @return {null|string|object<string,string>} immediate or internationalized label of found option, null otherwise
		 */
		lookup( fieldName, fieldValue = omitted, fieldProperty = "options" ) {
			const fieldKey = fieldName.toLowerCase();
			const field = sequence.fields[fieldKey];
			if ( !field ) {
				return null;
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
		},

		/**
		 * Fetches serialized value of named field.
		 *
		 * @param {string} fieldName _fully qualified_ name of field
		 * @returns {?*} serialized value of selected field, null if field is missing
		 */
		serialize( fieldName ) {
			const fieldKey = fieldName.toLowerCase();
			const field = sequence.fields[fieldKey];

			if ( !field ) {
				return null;
			}

			return field.constructor.serialize( field.value );
		},

		/**
		 * Resolves optionally provided object with different translations
		 * in separate properties with value of property matching current
		 * locale.
		 *
		 * @param {int|string|object<string,*>} input some scalar to be passed, some object with properties per supported locale
		 * @return {*} provided scalar value or value of given object's property matching current locale
		 */
		localize( input ) {
			return L10n.selectLocalized( input, sequence.locale );
		},

		/**
		 * Provides read-access on constants defined in context of
		 * current sequence of forms.
		 *
		 * @param {string} _name name of constant to read
		 * @param {boolean} testExistence true to check if named constant exists instead of reading it
		 * @return {boolean|*} true/false on testing if some constant exists, found constant's value or null otherwise
		 */
		constant( _name, testExistence = false ) {
			const { constants } = sequence;

			return constants.hasOwnProperty( _name ) ? testExistence ? true : constants[_name] : testExistence ? false : null;
		},
	};
}
