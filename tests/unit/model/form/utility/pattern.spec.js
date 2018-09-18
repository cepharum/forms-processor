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

import Pattern from "../../../../../src/model/form/utility/pattern";

const MajorLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const MinorLetters = "abcdefghijklmnopqrstuvwxyz";
const AllLetters = MajorLetters + MinorLetters;
const AllDigits = "0123456789";
const AllHexDigits = "0123456789ABCDEFabcdef";
const AllSpecials = ",.-;:_#+*?=)(/&%$§\"!<>[]{}^`´'~|";

const IsDecimalDigit = /^[0-9]$/i;
const IsHexLetter = /^[a-f]$/i;


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
			Pattern.compilePattern( "A" ).should.be.an.Array().which.has.length( 1 );
			Pattern.compilePattern( "+A" ).should.be.an.Array().which.has.length( 2 );
			Pattern.compilePattern( "A_A" ).should.be.an.Array().which.has.length( 3 );
			Pattern.compilePattern( "A _A" ).should.be.an.Array().which.has.length( 4 );
			Pattern.compilePattern( "+ A" ).should.be.an.Array().which.has.length( 3 );
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
			const source = "AaAA##";
			const compiled = Pattern.compilePattern( source );

			compiled.should.be.an.Array().which.has.length( 6 );

			for ( let i = 0; i < 6; i++ ) {
				compiled[i].should.not.be.an.Array().and.be.an.Object().which.has.properties( "code", "regexp", "format", "optional" );
				compiled[i].code.should.be.equal( source[i] );
			}
		} );

		it( "accepts functional character 'A' for case-insensitively matching any latin letter to be formatted uppercase", () => {
			const compiled = Pattern.compilePattern( "A" );

			compiled.should.be.an.Array();
			compiled[0].should.be.an.Object().which.has.property( "code" ).which.is.equal( "A" );
			compiled[0].should.be.an.Object().which.has.property( "regexp" );
			compiled[0].should.be.an.Object().which.has.property( "format" );
			compiled[0].should.be.an.Object().which.has.property( "optional" ).which.is.false();

			AllLetters.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.true();
					compiled[0].format( char ).should.be.equal( char.toUpperCase() );
				} );

			AllDigits.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.false();
					compiled[0].format( char ).should.be.equal( char );
				} );

			AllHexDigits.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.equal( !IsDecimalDigit.test( char ) );
					compiled[0].format( char ).should.be.equal( char.toUpperCase() );
				} );

			AllSpecials.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.false();
					compiled[0].format( char ).should.be.equal( char );
				} );
		} );

		it( "accepts functional character 'a' for case-insensitively matching any latin letter to be formatted lowercase", () => {
			const compiled = Pattern.compilePattern( "a" );

			compiled.should.be.an.Array();
			compiled[0].should.be.an.Object().which.has.property( "code" ).which.is.equal( "a" );
			compiled[0].should.be.an.Object().which.has.property( "regexp" );
			compiled[0].should.be.an.Object().which.has.property( "format" );
			compiled[0].should.be.an.Object().which.has.property( "optional" ).which.is.false();

			AllLetters.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.true();
					compiled[0].format( char ).should.be.equal( char.toLowerCase() );
				} );

			AllDigits.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.false();
					compiled[0].format( char ).should.be.equal( char );
				} );

			AllHexDigits.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.equal( !IsDecimalDigit.test( char ) );
					compiled[0].format( char ).should.be.equal( char.toLowerCase() );
				} );

			AllSpecials.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.false();
					compiled[0].format( char ).should.be.equal( char );
				} );
		} );

		it( "accepts functional character 'X' for case-insensitively matching any hexadecimal digit to be formatted uppercase", () => {
			const compiled = Pattern.compilePattern( "X" );

			compiled.should.be.an.Array();
			compiled[0].should.be.an.Object().which.has.property( "code" ).which.is.equal( "X" );
			compiled[0].should.be.an.Object().which.has.property( "regexp" );
			compiled[0].should.be.an.Object().which.has.property( "format" );
			compiled[0].should.be.an.Object().which.has.property( "optional" ).which.is.false();

			AllLetters.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.equal( IsHexLetter.test( char ) );
					compiled[0].format( char ).should.be.equal( char.toUpperCase() );
				} );

			AllDigits.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.true();
					compiled[0].format( char ).should.be.equal( char );
				} );

			AllHexDigits.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.true();
					compiled[0].format( char ).should.be.equal( char.toUpperCase() );
				} );

			AllSpecials.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.false();
					compiled[0].format( char ).should.be.equal( char );
				} );
		} );

		it( "accepts functional character 'x' for case-insensitively matching any hexadecimal digit to be formatted lowercase", () => {
			const compiled = Pattern.compilePattern( "x" );

			compiled.should.be.an.Array();
			compiled[0].should.be.an.Object().which.has.property( "code" ).which.is.equal( "x" );
			compiled[0].should.be.an.Object().which.has.property( "regexp" );
			compiled[0].should.be.an.Object().which.has.property( "format" );
			compiled[0].should.be.an.Object().which.has.property( "optional" ).which.is.false();

			AllLetters.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.equal( IsHexLetter.test( char ) );
					compiled[0].format( char ).should.be.equal( char.toLowerCase() );
				} );

			AllDigits.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.true();
					compiled[0].format( char ).should.be.equal( char );
				} );

			AllHexDigits.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.true();
					compiled[0].format( char ).should.be.equal( char.toLowerCase() );
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

			AllDigits.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.true();
					compiled[0].format( char ).should.be.equal( char );
				} );

			AllHexDigits.split( "" )
				.forEach( char => {
					compiled[0].regexp.test( char ).should.be.equal( IsDecimalDigit.test( char ) );
					compiled[0].format( char ).should.be.equal( IsDecimalDigit.test( char ) ? char : "0" );
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

			( () => Pattern.compilePattern( "A?" ) ).should.not.throw();
			( () => Pattern.compilePattern( "A??" ) ).should.not.throw();
			( () => Pattern.compilePattern( "A???" ) ).should.not.throw();

			( () => Pattern.compilePattern( "a?" ) ).should.not.throw();
			( () => Pattern.compilePattern( "a??" ) ).should.not.throw();
			( () => Pattern.compilePattern( "a???" ) ).should.not.throw();

			( () => Pattern.compilePattern( "#?" ) ).should.not.throw();
			( () => Pattern.compilePattern( "#??" ) ).should.not.throw();
			( () => Pattern.compilePattern( "#???" ) ).should.not.throw();
		} );

		it( "rejects functional character '?' succeeding literal characters", () => {
			( () => Pattern.compilePattern( "-?" ) ).should.throw();
			( () => Pattern.compilePattern( "-??" ) ).should.throw();
			( () => Pattern.compilePattern( "-???" ) ).should.throw();
			( () => Pattern.compilePattern( "A-?" ) ).should.throw();
			( () => Pattern.compilePattern( "A-??" ) ).should.throw();
			( () => Pattern.compilePattern( "A-???" ) ).should.throw();
			( () => Pattern.compilePattern( "a-?" ) ).should.throw();
			( () => Pattern.compilePattern( "a-??" ) ).should.throw();
			( () => Pattern.compilePattern( "a-???" ) ).should.throw();
			( () => Pattern.compilePattern( "#-?" ) ).should.throw();
			( () => Pattern.compilePattern( "#-??" ) ).should.throw();
			( () => Pattern.compilePattern( "#-???" ) ).should.throw();
		} );

		it( "accepts functional character '?' after functional character 'A' adopting the latter one's behaviour but marking it optional", () => {
			const compiled = Pattern.compilePattern( "A???" );

			compiled.should.be.an.Array();
			compiled[3].should.be.an.Object().which.has.property( "code" ).which.is.equal( "A" );
			compiled[3].should.be.an.Object().which.has.property( "regexp" );
			compiled[3].should.be.an.Object().which.has.property( "format" );
			compiled[3].should.be.an.Object().which.has.property( "optional" ).which.is.true();

			AllLetters.split( "" )
				.forEach( char => {
					compiled[3].regexp.test( char ).should.be.true();
					compiled[3].format( char ).should.be.equal( char.toUpperCase() );
				} );

			AllDigits.split( "" )
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

		it( "accepts functional character '?' after functional character 'a' adopting the latter one's behaviour but marking it optional", () => {
			const compiled = Pattern.compilePattern( "a???" );

			compiled.should.be.an.Array();
			compiled[3].should.be.an.Object().which.has.property( "code" ).which.is.equal( "a" );
			compiled[3].should.be.an.Object().which.has.property( "regexp" );
			compiled[3].should.be.an.Object().which.has.property( "format" );
			compiled[3].should.be.an.Object().which.has.property( "optional" ).which.is.true();

			AllLetters.split( "" )
				.forEach( char => {
					compiled[3].regexp.test( char ).should.be.true();
					compiled[3].format( char ).should.be.equal( char.toLowerCase() );
				} );

			AllDigits.split( "" )
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

			AllDigits.split( "" )
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
			Pattern.compilePattern( "[A]", { keepTrailingLiterals: true } ).should.be.an.Array().which.is.deepEqual( [["A"]] );
			Pattern.compilePattern( "[a]", { keepTrailingLiterals: true } ).should.be.an.Array().which.is.deepEqual( [["a"]] );
			Pattern.compilePattern( "[#]", { keepTrailingLiterals: true } ).should.be.an.Array().which.is.deepEqual( [["#"]] );
			Pattern.compilePattern( "[?]", { keepTrailingLiterals: true } ).should.be.an.Array().which.is.deepEqual( [["?"]] );
			Pattern.compilePattern( "[[]", { keepTrailingLiterals: true } ).should.be.an.Array().which.is.deepEqual( [["["]] );
			Pattern.compilePattern( "[]]", { keepTrailingLiterals: true } ).should.be.an.Array().which.is.deepEqual( [["]"]] );
		} );

		it( "ignores leading/trailing whitespace in provided pattern", () => {
			Pattern.compilePattern( "   " ).should.be.an.Array().which.is.empty();
			Pattern.compilePattern( " \nA\r " ).should.be.an.Array().which.has.length( 1 );
			Pattern.compilePattern( "\f - \t" ).should.be.an.Array().which.is.empty();
			Pattern.compilePattern( "\f - \t", { keepTrailingLiterals: true } ).should.be.an.Array().which.has.length( 1 );
		} );

		it( "reduces inner whitespace characters in a provided pattern", () => {
			Pattern.compilePattern( "+  A" ).should.be.an.Array().which.has.length( 3 );
			Pattern.compilePattern( "+ \f \t A" ).should.be.an.Array().which.has.length( 3 );

			Pattern.compilePattern( "A  _", { keepTrailingLiterals: true } ).should.be.an.Array().which.has.length( 3 );
			Pattern.compilePattern( "A \r\n _", { keepTrailingLiterals: true } ).should.be.an.Array().which.has.length( 3 );
		} );

		it( "normalizes reduced inner whitespace characters in a provided pattern", () => {
			Pattern.compilePattern( "+ \f \t A" )[1].should.be.an.Array().which.is.eql( [" "] );

			Pattern.compilePattern( "A  _", { keepTrailingLiterals: true } )[1].should.be.an.Array().which.is.eql( [" "] );
			Pattern.compilePattern( "A \r\n _", { keepTrailingLiterals: true } )[1].should.be.an.Array().which.is.eql( [" "] );
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
				Pattern.parse( "", "AAAAAA" ).should.be.String().which.is.empty();
			} );

			it( "returns empty string on empty pattern", () => {
				Pattern.parse( "AAAAAA", "" ).should.be.String().which.is.empty();
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
					[ "A", "A", "A" ],
					[ "a", "A", "A" ],
					[ "ABCD", "AAAA", "ABCD" ],
					[ "abcd", "AAAA", "ABCD" ],
					[ "A", "a", "a" ],
					[ "a", "a", "a" ],
					[ "ABCD", "aaaa", "abcd" ],
					[ "abcd", "aaaa", "abcd" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( result );

						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
					} );
			} );

			it( "is shorter than pattern", () => {
				[
					[ "AB", "AAAA", "AB" ],
					[ "ab", "AAAA", "AB" ],
					[ "AB", "aaaa", "ab" ],
					[ "ab", "aaaa", "ab" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( result );

						// provided input is too short, so parse() should consider input invalid on demand
						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
					} );
			} );

			it( "is truncated to size of pattern", () => {
				[
					[ "ABCD", "AA", "AB" ],
					[ "abcd", "AA", "AB" ],
					[ "ABCD", "aa", "ab" ],
					[ "abcd", "aa", "ab" ],
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
					[ "ABCD", "A???", "ABCD" ],
					[ "abcd", "A???", "ABCD" ],
					[ "ABCD", "a???", "abcd" ],
					[ "abcd", "a???", "abcd" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( result );

						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
					} );
			} );

			it( "is shorter than pattern", () => {
				[
					[ "AB", "A???", "AB" ],
					[ "ab", "A???", "AB" ],
					[ "AB", "a???", "ab" ],
					[ "ab", "a???", "ab" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( result );

						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
					} );
			} );

			it( "is truncated to size of pattern", () => {
				[
					[ "ABCD", "A?", "AB" ],
					[ "abcd", "A?", "AB" ],
					[ "ABCD", "a?", "ab" ],
					[ "abcd", "a?", "ab" ],
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
						[ "ABCD", "AA AA", "AB CD" ],
						[ "abcd", "AA AA", "AB CD" ],
						[ "ABCD", "aa aa", "ab cd" ],
						[ "abcd", "aa aa", "ab cd" ],
						[ "ABCD", "AA-AA", "AB-CD" ],
						[ "abcd", "AA-AA", "AB-CD" ],
						[ "ABCD", "aa-aa", "ab-cd" ],
						[ "abcd", "aa-aa", "ab-cd" ],
						[ "ABCD", "AA[ -]AA", "AB CD" ],
						[ "abcd", "AA[ -]AA", "AB CD" ],
						[ "ABCD", "aa[ -]aa", "ab cd" ],
						[ "abcd", "aa[ -]aa", "ab cd" ],
						[ "ABCD", "AA[- ]AA", "AB-CD" ],
						[ "abcd", "AA[- ]AA", "AB-CD" ],
						[ "ABCD", "aa[- ]aa", "ab-cd" ],
						[ "abcd", "aa[- ]aa", "ab-cd" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern ).should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
						} );
				} );

				it( "expected literals", () => {
					[
						[ "AB CD", "AA AA", "AB CD" ],
						[ "ab cd", "AA AA", "AB CD" ],
						[ "AB CD", "aa aa", "ab cd" ],
						[ "ab cd", "aa aa", "ab cd" ],
						[ "AB-CD", "AA-AA", "AB-CD" ],
						[ "ab-cd", "AA-AA", "AB-CD" ],
						[ "AB-CD", "aa-aa", "ab-cd" ],
						[ "ab-cd", "aa-aa", "ab-cd" ],
						[ "AB CD", "AA[ -]AA", "AB CD" ],
						[ "ab cd", "AA[ -]AA", "AB CD" ],
						[ "AB CD", "aa[ -]aa", "ab cd" ],
						[ "ab cd", "aa[ -]aa", "ab cd" ],
						[ "AB-CD", "AA[ -]AA", "AB-CD" ],
						[ "ab-cd", "AA[ -]AA", "AB-CD" ],
						[ "AB-CD", "aa[ -]aa", "ab-cd" ],
						[ "ab-cd", "aa[ -]aa", "ab-cd" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern ).should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
						} );
				} );

				it( "unexpected literals to be ignored and replaced w/ (first) expected one", () => {
					[
						[ "AB-CD", "AA AA", "AB CD" ],
						[ "ab-cd", "AA AA", "AB CD" ],
						[ "AB-CD", "aa aa", "ab cd" ],
						[ "ab-cd", "aa aa", "ab cd" ],
						[ "AB CD", "AA-AA", "AB-CD" ],
						[ "ab cd", "AA-AA", "AB-CD" ],
						[ "AB CD", "aa-aa", "ab-cd" ],
						[ "ab cd", "aa-aa", "ab-cd" ],
						[ "AB_CD", "AA-AA", "AB-CD" ],
						[ "ab.cd", "AA-AA", "AB-CD" ],
						[ "AB/CD", "aa-aa", "ab-cd" ],
						[ "ab!cd", "aa-aa", "ab-cd" ],
						[ "AB_CD", "AA[- ]AA", "AB-CD" ],
						[ "ab.cd", "AA[- ]AA", "AB-CD" ],
						[ "AB/CD", "aa[- ]aa", "ab-cd" ],
						[ "ab!cd", "aa[- ]aa", "ab-cd" ],
						[ "AB_CD", "AA[ -]AA", "AB CD" ],
						[ "ab.cd", "AA[ -]AA", "AB CD" ],
						[ "AB/CD", "aa[ -]aa", "ab cd" ],
						[ "ab!cd", "aa[ -]aa", "ab cd" ],
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
						[ "ABC", "AA AA", "AB C" ],
						[ "abc", "AA AA", "AB C" ],
						[ "ABC", "aa aa", "ab c" ],
						[ "abc", "aa aa", "ab c" ],
						[ "ABC", "AA-AA", "AB-C" ],
						[ "abc", "AA-AA", "AB-C" ],
						[ "ABC", "aa-aa", "ab-c" ],
						[ "abc", "aa-aa", "ab-c" ],
						[ "ABC", "AA[ -]AA", "AB C" ],
						[ "abc", "AA[ -]AA", "AB C" ],
						[ "ABC", "aa[ -]aa", "ab c" ],
						[ "abc", "aa[ -]aa", "ab c" ],
						[ "ABC", "AA[- ]AA", "AB-C" ],
						[ "abc", "AA[- ]AA", "AB-C" ],
						[ "ABC", "aa[- ]aa", "ab-c" ],
						[ "abc", "aa[- ]aa", "ab-c" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern ).should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
						} );
				} );

				it( "expected literals", () => {
					[
						[ "AB C", "AA AA", "AB C" ],
						[ "ab c", "AA AA", "AB C" ],
						[ "AB C", "aa aa", "ab c" ],
						[ "ab c", "aa aa", "ab c" ],
						[ "AB-C", "AA-AA", "AB-C" ],
						[ "ab-c", "AA-AA", "AB-C" ],
						[ "AB-C", "aa-aa", "ab-c" ],
						[ "ab-c", "aa-aa", "ab-c" ],
						[ "AB C", "AA[ -]AA", "AB C" ],
						[ "ab c", "AA[ -]AA", "AB C" ],
						[ "AB C", "aa[ -]aa", "ab c" ],
						[ "ab c", "aa[ -]aa", "ab c" ],
						[ "AB-C", "AA[ -]AA", "AB-C" ],
						[ "ab-c", "AA[ -]AA", "AB-C" ],
						[ "AB-C", "aa[ -]aa", "ab-c" ],
						[ "ab-c", "aa[ -]aa", "ab-c" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern ).should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
						} );
				} );

				it( "unexpected literals to be ignored and replaced w/ (first) expected one", () => {
					[
						[ "AB-C", "AA AA", "AB C" ],
						[ "ab-c", "AA AA", "AB C" ],
						[ "AB-C", "aa aa", "ab c" ],
						[ "ab-c", "aa aa", "ab c" ],
						[ "AB C", "AA-AA", "AB-C" ],
						[ "ab c", "AA-AA", "AB-C" ],
						[ "AB C", "aa-aa", "ab-c" ],
						[ "ab c", "aa-aa", "ab-c" ],
						[ "AB_C", "AA-AA", "AB-C" ],
						[ "ab.c", "AA-AA", "AB-C" ],
						[ "AB/C", "aa-aa", "ab-c" ],
						[ "ab!c", "aa-aa", "ab-c" ],
						[ "AB_C", "AA[- ]AA", "AB-C" ],
						[ "ab.c", "AA[- ]AA", "AB-C" ],
						[ "AB/C", "aa[- ]aa", "ab-c" ],
						[ "ab!c", "aa[- ]aa", "ab-c" ],
						[ "AB_C", "AA[ -]AA", "AB C" ],
						[ "ab.c", "AA[ -]AA", "AB C" ],
						[ "AB/C", "aa[ -]aa", "ab c" ],
						[ "ab!c", "aa[ -]aa", "ab c" ],
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
						[ "ABC", "AA A?", "AB C" ],
						[ "abc", "AA A?", "AB C" ],
						[ "ABC", "aa a?", "ab c" ],
						[ "abc", "aa a?", "ab c" ],
						[ "ABC", "AA-A?", "AB-C" ],
						[ "abc", "AA-A?", "AB-C" ],
						[ "ABC", "aa-a?", "ab-c" ],
						[ "abc", "aa-a?", "ab-c" ],
						[ "ABC", "AA[ -]A?", "AB C" ],
						[ "abc", "AA[ -]A?", "AB C" ],
						[ "ABC", "aa[ -]a?", "ab c" ],
						[ "abc", "aa[ -]a?", "ab c" ],
						[ "ABC", "AA[- ]A?", "AB-C" ],
						[ "abc", "AA[- ]A?", "AB-C" ],
						[ "ABC", "aa[- ]a?", "ab-c" ],
						[ "abc", "aa[- ]a?", "ab-c" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern ).should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
						} );
				} );

				it( "expected literals", () => {
					[
						[ "AB C", "AA A?", "AB C" ],
						[ "ab c", "AA A?", "AB C" ],
						[ "AB C", "aa a?", "ab c" ],
						[ "ab c", "aa a?", "ab c" ],
						[ "AB-C", "AA-A?", "AB-C" ],
						[ "ab-c", "AA-A?", "AB-C" ],
						[ "AB-C", "aa-a?", "ab-c" ],
						[ "ab-c", "aa-a?", "ab-c" ],
						[ "AB C", "AA[ -]A?", "AB C" ],
						[ "ab c", "AA[ -]A?", "AB C" ],
						[ "AB C", "aa[ -]a?", "ab c" ],
						[ "ab c", "aa[ -]a?", "ab c" ],
						[ "AB-C", "AA[- ]A?", "AB-C" ],
						[ "ab-c", "AA[- ]A?", "AB-C" ],
						[ "AB-C", "aa[- ]a?", "ab-c" ],
						[ "ab-c", "aa[- ]a?", "ab-c" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern ).should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
						} );
				} );

				it( "unexpected literals to be ignored and replaced w/ (first) expected one", () => {
					[
						[ "AB-C", "AA A?", "AB C" ],
						[ "ab-c", "AA A?", "AB C" ],
						[ "AB-C", "aa a?", "ab c" ],
						[ "ab-c", "aa a?", "ab c" ],
						[ "AB C", "AA-A?", "AB-C" ],
						[ "ab c", "AA-A?", "AB-C" ],
						[ "AB C", "aa-a?", "ab-c" ],
						[ "ab c", "aa-a?", "ab-c" ],
						[ "AB_C", "AA-A?", "AB-C" ],
						[ "ab.c", "AA-A?", "AB-C" ],
						[ "AB/C", "aa-a?", "ab-c" ],
						[ "ab!c", "aa-a?", "ab-c" ],
						[ "AB_C", "AA[- ]A?", "AB-C" ],
						[ "ab.c", "AA[- ]A?", "AB-C" ],
						[ "AB/C", "aa[- ]a?", "ab-c" ],
						[ "ab!c", "aa[- ]a?", "ab-c" ],
						[ "AB_C", "AA[ -]A?", "AB C" ],
						[ "ab.c", "AA[ -]A?", "AB C" ],
						[ "AB/C", "aa[ -]a?", "ab c" ],
						[ "ab!c", "aa[ -]a?", "ab c" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern ).should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
						} );
				} );
			} );

			it( "prematurely provides _expected_ literal on a pattern _requiring_ additional input preceding that expected literal", () => {
				[
					[ "A BC", "AA A", "AB C" ],
					[ "a bc", "AA A", "AB C" ],
					[ "A BC", "aa a", "ab c" ],
					[ "a bc", "aa a", "ab c" ],
					[ "A-BC", "AA-A", "AB-C" ],
					[ "a-bc", "AA-A", "AB-C" ],
					[ "A-BC", "aa-a", "ab-c" ],
					[ "a-bc", "aa-a", "ab-c" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( result );

						// actually input doesn't match pattern, so parse() should consider input invalid on demand
						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
					} );
			} );

			it( "prematurely provides _unexpected_ literal on a pattern _requiring_ additional input preceding the expected literal", () => {
				[
					[ "A-BC", "AA A", "AB C" ],
					[ "a-bc", "AA A", "AB C" ],
					[ "A-BC", "aa a", "ab c" ],
					[ "a-bc", "aa a", "ab c" ],
					[ "A BC", "AA-A", "AB-C" ],
					[ "a bc", "AA-A", "AB-C" ],
					[ "A BC", "aa-a", "ab-c" ],
					[ "a bc", "aa-a", "ab-c" ],
					[ "A_BC", "AA-A", "AB-C" ],
					[ "a.bc", "AA-A", "AB-C" ],
					[ "A/BC", "aa-a", "ab-c" ],
					[ "a!bc", "aa-a", "ab-c" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( result );

						// actually input doesn't match pattern, so parse() should consider input invalid on demand
						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
					} );
			} );

			it( "prematurely provides _expected_ literal on a pattern _supporting_ additional input preceding the expected literal", () => {
				[
					[ "A BC", "A? A?", "A BC" ],
					[ "a bc", "A? A?", "A BC" ],
					[ "A BC", "a? a?", "a bc" ],
					[ "a bc", "a? a?", "a bc" ],
					[ "A-BC", "A?-A?", "A-BC" ],
					[ "a-bc", "A?-A?", "A-BC" ],
					[ "A-BC", "a?-a?", "a-bc" ],
					[ "a-bc", "a?-a?", "a-bc" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( result );

						// actually input matches pattern
						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
					} );
			} );

			it( "prematurely provides _unexpected_ literal on a pattern _supporting_ additional input preceding the expected literal", () => {
				[
					[ "A-BC", "A? A?", "AB C" ],
					[ "a-bc", "A? A?", "AB C" ],
					[ "A-BC", "a? a?", "ab c" ],
					[ "a-bc", "a? a?", "ab c" ],
					[ "A BC", "A?-A?", "AB-C" ],
					[ "a bc", "A?-A?", "AB-C" ],
					[ "A BC", "a?-a?", "ab-c" ],
					[ "a bc", "a?-a?", "ab-c" ],
					[ "A_BC", "A?-A?", "AB-C" ],
					[ "a.bc", "A?-A?", "AB-C" ],
					[ "A/BC", "a?-a?", "ab-c" ],
					[ "a!bc", "a?-a?", "ab-c" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( result );

						// actually input doesn't match pattern due to mismatching literal, so parse() should consider input invalid on demand
						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
					} );
			} );

			it( "provides less values than expected by pattern preceding expected literal thus doesn't include literal in resulting output", () => {
				[
					[ "AB", "AA AA", "AB" ],
					[ "ab", "AA AA", "AB" ],
					[ "AB", "aa aa", "ab" ],
					[ "ab", "aa aa", "ab" ],
					[ "AB", "AA-AA", "AB" ],
					[ "ab", "AA-AA", "AB" ],
					[ "AB", "aa-aa", "ab" ],
					[ "ab", "aa-aa", "ab" ],
					[ "AB", "A? AA", "AB" ],
					[ "ab", "A? AA", "AB" ],
					[ "AB", "a? aa", "ab" ],
					[ "ab", "a? aa", "ab" ],
					[ "AB", "A?-AA", "AB" ],
					[ "ab", "A?-AA", "AB" ],
					[ "AB", "a?-aa", "ab" ],
					[ "ab", "a?-aa", "ab" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( result );

						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
					} );
			} );

			describe( "provides all values expected by pattern preceding expected literal which is provided, too,", () => {
				it( "thus includes literal at end of resulting output", () => {
					[
						[ "AB ", "AA AA", "AB " ],
						[ "ab ", "AA AA", "AB " ],
						[ "AB ", "aa aa", "ab " ],
						[ "ab ", "aa aa", "ab " ],
						[ "AB-", "AA-AA", "AB-" ],
						[ "ab-", "AA-AA", "AB-" ],
						[ "AB-", "aa-aa", "ab-" ],
						[ "ab-", "aa-aa", "ab-" ],
						[ "AB ", "A? AA", "AB " ],
						[ "ab ", "A? AA", "AB " ],
						[ "AB ", "a? aa", "ab " ],
						[ "ab ", "a? aa", "ab " ],
						[ "AB-", "A?-AA", "AB-" ],
						[ "ab-", "A?-AA", "AB-" ],
						[ "AB-", "a?-aa", "ab-" ],
						[ "ab-", "a?-aa", "ab-" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern ).should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
						} );
				} );

				it( "excludes the latter on demand from resulting output", () => {
					[
						[ "AB ", "AA AA", "AB" ],
						[ "ab ", "AA AA", "AB" ],
						[ "AB ", "aa aa", "ab" ],
						[ "ab ", "aa aa", "ab" ],
						[ "AB-", "AA-AA", "AB" ],
						[ "ab-", "AA-AA", "AB" ],
						[ "AB-", "aa-aa", "ab" ],
						[ "ab-", "aa-aa", "ab" ],
						[ "AB ", "A? AA", "AB" ],
						[ "ab ", "A? AA", "AB" ],
						[ "AB ", "a? aa", "ab" ],
						[ "ab ", "a? aa", "ab" ],
						[ "AB-", "A?-AA", "AB" ],
						[ "ab-", "A?-AA", "AB" ],
						[ "AB-", "a?-aa", "ab" ],
						[ "ab-", "a?-aa", "ab" ],
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
					[ "    A", "A", "A" ],
					[ " \r\t A", "A", "A" ],
					[ "\n  \fA", "A", "A" ],
				]
					.forEach( ( [ input, pattern, output ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( output );

						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
					} );
			} );

			it( "ignoring any trailing whitespace", () => {
				[
					[ "A    ", "A", "A" ],
					[ "A \r\t ", "A", "A" ],
					[ "A\n  \f", "A", "A" ],
				]
					.forEach( ( [ input, pattern, output ] ) => {
						Pattern.parse( input, pattern ).should.be.equal( output );

						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
					} );
			} );
		} );
	} );
} );
