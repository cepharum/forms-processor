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

import Format from "../../../../../src/model/form/utility/format";


describe( "Utility class Pattern", () => {
	it( "is available", () => {
		Should.exist( Format );
	} );

	describe( "exposes method iban() which", () => {
		it( "is a function", () => {
			Format.iban.should.be.Function();
		} );

		it( "accepts 'DE68210501700012345678'", () => {
			const result = Format.iban( "DE68210501700012345678" );
			Should( result.errors ).be.undefined();
			result.output.should.be.equal( "DE68210501700012345678" );
		} );

		it( "denies 'DE68210501700012345679'", () => {
			const result = Format.iban( "DE68210501700012345679" );
			result.errors.should.be.eql( ["@FORMATS.IBAN.INVALID"] );
			Should( result.output ).be.undefined();
		} );

		it( "denies 'AL68210501700012345679' if only 'DE' is allowed and countryCode is case insensitive", () => {
			const result = Format.iban( "AL68210501700012345679" , null, { countryCodes: ["de"] } );
			result.errors.should.be.eql( ["@FORMATS.IBAN.INVALID_COUNTRY_CODE"] );
			Should( result.output ).be.undefined();
		} );

		it( "denies to short input", () => {
			const result = Format.iban( "AL682105017000123456" , null );
			result.errors.should.be.eql( ["@VALIDATION.TOO_SHORT"] );
			Should( result.output ).be.undefined();
		} );

		it( "allows to short input if live", () => {
			const result = Format.iban( "AL682105017000123456" , true );
			Should( result.errors ).be.undefined();
			Should( result.output ).be.eql( "AL682105017000123456" );
		} );

		it( "denies to long input", () => {
			const result = Format.iban( "DE6821050170001234567922" , null );
			result.errors.should.be.eql( ["@VALIDATION.TOO_LONG"] );
			Should( result.output ).be.undefined();
		} );

		it( "denies to malformed input", () => {
			const result = Format.iban( "DE6d050170001234567922" , null );
			result.errors.should.be.eql( ["@FORMATS.IBAN.INVALID_FORMAT"] );
			Should( result.output ).be.undefined();
		} );

	} );
} );
