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


describe( "Utility functions checking strings to obey certain formats", () => {
	it( "are available", () => {
		Should.exist( Format );
	} );

	describe( "expose method iban() for validating IBAN input which", () => {
		it( "is a function", () => {
			Format.iban.should.be.Function();
		} );

		it( "accepts 'DE68210501700012345678'", () => {
			const result = Format.iban( "DE68210501700012345678" );
			Should( result.errors ).be.undefined();
			result.output.should.be.equal( "DE68210501700012345678" );
		} );

		it( "accepts and normalizes 'de68210501700012345678'", () => {
			const result = Format.iban( "de68210501700012345678" );
			Should( result.errors ).be.undefined();
			result.output.should.be.equal( "DE68210501700012345678" );
		} );

		it( "accepts and normalizes ' de68210501700012345678 '", () => {
			const result = Format.iban( " de68210501700012345678 " );
			Should( result.errors ).be.undefined();
			result.output.should.be.equal( "DE68210501700012345678" );
		} );

		it( "accepts and normalizes 'DE51120300001053216097'", () => {
			const result = Format.iban( "DE51120300001053216097" );
			Should( result.errors ).be.undefined();
			result.output.should.be.equal( "DE51120300001053216097" );
		} );

		it( "denies 'DE68210501700012345679'", () => {
			const result = Format.iban( "DE68210501700012345679" );
			result.errors.should.be.eql( ["@FORMATS.IBAN.CHECKSUM_FAILED"] );
			Should( result.output ).be.undefined();
		} );

		it( "denies 'AL68210501700012345679' if only 'DE' is allowed and countryCode is case insensitive", () => {
			const result = Format.iban( "AL68210501700012345679" , null, { countryCodes: ["de"] } );
			result.errors.should.be.eql( ["@FORMATS.IBAN.INVALID_COUNTRY_CODE"] );
			Should( result.output ).be.undefined();
		} );

		it( "accepts parts of 'de68210501700012345678' while entering it", () => {
			const iban = " de68210501700012345678 ";

			for ( let i = 0; i <= iban.length; i++ ) {
				const part = iban.slice( 0, i );
				const result = Format.iban( part, i < iban.length );
				Should( result.errors ).be.undefined();
			}
		} );

		it( "denies parts of 'AL68210501700012345679' while entering it as soon as the first two letters are available while accept German IBAN, only", () => {
			const iban = " AL68210501700012345679 ";

			for ( let i = 0; i <= iban.length; i++ ) {
				const part = iban.slice( 0, i );
				const result = Format.iban( part, i < iban.length, { countryCodes: ["de"] } );
				if ( i < 3 ) {
					Should( result.errors ).be.undefined();
				} else {
					result.errors.should.be.eql( ["@FORMATS.IBAN.INVALID_COUNTRY_CODE"] );
				}
			}
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

	describe( "exposes method bic() for validating BIC input which", () => {
		it( "is a function", () => {
			Format.bic.should.be.Function();
		} );

		it( "accepts 'BELADEBEXXX'", () => {
			const result = Format.bic( "BELADEBEXXX" );
			Should( result.errors ).be.undefined();
			Should( result.output ).be.equal( "BELADEBEXXX" );
		} );

		it( "accepts and normalizes ' beladebexxx '", () => {
			const result = Format.bic( " beladebexxx " );
			Should( result.errors ).be.undefined();
			Should( result.output ).be.equal( "BELADEBEXXX" );
		} );

		it( "accepts ' beladebexxx ' while entering it", () => {
			const bic = " beladebexxx ";

			for ( let i = 0; i <= bic.length; i++ ) {
				const part = bic.slice( 0, i );
				const result = Format.bic( part, i < bic.length );
				Should( result.errors ).be.undefined();
			}
		} );

		it( "accepts 'BELADEBE without trailing XXX'", () => {
			const result = Format.bic( "BELADEBE" );
			Should( result.errors ).be.undefined();
			Should( result.output ).be.equal( "BELADEBE" );
		} );

		it( "denies 'BELABEBEXXX' if only 'DE' is allowed and countryCode is case insensitive", () => {
			const result = Format.bic( "BELABEBEXXX" , null, { countryCodes: ["de"] } );
			Should( result.errors ).be.eql( ["@FORMATS.BIC.INVALID_COUNTRY_CODE"] );
			Should( result.output ).be.undefined();
		} );

		it( "accepts ' belabebexxx ' while entering it until having entered first 6 characters of BIC with country code mismatching", () => {
			const bic = " belabebexxx ";

			for ( let i = 0; i <= bic.length; i++ ) {
				const part = bic.slice( 0, i );
				const result = Format.bic( part, i < bic.length, { countryCodes: ["de"] } );

				if ( i < 7 ) {
					Should( result.errors ).be.undefined();
				} else {
					Should( result.errors ).be.eql( ["@FORMATS.BIC.INVALID_COUNTRY_CODE"] );
				}
			}
		} );

		it( "denies to short input", () => {
			const result = Format.bic( "BELABEBEX" );
			Should( result.errors ).be.eql( ["@VALIDATION.TOO_SHORT"] );
			Should( result.output ).be.undefined();
		} );

		it( "allows to short input if live", () => {
			const result = Format.bic( "BELABEBEX" , true );
			Should( result.errors ).be.undefined();
			Should( result.output ).be.eql( "BELABEBEX" );
		} );

		it( "denies to long input", () => {
			const result = Format.bic( "BELADEBEXXXX" );
			Should( result.errors ).be.eql( ["@VALIDATION.TOO_LONG"] );
			Should( result.output ).be.undefined();
		} );

		describe( "denies malformed input", () => {
			it( "only XXX as last 3", () => {
				const result = Format.bic( "BELADEBEX11" );
				Should( result.errors ).be.eql( ["@FORMATS.BIC.INVALID_FORMAT"] );
				Should( result.output ).be.undefined();
			} );

			it( "only 1X as LL", () => {
				const result = Format.bic( "BELA1EBEXXX" );
				Should( result.errors ).be.eql( ["@FORMATS.BIC.INVALID_FORMAT"] );
				Should( result.output ).be.undefined();
			} );

			it( "only XO as LL", () => {
				const result = Format.bic( "BELAXXBOXXX" );
				Should( result.errors ).be.eql( ["@FORMATS.BIC.INVALID_FORMAT"] );
				Should( result.output ).be.undefined();
			} );
		} );
	} );
} );
