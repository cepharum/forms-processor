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

import DateProcessor from "../../../../../src/model/form/utility/date";

describe( "Utility Class Date", () => {
	it( "is available", () => {
		Should.exist( DateProcessor );
	} );

	describe( "exposes method normalize() which" ,() => {
		const initializedDateProcessor = new DateProcessor();
		it( "is a function", () => {
			initializedDateProcessor.normalize.should.be.Function();
		} );

		it( "requires three parameters", () => {
			initializedDateProcessor.normalize.should.have.length( 3 );
		} );

		describe( "throws error when format does not match", () => {
			it( "22-09-2012, yyyy-mm-dd" , () => ( () => new DateProcessor( "yyyy-mm-dd" ).normalize( "22-09-2012" ) ).should.throw() );
			it( "2012-09-2012, dd-mm-yyyy", () => ( () => new DateProcessor( "dd-mm-yyyy" ).normalize( "2012-09-2012" ) ).should.throw() );
			it( "22-209-12, yy-mm-dd", () => ( () => new DateProcessor( "yy-mm-dd" ).normalize( "22-209-12" ) ).should.throw() );
			it( "22-09-132, yy-mm-dd", () => ( () => new DateProcessor( "yy-mm-dd" ).normalize( "22-09-132" ) ).should.throw() );
			it( "2022-09-12, yy-mm-dd", () => ( () => new DateProcessor( "yy-mm-dd" ).normalize( "2022-09-12" ) ).should.throw() );
			it( "2022-09-12, yy-mm--dd", () => ( () => new DateProcessor( "yy-mm--dd" ) ).should.throw() );
			it( "2022-09-12, yy-mmm-dd", () => ( () => new DateProcessor( "yy-mmm-dd" ) ).should.throw() );
			it( "2022-09-12, yy-mm-ddd", () => ( () => new DateProcessor( "yy-mm-ddd" ) ).should.throw() );
			it( "when the input does not match", () => {
				( () => new DateProcessor( "yyyy-mm-dd" ).normalize( "22-09-20" , false ) ).should.throw();
				( () => new DateProcessor( "yyyy-mm-dd" ).normalize( "2012-13-20" , false ) ).should.throw();
				( () => new DateProcessor( "yyyy-mm-dd" ).normalize( "2012-12-34" , false ) ).should.throw();
				( () => new DateProcessor( "yy-mm-dd" ).normalize( "22-09--12" ) ).should.throw();
			} );
		} );

		describe( "parses date with format 'yyyy-mm-dd'", () => {
			const date = new DateProcessor( "yyyy-mm-dd" ).normalize( "2012-09-12" ).output;
			it( "is instance of Date", () => {
				date.value.should.be.instanceof( Date );
			} );
			it( "has the right day", () => {
				date.value.getDate().should.be.eql( 12 );
			} );
			it( "has the right month", () => {
				date.value.getMonth().should.be.eql( 8 );
			} );
			it( "has the right year", () => {
				date.value.getFullYear().should.be.eql( 2012 );
			} );
		} );

		describe( "parses date with format 'yyyy-mm-dd'", () => {
			const date = new DateProcessor( "yyyy-mm-dd" ).normalize( "20", true ).output;
			it( "is instance of Date", () => {
				date.value.should.be.instanceof( Date );
			} );
			it( "has the right year", () => {
				date.value.getFullYear().should.be.eql( 20 );
			} );
		} );

		describe( "parses date with format 'yy-mm-dd'", () => {
			const processor = new DateProcessor( "yy-mm-dd" );
			const date = processor.normalize( "12-09-12" ).output;
			it( "is instance of Date", () => {
				date.value.should.be.instanceof( Date );
			} );
			it( "has the right day", () => {
				date.value.getDate().should.be.eql( 12 );
			} );
			it( "has the right month", () => {
				date.value.getMonth().should.be.eql( 8 );
			} );
			it( "has the right year", () => {
				date.value.getFullYear().should.be.eql( 2012 );
			} );
			const date2 = processor.normalize( "22-09-12" ).output;
			it( "has the right year", () => {
				date2.value.getFullYear().should.be.eql( 1922 );
			} );
			const date3 = processor.normalize( "22-09-12" , false, { yearBuffer: 20 } ).output;
			it( "handles year buffer right if year is in buffer", () => {
				date3.value.getFullYear().should.be.eql( 2022 );
			} );
			const date4 = processor.normalize( "70-09-12" , false, { yearBuffer: 20 } ).output;
			it( "handles year buffer right if year is not in buffer", () => {
				date4.value.getFullYear().should.be.eql( 1970 );
			} );
		} );
	} );
} );
