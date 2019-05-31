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

import { DateProcessor } from "../../../../../src/model/form/utility/date";

/**
 * Calculates date different from provided one by given number of months.
 *
 * @param {Date} refDate reference date
 * @param {int} numberOfMonths number of months to adjust provided date
 * @return {Date} resulting date
 */
function adjustMonth( refDate, numberOfMonths ) {
	const result = new Date( refDate );

	// choose safe date to prevent auto-adjustments on using `setMonth()` below
	result.setDate( 20 );

	// find last day of desired month
	result.setMonth( result.getMonth() + numberOfMonths + 1 );
	result.setDate( 0 );

	// recover day of month of reference date, but limit to valid range of dates
	// in resulting month
	if ( result.getDate() > refDate.getDate() ) {
		result.setDate( refDate.getDate() );
	}

	return result;
}


describe( "Utility Class DateProcessor", () => {
	it( "is available", () => {
		Should.exist( DateProcessor );
	} );

	describe( "can be constructed", () => {
		it( "with no argument", () => {
			const processor = new DateProcessor();
			processor.format.should.be.eql( ["yyyy-mm-dd"] );
			processor.normalizer["yyyy-mm-dd"].format.should.be.eql( "yyyy-mm-dd" );
		} );
		it( "with a string", () => {
			const format = "mm-yyyy-dd";
			const processor = new DateProcessor( format );
			processor.format.should.be.eql( [format] );
			processor.normalizer[format].format.should.be.eql( format );
		} );
		it( "with an array of strings", () => {
			const format = [ "mm-yyyy-dd", "dd-mm-yyyy", "yy-m-d" ];
			const processor = new DateProcessor( format );
			processor.format.should.be.eql( format );
			for( let i = 0, l = format.length; i < l; i++ ) {
				processor.normalizer[format[i]].format.should.be.eql( format[i] );
			}
		} );
	} );

	describe( "it handles an array of formats", () => {
		let processor = false;

		it( "initializes with an array of formats", () => {
			processor = new DateProcessor();
			processor.format.should.be.eql( ["yyyy-mm-dd"] );
			processor.normalizer["yyyy-mm-dd"].format.should.be.eql( "yyyy-mm-dd" );
		} );

		it( "exposes method addFormat", () => {
			processor.addFormat.should.be.a.Function();
		} );

		it( "which can add new formats", () => {
			processor.addFormat( "d-m-yy" );
			processor.format.should.be.eql( [ "yyyy-mm-dd", "d-m-yy" ] );
		} );

		it( "and normalizes using any of these formats", () => {
			const d1 = processor.normalize( "1212-12-12" );
			const d2 = processor.normalize( "12-12-12" );
			d1.should.be.instanceof( Date );
			d2.should.be.instanceof( Date );
		} );
	} );

	describe( "exposes method normalizeSelector", () => {
		const { normalizeSelector } = DateProcessor;

		it( "is a function", () => {
			normalizeSelector.should.be.Function();
		} );

		it( "requires one Parameter", () => {
			normalizeSelector.should.have.length( 1 );
		} );

		describe( "it accepts selectors" ,() => {
			it( "now || today", () => {
				const now = normalizeSelector( "noW" );
				const today = normalizeSelector( "toDay" );
				const date = new Date();
				Math.floor( now.getTime() / 8.64e+7 ).should.be.eql( Math.floor( date.getTime() / 8.64e+7 ) );
				Math.floor( today.getTime() / 8.64e+7 ).should.be.eql( Math.floor( date.getTime() / 8.64e+7 ) );
				Math.floor( today.getTime() / 8.64e+7 ).should.be.eql( Math.floor( now.getTime() / 8.64e+7 ) );
			} );

			it( "-x", () => {
				const date = normalizeSelector( "-9" );
				const noTime = Math.floor( date.getTime() / 8.64e+7 );
				const now = new Date();
				const nowNoTime = Math.floor( now.getTime() / 8.64e+7 );
				( nowNoTime - noTime ).should.be.eql( 9 );
			} );

			it( "+x", () => {
				const date = normalizeSelector( "+9" );
				const noTime = Math.floor( date.getTime() / 8.64e+7 );
				const now = new Date();
				const nowNoTime = Math.floor( now.getTime() / 8.64e+7 );
				( nowNoTime - noTime ).should.be.eql( -9 );
			} );

			it( "-xM", () => {
				const processed = normalizeSelector( "-9M" );
				const calculated = adjustMonth( new Date(), -9 );

				const processedNoTime = Math.floor( processed.getTime() / 8.64e+7 );
				const calculatedNoTime = Math.floor( calculated.getTime() / 8.64e+7 );

				calculatedNoTime.should.be.eql( processedNoTime );
			} );

			it( "-xBOM", () => {
				const processed = normalizeSelector( "-9BOM" );
				const calculated = adjustMonth( new Date(), -9 );

				calculated.setDate( 1 );

				const processedNoTime = Math.floor( processed.getTime() / 8.64e+7 );
				const calculatedNoTime = Math.floor( calculated.getTime() / 8.64e+7 );

				calculatedNoTime.should.be.eql( processedNoTime );
			} );

			it( "-xEOM", () => {
				const processed = normalizeSelector( "-9EOM" );
				const calculated = adjustMonth( new Date(), -9 );

				calculated.setDate( 20 );
				calculated.setMonth( calculated.getMonth() + 1 );
				calculated.setDate( 0 );

				const processedNoTime = Math.floor( processed.getTime() / 8.64e+7 );
				const calculatedNoTime = Math.floor( calculated.getTime() / 8.64e+7 );

				calculatedNoTime.should.be.eql( processedNoTime );
			} );

			it( "+xM", () => {
				const processed = normalizeSelector( "+9M" );
				const calculated = adjustMonth( new Date(), 9 );

				const processedNoTime = Math.floor( processed.getTime() / 8.64e+7 );
				const calculatedNoTime = Math.floor( calculated.getTime() / 8.64e+7 );

				calculatedNoTime.should.be.eql( processedNoTime );
			} );

			it( "+xBOM", () => {
				const processed = normalizeSelector( "+9BOM" );
				const calculated = adjustMonth( new Date(), 9 );

				calculated.setDate( 1 );

				const processedNoTime = Math.floor( processed.getTime() / 8.64e+7 );
				const calculatedNoTime = Math.floor( calculated.getTime() / 8.64e+7 );

				calculatedNoTime.should.be.eql( processedNoTime );
			} );

			it( "+xEOM", () => {
				const processed = normalizeSelector( "+9EOM" );
				const calculated = adjustMonth( new Date(), 9 );

				calculated.setDate( 20 );
				calculated.setMonth( calculated.getMonth() + 1 );
				calculated.setDate( 0 );

				const processedNoTime = Math.floor( processed.getTime() / 8.64e+7 );
				const calculatedNoTime = Math.floor( calculated.getTime() / 8.64e+7 );

				calculatedNoTime.should.be.eql( processedNoTime );
			} );

			it( "-xY", () => {
				const processed = normalizeSelector( "-9Y" );
				const calculated = new Date();

				( processed.getFullYear() - calculated.getFullYear() ).should.be.eql( -9 );

				processed.getMonth().should.be.equal( calculated.getMonth() );
				processed.getDate().should.be.equal( calculated.getDate() );
			} );

			it( "+xY", () => {
				const processed = normalizeSelector( "+9Y" );
				const calculated = new Date();

				( processed.getFullYear() - calculated.getFullYear() ).should.be.eql( 9 );

				processed.getMonth().should.be.equal( calculated.getMonth() );
				processed.getDate().should.be.equal( calculated.getDate() );
			} );

			it( "+xY starting from 2016-02-29", () => {
				const ref = new Date( 2016, 1, 29, 12, 0, 0 );
				const processed = normalizeSelector( "+3Y", { reference: ref } );

				( processed.getFullYear() - ref.getFullYear() ).should.be.eql( 3 );

				processed.getMonth().should.be.equal( 1 );
				processed.getDate().should.be.equal( 28 );
			} );

			it( "-xBD", () => {
				const processed = normalizeSelector( "-23BD" );

				processed.should.be.instanceof( Date );
			} );

			it( "+xBD", () => {
				const processed = normalizeSelector( "+39BD" );

				processed.should.be.instanceof( Date );
			} );
		} );
	} );

	describe( "exposes method normalize() which" ,() => {
		const initializedDateProcessor = new DateProcessor();
		it( "is a function", () => {
			initializedDateProcessor.normalize.should.be.Function();
		} );

		it( "requires one parameters", () => {
			initializedDateProcessor.normalize.should.have.length( 1 );
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
			let date;

			before( () => {
				date = new DateProcessor( "yyyy-mm-dd" ).normalize( "2012-09-12" );
			} );

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
		} );

		describe( "partially date with format 'yyyy-mm-dd'", () => {
			let date = false;
			it( "is instance of Date", () => {
				date = new DateProcessor( "yyyy-mm-dd" ).normalize( "20", { acceptPartial: true } );
				date.should.be.instanceof( Date );
			} );
			it( "has the right year", () => {
				date.getFullYear().should.be.eql( 20 );
			} );
		} );

		describe( "parses date with format 'yy-m-d'", () => {
			const processor = new DateProcessor( "yy-m-d" );
			let date = false;
			it( "is instance of Date", () => {
				date = processor.normalize( "12-9-12" );
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
			it( "has the right year", () => {
				const date2 = processor.normalize( "22-09-12" );
				date2.getFullYear().should.be.eql( 1922 );
			} );
			it( "handles year buffer right if year is in buffer", () => {
				const date3 = processor.normalize( "22-09-12", { yearBuffer: 20 } );
				date3.getFullYear().should.be.eql( 2022 );
			} );
			it( "handles year buffer right if year is not in buffer", () => {
				const date4 = processor.normalize( "70-09-12" , { yearBuffer: 20 } );
				date4.getFullYear().should.be.eql( 1970 );
			} );
		} );

		describe( "parses date with format 'd-m-yy'", () => {
			const processor = new DateProcessor( "d-m-yy", { yearBuffer: 20 } );
			let date = false;
			it( "is instance of Date", () => {
				date = processor.normalize( "12-9-12" );
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
			it( "has the right year", () => {
				const date2 = processor.normalize( "12-09-22" );
				date2.getFullYear().should.be.eql( 1922 );
			} );
			it( "handles year buffer right if year is in buffer", () => {
				const date3 = processor.normalize( "12-09-22", { yearBuffer: 20 } );
				date3.getFullYear().should.be.eql( 2022 );
			} );
			it( "handles year buffer right if year is not in buffer", () => {
				const date4 = processor.normalize( "12-09-70" , { yearBuffer: 20 } );
				date4.getFullYear().should.be.eql( 1970 );
			} );
		} );

		describe( "parses date with format 'yy-mm-dd'", () => {
			const processor = new DateProcessor( "yy-mm-dd" );
			let date = false;
			it( "is instance of Date", () => {
				date = processor.normalize( "12-09-12" );
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
			it( "has the right year", () => {
				const date2 = processor.normalize( "22-09-12" );
				date2.getFullYear().should.be.eql( 1922 );
			} );
			it( "handles year buffer right if year is in buffer", () => {
				const date3 = processor.normalize( "22-09-12", { yearBuffer: 20 } );
				date3.getFullYear().should.be.eql( 2022 );
			} );
			it( "handles year buffer right if year is not in buffer", () => {
				const date4 = processor.normalize( "70-09-12" , { yearBuffer: 20 } );
				date4.getFullYear().should.be.eql( 1970 );
			} );
		} );
	} );
} );
