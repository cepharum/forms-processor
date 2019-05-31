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

import Should from "should";

import { PartialDate } from "../../../../../src/model/form/utility/date";

describe( "Utility file date.js exposes class PartialDate which", () => {
	it( "is available", () => {
		Should.exist( PartialDate );
	} );

	it( "has instances that derive from Date", () => {
		new PartialDate().should.be.instanceOf( Date );
	} );

	it( "exposes property indicating whether date has been provided completely or not", () => {
		new PartialDate().should.have.property( "isIncompleteDate" ).which.is.a.Boolean();
	} );

	it( "exposes property indicating whether time of day has been provided completely or not", () => {
		new PartialDate().should.have.property( "isIncompleteTimeOfDay" ).which.is.a.Boolean();
	} );

	it( "is considered incomplete date by default", () => {
		new PartialDate().isIncompleteDate.should.be.true();
	} );

	it( "is considered incomplete time of day by default", () => {
		new PartialDate().isIncompleteTimeOfDay.should.be.true();
	} );

	it( "keeps considering date incomplete while explicitly setting month, only", () => {
		for ( let month = 0; month < 12; month++ ) {
			const date = new PartialDate();
			date.setMonth( month );
			date.isIncompleteDate.should.be.true();
		}
	} );

	it( "keeps considering date incomplete while explicitly setting day of month, only", () => {
		for ( let dayOfMonth = 1; dayOfMonth < 32; dayOfMonth++ ) {
			const date = new PartialDate();
			date.setDate( dayOfMonth );
			date.isIncompleteDate.should.be.true();
		}
	} );

	it( "keeps considering date incomplete while explicitly setting year, only", () => {
		for ( let year = 1900; year < 2100; year++ ) {
			const date = new PartialDate();
			date.setFullYear( year );
			date.isIncompleteDate.should.be.true();
		}
	} );

	it( "keeps considering date incomplete while explicitly setting month and day of month", () => {
		const days = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

		for ( let month = 0; month < 12; month++ ) {
			for ( let day = 0; day < days[month]; day++ ) {
				const date = new PartialDate();
				date.setDate( day );
				date.setMonth( month );
				date.isIncompleteDate.should.be.true();
			}
		}
	} );

	it( "fails to keep assigned month when combined with a given day of month would result in invalid date", () => {
		const date = new PartialDate();
		date.setDate( 31 );
		date.setMonth( 8 ); // choose September

		date.getDate().should.be.equal( 1 );
		date.getMonth().should.be.equal( 9 ); // refers to October
	} );

	it( "keeps assigned month when combined with a given day of month would result in valid date", () => {
		const date = new PartialDate();
		date.setDate( 31 );
		date.setMonth( 9 ); // choose October

		date.getDate().should.be.equal( 31 );
		date.getMonth().should.be.equal( 9 ); // refers to October
	} );
} );
