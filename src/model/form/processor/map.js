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

import FormProcessorAbstractModel from "./abstract";
import CompileTerm from "../utility/process";
import { Processor } from "simple-terms";


const cache = new Map();


/**
 * @typedef {(string|object<string,ThreadOfStrings>)} ThreadOfStrings
 */

/**
 * @typedef {(string|Processor|Array<(string|Processor)>)} CompiledNode
 */

/**
 * @typedef {(CompiledNode|object<string,CompiledNode>)} ThreadOfCompiledNodes
 */

/**
 * @typedef {(*|object<string,*>)} ThreadOfData
 */

/**
 * Implements data processor mapping provided data onto different structure of
 * data.
 */
export default class FormProcessorMapModel extends FormProcessorAbstractModel {
	/** @inheritDoc */
	constructor( definition ) {
		super( definition );

		if ( !definition || !definition.hasOwnProperty( "map" ) || !definition.map || typeof definition.map !== "object" ) {
			throw new TypeError( "missing definition of map to be applied on processing data" );
		}

		if ( !Object.keys( definition.map ).length ) {
			throw new TypeError( "rejecting empty map to be applied on processing data" );
		}

		Object.defineProperties( this, {
			/**
			 * Exposes map applied to create different structure of data.
			 *
			 * @name FormProcessorMapModel#map
			 * @property {object}
			 * @readonly
			 */
			map: { value: this.constructor._compileMap( definition.map ) },
		} );
	}

	/** @inheritDoc */
	process( data, sequence ) { // eslint-disable-line no-unused-vars
		return Promise.resolve( this.constructor._applyMap( this.map, Object.assign( data, sequence ? { $form: sequence.data } : null ) ) );
	}

	/**
	 * Creates copy of provided hierarchical map with contained computable terms
	 * compiled properly for later evaluation.
	 *
	 * @param {object<string,ThreadOfStrings>} map hierarchical set of strings each probably containing source of computable terms
	 * @returns {object<string,ThreadOfCompiledNodes>} hierarchical set of compiled terms mixed with literals
	 * @private
	 */
	static _compileMap( map ) {
		const compiled = {};

		const names = Object.keys( map );
		const numNames = names.length;

		for ( let i = 0; i < numNames; i++ ) {
			const name = names[i];
			const source = map[name];

			if ( source && typeof source === "object" ) {
				compiled[name] = this._compileMap( source );
			} else {
				try {
					compiled[name] = CompileTerm.compileString( source, {}, cache );
				} catch ( error ) {
					throw new TypeError( `compiling term ${source} in context of processor mapping onto field ${name} failed: ${error.message}` );
				}
			}
		}

		return compiled;
	}

	/**
	 * Retrieves data structure derived from provided map with all contained
	 * computable terms evaluated in scope of provided data.
	 *
	 * @param {object<string,ThreadOfCompiledNodes>} map description of structure to create
	 * @param {object<string,ThreadOfData>} data variable space for running terms in map
	 * @returns {object<string,ThreadOfData>} data with structure according provided map
	 * @protected
	 */
	static _applyMap( map, data ) {
		const compiled = {};

		const names = Object.keys( map );
		const numNames = names.length;

		for ( let i = 0; i < numNames; i++ ) {
			const name = names[i];
			const source = map[name];

			if ( Array.isArray( source ) ) {
				const numSlices = source.length;
				const computed = new Array( numSlices );

				for ( let j = 0; j < numSlices; j++ ) {
					const slice = source[j];

					if ( slice && typeof slice === "object" ) {
						computed[j] = slice.evaluate( data );
					} else {
						computed[j] = slice;
					}
				}

				compiled[name] = computed.join( "" );
			} else if ( source && typeof source === "object" ) {
				if ( source instanceof Processor ) {
					compiled[name] = source.evaluate( data );
				} else {
					compiled[name] = this._applyMap( source, data );
				}
			} else {
				compiled[name] = source == null ? null : source;
			}
		}

		return compiled;
	}
}
