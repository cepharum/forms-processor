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

import Range from "../../../../../src/model/form/utility/range";


describe( "Range", () => {
	it( "is available", () => {
		Should( Range ).be.ok();
	} );

	describe( "taking range definition", () => {
		describe( "as an array", () => {
			it( "is rejecting if array is empty", () => {
				( () => new Range( [] ) ).should.throw();
			} );

			it( "is accepting single-element array to define lower boundary", () => {
				( () => new Range( [1] ) ).should.not.throw();
				new Range( [1] ).lower.should.be.equal( 1 );
			} );
		} );

		describe( "as a string", () => {
			describe( "complying with simple range definition syntax", () => {
				it( "is accepted w/ upper/lower end defined", () => {
					( () => new Range( "1-2" ) ).should.not.throw();
					new Range( "1-2" ).lower.should.be.equal( 1 );
					new Range( "1-2" ).upper.should.be.equal( 2 );
				} );

				it( "is accepted w/ upper/lower end defined in wrong order", () => {
					( () => new Range( "2-1" ) ).should.not.throw();
					new Range( "2-1" ).lower.should.be.equal( 1 );
					new Range( "2-1" ).upper.should.be.equal( 2 );
				} );

				it( "is accepted w/ upper/lower end defined including whitespace", () => {
					( () => new Range( " 1\t-\r2 \n" ) ).should.not.throw();
					new Range( " 1\t-\r2 \n" ).lower.should.be.equal( 1 );
					new Range( " 1\t-\r2 \n" ).upper.should.be.equal( 2 );

					( () => new Range( " 2\t-\r1 \n" ) ).should.not.throw();
					new Range( " 2\t-\r1 \n" ).lower.should.be.equal( 1 );
					new Range( " 2\t-\r1 \n" ).upper.should.be.equal( 2 );
				} );

				it( "is accepted w/ non-integer ends defined", () => {
					( () => new Range( "2.5-3.5" ) ).should.not.throw();
					new Range( "2.5-3.5" ).lower.should.be.equal( 2.5 );
					new Range( "2.5-3.5" ).upper.should.be.equal( 3.5 );
				} );

				it( "is accepted w/ negative ends defined", () => {
					( () => new Range( "-20--19" ) ).should.not.throw();
					new Range( "-20--19" ).lower.should.be.equal( -20 );
					new Range( "-20--19" ).upper.should.be.equal( -19 );
				} );

				it( "is accepted w/ open upper end defined", () => {
					( () => new Range( "-20-" ) ).should.not.throw();
					new Range( "-20-" ).lower.should.be.equal( -20 );
					new Range( "-20-" ).upper.should.be.equal( Infinity );
				} );

				it( "is accepted w/ open lower end defined", () => {
					( () => new Range( "--20" ) ).should.not.throw();
					new Range( "--20" ).lower.should.be.equal( -Infinity );
					new Range( "--20" ).upper.should.be.equal( -20 );
				} );
			} );

			describe( "complying with bracket-style range definition syntax", () => {
				it( "is accepted w/ upper/lower end defined", () => {
					( () => new Range( "[1..2]" ) ).should.not.throw();
					new Range( "[1..2]" ).lower.should.be.equal( 1 );
					new Range( "[1..2]" ).upper.should.be.equal( 2 );

					( () => new Range( "[1...2]" ) ).should.not.throw();
					new Range( "[1...2]" ).lower.should.be.equal( 1 );
					new Range( "[1...2]" ).upper.should.be.equal( 2 );

					( () => new Range( "[1;2]" ) ).should.not.throw();
					new Range( "[1;2]" ).lower.should.be.equal( 1 );
					new Range( "[1;2]" ).upper.should.be.equal( 2 );

					( () => new Range( "]1..2[" ) ).should.not.throw();
					new Range( "]1..2[" ).lower.should.be.equal( 1 );
					new Range( "]1..2[" ).upper.should.be.equal( 2 );

					( () => new Range( "]1...2[" ) ).should.not.throw();
					new Range( "]1...2[" ).lower.should.be.equal( 1 );
					new Range( "]1...2[" ).upper.should.be.equal( 2 );

					( () => new Range( "]1;2[" ) ).should.not.throw();
					new Range( "]1;2[" ).lower.should.be.equal( 1 );
					new Range( "]1;2[" ).upper.should.be.equal( 2 );
				} );

				it( "is accepted w/ upper/lower end defined in wrong order", () => {
					( () => new Range( "[2..1]" ) ).should.not.throw();
					new Range( "[2..1]" ).lower.should.be.equal( 1 );
					new Range( "[2..1]" ).upper.should.be.equal( 2 );

					( () => new Range( "[2...1]" ) ).should.not.throw();
					new Range( "[2...1]" ).lower.should.be.equal( 1 );
					new Range( "[2...1]" ).upper.should.be.equal( 2 );

					( () => new Range( "[2;1]" ) ).should.not.throw();
					new Range( "[2;1]" ).lower.should.be.equal( 1 );
					new Range( "[2;1]" ).upper.should.be.equal( 2 );

					( () => new Range( "]2..1[" ) ).should.not.throw();
					new Range( "]2..1[" ).lower.should.be.equal( 1 );
					new Range( "]2..1[" ).upper.should.be.equal( 2 );

					( () => new Range( "]2...1[" ) ).should.not.throw();
					new Range( "]2...1[" ).lower.should.be.equal( 1 );
					new Range( "]2...1[" ).upper.should.be.equal( 2 );

					( () => new Range( "]2;1[" ) ).should.not.throw();
					new Range( "]2;1[" ).lower.should.be.equal( 1 );
					new Range( "]2;1[" ).upper.should.be.equal( 2 );
				} );

				it( "is accepted w/ upper/lower end defined including whitespace", () => {
					( () => new Range( " [\f1\t..\r2 ]\n" ) ).should.not.throw();
					new Range( " [\f1\t..\r2 ]\n" ).lower.should.be.equal( 1 );
					new Range( " [\f1\t..\r2 ]\n" ).upper.should.be.equal( 2 );

					( () => new Range( " [\f2\t..\r1 ]\n" ) ).should.not.throw();
					new Range( " [\f2\t..\r1 ]\n" ).lower.should.be.equal( 1 );
					new Range( " [\f2\t..\r1 ]\n" ).upper.should.be.equal( 2 );

					( () => new Range( " [\f1\t...\r2 ]\n" ) ).should.not.throw();
					new Range( " [\f1\t...\r2 ]\n" ).lower.should.be.equal( 1 );
					new Range( " [\f1\t...\r2 ]\n" ).upper.should.be.equal( 2 );

					( () => new Range( " [\f2\t...\r1 ]\n" ) ).should.not.throw();
					new Range( " [\f2\t...\r1 ]\n" ).lower.should.be.equal( 1 );
					new Range( " [\f2\t...\r1 ]\n" ).upper.should.be.equal( 2 );

					( () => new Range( " [\f1\t;\r2 ]\n" ) ).should.not.throw();
					new Range( " [\f1\t;\r2 ]\n" ).lower.should.be.equal( 1 );
					new Range( " [\f1\t;\r2 ]\n" ).upper.should.be.equal( 2 );

					( () => new Range( " [\f2\t;\r1 ]\n" ) ).should.not.throw();
					new Range( " [\f2\t;\r1 ]\n" ).lower.should.be.equal( 1 );
					new Range( " [\f2\t;\r1 ]\n" ).upper.should.be.equal( 2 );

					( () => new Range( " ]\f1\t...\r2 [\n" ) ).should.not.throw();
					new Range( " ]\f1\t...\r2 [\n" ).lower.should.be.equal( 1 );
					new Range( " ]\f1\t...\r2 [\n" ).upper.should.be.equal( 2 );

					( () => new Range( " ]\f2\t...\r1 [\n" ) ).should.not.throw();
					new Range( " ]\f2\t...\r1 [\n" ).lower.should.be.equal( 1 );
					new Range( " ]\f2\t...\r1 [\n" ).upper.should.be.equal( 2 );

					( () => new Range( " ]\f1\t;\r2 [\n" ) ).should.not.throw();
					new Range( " ]\f1\t;\r2 [\n" ).lower.should.be.equal( 1 );
					new Range( " ]\f1\t;\r2 [\n" ).upper.should.be.equal( 2 );

					( () => new Range( " ]\f2\t;\r1 [\n" ) ).should.not.throw();
					new Range( " ]\f2\t;\r1 [\n" ).lower.should.be.equal( 1 );
					new Range( " ]\f2\t;\r1 [\n" ).upper.should.be.equal( 2 );
				} );

				it( "is accepted w/ non-integer ends defined", () => {
					( () => new Range( "[2.5..3.5]" ) ).should.not.throw();
					new Range( "[2.5..3.5]" ).lower.should.be.equal( 2.5 );
					new Range( "[2.5..3.5]" ).upper.should.be.equal( 3.5 );

					( () => new Range( "[2.5...3.5]" ) ).should.not.throw();
					new Range( "[2.5...3.5]" ).lower.should.be.equal( 2.5 );
					new Range( "[2.5...3.5]" ).upper.should.be.equal( 3.5 );

					( () => new Range( "[2.5;3.5]" ) ).should.not.throw();
					new Range( "[2.5;3.5]" ).lower.should.be.equal( 2.5 );
					new Range( "[2.5;3.5]" ).upper.should.be.equal( 3.5 );

					( () => new Range( "]2.5..3.5[" ) ).should.not.throw();
					new Range( "]2.5..3.5[" ).lower.should.be.equal( 2.5 );
					new Range( "]2.5..3.5[" ).upper.should.be.equal( 3.5 );

					( () => new Range( "]2.5...3.5[" ) ).should.not.throw();
					new Range( "]2.5...3.5[" ).lower.should.be.equal( 2.5 );
					new Range( "]2.5...3.5[" ).upper.should.be.equal( 3.5 );

					( () => new Range( "]2.5;3.5[" ) ).should.not.throw();
					new Range( "]2.5;3.5[" ).lower.should.be.equal( 2.5 );
					new Range( "]2.5;3.5[" ).upper.should.be.equal( 3.5 );
				} );

				it( "is accepted w/ negative ends defined", () => {
					( () => new Range( "[-20..-19]" ) ).should.not.throw();
					new Range( "[-20..-19]" ).lower.should.be.equal( -20 );
					new Range( "[-20..-19]" ).upper.should.be.equal( -19 );

					( () => new Range( "[-20...-19]" ) ).should.not.throw();
					new Range( "[-20...-19]" ).lower.should.be.equal( -20 );
					new Range( "[-20...-19]" ).upper.should.be.equal( -19 );

					( () => new Range( "[-20;-19]" ) ).should.not.throw();
					new Range( "[-20;-19]" ).lower.should.be.equal( -20 );
					new Range( "[-20;-19]" ).upper.should.be.equal( -19 );

					( () => new Range( "]-20..-19[" ) ).should.not.throw();
					new Range( "]-20..-19[" ).lower.should.be.equal( -20 );
					new Range( "]-20..-19[" ).upper.should.be.equal( -19 );

					( () => new Range( "]-20...-19[" ) ).should.not.throw();
					new Range( "]-20...-19[" ).lower.should.be.equal( -20 );
					new Range( "]-20...-19[" ).upper.should.be.equal( -19 );

					( () => new Range( "]-20;-19[" ) ).should.not.throw();
					new Range( "]-20;-19[" ).lower.should.be.equal( -20 );
					new Range( "]-20;-19[" ).upper.should.be.equal( -19 );
				} );

				it( "is accepted w/ open upper end defined", () => {
					( () => new Range( "[-20..]" ) ).should.not.throw();
					new Range( "[-20..]" ).lower.should.be.equal( -20 );
					new Range( "[-20..]" ).upper.should.be.equal( Infinity );

					( () => new Range( "[-20...]" ) ).should.not.throw();
					new Range( "[-20...]" ).lower.should.be.equal( -20 );
					new Range( "[-20...]" ).upper.should.be.equal( Infinity );

					( () => new Range( "[-20;]" ) ).should.not.throw();
					new Range( "[-20;]" ).lower.should.be.equal( -20 );
					new Range( "[-20;]" ).upper.should.be.equal( Infinity );

					( () => new Range( "]-20..[" ) ).should.not.throw();
					new Range( "]-20..[" ).lower.should.be.equal( -20 );
					new Range( "]-20..[" ).upper.should.be.equal( Infinity );

					( () => new Range( "]-20...[" ) ).should.not.throw();
					new Range( "]-20...[" ).lower.should.be.equal( -20 );
					new Range( "]-20...[" ).upper.should.be.equal( Infinity );

					( () => new Range( "]-20;[" ) ).should.not.throw();
					new Range( "]-20;[" ).lower.should.be.equal( -20 );
					new Range( "]-20;[" ).upper.should.be.equal( Infinity );
				} );

				it( "is accepted w/ open lower end defined", () => {
					( () => new Range( "[..-19]" ) ).should.not.throw();
					new Range( "[..-19]" ).lower.should.be.equal( -Infinity );
					new Range( "[..-19]" ).upper.should.be.equal( -19 );

					( () => new Range( "[...-19]" ) ).should.not.throw();
					new Range( "[...-19]" ).lower.should.be.equal( -Infinity );
					new Range( "[...-19]" ).upper.should.be.equal( -19 );

					( () => new Range( "[;-19]" ) ).should.not.throw();
					new Range( "[;-19]" ).lower.should.be.equal( -Infinity );
					new Range( "[;-19]" ).upper.should.be.equal( -19 );

					( () => new Range( "]..-19[" ) ).should.not.throw();
					new Range( "]..-19[" ).lower.should.be.equal( -Infinity );
					new Range( "]..-19[" ).upper.should.be.equal( -19 );

					( () => new Range( "]...-19[" ) ).should.not.throw();
					new Range( "]...-19[" ).lower.should.be.equal( -Infinity );
					new Range( "]...-19[" ).upper.should.be.equal( -19 );

					( () => new Range( "];-19[" ) ).should.not.throw();
					new Range( "];-19[" ).lower.should.be.equal( -Infinity );
					new Range( "];-19[" ).upper.should.be.equal( -19 );
				} );
			} );
		} );
	} );
} );
