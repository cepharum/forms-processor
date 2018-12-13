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

		const { url, method = "POST", pass = "data", onError = "fail" } = definition;

		const _url = url.trim();
		if ( typeof url !== "string" || !ptnProbableUrl.test( url ) ) {
			throw new TypeError( "URL for sending input data is missing or invalid." );
		}

		const _method = method.trim().toUpperCase() || "POST";
		switch ( _method ) {
			case "POST" :
			case "PUT" :
				break;

			default :
				throw new TypeError( "Rejecting invalid HTTP method to use on sending input data." );
		}

		let _pass = ( pass == null ? "" : String( pass ) ).trim().toLowerCase();
		switch ( _pass ) {
			case "data" :
			case "original" :
			case "provided" :
			case "input" :
			case "sent" :
				_pass = "sent";
				break;

			case "response" :
			case "received" :
				_pass = "received";
				break;

			case "all" :
			case "both" :
			case "merged" :
				_pass = "merged";
				break;

			default :
				throw new TypeError( "Rejecting invalid parameter on result returned from sending input data." );
		}

		let _errorMode = ( onError == null ? "" : String( onError ) ).trim().toLowerCase();
		switch ( _errorMode ) {
			case "fail" :
				_errorMode = "fail";
				break;

			case "ignore" :
				_errorMode = "ignore";
				break;

			default :
				throw new TypeError( "Rejecting invalid parameter for handling error on sending input data." );
		}


		if ( _errorMode === "ignore" && _pass === "received" ) {
			console.warn( "Configuration of processor sending input data might cause follow-up issues." ); // eslint-disable-line no-console
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

			/**
			 * Provides mode selecting data set to be passed as result of this
			 * processor.
			 *
			 * @name FormProcessorSendModel#pass
			 * @property {string}
			 * @readonly
			 */
			pass: { value: _pass },

			/**
			 * Provides mode on handling error response..
			 *
			 * @name FormProcessorSendModel#onError
			 * @property {string}
			 * @readonly
			 */
			onError: { value: _errorMode },
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
			return Promise.reject( new TypeError( "Rejecting invalid input data to be sent." ) );
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
					return response.json();
				}

				throw new Error( `Sending input data to ${url} responded on error.` );
			} )
			.catch( error => {
				if ( this.onError === "ignore" ) {
					console.error( error ); // eslint-disable-line no-console

					return null;
				}

				throw error;
			} )
			.then( received => {
				switch ( this.pass ) {
					case "sent" :
					default :
						return data;
					case "received" :
						return received;
					case "merged" :
						return { sent: data, received };
				}
			} );
	}
}
