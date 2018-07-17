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

import { describe, it } from "mocha";
import Should from "should";

import Pattern from "../../../../../src/model/form/utility/pattern";

const MajorLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const MinorLetters = "abcdefghijklmnopqrstuvwxyz";
const AllLetters = MajorLetters + MinorLetters;
const AllNumbers = "0123456789";
const AllSpecials = ",.-;:_#+*?=)(/&%$§\"!<>[]{}^`´'~|";


describe( "Utility class Pattern", () => {
	it( "is available", () => {
		Should.exist( Pattern );
	} );

	describe( "exposes method compilePattern() which", () => {
		it( "is a function", () => {
			Pattern.compilePattern.should.be.Function();
		} );

		it( "requires one parameter", () => {
			Pattern.compilePattern.should.have.length( 1 );
		} );

		it( "returns an array", () => {
			Pattern.compilePattern( "" ).should.be.an.Array().which.is.empty();
		} );

		it( "returns separate item in resulting array for every element in provided pattern", () => {
			Pattern.compilePattern( "X" ).should.be.an.Array().which.has.length( 1 );
			Pattern.compilePattern( "+X" ).should.be.an.Array().which.has.length( 2 );
			Pattern.compilePattern( "X_X" ).should.be.an.Array().which.has.length( 3 );
			Pattern.compilePattern( "X _X" ).should.be.an.Array().which.has.length( 4 );
			Pattern.compilePattern( "+ X" ).should.be.an.Array().which.has.length( 3 );
		} );

		it( "ignores trailing literals defined in pattern", () => {
			Pattern.compilePattern( "_" ).should.be.an.Array().which.is.empty();
			Pattern.compilePattern( "+" ).should.be.an.Array().which.is.empty();
			Pattern.compilePattern( "-" ).should.be.an.Array().which.is.empty();
			Pattern.compilePattern( "." ).should.be.an.Array().which.is.empty();
		} );

		it( "keeps trailing literals defined in pattern on demand", () => {
			Pattern.compilePattern( "_", { keepTrailingLiterals: true } ).should.be.an.Array().which.has.length( 1 );
			Pattern.compilePattern( "+", { keepTrailingLiterals: true } ).should.be.an.Array().which.has.length( 1 );
			Pattern.compilePattern( "-", { keepTrailingLiterals: true } ).should.be.an.Array().which.has.length( 1 );
			Pattern.compilePattern( ".", { keepTrailingLiterals: true } ).should.be.an.Array().which.has.length( 1 );
		} );

		it( "fails if pattern contains trailing literals on demand", () => {
			( () => Pattern.compilePattern( "_", { ignoreTrailingLiterals: false } ) ).should.throw();
			( () => Pattern.compilePattern( "+", { ignoreTrailingLiterals: false } ) ).should.throw();
			( () => Pattern.compilePattern( "-", { ignoreTrailingLiterals: false } ) ).should.throw();
			( () => Pattern.compilePattern( ".", { ignoreTrailingLiterals: false } ) ).should.throw();
			( () => Pattern.compilePattern( "_", { ignoreTrailingLiterals: false, keepTrailingLiterals: true } ) ).should.throw();
			( () => Pattern.compilePattern( "+", { ignoreTrailingLiterals: false, keepTrailingLiterals: true } ) ).should.throw();
			( () => Pattern.compilePattern( "-", { ignoreTrailingLiterals: false, keepTrailingLiterals: true } ) ).should.throw();
			( () => Pattern.compilePattern( ".", { ignoreTrailingLiterals: false, keepTrailingLiterals: true } ) ).should.throw();
		} );

		it( "returns object per functional element in provided pattern", () => {
			const source = "XxXX##";
			const compiled = Pattern.compilePattern( source );

			compiled.should.be.an.Array().which.has.length( 6 );

			for ( let i = 0; i < 6; i++ ) {
				compiled[i].should.not.be.an.Array().and.be.an.Object().which.has.properties( "code", "regexp", "format", "optional" );
				compiled[i].code.should.be.equal( source[i] );
			}
		} );

		it( "accepts functional character 'X' for case-insensitively matching any latin letter to be formatted uppercase", () => {
			const compiled = Pattern.compilePattern( "X" );

			compiled.should.be.an.Array();
			compiled[0].should.be.an.Object().which.has.property( "code" ).which.is.equal( "X" );
			compiled[0].should.be.an.Object().which.has.property( "regexp" );
			compiled[0].should.be.an.Object().which.has.property( "format" );
			compiled[0].should.be.an.Object().which.has.property( "optional" ).which.is.false();

			AllLetters.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.true();
					compiled[0].format( char ).should.be.equal( char.toUpperCase() );
				} );

			AllNumbers.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.false();
					compiled[0].format( char ).should.be.equal( char );
				} );

			AllSpecials.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.false();
					compiled[0].format( char ).should.be.equal( char );
				} );
		} );

		it( "accepts functional character 'x' for case-insensitively matching any latin letter to be formatted lowercase", () => {
			const compiled = Pattern.compilePattern( "x" );

			compiled.should.be.an.Array();
			compiled[0].should.be.an.Object().which.has.property( "code" ).which.is.equal( "x" );
			compiled[0].should.be.an.Object().which.has.property( "regexp" );
			compiled[0].should.be.an.Object().which.has.property( "format" );
			compiled[0].should.be.an.Object().which.has.property( "optional" ).which.is.false();

			AllLetters.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.true();
					compiled[0].format( char ).should.be.equal( char.toLowerCase() );
				} );

			AllNumbers.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.false();
					compiled[0].format( char ).should.be.equal( char );
				} );

			AllSpecials.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.false();
					compiled[0].format( char ).should.be.equal( char );
				} );
		} );

		it( "accepts functional character '#' for matching any digit to be formatted using integer value of provided character", () => {
			const compiled = Pattern.compilePattern( "#" );

			compiled.should.be.an.Array();
			compiled[0].should.be.an.Object().which.has.property( "code" ).which.is.equal( "#" );
			compiled[0].should.be.an.Object().which.has.property( "regexp" );
			compiled[0].should.be.an.Object().which.has.property( "format" );
			compiled[0].should.be.an.Object().which.has.property( "optional" ).which.is.false();

			AllLetters.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.false();
					compiled[0].format( char ).should.be.equal( "0" );
				} );

			AllNumbers.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.true();
					compiled[0].format( char ).should.be.equal( char );
				} );

			AllSpecials.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.false();
					compiled[0].format( char ).should.be.equal( "0" );
				} );
		} );

		it( "rejects functional character '?' unless it is mediately or immediately preceded by a different functional character", () => {
			( () => Pattern.compilePattern( "?" ) ).should.throw();
			( () => Pattern.compilePattern( "??" ) ).should.throw();
			( () => Pattern.compilePattern( "???" ) ).should.throw();

			( () => Pattern.compilePattern( "X?" ) ).should.not.throw();
			( () => Pattern.compilePattern( "X??" ) ).should.not.throw();
			( () => Pattern.compilePattern( "X???" ) ).should.not.throw();

			( () => Pattern.compilePattern( "x?" ) ).should.not.throw();
			( () => Pattern.compilePattern( "x??" ) ).should.not.throw();
			( () => Pattern.compilePattern( "x???" ) ).should.not.throw();

			( () => Pattern.compilePattern( "#?" ) ).should.not.throw();
			( () => Pattern.compilePattern( "#??" ) ).should.not.throw();
			( () => Pattern.compilePattern( "#???" ) ).should.not.throw();
		} );

		it( "rejects functional character '?' succeeding literal characters", () => {
			( () => Pattern.compilePattern( "-?" ) ).should.throw();
			( () => Pattern.compilePattern( "-??" ) ).should.throw();
			( () => Pattern.compilePattern( "-???" ) ).should.throw();
			( () => Pattern.compilePattern( "X-?" ) ).should.throw();
			( () => Pattern.compilePattern( "X-??" ) ).should.throw();
			( () => Pattern.compilePattern( "X-???" ) ).should.throw();
			( () => Pattern.compilePattern( "x-?" ) ).should.throw();
			( () => Pattern.compilePattern( "x-??" ) ).should.throw();
			( () => Pattern.compilePattern( "x-???" ) ).should.throw();
			( () => Pattern.compilePattern( "#-?" ) ).should.throw();
			( () => Pattern.compilePattern( "#-??" ) ).should.throw();
			( () => Pattern.compilePattern( "#-???" ) ).should.throw();
		} );

		it( "accepts functional character '?' after functional character 'X' adopting the latter one's behaviour but marking it optional", () => {
			const compiled = Pattern.compilePattern( "X???" );

			compiled.should.be.an.Array();
			compiled[3].should.be.an.Object().which.has.property( "code" ).which.is.equal( "X" );
			compiled[3].should.be.an.Object().which.has.property( "regexp" );
			compiled[3].should.be.an.Object().which.has.property( "format" );
			compiled[3].should.be.an.Object().which.has.property( "optional" ).which.is.true();

			AllLetters.split( "" )
				.forEach( char => {
					compiled[3].regexp.test( char ).should.be.true();
					compiled[3].format( char ).should.be.equal( char.toUpperCase() );
				} );

			AllNumbers.split( "" )
				.forEach( char => {
					compiled[3].regexp.test( char ).should.be.false();
					compiled[3].format( char ).should.be.equal( char );
				} );

			AllSpecials.split( "" )
				.forEach( char => {
					compiled[3].regexp.test( char ).should.be.false();
					compiled[3].format( char ).should.be.equal( char );
				} );
		} );

		it( "accepts functional character '?' after functional character 'x' adopting the latter one's behaviour but marking it optional", () => {
			const compiled = Pattern.compilePattern( "x???" );

			compiled.should.be.an.Array();
			compiled[3].should.be.an.Object().which.has.property( "code" ).which.is.equal( "x" );
			compiled[3].should.be.an.Object().which.has.property( "regexp" );
			compiled[3].should.be.an.Object().which.has.property( "format" );
			compiled[3].should.be.an.Object().which.has.property( "optional" ).which.is.true();

			AllLetters.split( "" )
				.forEach( char => {
					compiled[3].regexp.test( char ).should.be.true();
					compiled[3].format( char ).should.be.equal( char.toLowerCase() );
				} );

			AllNumbers.split( "" )
				.forEach( char => {
					compiled[3].regexp.test( char ).should.be.false();
					compiled[3].format( char ).should.be.equal( char );
				} );

			AllSpecials.split( "" )
				.forEach( char => {
					compiled[3].regexp.test( char ).should.be.false();
					compiled[3].format( char ).should.be.equal( char );
				} );
		} );

		it( "accepts functional character '?' after functional character '#' adopting the latter one's behaviour but marking it optional", () => {
			const compiled = Pattern.compilePattern( "#???" );

			compiled.should.be.an.Array();
			compiled[3].should.be.an.Object().which.has.property( "code" ).which.is.equal( "#" );
			compiled[3].should.be.an.Object().which.has.property( "regexp" );
			compiled[3].should.be.an.Object().which.has.property( "format" );
			compiled[3].should.be.an.Object().which.has.property( "optional" ).which.is.true();

			AllLetters.split( "" )
				.forEach( char => {
					compiled[3].regexp.test( char ).should.be.false();
					compiled[3].format( char ).should.be.equal( "0" );
				} );

			AllNumbers.split( "" )
				.forEach( char => {
					compiled[3].regexp.test( char ).should.be.true();
					compiled[3].format( char ).should.be.equal( char );
				} );

			AllSpecials.split( "" )
				.forEach( char => {
					compiled[3].regexp.test( char ).should.be.false();
					compiled[3].format( char ).should.be.equal( "0" );
				} );
		} );

		it( "returns array per literal element in provided pattern listing valid literal characters in either position", () => {
			const source = "-.+_ =&";
			const compiled = Pattern.compilePattern( source, { keepTrailingLiterals: true } );

			compiled.should.be.an.Array().which.has.length( 7 );

			for ( let i = 0; i < 6; i++ ) {
				compiled[i].should.be.an.Array().which.has.length( 1 );
				compiled[i][0].should.be.equal( source[i] );
			}
		} );

		it( "supports literal elements in provided pattern listing multiple optional literal characters to be accepted in a position", () => {
			const source = "-.+[_ ]=&";
			const compiled = Pattern.compilePattern( source, { keepTrailingLiterals: true } );

			compiled.should.be.an.Array().which.has.length( 6 );

			for ( let i = 0; i < 6; i++ ) {
				if ( i === 3 ) {
					compiled[i].should.be.an.Array().which.has.length( 2 );
					compiled[i].should.be.eql( [ "_", " " ] );
				} else {
					compiled[i].should.be.an.Array().which.has.length( 1 );
				}
			}
		} );

		it( "fails on providing unfinished list of optional literal characters", () => {
			( () => Pattern.compilePattern( "-.+[_ =&" ) ).should.throw();
			( () => Pattern.compilePattern( "-.+[_ ]=&" ) ).should.not.throw();
			( () => Pattern.compilePattern( "-.+[_ =]&" ) ).should.not.throw();
			( () => Pattern.compilePattern( "-.+[_ =&]" ) ).should.not.throw();
		} );

		it( "fails on providing empty list of optional literal characters (for considering closing bracket as part of listed options)", () => {
			( () => Pattern.compilePattern( "-.+[]_ =&" ) ).should.throw();
		} );

		it( "accepts lists of optional literal characters consisting of single character, only", () => {
			Pattern.compilePattern( "[-]", { keepTrailingLiterals: true } ).should.be.an.Array().which.is.deepEqual( [["-"]] );
		} );

		it( "handles functional characters provided in lists of optional literal characters as literal characters", () => {
			Pattern.compilePattern( "[X]", { keepTrailingLiterals: true } ).should.be.an.Array().which.is.deepEqual( [["X"]] );
			Pattern.compilePattern( "[x]", { keepTrailingLiterals: true } ).should.be.an.Array().which.is.deepEqual( [["x"]] );
			Pattern.compilePattern( "[#]", { keepTrailingLiterals: true } ).should.be.an.Array().which.is.deepEqual( [["#"]] );
			Pattern.compilePattern( "[?]", { keepTrailingLiterals: true } ).should.be.an.Array().which.is.deepEqual( [["?"]] );
			Pattern.compilePattern( "[[]", { keepTrailingLiterals: true } ).should.be.an.Array().which.is.deepEqual( [["["]] );
			Pattern.compilePattern( "[]]", { keepTrailingLiterals: true } ).should.be.an.Array().which.is.deepEqual( [["]"]] );
		} );

		it( "ignores leading/trailing whitespace in provided pattern", () => {
			Pattern.compilePattern( "   " ).should.be.an.Array().which.is.empty();
			Pattern.compilePattern( " \nX\r " ).should.be.an.Array().which.has.length( 1 );
			Pattern.compilePattern( "\f - \t" ).should.be.an.Array().which.is.empty();
			Pattern.compilePattern( "\f - \t", { keepTrailingLiterals: true } ).should.be.an.Array().which.has.length( 1 );
		} );

		it( "reduces inner whitespace characters in a provided pattern", () => {
			Pattern.compilePattern( "+  X" ).should.be.an.Array().which.has.length( 3 );
			Pattern.compilePattern( "+ \f \t X" ).should.be.an.Array().which.has.length( 3 );

			Pattern.compilePattern( "X  _", { keepTrailingLiterals: true } ).should.be.an.Array().which.has.length( 3 );
			Pattern.compilePattern( "X \r\n _", { keepTrailingLiterals: true } ).should.be.an.Array().which.has.length( 3 );
		} );

		it( "normalizes reduced inner whitespace characters in a provided pattern", () => {
			Pattern.compilePattern( "+ \f \t X" )[1].should.be.an.Array().which.is.eql( [" "] );

			Pattern.compilePattern( "X  _", { keepTrailingLiterals: true } )[1].should.be.an.Array().which.is.eql( [" "] );
			Pattern.compilePattern( "X \r\n _", { keepTrailingLiterals: true } )[1].should.be.an.Array().which.is.eql( [" "] );
		} );
	} );

	describe( "exposes method parse() which", () => {
		it( "is a function", () => {
			Pattern.parse.should.be.Function();
		} );

		it( "requires two parameters", () => {
			Pattern.parse.should.have.length( 2 );
		} );

		it( "returns string", () => {
			Pattern.parse( "", "" ).should.be.String();
		} );

		describe( "extracts characters matching pattern from given input and so", () => {
			it( "returns empty string on empty input and empty pattern", () => {
				Pattern.parse( "", "" ).should.be.String().which.is.empty();
			} );

			it( "returns empty string on empty input", () => {
				Pattern.parse( "", "XXXXXX" ).should.be.String().which.is.empty();
			} );

			it( "returns empty string on empty pattern", () => {
				Pattern.parse( "XXXXXX", "" ).should.be.String().which.is.empty();
			} );

			it( "returns empty string on input and/or pattern consisting of whitespace, only", () => {
				Pattern.parse( "     ", "" ).should.be.String().which.is.empty();
				Pattern.parse( "     ", "     " ).should.be.String().which.is.empty();
				Pattern.parse( "", "     " ).should.be.String().which.is.empty();
			} );

			it( "returns uppercase literals ", () => {
				Pattern.parse( "     ", "" ).should.be.String().which.is.empty();
				Pattern.parse( "     ", "     " ).should.be.String().which.is.empty();
				Pattern.parse( "", "     " ).should.be.String().which.is.empty();
			} );
		} );

		describe( "extracts mandatory sequence of letters that", () => {
			it( "is matching size of pattern", () => {
				[
					[ "A", "X", "A" ],
					[ "a", "X", "A" ],
					[ "ABCD", "XXXX", "ABCD" ],
					[ "abcd", "XXXX", "ABCD" ],
					[ "A", "x", "a" ],
					[ "a", "x", "a" ],
					[ "ABCD", "xxxx", "abcd" ],
					[ "abcd", "xxxx", "abcd" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( result );

						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
					} );
			} );

			it( "is shorter than pattern", () => {
				[
					[ "AB", "XXXX", "AB" ],
					[ "ab", "XXXX", "AB" ],
					[ "AB", "xxxx", "ab" ],
					[ "ab", "xxxx", "ab" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( result );

						// provided input is too short, so parse() should consider input invalid on demand
						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
					} );
			} );

			it( "is truncated to size of pattern", () => {
				[
					[ "ABCD", "XX", "AB" ],
					[ "abcd", "XX", "AB" ],
					[ "ABCD", "xx", "ab" ],
					[ "abcd", "xx", "ab" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( result );

						// there is more input than expected by patter, so parse() should consider input invalid on demand
						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
					} );
			} );
		} );

		describe( "extracts partially optional sequence of letters that", () => {
			it( "is matching size of pattern", () => {
				[
					[ "ABCD", "X???", "ABCD" ],
					[ "abcd", "X???", "ABCD" ],
					[ "ABCD", "x???", "abcd" ],
					[ "abcd", "x???", "abcd" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( result );

						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
					} );
			} );

			it( "is shorter than pattern", () => {
				[
					[ "AB", "X???", "AB" ],
					[ "ab", "X???", "AB" ],
					[ "AB", "x???", "ab" ],
					[ "ab", "x???", "ab" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( result );

						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
					} );
			} );

			it( "is truncated to size of pattern", () => {
				[
					[ "ABCD", "X?", "AB" ],
					[ "abcd", "X?", "AB" ],
					[ "ABCD", "x?", "ab" ],
					[ "abcd", "x?", "ab" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( result );

						// there is more input than expected by pattern, so parse() should consider input invalid on demand
						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
					} );
			} );
		} );

		describe( "handles pattern w/ intermittent literals on providing input that", () => {
			describe( "contains same number of letters and", () => {
				it( "no literals", () => {
					[
						[ "ABCD", "XX XX", "AB CD" ],
						[ "abcd", "XX XX", "AB CD" ],
						[ "ABCD", "xx xx", "ab cd" ],
						[ "abcd", "xx xx", "ab cd" ],
						[ "ABCD", "XX-XX", "AB-CD" ],
						[ "abcd", "XX-XX", "AB-CD" ],
						[ "ABCD", "xx-xx", "ab-cd" ],
						[ "abcd", "xx-xx", "ab-cd" ],
						[ "ABCD", "XX[ -]XX", "AB CD" ],
						[ "abcd", "XX[ -]XX", "AB CD" ],
						[ "ABCD", "xx[ -]xx", "ab cd" ],
						[ "abcd", "xx[ -]xx", "ab cd" ],
						[ "ABCD", "XX[- ]XX", "AB-CD" ],
						[ "abcd", "XX[- ]XX", "AB-CD" ],
						[ "ABCD", "xx[- ]xx", "ab-cd" ],
						[ "abcd", "xx[- ]xx", "ab-cd" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern ).should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
						} );
				} );

				it( "expected literals", () => {
					[
						[ "AB CD", "XX XX", "AB CD" ],
						[ "ab cd", "XX XX", "AB CD" ],
						[ "AB CD", "xx xx", "ab cd" ],
						[ "ab cd", "xx xx", "ab cd" ],
						[ "AB-CD", "XX-XX", "AB-CD" ],
						[ "ab-cd", "XX-XX", "AB-CD" ],
						[ "AB-CD", "xx-xx", "ab-cd" ],
						[ "ab-cd", "xx-xx", "ab-cd" ],
						[ "AB CD", "XX[ -]XX", "AB CD" ],
						[ "ab cd", "XX[ -]XX", "AB CD" ],
						[ "AB CD", "xx[ -]xx", "ab cd" ],
						[ "ab cd", "xx[ -]xx", "ab cd" ],
						[ "AB-CD", "XX[ -]XX", "AB-CD" ],
						[ "ab-cd", "XX[ -]XX", "AB-CD" ],
						[ "AB-CD", "xx[ -]xx", "ab-cd" ],
						[ "ab-cd", "xx[ -]xx", "ab-cd" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern ).should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
						} );
				} );

				it( "unexpected literals to be ignored and replaced w/ (first) expected one", () => {
					[
						[ "AB-CD", "XX XX", "AB CD" ],
						[ "ab-cd", "XX XX", "AB CD" ],
						[ "AB-CD", "xx xx", "ab cd" ],
						[ "ab-cd", "xx xx", "ab cd" ],
						[ "AB CD", "XX-XX", "AB-CD" ],
						[ "ab cd", "XX-XX", "AB-CD" ],
						[ "AB CD", "xx-xx", "ab-cd" ],
						[ "ab cd", "xx-xx", "ab-cd" ],
						[ "AB_CD", "XX-XX", "AB-CD" ],
						[ "ab.cd", "XX-XX", "AB-CD" ],
						[ "AB/CD", "xx-xx", "ab-cd" ],
						[ "ab!cd", "xx-xx", "ab-cd" ],
						[ "AB_CD", "XX[- ]XX", "AB-CD" ],
						[ "ab.cd", "XX[- ]XX", "AB-CD" ],
						[ "AB/CD", "xx[- ]xx", "ab-cd" ],
						[ "ab!cd", "xx[- ]xx", "ab-cd" ],
						[ "AB_CD", "XX[ -]XX", "AB CD" ],
						[ "ab.cd", "XX[ -]XX", "AB CD" ],
						[ "AB/CD", "xx[ -]xx", "ab cd" ],
						[ "ab!cd", "xx[ -]xx", "ab cd" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern ).should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
						} );
				} );
			} );

			describe( "contains less letters than _required_ by pattern and", () => {
				it( "no literals", () => {
					[
						[ "ABC", "XX XX", "AB C" ],
						[ "abc", "XX XX", "AB C" ],
						[ "ABC", "xx xx", "ab c" ],
						[ "abc", "xx xx", "ab c" ],
						[ "ABC", "XX-XX", "AB-C" ],
						[ "abc", "XX-XX", "AB-C" ],
						[ "ABC", "xx-xx", "ab-c" ],
						[ "abc", "xx-xx", "ab-c" ],
						[ "ABC", "XX[ -]XX", "AB C" ],
						[ "abc", "XX[ -]XX", "AB C" ],
						[ "ABC", "xx[ -]xx", "ab c" ],
						[ "abc", "xx[ -]xx", "ab c" ],
						[ "ABC", "XX[- ]XX", "AB-C" ],
						[ "abc", "XX[- ]XX", "AB-C" ],
						[ "ABC", "xx[- ]xx", "ab-c" ],
						[ "abc", "xx[- ]xx", "ab-c" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern ).should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
						} );
				} );

				it( "expected literals", () => {
					[
						[ "AB C", "XX XX", "AB C" ],
						[ "ab c", "XX XX", "AB C" ],
						[ "AB C", "xx xx", "ab c" ],
						[ "ab c", "xx xx", "ab c" ],
						[ "AB-C", "XX-XX", "AB-C" ],
						[ "ab-c", "XX-XX", "AB-C" ],
						[ "AB-C", "xx-xx", "ab-c" ],
						[ "ab-c", "xx-xx", "ab-c" ],
						[ "AB C", "XX[ -]XX", "AB C" ],
						[ "ab c", "XX[ -]XX", "AB C" ],
						[ "AB C", "xx[ -]xx", "ab c" ],
						[ "ab c", "xx[ -]xx", "ab c" ],
						[ "AB-C", "XX[ -]XX", "AB-C" ],
						[ "ab-c", "XX[ -]XX", "AB-C" ],
						[ "AB-C", "xx[ -]xx", "ab-c" ],
						[ "ab-c", "xx[ -]xx", "ab-c" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern ).should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
						} );
				} );

				it( "unexpected literals to be ignored and replaced w/ (first) expected one", () => {
					[
						[ "AB-C", "XX XX", "AB C" ],
						[ "ab-c", "XX XX", "AB C" ],
						[ "AB-C", "xx xx", "ab c" ],
						[ "ab-c", "xx xx", "ab c" ],
						[ "AB C", "XX-XX", "AB-C" ],
						[ "ab c", "XX-XX", "AB-C" ],
						[ "AB C", "xx-xx", "ab-c" ],
						[ "ab c", "xx-xx", "ab-c" ],
						[ "AB_C", "XX-XX", "AB-C" ],
						[ "ab.c", "XX-XX", "AB-C" ],
						[ "AB/C", "xx-xx", "ab-c" ],
						[ "ab!c", "xx-xx", "ab-c" ],
						[ "AB_C", "XX[- ]XX", "AB-C" ],
						[ "ab.c", "XX[- ]XX", "AB-C" ],
						[ "AB/C", "xx[- ]xx", "ab-c" ],
						[ "ab!c", "xx[- ]xx", "ab-c" ],
						[ "AB_C", "XX[ -]XX", "AB C" ],
						[ "ab.c", "XX[ -]XX", "AB C" ],
						[ "AB/C", "xx[ -]xx", "ab c" ],
						[ "ab!c", "xx[ -]xx", "ab c" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern ).should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
						} );
				} );
			} );

			describe( "contains less letters than _supported_ by pattern and", () => {
				it( "no literals", () => {
					[
						[ "ABC", "XX X?", "AB C" ],
						[ "abc", "XX X?", "AB C" ],
						[ "ABC", "xx x?", "ab c" ],
						[ "abc", "xx x?", "ab c" ],
						[ "ABC", "XX-X?", "AB-C" ],
						[ "abc", "XX-X?", "AB-C" ],
						[ "ABC", "xx-x?", "ab-c" ],
						[ "abc", "xx-x?", "ab-c" ],
						[ "ABC", "XX[ -]X?", "AB C" ],
						[ "abc", "XX[ -]X?", "AB C" ],
						[ "ABC", "xx[ -]x?", "ab c" ],
						[ "abc", "xx[ -]x?", "ab c" ],
						[ "ABC", "XX[- ]X?", "AB-C" ],
						[ "abc", "XX[- ]X?", "AB-C" ],
						[ "ABC", "xx[- ]x?", "ab-c" ],
						[ "abc", "xx[- ]x?", "ab-c" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern ).should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
						} );
				} );

				it( "expected literals", () => {
					[
						[ "AB C", "XX X?", "AB C" ],
						[ "ab c", "XX X?", "AB C" ],
						[ "AB C", "xx x?", "ab c" ],
						[ "ab c", "xx x?", "ab c" ],
						[ "AB-C", "XX-X?", "AB-C" ],
						[ "ab-c", "XX-X?", "AB-C" ],
						[ "AB-C", "xx-x?", "ab-c" ],
						[ "ab-c", "xx-x?", "ab-c" ],
						[ "AB C", "XX[ -]X?", "AB C" ],
						[ "ab c", "XX[ -]X?", "AB C" ],
						[ "AB C", "xx[ -]x?", "ab c" ],
						[ "ab c", "xx[ -]x?", "ab c" ],
						[ "AB-C", "XX[- ]X?", "AB-C" ],
						[ "ab-c", "XX[- ]X?", "AB-C" ],
						[ "AB-C", "xx[- ]x?", "ab-c" ],
						[ "ab-c", "xx[- ]x?", "ab-c" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern ).should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
						} );
				} );

				it( "unexpected literals to be ignored and replaced w/ (first) expected one", () => {
					[
						[ "AB-C", "XX X?", "AB C" ],
						[ "ab-c", "XX X?", "AB C" ],
						[ "AB-C", "xx x?", "ab c" ],
						[ "ab-c", "xx x?", "ab c" ],
						[ "AB C", "XX-X?", "AB-C" ],
						[ "ab c", "XX-X?", "AB-C" ],
						[ "AB C", "xx-x?", "ab-c" ],
						[ "ab c", "xx-x?", "ab-c" ],
						[ "AB_C", "XX-XX", "AB-C" ],
						[ "ab.c", "XX-XX", "AB-C" ],
						[ "AB/C", "xx-xx", "ab-c" ],
						[ "ab!c", "xx-xx", "ab-c" ],
						[ "AB_C", "XX[- ]XX", "AB-C" ],
						[ "ab.c", "XX[- ]XX", "AB-C" ],
						[ "AB/C", "xx[- ]xx", "ab-c" ],
						[ "ab!c", "xx[- ]xx", "ab-c" ],
						[ "AB_C", "XX[ -]XX", "AB C" ],
						[ "ab.c", "XX[ -]XX", "AB C" ],
						[ "AB/C", "xx[ -]xx", "ab c" ],
						[ "ab!c", "xx[ -]xx", "ab c" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern ).should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
						} );
				} );
			} );

			it( "prematurely provides _expected_ literal on a pattern _requiring_ additional input preceding that expected literal", () => {
				[
					[ "A BC", "XX X", "AB C" ],
					[ "a bc", "XX X", "AB C" ],
					[ "A BC", "xx x", "ab c" ],
					[ "a bc", "xx x", "ab c" ],
					[ "A-BC", "XX-X", "AB-C" ],
					[ "a-bc", "XX-X", "AB-C" ],
					[ "A-BC", "xx-x", "ab-c" ],
					[ "a-bc", "xx-x", "ab-c" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( result );

						// actually input doesn't match pattern, so parse() should consider input invalid on demand
						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
					} );
			} );

			it( "prematurely provides _unexpected_ literal on a pattern _requiring_ additional input preceding the expected literal", () => {
				[
					[ "A-BC", "XX X", "AB C" ],
					[ "a-bc", "XX X", "AB C" ],
					[ "A-BC", "xx x", "ab c" ],
					[ "a-bc", "xx x", "ab c" ],
					[ "A BC", "XX-X", "AB-C" ],
					[ "a bc", "XX-X", "AB-C" ],
					[ "A BC", "xx-x", "ab-c" ],
					[ "a bc", "xx-x", "ab-c" ],
					[ "A_BC", "XX-X", "AB-C" ],
					[ "a.bc", "XX-X", "AB-C" ],
					[ "A/BC", "xx-x", "ab-c" ],
					[ "a!bc", "xx-x", "ab-c" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( result );

						// actually input doesn't match pattern, so parse() should consider input invalid on demand
						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
					} );
			} );

			it( "prematurely provides _expected_ literal on a pattern _supporting_ additional input preceding the expected literal", () => {
				[
					[ "A BC", "X? X?", "A BC" ],
					[ "a bc", "X? X?", "A BC" ],
					[ "A BC", "x? x?", "a bc" ],
					[ "a bc", "x? x?", "a bc" ],
					[ "A-BC", "X?-X?", "A-BC" ],
					[ "a-bc", "X?-X?", "A-BC" ],
					[ "A-BC", "x?-x?", "a-bc" ],
					[ "a-bc", "x?-x?", "a-bc" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( result );

						// actually input matches pattern
						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
					} );
			} );

			it( "prematurely provides _unexpected_ literal on a pattern _supporting_ additional input preceding the expected literal", () => {
				[
					[ "A-BC", "X? X?", "AB C" ],
					[ "a-bc", "X? X?", "AB C" ],
					[ "A-BC", "x? x?", "ab c" ],
					[ "a-bc", "x? x?", "ab c" ],
					[ "A BC", "X?-X?", "AB-C" ],
					[ "a bc", "X?-X?", "AB-C" ],
					[ "A BC", "x?-x?", "ab-c" ],
					[ "a bc", "x?-x?", "ab-c" ],
					[ "A_BC", "X?-X?", "AB-C" ],
					[ "a.bc", "X?-X?", "AB-C" ],
					[ "A/BC", "x?-x?", "ab-c" ],
					[ "a!bc", "x?-x?", "ab-c" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( result );

						// actually input doesn't match pattern due to mismatching literal, so parse() should consider input invalid on demand
						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
					} );
			} );

			it( "provides less values than expected by pattern preceding expected literal thus doesn't include literal in resulting output", () => {
				[
					[ "AB", "XX XX", "AB" ],
					[ "ab", "XX XX", "AB" ],
					[ "AB", "xx xx", "ab" ],
					[ "ab", "xx xx", "ab" ],
					[ "AB", "XX-XX", "AB" ],
					[ "ab", "XX-XX", "AB" ],
					[ "AB", "xx-xx", "ab" ],
					[ "ab", "xx-xx", "ab" ],
					[ "AB", "X? XX", "AB" ],
					[ "ab", "X? XX", "AB" ],
					[ "AB", "x? xx", "ab" ],
					[ "ab", "x? xx", "ab" ],
					[ "AB", "X?-XX", "AB" ],
					[ "ab", "X?-XX", "AB" ],
					[ "AB", "x?-xx", "ab" ],
					[ "ab", "x?-xx", "ab" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( result );

						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
					} );
			} );

			describe( "provides all values expected by pattern preceding expected literal which is provided, too,", () => {
				it( "thus includes literal at end of resulting output", () => {
					[
						[ "AB ", "XX XX", "AB " ],
						[ "ab ", "XX XX", "AB " ],
						[ "AB ", "xx xx", "ab " ],
						[ "ab ", "xx xx", "ab " ],
						[ "AB-", "XX-XX", "AB-" ],
						[ "ab-", "XX-XX", "AB-" ],
						[ "AB-", "xx-xx", "ab-" ],
						[ "ab-", "xx-xx", "ab-" ],
						[ "AB ", "X? XX", "AB " ],
						[ "ab ", "X? XX", "AB " ],
						[ "AB ", "x? xx", "ab " ],
						[ "ab ", "x? xx", "ab " ],
						[ "AB-", "X?-XX", "AB-" ],
						[ "ab-", "X?-XX", "AB-" ],
						[ "AB-", "x?-xx", "ab-" ],
						[ "ab-", "x?-xx", "ab-" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern ).should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
						} );
				} );

				it( "excludes the latter on demand from resulting output", () => {
					[
						[ "AB ", "XX XX", "AB" ],
						[ "ab ", "XX XX", "AB" ],
						[ "AB ", "xx xx", "ab" ],
						[ "ab ", "xx xx", "ab" ],
						[ "AB-", "XX-XX", "AB" ],
						[ "ab-", "XX-XX", "AB" ],
						[ "AB-", "xx-xx", "ab" ],
						[ "ab-", "xx-xx", "ab" ],
						[ "AB ", "X? XX", "AB" ],
						[ "ab ", "X? XX", "AB" ],
						[ "AB ", "x? xx", "ab" ],
						[ "ab ", "x? xx", "ab" ],
						[ "AB-", "X?-XX", "AB" ],
						[ "ab-", "X?-XX", "AB" ],
						[ "AB-", "x?-xx", "ab" ],
						[ "ab-", "x?-xx", "ab" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern, { keepTrailingLiterals: false } ).should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
						} );
				} );
			} );
		} );

		describe( "handles whitespace in provided input by", () => {
			it( "ignoring any leading whitespace", () => {
				[
					[ "    A", "X", "A" ],
					[ " \r\t A", "X", "A" ],
					[ "\n  \fA", "X", "A" ],
				]
					.forEach( ( [ input, pattern, output ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( output );

						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
					} );
			} );

			it( "ignoring any trailing whitespace", () => {
				[
					[ "A    ", "X", "A" ],
					[ "A \r\t ", "X", "A" ],
					[ "A\n  \f", "X", "A" ],
				]
					.forEach( ( [ input, pattern, output ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( output );

						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
					} );
			} );
		} );
	} );
} );
