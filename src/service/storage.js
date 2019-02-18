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
 * Implements API for accessing object containing hierarchy of values.
 */
export default class Storage {
	/**
	 * Normalizes qualified name of a field.
	 *
	 * @param {?string} name qualified name of field to be normalized
	 * @returns {?string} normalized qualified name of field
	 */
	static normalizeName( name ) {
		return name == null ? null : String( name ).trim().replace( /\s*\.\s*/g, "." );
	}

	/**
	 * Reads value from storage selected by qualified name.
	 *
	 * @param {object} storage refers to object managed as _storage_ by constructed instance
	 * @param {string} name path name of value to be read
	 * @param {?*} fallbackValue value to return in case storage does not contain named value
	 * @return {?*} found value, null if value is missing
	 */
	static read( storage, name, fallbackValue = null ) {
		if ( !storage || typeof storage !== "object" ) {
			throw new TypeError( "Reading from invalid storage rejected." );
		}

		const _name = this.normalizeName( name );
		if ( _name == null ) {
			return fallbackValue == null ? null : fallbackValue;
		}

		let pointer = storage;
		const segments = _name.split( /\s*\.\s*/ );
		const numSegments = segments.length;

		for ( let i = 0; i < numSegments; i++ ) {
			const segment = segments[i];

			if ( pointer && typeof pointer === "object" && pointer.hasOwnProperty( segment ) ) {
				pointer = pointer[segment];
			} else {
				return fallbackValue == null ? null : fallbackValue;
			}
		}

		return pointer;
	}

	/**
	 * Writes value to hierarchical storage.
	 *
	 * @param {object} storage refers to object managed as _storage_ by constructed instance
	 * @param {string} name path name of value to be written
	 * @param {*} value value to be written
	 * @returns {boolean} true if properties have been added to storage
	 */
	static write( storage, name, value ) {
		if ( !storage || typeof storage !== "object" ) {
			throw new TypeError( "Writing to invalid storage rejected." );
		}

		const _name = this.normalizeName( name );
		if ( _name == null ) {
			return false;
		}

		let pointer = storage;
		const segments = _name.split( /\s*\.\s*/ );
		const maxIndex = segments.length - 1;
		let changed = false;

		for ( let i = 0; i < maxIndex; i++ ) {
			const segment = segments[i];

			if ( !pointer.hasOwnProperty( segment ) ) {
				pointer[segment] = {};
				changed = true;
			} else if ( !pointer[segment] || typeof pointer[segment] !== "object" ) {
				throw new TypeError( `Can't write to ${name} due to value at ${segments.slice( 0, i + 1 ).join( "." )}.` );
			}

			pointer = pointer[segment];
		}

		const lastSegment = segments[maxIndex];
		if ( !pointer.hasOwnProperty( lastSegment ) ) {
			changed = true;
		}

		pointer[lastSegment] = value;

		return changed;
	}
}
