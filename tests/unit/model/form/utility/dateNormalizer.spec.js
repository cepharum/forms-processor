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

import DateProcessor, { DateNormalizer } from "../../../../../src/model/form/utility/date";

describe( "Utility Class DateNormalizer", () => {
	it( "is available", () => {
		Should.exist( DateNormalizer );
	} );

	describe( "is constructable with 'yyyy-mm-dd'", () => {
		const normalizer = new DateNormalizer( "yyyy-mm-dd" );
		const normalizer2 = new DateNormalizer( "yy.m.d" );
		it( "has identified the right seperator ", () => {
			normalizer.seperator = "-";
			normalizer2.seperator = ".";
		} );
		it( "used the right format", () => {
			normalizer.format = "yyyy-mm-dd";
			normalizer.format = "yy.m.d";
		} );
		it( "identified the values correctly", () => {
			normalizer.identifiers.year = "yyyy";
			normalizer.identifiers.month = "mm";
			normalizer.identifiers.day = "dd";
			normalizer2.identifiers.year = "yy";
			normalizer2.identifiers.month = "m";
			normalizer2.identifiers.day = "d";
		} );
		it( "has constructed patterns", () => {
			Should.exist( normalizer.patterns );
			Should.exist( normalizer.patterns.complete );
			Should.exist( normalizer.patterns.year );
			Should.exist( normalizer.patterns.month );
			Should.exist( normalizer.patterns.day );
			Should.exist( normalizer2.patterns );
			Should.exist( normalizer2.patterns.complete );
			Should.exist( normalizer2.patterns.year );
			Should.exist( normalizer2.patterns.month );
			Should.exist( normalizer2.patterns.day );
		} );
		const patterns = normalizer.patterns;
		const patterns2 = normalizer2.patterns;
		const complete = patterns.complete;
		const complete2 = patterns2.complete;
		const dd = patterns.day;
		const mm = patterns.month;
		const yyyy = patterns.year;
		const d = patterns2.day;
		const m = patterns2.month;
		const yy = patterns2.year;

		it( "provides complete and partial patterns", () => {
			Should.exist( complete.acceptPartial );
			Should.exist( complete.regular );
			Should.exist( yyyy.acceptPartial );
			Should.exist( yyyy.regular );
			Should.exist( mm.acceptPartial );
			Should.exist( mm.regular );
			Should.exist( dd.acceptPartial );
			Should.exist( dd.regular );
			Should.exist( complete2.acceptPartial );
			Should.exist( complete2.regular );
			Should.exist( yy.acceptPartial );
			Should.exist( yy.regular );
			Should.exist( m.acceptPartial );
			Should.exist( m.regular );
			Should.exist( d.acceptPartial );
			Should.exist( d.regular );
		} );

		describe( "and the patterns work correctly", () => {
			it( "d acceptPartial", () => {
				d.acceptPartial.test( "" ).should.be.true( "" );
				d.acceptPartial.test( "0" ).should.be.true( "0" );
				d.acceptPartial.test( "9" ).should.be.true( "9" );
				d.acceptPartial.test( "10" ).should.be.true( "10" );
				d.acceptPartial.test( "19" ).should.be.true( "19" );
				d.acceptPartial.test( "20" ).should.be.true( "20" );
				d.acceptPartial.test( "29" ).should.be.true( "29" );
				d.acceptPartial.test( "30" ).should.be.true( "30" );
				d.acceptPartial.test( "32" ).should.not.be.true( "32" );
				d.acceptPartial.test( "00" ).should.not.be.true( "00" );
				d.acceptPartial.test( "-1" ).should.not.be.true( "-1" );
				d.acceptPartial.test( "122" ).should.not.be.true( "122" );
				d.acceptPartial.test( "dd" ).should.not.be.true( "dd" );
				d.acceptPartial.test( "d3" ).should.not.be.true( "d3" );
			} );
			it( "d regular", () => {
				d.regular.test( "9" ).should.be.true( "9" );
				d.regular.test( "01" ).should.be.true( "01" );
				d.regular.test( "09" ).should.be.true( "09" );
				d.regular.test( "10" ).should.be.true( "10" );
				d.regular.test( "19" ).should.be.true( "19" );
				d.regular.test( "20" ).should.be.true( "20" );
				d.regular.test( "29" ).should.be.true( "29" );
				d.regular.test( "30" ).should.be.true( "30" );
				d.regular.test( "0" ).should.not.be.true( "0" );
				d.regular.test( "32" ).should.not.be.true( "32" );
				d.regular.test( "00" ).should.not.be.true( "00" );
				d.regular.test( "-1" ).should.not.be.true( "-1" );
				d.regular.test( "122" ).should.not.be.true( "122" );
				d.regular.test( "dd" ).should.not.be.true( "dd" );
				d.regular.test( "d3" ).should.not.be.true( "d3" );
			} );
			it( "dd acceptPartial", () => {
				dd.acceptPartial.test( "" ).should.be.true( "" );
				dd.acceptPartial.test( "0" ).should.be.true( "0" );
				dd.acceptPartial.test( "3" ).should.be.true( "3" );
				dd.acceptPartial.test( "9" ).should.be.not.true( "9" );
				dd.acceptPartial.test( "10" ).should.be.true( "10" );
				dd.acceptPartial.test( "19" ).should.be.true( "19" );
				dd.acceptPartial.test( "20" ).should.be.true( "20" );
				dd.acceptPartial.test( "29" ).should.be.true( "29" );
				dd.acceptPartial.test( "30" ).should.be.true( "30" );
				dd.acceptPartial.test( "32" ).should.not.be.true( "32" );
				dd.acceptPartial.test( "00" ).should.not.be.true( "00" );
				dd.acceptPartial.test( "-1" ).should.not.be.true( "-1" );
				dd.acceptPartial.test( "122" ).should.not.be.true( "122" );
				dd.acceptPartial.test( "dd" ).should.not.be.true( "dd" );
				dd.acceptPartial.test( "d3" ).should.not.be.true( "d3" );
			} );
			it( "dd regular", () => {
				dd.regular.test( "01" ).should.be.true( "01" );
				dd.regular.test( "09" ).should.be.true( "09" );
				dd.regular.test( "10" ).should.be.true( "10" );
				dd.regular.test( "19" ).should.be.true( "19" );
				dd.regular.test( "20" ).should.be.true( "20" );
				dd.regular.test( "29" ).should.be.true( "29" );
				dd.regular.test( "30" ).should.be.true( "30" );
				dd.regular.test( "32" ).should.not.be.true( "32" );
				dd.regular.test( "00" ).should.not.be.true( "00" );
				dd.regular.test( "0" ).should.not.be.true( "0" );
				dd.regular.test( "9" ).should.not.be.true( "9" );
				dd.regular.test( "-1" ).should.not.be.true( "-1" );
				dd.regular.test( "122" ).should.not.be.true( "122" );
				dd.regular.test( "dd" ).should.not.be.true( "dd" );
				dd.regular.test( "d3" ).should.not.be.true( "d3" );
			} );
			it( "m acceptPartial", () => {
				m.acceptPartial.test( "" ).should.be.true( "" );
				m.acceptPartial.test( "0" ).should.be.true( "0" );
				m.acceptPartial.test( "1" ).should.be.true( "1" );
				m.acceptPartial.test( "9" ).should.be.true( "9" );
				m.acceptPartial.test( "1" ).should.be.true( "01" );
				m.acceptPartial.test( "9" ).should.be.true( "09" );
				m.acceptPartial.test( "10" ).should.be.true( "10" );
				m.acceptPartial.test( "12" ).should.be.true( "12" );
				m.acceptPartial.test( "13" ).should.not.be.true( "13" );
				m.acceptPartial.test( "32" ).should.not.be.true( "32" );
				m.acceptPartial.test( "00" ).should.not.be.true( "00" );
				m.acceptPartial.test( "-1" ).should.not.be.true( "-1" );
				m.acceptPartial.test( "122" ).should.not.be.true( "122" );
				m.acceptPartial.test( "dd" ).should.not.be.true( "dd" );
				m.acceptPartial.test( "d3" ).should.not.be.true( "d3" );
			} );
			it( "m regular", () => {
				m.regular.test( "1" ).should.be.true( "1" );
				m.regular.test( "9" ).should.be.true( "9" );
				m.regular.test( "01" ).should.be.true( "01" );
				m.regular.test( "09" ).should.be.true( "09" );
				m.regular.test( "10" ).should.be.true( "10" );
				m.regular.test( "12" ).should.be.true( "12" );
				m.regular.test( "13" ).should.not.be.true( "13" );
				m.regular.test( "32" ).should.not.be.true( "32" );
				m.regular.test( "0" ).should.not.be.true( "0" );
				m.regular.test( "00" ).should.not.be.true( "00" );
				m.regular.test( "-1" ).should.not.be.true( "-1" );
				m.regular.test( "122" ).should.not.be.true( "122" );
				m.regular.test( "dd" ).should.not.be.true( "dd" );
				m.regular.test( "d3" ).should.not.be.true( "d3" );
			} );
			it( "mm acceptPartial", () => {
				mm.acceptPartial.test( "" ).should.be.true( "" );
				mm.acceptPartial.test( "0" ).should.be.true( "0" );
				mm.acceptPartial.test( "1" ).should.be.true( "1" );
				mm.acceptPartial.test( "9" ).should.be.not.true( "9" );
				mm.acceptPartial.test( "01" ).should.be.true( "01" );
				mm.acceptPartial.test( "09" ).should.be.true( "09" );
				mm.acceptPartial.test( "10" ).should.be.true( "10" );
				mm.acceptPartial.test( "12" ).should.be.true( "12" );
				mm.acceptPartial.test( "13" ).should.not.be.true( "13" );
				mm.acceptPartial.test( "32" ).should.not.be.true( "32" );
				mm.acceptPartial.test( "00" ).should.not.be.true( "00" );
				mm.acceptPartial.test( "-1" ).should.not.be.true( "-1" );
				mm.acceptPartial.test( "122" ).should.not.be.true( "122" );
				mm.acceptPartial.test( "dd" ).should.not.be.true( "dd" );
				mm.acceptPartial.test( "d3" ).should.not.be.true( "d3" );
			} );
			it( "mm regular", () => {
				mm.regular.test( "01" ).should.be.true( "01" );
				mm.regular.test( "09" ).should.be.true( "09" );
				mm.regular.test( "10" ).should.be.true( "10" );
				mm.regular.test( "12" ).should.be.true( "12" );
				mm.regular.test( "13" ).should.not.be.true( "13" );
				mm.regular.test( "32" ).should.not.be.true( "32" );
				mm.regular.test( "0" ).should.not.be.true( "0" );
				mm.regular.test( "00" ).should.not.be.true( "00" );
				mm.regular.test( "-1" ).should.not.be.true( "-1" );
				mm.regular.test( "122" ).should.not.be.true( "122" );
				mm.regular.test( "dd" ).should.not.be.true( "dd" );
				mm.regular.test( "d3" ).should.not.be.true( "d3" );
			} );
			it( "yy acceptPartial", () => {
				yy.acceptPartial.test( "" ).should.be.true( "" );
				yy.acceptPartial.test( "0" ).should.be.true( "0" );
				yy.acceptPartial.test( "1" ).should.be.true( "1" );
				yy.acceptPartial.test( "9" ).should.be.true( "9" );
				yy.acceptPartial.test( "01" ).should.be.true( "01" );
				yy.acceptPartial.test( "09" ).should.be.true( "09" );
				yy.acceptPartial.test( "10" ).should.be.true( "10" );
				yy.acceptPartial.test( "12" ).should.be.true( "12" );
				yy.acceptPartial.test( "99" ).should.be.true( "99" );
				yy.acceptPartial.test( "00" ).should.be.true( "00" );
				yy.acceptPartial.test( "100" ).should.not.be.true( "100" );
				yy.acceptPartial.test( "20020" ).should.not.be.true( "20020" );
				yy.acceptPartial.test( "-1" ).should.not.be.true( "-1" );
				yy.acceptPartial.test( "dd" ).should.not.be.true( "dd" );
				yy.acceptPartial.test( "d3" ).should.not.be.true( "d3" );
			} );
			it( "yy regular", () => {
				yy.acceptPartial.test( "01" ).should.be.true( "01" );
				yy.acceptPartial.test( "09" ).should.be.true( "09" );
				yy.acceptPartial.test( "10" ).should.be.true( "10" );
				yy.acceptPartial.test( "12" ).should.be.true( "12" );
				yy.acceptPartial.test( "99" ).should.be.true( "99" );
				yy.acceptPartial.test( "00" ).should.be.true( "00" );
				yy.acceptPartial.test( "100" ).should.not.be.true( "100" );
				yy.acceptPartial.test( "20020" ).should.not.be.true( "20020" );
				yy.acceptPartial.test( "-1" ).should.not.be.true( "-1" );
				yy.acceptPartial.test( "dd" ).should.not.be.true( "dd" );
				yy.acceptPartial.test( "d3" ).should.not.be.true( "d3" );
			} );

			it( "yyyy-mm-dd acceptPartial", () => {
				complete.acceptPartial.test( "" ).should.be.true( "empty" );
				complete.acceptPartial.test( "0" ).should.be.true( "0" );
				complete.acceptPartial.test( "13" ).should.be.true( "13" );
				complete.acceptPartial.test( "1333" ).should.be.true( "1333" );
				complete.acceptPartial.test( "1333-" ).should.be.true( "1333-" );
				complete.acceptPartial.test( "1333-0" ).should.be.true( "1333-0" );
				complete.acceptPartial.test( "1333-09" ).should.be.true( "1333-09" );
				complete.acceptPartial.test( "1333-12-" ).should.be.true( "1333-12-" );
				complete.acceptPartial.test( "1333-12-2" ).should.be.true( "1333-12-2" );
				complete.acceptPartial.test( "1333-12-22" ).should.be.true( "1333-12-22" );
				complete.acceptPartial.test( "-" ).should.not.be.true( "-" );
				complete.acceptPartial.test( "1333-12-223" ).should.not.be.true( "1333-12-223" );
				complete.acceptPartial.test( "1x33-12-22" ).should.not.be.true( "1x33-12-22" );
				complete.acceptPartial.test( "12332-12-22" ).should.not.be.true( "12332-12-22" );
			} );
			it( "yyyy-mm-dd regular", () => {
				complete.regular.test( "" ).should.not.be.true( "empty" );
				complete.regular.test( "0" ).should.not.be.true( "0" );
				complete.regular.test( "13" ).should.not.be.true( "13" );
				complete.regular.test( "1333" ).should.not.be.true( "1333" );
				complete.regular.test( "1333-" ).should.not.be.true( "1333-" );
				complete.regular.test( "1333-0" ).should.not.be.true( "1333-0" );
				complete.regular.test( "1333-09" ).should.not.be.true( "1333-09" );
				complete.regular.test( "1333-12-" ).should.not.be.true( "1333-12-" );
				complete.regular.test( "1333-12-2" ).should.not.be.true( "1333-12-2" );
				complete.regular.test( "1333-12-22" ).should.be.true( "1333-12-22" );
				complete.regular.test( "1333-12-223" ).should.not.be.true( "1333-12-223" );
				complete.regular.test( "1x33-12-22" ).should.not.be.true( "1x33-12-22" );
				complete.regular.test( "12332-12-22" ).should.not.be.true( "12332-12-22" );
			} );
		} );
	} );

	describe( "it denies unusable formats", () => {
		it( "yyyy-mm-dd-mm" , () => ( () => new DateProcessor( "yyyy-mm-dd-mm" ) ).should.throw() );
		it( "yyyy-mmm-dd" , () => ( () => new DateProcessor( "yyyy-mmm-dd" ) ).should.throw() );
		it( "yyy-mm-dd" , () => ( () => new DateProcessor( "yyy-mm-dd" ) ).should.throw() );
		it( "y-mm-dd" , () => ( () => new DateProcessor( "y-mm-dd" ) ).should.throw() );
		it( "yyyy-mm-ddd" , () => ( () => new DateProcessor( "yyyy-mm-ddd" ) ).should.throw() );
		it( "2012-12-12" , () => ( () => new DateProcessor( "2012-12-12" ) ).should.throw() );
	} );

	describe( "it has a normalize method", () => {
		let normalizer = false;

		it( "that is not static", () => {
			normalizer = new DateNormalizer( "yyyy-mm-dd" );
			Should.exist( normalizer.normalize );
		} );

		it( "that turns a string into a date", () => {
			const parsedDate = normalizer.normalize( "2012-12-12" );
			parsedDate.should.be.instanceof( Date );
			parsedDate.getFullYear().should.be.eql( 2012 );
			parsedDate.getMonth().should.be.eql( 11 );
			parsedDate.getDate().should.be.eql( 12 );
		} );
		it( "is a function", () => {
			normalizer.normalize.should.be.Function();
		} );
		it( "and denies a malformed string", () => {
			Should( () => normalizer.normalize( "20-12-12" ) ).throw();
			Should( () => normalizer.normalize( "20x2-12-12" ) ).throw();
			Should( () => normalizer.normalize( "2012-12-1" ) ).throw();
			Should( () => normalizer.normalize( "2012-1-12" ) ).throw();
		} );

		describe( "throws error when format does not match", () => {
			it( "22-09-2012, yyyy-mm-dd" , () => ( () => new DateNormalizer( "yyyy-mm-dd" ).normalize( "22-09-2012" ) ).should.throw() );
			it( "2012-09-2012, dd-mm-yyyy", () => ( () => new DateNormalizer( "dd-mm-yyyy" ).normalize( "2012-09-2012" ) ).should.throw() );
			it( "22-209-12, yy-mm-dd", () => ( () => new DateNormalizer( "yy-mm-dd" ).normalize( "22-209-12" ) ).should.throw() );
			it( "22-09-132, yy-mm-dd", () => ( () => new DateNormalizer( "yy-mm-dd" ).normalize( "22-09-132" ) ).should.throw() );
			it( "2022-09-12, yy-mm-dd", () => ( () => new DateNormalizer( "yy-mm-dd" ).normalize( "2022-09-12" ) ).should.throw() );
			it( "2022-09-12, yy-mm--dd", () => ( () => new DateNormalizer( "yy-mm--dd" ) ).should.throw() );
			it( "2022-09-12, yy-mmm-dd", () => ( () => new DateNormalizer( "yy-mmm-dd" ) ).should.throw() );
			it( "2022-09-12, yy-mm-ddd", () => ( () => new DateNormalizer( "yy-mm-ddd" ) ).should.throw() );
			it( "when the input does not match", () => {
				( () => new DateNormalizer( "yyyy-mm-dd" ).normalize( "22-09-20" , ) ).should.throw();
				( () => new DateNormalizer( "yyyy-mm-dd" ).normalize( "2012-13-20" ) ).should.throw();
				( () => new DateNormalizer( "yyyy-mm-dd" ).normalize( "2012-12-34" ) ).should.throw();
				( () => new DateNormalizer( "yy-mm-dd" ).normalize( "22-09--12" ) ).should.throw();
			} );
		} );

		describe( "parses date with format 'yyyy.mm.dd'", () => {
			let date = false;
			it( "is instance of Date", () => {
				date = new DateNormalizer( "yyyy.mm.dd" ).normalize( "2012.09.12" );
				date.should.be.instanceof( Date );
			} );
			it( "has the right day", () => {
				date.getDate().should.be.eql( 12 );
			} );
			it( "has the right month", () => {
				date.getMonth().should.be.eql( 8 );
			} );
			it( "has the right year", () => {
				date.getFullYear().should.be.eql( 2012 );
			} );
		} );

		describe( "parses date with format 'M.d.YY'", () => {
			let date = false;
			it( "is instance of Date", () => {
				date = new DateNormalizer( "M.d.YY" ).normalize( "12.09.30" );
				date.should.be.instanceof( Date );
			} );
			it( "has the right day", () => {
				date.getDate().should.be.eql( 9 );
			} );
			it( "has the right month", () => {
				date.getMonth().should.be.eql( 11 );
			} );
			it( "has the right year", () => {
				date.getFullYear().should.be.eql( 1930 );
			} );
		} );

		describe( "parses date with format 'yyyy-mm-dd'", () => {
			const date = new DateNormalizer( "yyyy-mm-dd" ).normalize( "20", { acceptPartial: true } );
			it( "is instance of Date", () => {
				date.should.be.instanceof( Date );
			} );
			it( "has the right year", () => {
				date.getFullYear().should.be.eql( 20 );
			} );
		} );

		describe( "parses date with format 'yy-mm-dd'", () => {
			const processor = new DateNormalizer( "yy-mm-dd" );
			const date = processor.normalize( "12-09-12" );
			it( "is instance of Date", () => {
				date.should.be.instanceof( Date );
			} );
			it( "has the right day", () => {
				date.getDate().should.be.eql( 12 );
			} );
			it( "has the right month", () => {
				date.getMonth().should.be.eql( 8 );
			} );
			it( "has the right year", () => {
				date.getFullYear().should.be.eql( 2012 );
			} );
			const date2 = processor.normalize( "22-09-12" );
			it( "has the right year", () => {
				date2.getFullYear().should.be.eql( 1922 );
			} );
			const date3 = processor.normalize( "22-09-12" , { acceptPartial: true, yearBuffer: 20 } );
			it( "handles year buffer right if year is in buffer", () => {
				date3.getFullYear().should.be.eql( 2022 );
			} );
			const date4 = processor.normalize( "70-09-12" , { acceptPartial: true, yearBuffer: 20 } );
			it( "handles year buffer right if year is not in buffer", () => {
				date4.getFullYear().should.be.eql( 1970 );
			} );
		} );

		describe( "parses date with format 'd-m-yy'", () => {
			const processor = new DateNormalizer( "d-m-yy" );
			const date = processor.normalize( "2-9-12" );
			it( "is instance of Date", () => {
				date.should.be.instanceof( Date );
			} );
			it( "has the right day", () => {
				date.getDate().should.be.eql( 2 );
			} );
			it( "has the right month", () => {
				date.getMonth().should.be.eql( 8 );
			} );
			it( "has the right year", () => {
				date.getFullYear().should.be.eql( 2012 );
			} );
			const date2 = processor.normalize( "12-09-22" );
			it( "has the right year", () => {
				date2.getFullYear().should.be.eql( 1922 );
			} );
			const date3 = processor.normalize( "12-09-22" , { acceptPartial: true, yearBuffer: 20 } );
			it( "handles year buffer right if year is in buffer", () => {
				date3.getFullYear().should.be.eql( 2022 );
			} );
			const date4 = processor.normalize( "22-09-70" , { acceptPartial: true, yearBuffer: 20 } );
			it( "handles year buffer right if year is not in buffer", () => {
				date4.getFullYear().should.be.eql( 1970 );
			} );
		} );
	} );
} );
