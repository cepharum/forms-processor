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

import { DateValidator } from "../../../../../src/model/form/utility/date";

describe( "Utility Class DateValidator", () => {
	it( "is available", () => {
		Should.exist( DateValidator );
	} );

	describe( "exposes method checkWeekday() which" ,() => {
		const { checkWeekday } = DateValidator;

		it( "is a function", () => {
			checkWeekday.should.be.Function();
		} );

		it( "requires two parameters", () => {
			checkWeekday.should.have.length( 2 );
		} );

		it( "accepts integer" , () => {
			( () => checkWeekday( 2, 2 ) ).should.not.throw();
			( () => checkWeekday( 2, 1 ) ).should.throw();
		} );

		it( "accepts range" , () => {
			( () => checkWeekday( 2, "1-2" ) ).should.not.throw();
			( () => checkWeekday( 4, "1-2" ) ).should.throw();
		} );
	} );


	describe( "exposes method validate() which" ,() => {
		const { validate } = DateValidator;

		it( "is a function", () => {
			validate.should.be.Function();
		} );

		it( "requires one parameters", () => {
			validate.should.have.length( 1 );
		} );

		it( "accepts Date and parasable dateStrings as input", () => {
			( () => validate( "2012-12-12" ) ).should.not.throw();
			( () => validate( new Date( "2012-12-12" ) ) ).should.not.throw();
		} );

		describe( "accepts options to validate against" ,() => {
			it( "maxDate", () => {
				( () => validate( "2011-12-12", { maxDate: "2012-12-12" } ) ).should.not.throw();
				( () => validate( "2012-12-12", { maxDate: "2012-12-12" } ) ).should.not.throw();
				( () => validate( "2012-12-22", { maxDate: "2012-12-12" } ) ).should.throw();
				( () => validate( "2012-12-13", { maxDate: "2012-12-12" } ) ).should.throw();
			} );
			it( "minDate", () => {
				( () => validate( "2013-12-12", { minDate: "2012-12-12" } ) ).should.not.throw();
				( () => validate( "2012-12-12", { minDate: "2012-12-12" } ) ).should.not.throw();
				( () => validate( "2012-12-11", { minDate: "2012-12-12" } ) ).should.throw();
				( () => validate( "2012-12-01", { minDate: "2012-12-12" } ) ).should.throw();
			} );
			it( "allowedWeekdays", () => {
				( () => validate( "2013-12-12", { allowedWeekdays: "0-6" } ) ).should.not.throw();
				( () => validate( "2019-03-06", { allowedWeekdays: 3 } ) ).should.not.throw();
				( () => validate( "2019-03-06", { allowedWeekdays: [ "0-2", 4, 5, 6 ] } ) ).should.throw();
				( () => validate( "2019-03-06", { allowedWeekdays: [ "0-2" ,"4-6" ] } ) ).should.throw();
			} );
			it( "notAllowedDates", () => {
				( () => validate( "2013-12-12", { notAllowedDates: [] } ) ).should.not.throw();
				( () => validate( "2019-03-06", { notAllowedDates: ["2019-03-09"] } ) ).should.not.throw();
				( () => validate( "2019-03-06", { notAllowedDates: ["2019-03-06"] } ) ).should.throw();
				( () => validate( "2019-03-06", { notAllowedDates: [ "2019-03-06", "2019-03-07" ] } ) ).should.throw();
			} );
		} );
	} );
} );
