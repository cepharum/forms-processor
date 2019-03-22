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

import Should from "should";

import Base64 from "../../../../../src/model/form/utility/base64";


describe( "Base64 support", () => {
	it( "is available", () => {
		Should( Base64 ).be.ok();
	} );

	describe( "exposes method for converting ArrayBuffer to base64 string which", () => {
		it( "is called arrayBufferToBase64", () => {
			Base64.arrayBufferToBase64.should.be.Function();
		} );

		it( "expects one argument", () => {
			Base64.arrayBufferToBase64.should.have.length( 1 );
		} );

		it( "returns string representing data in provided array using base64 encoding", () => {
			Base64.arrayBufferToBase64( new Uint8Array() ).should.be.String().which.has.length( 0 );
		} );

		it( "returns string representing data in provided array using base64 encoding", () => {
			Base64.arrayBufferToBase64( new Uint8Array( [ 0, 0, 0 ] ) ).should.be.String().which.is.equal( "AAAA" );
			Base64.arrayBufferToBase64( new Uint8Array( [ 0, 0, 0, 0 ] ) ).should.be.String().which.is.equal( "AAAAAA==" );
			Base64.arrayBufferToBase64( new Uint8Array( [ 0, 0, 0, 0, 0 ] ) ).should.be.String().which.is.equal( "AAAAAAA=" );
		} );
	} );

	describe( "exposes method for converting base64 string to ArrayBuffer which", () => {
		it( "is called base64ToArrayBuffer", () => {
			Base64.base64ToArrayBuffer.should.be.Function();
		} );

		it( "expects one argument", () => {
			Base64.base64ToArrayBuffer.should.have.length( 1 );
		} );

		it( "returns ArrayBuffer with data represented by provided string", () => {
			Base64.base64ToArrayBuffer( "" ).should.be.instanceOf( Uint8Array ).which.has.length( 0 );
		} );

		it( "returns string representing data in provided array using base64 encoding", () => {
			Base64.base64ToArrayBuffer( "AAAA" ).should.be.instanceOf( Uint8Array ).which.is.deepEqual( new Uint8Array( [ 0, 0, 0 ] ) );
			Base64.base64ToArrayBuffer( "AAAAAA==" ).should.be.instanceOf( Uint8Array ).which.is.deepEqual( new Uint8Array( [ 0, 0, 0, 0 ] ) );
			Base64.base64ToArrayBuffer( "AAAAAAA=" ).should.be.instanceOf( Uint8Array ).which.is.deepEqual( new Uint8Array( [ 0, 0, 0, 0, 0 ] ) );
		} );
	} );

	describe( "can be used in a way so it", function() {
		this.timeout( 30000 );

		it( "is properly encoding and decoding arbitrary binary data", () => {
			for ( let i = 0; i < 100; i++ ) {
				const size = 16384 + ( i % 4 );
				const data = new Uint8Array( size );

				for ( let j = 0; j < size; j++ ) {
					data[j] = Math.floor( Math.random() * 256 );
				}

				const encoded = Base64.arrayBufferToBase64( data );

				encoded.should.be.String().and.not.match( /[^a-z0-9+/=]/i );
				encoded.length.should.be.greaterThanOrEqual( 21848 );

				Base64.base64ToArrayBuffer( encoded ).should.be.deepEqual( data );
			}
		} );
	} );
} );
