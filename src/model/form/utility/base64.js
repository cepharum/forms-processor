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
 * Calculates Base64-encoded representation of provided array buffer.
 *
 * @param {ArrayBuffer} arrayBuffer some array buffer
 * @return {string} Base64-encoded content of provided array buffer
 */
export function arrayBufferToBase64( arrayBuffer ) {
	const source = new Uint8Array( arrayBuffer );
	const numBytes = source.length;
	const numEncodedBytes = Math.ceil( numBytes / 3 ) * 4;
	let encodedBytes = "";

	const map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

	for ( let read = 0, write = 0; write < numEncodedBytes; write++ ) {
		if ( read >= numBytes ) {
			encodedBytes += "=";
		} else {
			const byte = source[read];

			switch ( write % 4 ) {
				case 0 :
					encodedBytes += map[byte >> 2];
					break;
				case 1 :
					encodedBytes += map[( ( byte & 0x03 ) << 4 ) | ( ( source[++read] || 0 ) >> 4 )];
					break;
				case 2 :
					encodedBytes += map[( ( byte & 0x0f ) << 2 ) | ( ( source[++read] || 0 ) >> 6 )];
					break;
				case 3 :
					encodedBytes += map[byte & 0x3f];
					read++;
					break;
			}
		}
	}

	return encodedBytes;
}

/**
 * Extracts a stream of octets from a Base64-encoded representation of data.
 *
 * @param {string} base64 Base64-encoded representation of arbitrary data
 * @return {Uint8Array} stream of octets described by provided representation
 */
export function base64ToArrayBuffer( base64 ) {
	const source = String( base64 ).replace( /\s+|=+\s*$/g, "" );
	const numEncodedBytes = source.length;
	if ( numEncodedBytes % 4 === 1 ) {
		throw new TypeError( "invalid length of Base64-encoded data" );
	}

	const numBytes = Math.floor( numEncodedBytes / 4 * 3 );
	const data = new Uint8Array( numBytes );
	let store, read, write;

	for ( read = 0, write = 0; read < numEncodedBytes; read++ ) {
		let value = base64.charCodeAt( read );

		switch ( value ) {
			case 43 :
				value = 62;
				break;

			case 47 :
				value = 63;
				break;

			default :
				value -= value < 65 ? 48 - 52 : value < 97 ? 65 : 97 - 26;
				break;
		}

		switch ( read % 4 ) {
			case 0 :
				store = value << 2;
				break;

			case 1 :
				store |= value >> 4;
				data[write++] = store;
				store = ( value & 0x0f ) << 4;
				break;

			case 2 :
				store |= value >> 2;
				data[write++] = store;
				store = ( value & 0x03 ) << 6;
				break;

			case 3 :
				store |= value;
				data[write++] = store;
				break;
		}
	}

	if ( read % 4 > 0 ) {
		data[write] = store;
	}

	return data;
}

export default {
	arrayBufferToBase64,
	base64ToArrayBuffer,
};
