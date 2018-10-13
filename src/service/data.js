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

/**
 * Matches string values representing boolean value `true`.
 *
 * @type {RegExp}
 */
const ptnTruthy = /^\s*(?:y(?:es)?|t(?:rue)?|1|on)?\s*$/i;

/**
 * Matches string values representing boolean value `false`.
 *
 * @type {RegExp}
 */
const ptnFalsy = /^\s*(?:no?|f(?:alse)?|0|off)?\s*$/i;


/**
 * Exposes set of methods for processing arbitrary data.
 */
export default class Data {
	/**
	 * Converts provided arbitrary value to boolean supporting several string
	 * values resulting in either `true` or `false`.
	 *
	 * @param {*} value value to be converted
	 * @param {true|false|null} defaultValue value to return in case of matching neither list of string literals describing boolean value
	 * @returns {?boolean} resulting value or null if `value` is representing neither boolean value while omitting default
	 */
	static normalizeToBoolean( value, defaultValue = null ) {
		if ( value === true || value === false ) {
			return value;
		}

		if ( ptnFalsy.test( value ) ) {
			return false;
		}

		if ( !defaultValue && ptnTruthy.test( value ) ) {
			return true;
		}

		return defaultValue == null ? null : Boolean( defaultValue );
	}

	/**
	 * Deeply freezes provided value preventing modification of its properties
	 * (in case of providing an object) or its elements (in case of providing an
	 * array).
	 *
	 * @note Freezing value works on arrays and objects, only.
	 *
	 * @param {*} value arbitrary value to be frozen
	 * @returns {*} frozen value
	 */
	static deepFreeze( value ) {
		if ( value && typeof value === "object" ) {
			if ( Array.isArray( value ) ) {
				const numItems = value.length;

				for ( let i = 0; i < numItems; i++ ) {
					value[i] = this.deepFreeze( value[i] );
				}
			} else {
				const keys = Object.keys( value );
				const numKeys = keys.length;

				for ( let i = 0; i < numKeys; i++ ) {
					const key = keys[i];

					value[key] = this.deepFreeze( value[key] );
				}
			}

			return Object.freeze( value );
		}

		return value;
	}

	/**
	 * Deeply clones provided value.
	 *
	 * @param {*} value arbitrary value to be cloned
	 * @param {boolean} andFreeze set true to implicitly freeze any cloned object
	 * @returns {*} cloned value
	 */
	static deepClone( value, andFreeze = false ) {
		if ( value && typeof value === "object" ) {
			if ( Array.isArray( value ) ) {
				const numItems = value.length;
				const clone = new Array( numItems );

				for ( let i = 0; i < numItems; i++ ) {
					clone[i] = this.deepClone( value[i] );
				}

				return andFreeze ? Object.freeze( clone ) : clone;
			}

			const keys = Object.keys( value );
			const numKeys = keys.length;
			const clone = {};

			for ( let i = 0; i < numKeys; i++ ) {
				const key = keys[i];

				clone[key] = this.deepClone( value[key] );
			}

			return andFreeze ? Object.freeze( clone ) : clone;
		}

		return value;
	}

	/**
	 * Deeply merges source object into provided target object.
	 *
	 * @param {object} target object to be adjusted by merging
	 * @param {object} source properties to be written into target object
	 * @returns {object} reference on provided target object with properties of source object merged
	 */
	static deepMerge( target, source ) {
		if ( !source ) {
			return target;
		}

		if ( typeof target !== "object" || !target || typeof source !== "object" ) {
			throw new TypeError( "cannot merge provided data" );
		}

		const sourceIsArray = Array.isArray( source );

		if ( sourceIsArray ? 1 : 0 ^ Array.isArray( target ) ? 1 : 0 ) {
			throw new TypeError( "cannot merge incompatible data types" );
		}

		if ( sourceIsArray ) {
			return target.concat( source );
		}

		const names = Object.keys( source );
		const numNames = names.length;
		for ( let i = 0; i < numNames; i++ ) {
			const name = names[i];
			const sourceValue = source[name];

			switch ( typeof sourceValue ) {
				case "undefined" :
					break;

				case "object" :
					if ( sourceValue ) {
						const sourceValueIsArray = Array.isArray( sourceValue );
						let targetValue = target[name];

						if ( !targetValue || ( sourceValueIsArray ? 1 : 0 ^ Array.isArray( targetValue ) ? 1 : 0 ) ) {
							targetValue = target[name] = sourceValueIsArray ? [] : {};
						}

						this.deepMerge( targetValue, sourceValue );
					}
					break;

				default :
					target[name] = sourceValue;
			}
		}

		return target;
	}

	/**
	 * Removes duplicate items from provided list of items.
	 *
	 * @param {array} items list of items
	 * @returns {array} provided list of items with duplicate entries removed
	 */
	static unique( items ) {
		if ( !items ) {
			return [];
		}

		if ( !Array.isArray( items ) ) {
			throw new TypeError( "not a list of items" );
		}

		const map = new Map();

		const numItems = items.length;
		const filtered = new Array( items );
		let write = 0;

		for ( let i = 0; i < numItems; i++ ) {
			const item = items[i];

			if ( map.has( item ) ) {
				continue;
			}

			map.set( item, true );
			filtered[write++] = item;
		}

		filtered.splice( write );

		return filtered;
	}
}
