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
 * Implements abstract processor of forms' input data.
 *
 * @abstract
 */
export default class FormProcessorAbstractModel {
	/**
	 * @param {object} definition definition properties customizing processor's particular behaviour
	 * @param {FormSequenceModel} sequence reference on sequence manager this processor is used with
	 */
	constructor( definition, sequence ) {
		Object.defineProperties( this, {
			/**
			 * Exposes definition customizing processor's behaviour.
			 *
			 * @name FormProcessorAbstractModel#definition
			 * @property {object}
			 * @readonly
			 */
			definition: { value: definition },

			/**
			 * Exposes sequence processor is used with.
			 *
			 * @name FormProcessorAbstractModel#sequence
			 * @property {FormSequenceModel}
			 * @readonly
			 */
			sequence: { value: sequence },
		} );
	}

	/**
	 * Processes provided input data.
	 *
	 * @param {FormSequenceInputData} data all forms' input data
	 * @param {FormSequenceModel} sequence sequence of forms provided data is related to
	 * @returns {Promise<FormSequenceInputData>} processed input data
	 * @abstract
	 */
	process( data, sequence ) { // eslint-disable-line no-unused-vars
		return Promise.resolve( data );
	}

	/**
	 * Sets up provided constructor function to represent "sub-class" of current
	 * one.
	 *
	 * @note This method is provided to simplify pre-ES6 inheritance on
	 *       registering custom processors.
	 *
	 * @param {function} subClassConstructor constructor function
	 * @returns {function} provided constructor function
	 */
	static makeInherit( subClassConstructor ) {
		const subProto = subClassConstructor.prototype = Object.create( this.prototype );
		subProto.constructor = subClassConstructor;
		subProto.$super = this;

		return subClassConstructor;
	}

	/**
	 * Indicates if current class is a base class of provided one.
	 *
	 * @param {function|class} subClass some class to be tested for inheriting from current one
	 * @returns {boolean} true if current one is base class of provided one
	 */
	static isBaseClassOf( subClass ) {
		let iter = subClass.prototype;

		while ( iter ) {
			if ( iter.constructor === this ) {
				return true;
			}

			iter = Object.getPrototypeOf( iter );
		}

		return false;
	}
}
