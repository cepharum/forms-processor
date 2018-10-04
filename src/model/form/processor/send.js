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

import FormProcessorAbstractModel from "./abstract";

/**
 * Matches beginning of URL.
 *
 * @type {RegExp}
 */
const ptnProbableUrl = /^([a-z]+:\/\/[^/]+|\.)?\//;


/**
 * Implements processor sending all input data to some configured URL.
 */
export default class FormProcessorSendModel extends FormProcessorAbstractModel {
	/** @inheritDoc */
	constructor( definition ) {
		super( definition );

		const { url, method = "POST" } = definition;

		const _url = url.trim();
		if ( typeof url !== "string" || !ptnProbableUrl.test( url ) ) {
			throw new TypeError( "invalid or missing URL for sending input data to" );
		}

		const _method = method.trim().toUpperCase() || "POST";
		switch ( _method ) {
			case "POST" :
			case "PUT" :
				break;

			default :
				throw new TypeError( "invalid HTTP method to use on sending input data" );
		}


		Object.defineProperties( this, {
			/**
			 * Provides URL to send input data to.
			 *
			 * @name FormProcessorSendModel#url
			 * @property {string}
			 * @readonly
			 */
			url: { value: _url },

			/**
			 * Provides HTTP method to be used on sending data.
			 *
			 * @name FormProcessorSendModel#method
			 * @property {string}
			 * @readonly
			 */
			method: { value: _method },
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
	process( data, sequence ) {
		if ( !data || typeof data !== "object" || Array.isArray( data ) ) {
			return Promise.reject( new TypeError( "invalid input data to be sent" ) );
		}

		const url = this.url.replace( /{([^}]+)}/, ( all, code ) => {
			switch ( code.trim().toLowerCase() ) {
				case "id" :
					return sequence.id;

				case "name" :
					return sequence.name;

				default :
					return all;
			}
		} );

		return fetch( url, {
			method: this.method,
			headers: {
				"Content-Type": "application/json; charset=utf8",
			},
			body: JSON.stringify( data ),
			credentials: "same-origin",
		} )
			.then( response => {
				if ( response.ok ) {
					return data;
				}

				throw new Error( `sending input data to ${url} responded on error` );
			} )
			.catch( error => {
				if ( this.definition.ignoreFailure ) {
					console.error( error );

					return data;
				}

				throw error;
			} );
	}
}
