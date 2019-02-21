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
			Pattern.compilePattern( ".A" ).should.be.an.Array().which.has.length( 2 );
			Pattern.compilePattern( "A_A" ).should.be.an.Array().which.has.length( 3 );
			Pattern.compilePattern( "A _A" ).should.be.an.Array().which.has.length( 4 );
			Pattern.compilePattern( ". A" ).should.be.an.Array().which.has.length( 3 );
		} );

		describe( "handles functional markers in a pattern which", () => {
			it( "are each represented by descriptor in result", () => {
				const source = "AaAA##";
				const compiled = Pattern.compilePattern( source );

				compiled.should.be.an.Array().which.has.length( 6 );

				for ( let i = 0; i < 6; i++ ) {
					compiled[i].should.not.be.an.Array().and.be.an.Object().which.has.properties( "code", "regexp", "format", "optional" );
					compiled[i].code.should.be.equal( source[i] );
				}
			} );

			it( "accepts 'A' for case-insensitively matching any latin letter to be formatted uppercase", () => {
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

			it( "accepts 'a' for case-insensitively matching any latin letter to be formatted lowercase", () => {
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

			it( "accepts 'W' for case-insensitively matching any latin letter or digit to be formatted uppercase", () => {
				const compiled = Pattern.compilePattern( "W" );

				compiled.should.be.an.Array();
				compiled[0].should.be.an.Object().which.has.property( "code" ).which.is.equal( "W" );
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

			it( "accepts 'w' for case-insensitively matching any latin letter or digit to be formatted lowercase", () => {
				const compiled = Pattern.compilePattern( "w" );

				compiled.should.be.an.Array();
				compiled[0].should.be.an.Object().which.has.property( "code" ).which.is.equal( "w" );
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

			it( "accepts 'X' for case-insensitively matching any hexadecimal digit to be formatted uppercase", () => {
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

			it( "accepts 'x' for case-insensitively matching any hexadecimal digit to be formatted lowercase", () => {
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

			it( "accepts '#' for matching any digit to be formatted using integer value of provided character", () => {
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
		} );

		describe( "handles quantifiers which", () => {
			it( "rejects '?' in a leading position of a pattern", () => {
				( () => Pattern.compilePattern( "?" ) ).should.throw();
				( () => Pattern.compilePattern( "?A" ) ).should.throw();
				( () => Pattern.compilePattern( "?AAAAA" ) ).should.throw();
			} );

			it( "accepts '?' succeeding functional characters", () => {
				( () => Pattern.compilePattern( "A?" ) ).should.not.throw();
				( () => Pattern.compilePattern( "a?" ) ).should.not.throw();
				( () => Pattern.compilePattern( "X?" ) ).should.not.throw();
				( () => Pattern.compilePattern( "x?" ) ).should.not.throw();
				( () => Pattern.compilePattern( "#?" ) ).should.not.throw();
				( () => Pattern.compilePattern( "W?" ) ).should.not.throw();
				( () => Pattern.compilePattern( "w?" ) ).should.not.throw();
			} );

			it( "accepts '?' succeeding accepted quantifier '?'", () => {
				( () => Pattern.compilePattern( "A??" ) ).should.not.throw();
				( () => Pattern.compilePattern( "a??" ) ).should.not.throw();
				( () => Pattern.compilePattern( "X??" ) ).should.not.throw();
				( () => Pattern.compilePattern( "x??" ) ).should.not.throw();
				( () => Pattern.compilePattern( "#??" ) ).should.not.throw();
				( () => Pattern.compilePattern( "W??" ) ).should.not.throw();
				( () => Pattern.compilePattern( "w??" ) ).should.not.throw();

				( () => Pattern.compilePattern( "A???" ) ).should.not.throw();
				( () => Pattern.compilePattern( "a???" ) ).should.not.throw();
				( () => Pattern.compilePattern( "X???" ) ).should.not.throw();
				( () => Pattern.compilePattern( "x???" ) ).should.not.throw();
				( () => Pattern.compilePattern( "#???" ) ).should.not.throw();
				( () => Pattern.compilePattern( "W???" ) ).should.not.throw();
				( () => Pattern.compilePattern( "w???" ) ).should.not.throw();
			} );

			it( "rejects '?' succeeding literal characters", () => {
				( () => Pattern.compilePattern( "-?" ) ).should.throw();
				( () => Pattern.compilePattern( "-??" ) ).should.throw();
				( () => Pattern.compilePattern( "-???" ) ).should.throw();
				( () => Pattern.compilePattern( "A-?" ) ).should.throw();
				( () => Pattern.compilePattern( "A-??" ) ).should.throw();
				( () => Pattern.compilePattern( "A-???" ) ).should.throw();
				( () => Pattern.compilePattern( "a-?" ) ).should.throw();
				( () => Pattern.compilePattern( "a-??" ) ).should.throw();
				( () => Pattern.compilePattern( "a-???" ) ).should.throw();
				( () => Pattern.compilePattern( "W-?" ) ).should.throw();
				( () => Pattern.compilePattern( "W-??" ) ).should.throw();
				( () => Pattern.compilePattern( "W-???" ) ).should.throw();
				( () => Pattern.compilePattern( "w-?" ) ).should.throw();
				( () => Pattern.compilePattern( "w-??" ) ).should.throw();
				( () => Pattern.compilePattern( "w-???" ) ).should.throw();
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

			it( "accepts '?' after functional character 'A' adopting the latter one's behaviour but marking it optional", () => {
				const compiled = Pattern.compilePattern( "A???" );

				compiled.should.be.an.Array();
				[ 0, 1, 2 ].forEach( index => {
					compiled[index].should.be.an.Object().which.has.property( "code" ).which.is.equal( "A" );
					compiled[index].should.be.an.Object().which.has.property( "regexp" );
					compiled[index].should.be.an.Object().which.has.property( "format" );
					compiled[index].should.be.an.Object().which.has.property( "optional" ).which.is.true();
					compiled[index].should.be.an.Object().which.has.property( "multi" ).which.is.false();
				} );

				AllLetters.split( "" )
					.forEach( char => {
						[ 0, 1, 2 ].forEach( index => {
							compiled[index].regexp.test( char ).should.be.true();
							compiled[index].format( char ).should.be.equal( char.toUpperCase() );
						} );
					} );

				AllDigits.split( "" )
					.forEach( char => {
						[ 0, 1, 2 ].forEach( index => {
							compiled[index].regexp.test( char ).should.be.false();
							compiled[index].format( char ).should.be.equal( char );
						} );
					} );

				AllSpecials.split( "" )
					.forEach( char => {
						[ 0, 1, 2 ].forEach( index => {
							compiled[index].regexp.test( char ).should.be.false();
							compiled[index].format( char ).should.be.equal( char );
						} );
					} );
			} );

			it( "accepts '?' after functional character 'a' adopting the latter one's behaviour but marking it optional", () => {
				const compiled = Pattern.compilePattern( "a???" );

				compiled.should.be.an.Array();
				[ 0, 1, 2 ].forEach( index => {
					compiled[index].should.be.an.Object().which.has.property( "code" ).which.is.equal( "a" );
					compiled[index].should.be.an.Object().which.has.property( "regexp" );
					compiled[index].should.be.an.Object().which.has.property( "format" );
					compiled[index].should.be.an.Object().which.has.property( "optional" ).which.is.true();
					compiled[index].should.be.an.Object().which.has.property( "multi" ).which.is.false();
				} );

				AllLetters.split( "" )
					.forEach( char => {
						[ 0, 1, 2 ].forEach( index => {
							compiled[index].regexp.test( char ).should.be.true();
							compiled[index].format( char ).should.be.equal( char.toLowerCase() );
						} );
					} );

				AllDigits.split( "" )
					.forEach( char => {
						[ 0, 1, 2 ].forEach( index => {
							compiled[index].regexp.test( char ).should.be.false();
							compiled[index].format( char ).should.be.equal( char );
						} );
					} );

				AllSpecials.split( "" )
					.forEach( char => {
						[ 0, 1, 2 ].forEach( index => {
							compiled[index].regexp.test( char ).should.be.false();
							compiled[index].format( char ).should.be.equal( char );
						} );
					} );
			} );

			it( "accepts '?' after functional character 'X' adopting the latter one's behaviour but marking it optional", () => {
				const compiled = Pattern.compilePattern( "X???" );

				compiled.should.be.an.Array();
				[ 0, 1, 2 ].forEach( index => {
					compiled[index].should.be.an.Object().which.has.property( "code" ).which.is.equal( "X" );
					compiled[index].should.be.an.Object().which.has.property( "regexp" );
					compiled[index].should.be.an.Object().which.has.property( "format" );
					compiled[index].should.be.an.Object().which.has.property( "optional" ).which.is.true();
					compiled[index].should.be.an.Object().which.has.property( "multi" ).which.is.false();
				} );

				AllLetters.split( "" )
					.forEach( char => {
						[ 0, 1, 2 ].forEach( index => {
							compiled[index].regexp.test( char ).should.be.equal( /[a-f]/i.test( char ) );
							compiled[index].format( char ).should.be.equal( char.toUpperCase() );
						} );
					} );

				AllDigits.split( "" )
					.forEach( char => {
						[ 0, 1, 2 ].forEach( index => {
							compiled[index].regexp.test( char ).should.be.true();
							compiled[index].format( char ).should.be.equal( char );
						} );
					} );

				AllSpecials.split( "" )
					.forEach( char => {
						[ 0, 1, 2 ].forEach( index => {
							compiled[index].regexp.test( char ).should.be.false();
							compiled[index].format( char ).should.be.equal( char );
						} );
					} );
			} );

			it( "accepts '?' after functional character 'x' adopting the latter one's behaviour but marking it optional", () => {
				const compiled = Pattern.compilePattern( "x???" );

				compiled.should.be.an.Array();
				[ 0, 1, 2 ].forEach( index => {
					compiled[index].should.be.an.Object().which.has.property( "code" ).which.is.equal( "x" );
					compiled[index].should.be.an.Object().which.has.property( "regexp" );
					compiled[index].should.be.an.Object().which.has.property( "format" );
					compiled[index].should.be.an.Object().which.has.property( "optional" ).which.is.true();
					compiled[index].should.be.an.Object().which.has.property( "multi" ).which.is.false();
				} );

				AllLetters.split( "" )
					.forEach( char => {
						[ 0, 1, 2 ].forEach( index => {
							compiled[index].regexp.test( char ).should.be.equal( /[a-f]/i.test( char ) );
							compiled[index].format( char ).should.be.equal( char.toLowerCase() );
						} );
					} );

				AllDigits.split( "" )
					.forEach( char => {
						[ 0, 1, 2 ].forEach( index => {
							compiled[index].regexp.test( char ).should.be.true();
							compiled[index].format( char ).should.be.equal( char );
						} );
					} );

				AllSpecials.split( "" )
					.forEach( char => {
						[ 0, 1, 2 ].forEach( index => {
							compiled[index].regexp.test( char ).should.be.false();
							compiled[index].format( char ).should.be.equal( char );
						} );
					} );
			} );

			it( "accepts '?' after functional character '#' adopting the latter one's behaviour but marking it optional", () => {
				const compiled = Pattern.compilePattern( "#???" );

				compiled.should.be.an.Array();
				[ 0, 1, 2 ].forEach( index => {
					compiled[index].should.be.an.Object().which.has.property( "code" ).which.is.equal( "#" );
					compiled[index].should.be.an.Object().which.has.property( "regexp" );
					compiled[index].should.be.an.Object().which.has.property( "format" );
					compiled[index].should.be.an.Object().which.has.property( "optional" ).which.is.true();
					compiled[index].should.be.an.Object().which.has.property( "multi" ).which.is.false();
				} );

				AllLetters.split( "" )
					.forEach( char => {
						[ 0, 1, 2 ].forEach( index => {
							compiled[index].regexp.test( char ).should.be.false();
							compiled[index].format( char ).should.be.equal( "0" );
						} );
					} );

				AllDigits.split( "" )
					.forEach( char => {
						[ 0, 1, 2 ].forEach( index => {
							compiled[index].regexp.test( char ).should.be.true();
							compiled[index].format( char ).should.be.equal( char );
						} );
					} );

				AllSpecials.split( "" )
					.forEach( char => {
						[ 0, 1, 2 ].forEach( index => {
							compiled[index].regexp.test( char ).should.be.false();
							compiled[index].format( char ).should.be.equal( "0" );
						} );
					} );
			} );

			it( "accepts '?' after functional character 'W' adopting the latter one's behaviour but marking it optional", () => {
				const compiled = Pattern.compilePattern( "W???" );

				compiled.should.be.an.Array();
				[ 0, 1, 2 ].forEach( index => {
					compiled[index].should.be.an.Object().which.has.property( "code" ).which.is.equal( "W" );
					compiled[index].should.be.an.Object().which.has.property( "regexp" );
					compiled[index].should.be.an.Object().which.has.property( "format" );
					compiled[index].should.be.an.Object().which.has.property( "optional" ).which.is.true();
					compiled[index].should.be.an.Object().which.has.property( "multi" ).which.is.false();
				} );

				AllLetters.split( "" )
					.forEach( char => {
						[ 0, 1, 2 ].forEach( index => {
							compiled[index].regexp.test( char ).should.be.true();
							compiled[index].format( char ).should.be.equal( char.toUpperCase() );
						} );
					} );

				AllDigits.split( "" )
					.forEach( char => {
						[ 0, 1, 2 ].forEach( index => {
							compiled[index].regexp.test( char ).should.be.true();
							compiled[index].format( char ).should.be.equal( char );
						} );
					} );

				AllSpecials.split( "" )
					.forEach( char => {
						[ 0, 1, 2 ].forEach( index => {
							compiled[index].regexp.test( char ).should.be.false();
							compiled[index].format( char ).should.be.equal( char );
						} );
					} );
			} );

			it( "accepts '?' after functional character 'w' adopting the latter one's behaviour but marking it optional", () => {
				const compiled = Pattern.compilePattern( "w???" );

				compiled.should.be.an.Array();
				[ 0, 1, 2 ].forEach( index => {
					compiled[index].should.be.an.Object().which.has.property( "code" ).which.is.equal( "w" );
					compiled[index].should.be.an.Object().which.has.property( "regexp" );
					compiled[index].should.be.an.Object().which.has.property( "format" );
					compiled[index].should.be.an.Object().which.has.property( "optional" ).which.is.true();
					compiled[index].should.be.an.Object().which.has.property( "multi" ).which.is.false();
				} );

				AllLetters.split( "" )
					.forEach( char => {
						[ 0, 1, 2 ].forEach( index => {
							compiled[index].regexp.test( char ).should.be.true();
							compiled[index].format( char ).should.be.equal( char.toLowerCase() );
						} );
					} );

				AllDigits.split( "" )
					.forEach( char => {
						[ 0, 1, 2 ].forEach( index => {
							compiled[index].regexp.test( char ).should.be.true();
							compiled[index].format( char ).should.be.equal( char );
						} );
					} );

				AllSpecials.split( "" )
					.forEach( char => {
						[ 0, 1, 2 ].forEach( index => {
							compiled[index].regexp.test( char ).should.be.false();
							compiled[index].format( char ).should.be.equal( char );
						} );
					} );
			} );

			it( "rejects '*' in a leading position of a pattern", () => {
				( () => Pattern.compilePattern( "*" ) ).should.throw();
				( () => Pattern.compilePattern( "*A" ) ).should.throw();
				( () => Pattern.compilePattern( "*AAAAA" ) ).should.throw();
			} );

			it( "accepts '*' succeeding functional characters", () => {
				( () => Pattern.compilePattern( "A*" ) ).should.not.throw();
				( () => Pattern.compilePattern( "a*" ) ).should.not.throw();
				( () => Pattern.compilePattern( "X*" ) ).should.not.throw();
				( () => Pattern.compilePattern( "x*" ) ).should.not.throw();
				( () => Pattern.compilePattern( "#*" ) ).should.not.throw();
				( () => Pattern.compilePattern( "W*" ) ).should.not.throw();
				( () => Pattern.compilePattern( "w*" ) ).should.not.throw();
			} );

			it( "rejects '*' succeeding accepted quantifier '*'", () => {
				( () => Pattern.compilePattern( "A**" ) ).should.throw();
				( () => Pattern.compilePattern( "a**" ) ).should.throw();
				( () => Pattern.compilePattern( "X**" ) ).should.throw();
				( () => Pattern.compilePattern( "x**" ) ).should.throw();
				( () => Pattern.compilePattern( "#**" ) ).should.throw();
				( () => Pattern.compilePattern( "W**" ) ).should.throw();
				( () => Pattern.compilePattern( "w**" ) ).should.throw();

				( () => Pattern.compilePattern( "A***" ) ).should.throw();
				( () => Pattern.compilePattern( "a***" ) ).should.throw();
				( () => Pattern.compilePattern( "X***" ) ).should.throw();
				( () => Pattern.compilePattern( "x***" ) ).should.throw();
				( () => Pattern.compilePattern( "#***" ) ).should.throw();
				( () => Pattern.compilePattern( "W***" ) ).should.throw();
				( () => Pattern.compilePattern( "w***" ) ).should.throw();
			} );

			it( "rejects '*' succeeding literal characters", () => {
				( () => Pattern.compilePattern( "-*" ) ).should.throw();
				( () => Pattern.compilePattern( "A-*" ) ).should.throw();
				( () => Pattern.compilePattern( "a-*" ) ).should.throw();
				( () => Pattern.compilePattern( "W-*" ) ).should.throw();
				( () => Pattern.compilePattern( "w-*" ) ).should.throw();
				( () => Pattern.compilePattern( "X-*" ) ).should.throw();
				( () => Pattern.compilePattern( "x-*" ) ).should.throw();
				( () => Pattern.compilePattern( "#-*" ) ).should.throw();
			} );

			it( "accepts '*' after functional character 'A' adopting the latter one's behaviour but marking it optional", () => {
				const compiled = Pattern.compilePattern( "A*" );

				compiled.should.be.an.Array();
				compiled[0].should.be.an.Object().which.has.property( "code" ).which.is.equal( "A" );
				compiled[0].should.be.an.Object().which.has.property( "regexp" );
				compiled[0].should.be.an.Object().which.has.property( "format" );
				compiled[0].should.be.an.Object().which.has.property( "optional" ).which.is.true();
				compiled[0].should.be.an.Object().which.has.property( "multi" ).which.is.true();

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

				AllSpecials.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.false();
						compiled[0].format( char ).should.be.equal( char );
					} );
			} );

			it( "accepts '*' after functional character 'a' adopting the latter one's behaviour but marking it optional", () => {
				const compiled = Pattern.compilePattern( "a*" );

				compiled.should.be.an.Array();
				compiled[0].should.be.an.Object().which.has.property( "code" ).which.is.equal( "a" );
				compiled[0].should.be.an.Object().which.has.property( "regexp" );
				compiled[0].should.be.an.Object().which.has.property( "format" );
				compiled[0].should.be.an.Object().which.has.property( "optional" ).which.is.true();
				compiled[0].should.be.an.Object().which.has.property( "multi" ).which.is.true();

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

				AllSpecials.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.false();
						compiled[0].format( char ).should.be.equal( char );
					} );
			} );

			it( "accepts '*' after functional character 'X' adopting the latter one's behaviour but marking it optional", () => {
				const compiled = Pattern.compilePattern( "X*" );

				compiled.should.be.an.Array();
				compiled[0].should.be.an.Object().which.has.property( "code" ).which.is.equal( "X" );
				compiled[0].should.be.an.Object().which.has.property( "regexp" );
				compiled[0].should.be.an.Object().which.has.property( "format" );
				compiled[0].should.be.an.Object().which.has.property( "optional" ).which.is.true();
				compiled[0].should.be.an.Object().which.has.property( "multi" ).which.is.true();

				AllLetters.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.equal( /[a-f]/i.test( char ) );
						compiled[0].format( char ).should.be.equal( char.toUpperCase() );
					} );

				AllDigits.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.true();
						compiled[0].format( char ).should.be.equal( char );
					} );

				AllSpecials.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.false();
						compiled[0].format( char ).should.be.equal( char );
					} );
			} );

			it( "accepts '*' after functional character 'x' adopting the latter one's behaviour but marking it optional", () => {
				const compiled = Pattern.compilePattern( "x*" );

				compiled.should.be.an.Array();
				compiled[0].should.be.an.Object().which.has.property( "code" ).which.is.equal( "x" );
				compiled[0].should.be.an.Object().which.has.property( "regexp" );
				compiled[0].should.be.an.Object().which.has.property( "format" );
				compiled[0].should.be.an.Object().which.has.property( "optional" ).which.is.true();
				compiled[0].should.be.an.Object().which.has.property( "multi" ).which.is.true();

				AllLetters.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.equal( /[a-f]/i.test( char ) );
						compiled[0].format( char ).should.be.equal( char.toLowerCase() );
					} );

				AllDigits.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.true();
						compiled[0].format( char ).should.be.equal( char );
					} );

				AllSpecials.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.false();
						compiled[0].format( char ).should.be.equal( char );
					} );
			} );

			it( "accepts '*' after functional character '#' adopting the latter one's behaviour but marking it optional", () => {
				const compiled = Pattern.compilePattern( "#*" );

				compiled.should.be.an.Array();
				compiled[0].should.be.an.Object().which.has.property( "code" ).which.is.equal( "#" );
				compiled[0].should.be.an.Object().which.has.property( "regexp" );
				compiled[0].should.be.an.Object().which.has.property( "format" );
				compiled[0].should.be.an.Object().which.has.property( "optional" ).which.is.true();
				compiled[0].should.be.an.Object().which.has.property( "multi" ).which.is.true();

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

				AllSpecials.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.false();
						compiled[0].format( char ).should.be.equal( "0" );
					} );
			} );

			it( "accepts '*' after functional character 'W' adopting the latter one's behaviour but marking it optional", () => {
				const compiled = Pattern.compilePattern( "W*" );

				compiled.should.be.an.Array();
				compiled[0].should.be.an.Object().which.has.property( "code" ).which.is.equal( "W" );
				compiled[0].should.be.an.Object().which.has.property( "regexp" );
				compiled[0].should.be.an.Object().which.has.property( "format" );
				compiled[0].should.be.an.Object().which.has.property( "optional" ).which.is.true();
				compiled[0].should.be.an.Object().which.has.property( "multi" ).which.is.true();

				AllLetters.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.true();
						compiled[0].format( char ).should.be.equal( char.toUpperCase() );
					} );

				AllDigits.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.true();
						compiled[0].format( char ).should.be.equal( char );
					} );

				AllSpecials.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.false();
						compiled[0].format( char ).should.be.equal( char );
					} );
			} );

			it( "accepts '*' after functional character 'w' adopting the latter one's behaviour but marking it optional", () => {
				const compiled = Pattern.compilePattern( "w*" );

				compiled.should.be.an.Array();
				compiled[0].should.be.an.Object().which.has.property( "code" ).which.is.equal( "w" );
				compiled[0].should.be.an.Object().which.has.property( "regexp" );
				compiled[0].should.be.an.Object().which.has.property( "format" );
				compiled[0].should.be.an.Object().which.has.property( "optional" ).which.is.true();
				compiled[0].should.be.an.Object().which.has.property( "multi" ).which.is.true();

				AllLetters.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.true();
						compiled[0].format( char ).should.be.equal( char.toLowerCase() );
					} );

				AllDigits.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.true();
						compiled[0].format( char ).should.be.equal( char );
					} );

				AllSpecials.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.false();
						compiled[0].format( char ).should.be.equal( char );
					} );
			} );

			it( "rejects '+' in a leading position of a pattern", () => {
				( () => Pattern.compilePattern( "+" ) ).should.throw();
				( () => Pattern.compilePattern( "+A" ) ).should.throw();
				( () => Pattern.compilePattern( "+AAAAA" ) ).should.throw();
			} );

			it( "accepts '+' succeeding functional characters", () => {
				( () => Pattern.compilePattern( "A+" ) ).should.not.throw();
				( () => Pattern.compilePattern( "a+" ) ).should.not.throw();
				( () => Pattern.compilePattern( "X+" ) ).should.not.throw();
				( () => Pattern.compilePattern( "x+" ) ).should.not.throw();
				( () => Pattern.compilePattern( "#+" ) ).should.not.throw();
				( () => Pattern.compilePattern( "W+" ) ).should.not.throw();
				( () => Pattern.compilePattern( "w+" ) ).should.not.throw();
			} );

			it( "rejects '+' succeeding accepted quantifier '+'", () => {
				( () => Pattern.compilePattern( "A++" ) ).should.throw();
				( () => Pattern.compilePattern( "a++" ) ).should.throw();
				( () => Pattern.compilePattern( "X++" ) ).should.throw();
				( () => Pattern.compilePattern( "x++" ) ).should.throw();
				( () => Pattern.compilePattern( "#++" ) ).should.throw();
				( () => Pattern.compilePattern( "W++" ) ).should.throw();
				( () => Pattern.compilePattern( "w++" ) ).should.throw();

				( () => Pattern.compilePattern( "A+++" ) ).should.throw();
				( () => Pattern.compilePattern( "a+++" ) ).should.throw();
				( () => Pattern.compilePattern( "X+++" ) ).should.throw();
				( () => Pattern.compilePattern( "x+++" ) ).should.throw();
				( () => Pattern.compilePattern( "#+++" ) ).should.throw();
				( () => Pattern.compilePattern( "W+++" ) ).should.throw();
				( () => Pattern.compilePattern( "w+++" ) ).should.throw();
			} );

			it( "rejects '+' succeeding literal characters", () => {
				( () => Pattern.compilePattern( "-+" ) ).should.throw();
				( () => Pattern.compilePattern( "A-+" ) ).should.throw();
				( () => Pattern.compilePattern( "a-+" ) ).should.throw();
				( () => Pattern.compilePattern( "W-+" ) ).should.throw();
				( () => Pattern.compilePattern( "w-+" ) ).should.throw();
				( () => Pattern.compilePattern( "X-+" ) ).should.throw();
				( () => Pattern.compilePattern( "x-+" ) ).should.throw();
				( () => Pattern.compilePattern( "#-+" ) ).should.throw();
			} );

			it( "accepts '+' after functional character 'A' adopting the latter one's behaviour but marking it optional", () => {
				const compiled = Pattern.compilePattern( "A+" );

				compiled.should.be.an.Array();
				compiled[0].should.be.an.Object().which.has.property( "code" ).which.is.equal( "A" );
				compiled[0].should.be.an.Object().which.has.property( "regexp" );
				compiled[0].should.be.an.Object().which.has.property( "format" );
				compiled[0].should.be.an.Object().which.has.property( "optional" ).which.is.false();
				compiled[0].should.be.an.Object().which.has.property( "multi" ).which.is.true();

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

				AllSpecials.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.false();
						compiled[0].format( char ).should.be.equal( char );
					} );
			} );

			it( "accepts '+' after functional character 'a' adopting the latter one's behaviour but marking it optional", () => {
				const compiled = Pattern.compilePattern( "a+" );

				compiled.should.be.an.Array();
				compiled[0].should.be.an.Object().which.has.property( "code" ).which.is.equal( "a" );
				compiled[0].should.be.an.Object().which.has.property( "regexp" );
				compiled[0].should.be.an.Object().which.has.property( "format" );
				compiled[0].should.be.an.Object().which.has.property( "optional" ).which.is.false();
				compiled[0].should.be.an.Object().which.has.property( "multi" ).which.is.true();

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

				AllSpecials.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.false();
						compiled[0].format( char ).should.be.equal( char );
					} );
			} );

			it( "accepts '+' after functional character 'X' adopting the latter one's behaviour but marking it optional", () => {
				const compiled = Pattern.compilePattern( "X+" );

				compiled.should.be.an.Array();
				compiled[0].should.be.an.Object().which.has.property( "code" ).which.is.equal( "X" );
				compiled[0].should.be.an.Object().which.has.property( "regexp" );
				compiled[0].should.be.an.Object().which.has.property( "format" );
				compiled[0].should.be.an.Object().which.has.property( "optional" ).which.is.false();
				compiled[0].should.be.an.Object().which.has.property( "multi" ).which.is.true();

				AllLetters.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.equal( /[a-f]/i.test( char ) );
						compiled[0].format( char ).should.be.equal( char.toUpperCase() );
					} );

				AllDigits.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.true();
						compiled[0].format( char ).should.be.equal( char );
					} );

				AllSpecials.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.false();
						compiled[0].format( char ).should.be.equal( char );
					} );
			} );

			it( "accepts '+' after functional character 'x' adopting the latter one's behaviour but marking it optional", () => {
				const compiled = Pattern.compilePattern( "x+" );

				compiled.should.be.an.Array();
				compiled[0].should.be.an.Object().which.has.property( "code" ).which.is.equal( "x" );
				compiled[0].should.be.an.Object().which.has.property( "regexp" );
				compiled[0].should.be.an.Object().which.has.property( "format" );
				compiled[0].should.be.an.Object().which.has.property( "optional" ).which.is.false();
				compiled[0].should.be.an.Object().which.has.property( "multi" ).which.is.true();

				AllLetters.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.equal( /[a-f]/i.test( char ) );
						compiled[0].format( char ).should.be.equal( char.toLowerCase() );
					} );

				AllDigits.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.true();
						compiled[0].format( char ).should.be.equal( char );
					} );

				AllSpecials.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.false();
						compiled[0].format( char ).should.be.equal( char );
					} );
			} );

			it( "accepts '+' after functional character '#' adopting the latter one's behaviour but marking it optional", () => {
				const compiled = Pattern.compilePattern( "#+" );

				compiled.should.be.an.Array();
				compiled[0].should.be.an.Object().which.has.property( "code" ).which.is.equal( "#" );
				compiled[0].should.be.an.Object().which.has.property( "regexp" );
				compiled[0].should.be.an.Object().which.has.property( "format" );
				compiled[0].should.be.an.Object().which.has.property( "optional" ).which.is.false();
				compiled[0].should.be.an.Object().which.has.property( "multi" ).which.is.true();

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

				AllSpecials.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.false();
						compiled[0].format( char ).should.be.equal( "0" );
					} );
			} );

			it( "accepts '+' after functional character 'W' adopting the latter one's behaviour but marking it optional", () => {
				const compiled = Pattern.compilePattern( "W+" );

				compiled.should.be.an.Array();
				compiled[0].should.be.an.Object().which.has.property( "code" ).which.is.equal( "W" );
				compiled[0].should.be.an.Object().which.has.property( "regexp" );
				compiled[0].should.be.an.Object().which.has.property( "format" );
				compiled[0].should.be.an.Object().which.has.property( "optional" ).which.is.false();
				compiled[0].should.be.an.Object().which.has.property( "multi" ).which.is.true();

				AllLetters.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.true();
						compiled[0].format( char ).should.be.equal( char.toUpperCase() );
					} );

				AllDigits.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.true();
						compiled[0].format( char ).should.be.equal( char );
					} );

				AllSpecials.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.false();
						compiled[0].format( char ).should.be.equal( char );
					} );
			} );

			it( "accepts '+' after functional character 'w' adopting the latter one's behaviour but marking it optional", () => {
				const compiled = Pattern.compilePattern( "w+" );

				compiled.should.be.an.Array();
				compiled[0].should.be.an.Object().which.has.property( "code" ).which.is.equal( "w" );
				compiled[0].should.be.an.Object().which.has.property( "regexp" );
				compiled[0].should.be.an.Object().which.has.property( "format" );
				compiled[0].should.be.an.Object().which.has.property( "optional" ).which.is.false();
				compiled[0].should.be.an.Object().which.has.property( "multi" ).which.is.true();

				AllLetters.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.true();
						compiled[0].format( char ).should.be.equal( char.toLowerCase() );
					} );

				AllDigits.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.true();
						compiled[0].format( char ).should.be.equal( char );
					} );

				AllSpecials.split( "" )
					.forEach( char => {
						compiled[0].regexp.test( char ).should.be.false();
						compiled[0].format( char ).should.be.equal( char );
					} );
			} );

			it( "rejects '?' succeeding accepted quantifier '*' or '+'", () => {
				( () => Pattern.compilePattern( "A*?" ) ).should.throw();
				( () => Pattern.compilePattern( "a*?" ) ).should.throw();
				( () => Pattern.compilePattern( "X*?" ) ).should.throw();
				( () => Pattern.compilePattern( "x*?" ) ).should.throw();
				( () => Pattern.compilePattern( "#*?" ) ).should.throw();
				( () => Pattern.compilePattern( "W*?" ) ).should.throw();
				( () => Pattern.compilePattern( "w*?" ) ).should.throw();

				( () => Pattern.compilePattern( "A*???" ) ).should.throw();
				( () => Pattern.compilePattern( "a*???" ) ).should.throw();
				( () => Pattern.compilePattern( "X*???" ) ).should.throw();
				( () => Pattern.compilePattern( "x*???" ) ).should.throw();
				( () => Pattern.compilePattern( "#*???" ) ).should.throw();
				( () => Pattern.compilePattern( "W*???" ) ).should.throw();
				( () => Pattern.compilePattern( "w*???" ) ).should.throw();

				( () => Pattern.compilePattern( "A+?" ) ).should.throw();
				( () => Pattern.compilePattern( "a+?" ) ).should.throw();
				( () => Pattern.compilePattern( "X+?" ) ).should.throw();
				( () => Pattern.compilePattern( "x+?" ) ).should.throw();
				( () => Pattern.compilePattern( "#+?" ) ).should.throw();
				( () => Pattern.compilePattern( "W+?" ) ).should.throw();
				( () => Pattern.compilePattern( "w+?" ) ).should.throw();

				( () => Pattern.compilePattern( "A+???" ) ).should.throw();
				( () => Pattern.compilePattern( "a+???" ) ).should.throw();
				( () => Pattern.compilePattern( "X+???" ) ).should.throw();
				( () => Pattern.compilePattern( "x+???" ) ).should.throw();
				( () => Pattern.compilePattern( "#+???" ) ).should.throw();
				( () => Pattern.compilePattern( "W+???" ) ).should.throw();
				( () => Pattern.compilePattern( "w+???" ) ).should.throw();
			} );

			it( "rejects '*' or '+' succeeding accepted quantifier '?'", () => {
				( () => Pattern.compilePattern( "A?*" ) ).should.throw();
				( () => Pattern.compilePattern( "a?*" ) ).should.throw();
				( () => Pattern.compilePattern( "X?*" ) ).should.throw();
				( () => Pattern.compilePattern( "x?*" ) ).should.throw();
				( () => Pattern.compilePattern( "#?*" ) ).should.throw();
				( () => Pattern.compilePattern( "W?*" ) ).should.throw();
				( () => Pattern.compilePattern( "w?*" ) ).should.throw();

				( () => Pattern.compilePattern( "A?+" ) ).should.throw();
				( () => Pattern.compilePattern( "a?+" ) ).should.throw();
				( () => Pattern.compilePattern( "X?+" ) ).should.throw();
				( () => Pattern.compilePattern( "x?+" ) ).should.throw();
				( () => Pattern.compilePattern( "#?+" ) ).should.throw();
				( () => Pattern.compilePattern( "W?+" ) ).should.throw();
				( () => Pattern.compilePattern( "w?+" ) ).should.throw();
			} );

			it( "rejects '*' or '+' succeeding each other accepted quantifier '?'", () => {
				( () => Pattern.compilePattern( "A*+" ) ).should.throw();
				( () => Pattern.compilePattern( "a*+" ) ).should.throw();
				( () => Pattern.compilePattern( "X*+" ) ).should.throw();
				( () => Pattern.compilePattern( "x*+" ) ).should.throw();
				( () => Pattern.compilePattern( "#*+" ) ).should.throw();
				( () => Pattern.compilePattern( "W*+" ) ).should.throw();
				( () => Pattern.compilePattern( "w*+" ) ).should.throw();

				( () => Pattern.compilePattern( "A+*" ) ).should.throw();
				( () => Pattern.compilePattern( "a+*" ) ).should.throw();
				( () => Pattern.compilePattern( "X+*" ) ).should.throw();
				( () => Pattern.compilePattern( "x+*" ) ).should.throw();
				( () => Pattern.compilePattern( "#+*" ) ).should.throw();
				( () => Pattern.compilePattern( "W+*" ) ).should.throw();
				( () => Pattern.compilePattern( "w+*" ) ).should.throw();
			} );
		} );

		describe( "handles literals in a pattern which", () => {
			it( "ignores leading/trailing whitespace", () => {
				Pattern.compilePattern( "   " ).should.be.an.Array().which.is.empty();
				Pattern.compilePattern( " \nA\r " ).should.be.an.Array().which.has.length( 1 );
				Pattern.compilePattern( "\f - \t" ).should.be.an.Array().which.is.empty();
				Pattern.compilePattern( "\f - \t", { keepTrailingLiterals: true } ).should.be.an.Array().which.has.length( 1 );
			} );

			it( "reduces sequence of whitespace characters", () => {
				Pattern.compilePattern( "\\+  A" ).should.be.an.Array().which.has.length( 3 );
				Pattern.compilePattern( "\\+ \f \t A" ).should.be.an.Array().which.has.length( 3 );

				Pattern.compilePattern( "A  _", { keepTrailingLiterals: true } ).should.be.an.Array().which.has.length( 3 );
				Pattern.compilePattern( "A \r\n _", { keepTrailingLiterals: true } ).should.be.an.Array().which.has.length( 3 );
			} );

			it( "replaces sequence of any whitespace characters with single SPC", () => {
				Pattern.compilePattern( "\\+ \f \t A" )[1].should.be.an.Object().which.is.deepEqual( {
					type: "literal",
					literals: " ",
					keep: false,
				} );

				Pattern.compilePattern( "A  _", { keepTrailingLiterals: true } )[1].should.be.an.Object().which.is.deepEqual( {
					type: "literal",
					literals: " ",
					keep: false,
				} );

				Pattern.compilePattern( "A\n_", { keepTrailingLiterals: true } )[1].should.be.an.Object().which.is.deepEqual( {
					type: "literal",
					literals: " ",
					keep: false,
				} );

				Pattern.compilePattern( "A \r\n _", { keepTrailingLiterals: true } )[1].should.be.an.Object().which.is.deepEqual( {
					type: "literal",
					literals: " ",
					keep: false,
				} );
			} );

			it( "are ignored in trailing position", () => {
				Pattern.compilePattern( "_" ).should.be.an.Array().which.is.empty();
				Pattern.compilePattern( "\\+" ).should.be.an.Array().which.is.empty();
				Pattern.compilePattern( "-" ).should.be.an.Array().which.is.empty();
				Pattern.compilePattern( "." ).should.be.an.Array().which.is.empty();
			} );

			it( "are kept in trailing position on demand", () => {
				Pattern.compilePattern( "_", { keepTrailingLiterals: true } ).should.be.an.Array().which.has.length( 1 );
				Pattern.compilePattern( "\\+", { keepTrailingLiterals: true } ).should.be.an.Array().which.has.length( 1 );
				Pattern.compilePattern( "-", { keepTrailingLiterals: true } ).should.be.an.Array().which.has.length( 1 );
				Pattern.compilePattern( ".", { keepTrailingLiterals: true } ).should.be.an.Array().which.has.length( 1 );
			} );

			it( "are rejected on demand when in trailing position", () => {
				( () => Pattern.compilePattern( "_", { ignoreTrailingLiterals: false } ) ).should.throw();
				( () => Pattern.compilePattern( "\\+", { ignoreTrailingLiterals: false } ) ).should.throw();
				( () => Pattern.compilePattern( "-", { ignoreTrailingLiterals: false } ) ).should.throw();
				( () => Pattern.compilePattern( ".", { ignoreTrailingLiterals: false } ) ).should.throw();
				( () => Pattern.compilePattern( "_", { ignoreTrailingLiterals: false, keepTrailingLiterals: true } ) ).should.throw();
				( () => Pattern.compilePattern( "\\+", { ignoreTrailingLiterals: false, keepTrailingLiterals: true } ) ).should.throw();
				( () => Pattern.compilePattern( "-", { ignoreTrailingLiterals: false, keepTrailingLiterals: true } ) ).should.throw();
				( () => Pattern.compilePattern( ".", { ignoreTrailingLiterals: false, keepTrailingLiterals: true } ) ).should.throw();
			} );

			it( "provides descriptor for every literal element in provided pattern", () => {
				const source = "]-.,_ =&:;<>|(){}/$\"'`^";
				const numSource = source.length;

				const compiled = Pattern.compilePattern( source, { keepTrailingLiterals: true } );

				compiled.should.be.an.Array().which.has.length( numSource );

				for ( let i = 0; i < numSource; i++ ) {
					compiled[i].should.be.an.Object();
					compiled[i].should.have.property( "type" ).which.is.a.String().and.equal( "literal" );
					compiled[i].should.have.property( "literals" ).which.is.a.String().and.equal( source[i] );
					compiled[i].should.have.property( "keep" ).which.is.false();
				}
			} );

			it( "supports compound literal representing a list of actual literals with any listed literals matching whole compound literal", () => {
				const source = "[-.,_ =&:;<>|(){}/$\"'`^]";
				const compiled = Pattern.compilePattern( source, { keepTrailingLiterals: true } );

				compiled.should.be.an.Array().which.has.length( 1 );

				compiled[0].should.be.an.Object().which.has.property( "type" ).which.is.a.String().and.equal( "literal" );
				compiled[0].should.have.property( "literals" ).which.is.a.String().and.equal( source.slice( 1, -1 ) );
				compiled[0].should.have.property( "keep" ).which.is.false();
			} );

			it( "fails on providing unfinished compound literal", () => {
				( () => Pattern.compilePattern( "-.\\+[_ =&" ) ).should.throw();
				( () => Pattern.compilePattern( "-.\\+[_ ]=&" ) ).should.not.throw();
				( () => Pattern.compilePattern( "-.\\+[_ =]&" ) ).should.not.throw();
				( () => Pattern.compilePattern( "-.\\+[_ =&]" ) ).should.not.throw();
			} );

			it( "fails on providing empty compound literal (for considering closing bracket as part of listed options)", () => {
				( () => Pattern.compilePattern( "-.\\+[]_ =&" ) ).should.throw();
			} );

			it( "accepts ']' in a compound literal when given in leading position of compound literal, only", () => {
				let source = "[]-.,_ =&:;<>|(){}/$\"'`^]";
				let compiled = Pattern.compilePattern( source, { keepTrailingLiterals: true } );

				compiled.should.be.an.Array().which.has.length( 1 );
				compiled[0].should.have.property( "literals" ).which.match( /]/ );

				source = "[-].,_ =&:;<>|(){}/$\"'`^]";
				compiled = Pattern.compilePattern( source, { keepTrailingLiterals: true } );

				compiled.should.be.an.Array().which.has.property( "length" ).which.is.greaterThan( 1 );
				compiled[0].should.have.property( "literals" ).which.not.match( /]/ );
			} );

			it( "supports escaping non-matching functional characters by preceding them with backslash to be considered literals", () => {
				const source = "?*+[!\\";
				const numSource = source.length;

				for ( let i = 0; i < numSource; i++ ) {
					( () => Pattern.compilePattern( source[i], { keepTrailingLiterals: true } ) ).should.throw();

					const compiled = Pattern.compilePattern( "\\" + source[i], { keepTrailingLiterals: true } );

					compiled.should.be.an.Array().which.has.length( 1 );
					compiled[0].should.be.an.Object();
					compiled[0].should.have.property( "type" ).which.is.a.String().and.equal( "literal" );
					compiled[0].should.have.property( "literals" ).which.is.a.String().and.equal( source[i] );
					compiled[0].should.have.property( "keep" ).which.is.false();
				}
			} );

			it( "supports escaping non-matching functional characters by wrapping them in single-character compound literals to be considered literals", () => {
				const source = "?*+[!\\";
				const numSource = source.length;

				for ( let i = 0; i < numSource; i++ ) {
					( () => Pattern.compilePattern( source[i], { keepTrailingLiterals: true } ) ).should.throw();

					const compiled = Pattern.compilePattern( "[" + source[i] + "]", { keepTrailingLiterals: true } );

					compiled.should.be.an.Array().which.has.length( 1 );
					compiled[0].should.be.an.Object();
					compiled[0].should.have.property( "type" ).which.is.a.String().and.equal( "literal" );
					compiled[0].should.have.property( "literals" ).which.is.a.String().and.equal( source[i] );
					compiled[0].should.have.property( "keep" ).which.is.false();
				}
			} );

			it( "supports escaping matching functional characters by preceding them with backslash to be considered literals", () => {
				const source = "AaWwXx#";
				const numSource = source.length;

				for ( let i = 0; i < numSource; i++ ) {
					( () => Pattern.compilePattern( source[i], { keepTrailingLiterals: true } ) ).should.not.throw();

					const compiled = Pattern.compilePattern( "\\" + source[i], { keepTrailingLiterals: true } );

					compiled.should.be.an.Array().which.has.length( 1 );
					compiled[0].should.be.an.Object();
					compiled[0].should.have.property( "type" ).which.is.a.String().and.equal( "literal" );
					compiled[0].should.have.property( "literals" ).which.is.a.String().and.equal( source[i] );
					compiled[0].should.have.property( "keep" ).which.is.false();
				}
			} );

			it( "supports escaping matching functional characters by wrapping them in single-character compound literals to be considered literals", () => {
				const source = "AaXxWw#";
				const numSource = source.length;

				for ( let i = 0; i < numSource; i++ ) {
					( () => Pattern.compilePattern( source[i], { keepTrailingLiterals: true } ) ).should.not.throw();

					const compiled = Pattern.compilePattern( "[" + source[i] + "]", { keepTrailingLiterals: true } );

					compiled.should.be.an.Array().which.has.length( 1 );
					compiled[0].should.be.an.Object();
					compiled[0].should.have.property( "type" ).which.is.a.String().and.equal( "literal" );
					compiled[0].should.have.property( "literals" ).which.is.a.String().and.equal( source[i] );
					compiled[0].should.have.property( "keep" ).which.is.false();
				}
			} );

			it( "supports modifier '!' requesting to keep literal in valuable string returned from parser", () => {
				const source = "]-.,_=&:;<>|(){}/$\"'`^";
				const numSource = source.length;

				for ( let i = 0; i < numSource; i++ ) {
					let compiled = Pattern.compilePattern( source[i], { keepTrailingLiterals: true } );

					compiled.should.be.an.Array().which.has.length( 1 );

					compiled[0].should.be.an.Object();
					compiled[0].should.have.property( "type" ).which.is.a.String().and.equal( "literal" );
					compiled[0].should.have.property( "literals" ).which.is.a.String().and.equal( source[i] );
					compiled[0].should.have.property( "keep" ).which.is.false();

					compiled = Pattern.compilePattern( source[i] + "!", { keepTrailingLiterals: true } );

					compiled.should.be.an.Array().which.has.length( 1 );

					compiled[0].should.be.an.Object();
					compiled[0].should.have.property( "type" ).which.is.a.String().and.equal( "literal" );
					compiled[0].should.have.property( "literals" ).which.is.a.String().and.equal( source[i] );
					compiled[0].should.have.property( "keep" ).which.is.true();
				}
			} );

			it( "rejects modifier '!' in a leading position", () => {
				( () => Pattern.compilePattern( "!", { keepTrailingLiterals: true } ) ).should.throw();

				const source = "]-.,_=&:;<>|(){}/$\"'`^";
				const numSource = source.length;

				for ( let i = 0; i < numSource; i++ ) {
					( () => Pattern.compilePattern( "!" + source[i], { keepTrailingLiterals: true } ) ).should.throw();
					( () => Pattern.compilePattern( source[i] + "!", { keepTrailingLiterals: true } ) ).should.not.throw();
				}
			} );
		} );
	} );

	describe( "exposes method parse() which", () => {
		it( "is a function", () => {
			Pattern.parse.should.be.Function();
		} );

		it( "requires two parameters", () => {
			Pattern.parse.should.have.length( 2 );
		} );

		it( "returns object with filtered and formatted version of provided input", () => {
			let result;

			( () => ( result = Pattern.parse( "", "" ) ) ).should.not.throw();

			result.should.be.Object().which.has.size( 2 ).and.has.properties( "formatted", "valuable" );
			result.formatted.should.be.Object().which.has.size( 2 ).and.has.properties( "value", "cursor" );
			result.valuable.should.be.Object().which.has.size( 2 ).and.has.properties( "value", "cursor" );
		} );

		describe( "extracts characters matching pattern from given input and so", () => {
			it( "returns empty string on empty input and empty pattern", () => {
				Pattern.parse( "", "" ).formatted.value.should.be.String().which.is.empty();
			} );

			it( "returns empty string on empty input", () => {
				Pattern.parse( "", "AAAAAA" ).formatted.value.should.be.String().which.is.empty();
			} );

			it( "returns empty string on empty pattern", () => {
				Pattern.parse( "AAAAAA", "" ).formatted.value.should.be.String().which.is.empty();
			} );

			it( "returns empty string on input and/or pattern consisting of whitespace, only", () => {
				Pattern.parse( "     ", "" ).formatted.value.should.be.String().which.is.empty();
				Pattern.parse( "     ", "     " ).formatted.value.should.be.String().which.is.empty();
				Pattern.parse( "", "     " ).formatted.value.should.be.String().which.is.empty();
			} );

			it( "returns uppercase literals ", () => {
				Pattern.parse( "     ", "" ).formatted.value.should.be.String().which.is.empty();
				Pattern.parse( "     ", "     " ).formatted.value.should.be.String().which.is.empty();
				Pattern.parse( "", "     " ).formatted.value.should.be.String().which.is.empty();
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
						Pattern.parse( input, pattern ).formatted.value.should.be.equal( result );

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
						Pattern.parse( input, pattern ).formatted.value.should.be.equal( result );

						// provided input is too short, so parse() should consider input invalid on demand
						( () => Pattern.parse( input, pattern, { ignoreMissing: false } ) ).should.throw();
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
						Pattern.parse( input, pattern ).formatted.value.should.be.equal( result );

						// there is more input than expected by patter, so parse() should consider input invalid on demand
						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
					} );
			} );
		} );

		describe( "extracts partially optional sequence of letters that", () => {
			it( "is matching size of pattern", () => {
				[
					[ "ABCD", "A????", "ABCD" ],
					[ "abcd", "A????", "ABCD" ],
					[ "ABCD", "a????", "abcd" ],
					[ "abcd", "a????", "abcd" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).formatted.value.should.be.equal( result );

						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
					} );
			} );

			it( "is shorter than pattern", () => {
				[
					[ "AB", "A????", "AB" ],
					[ "ab", "A????", "AB" ],
					[ "AB", "a????", "ab" ],
					[ "ab", "a????", "ab" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).formatted.value.should.be.equal( result );

						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
					} );
			} );

			it( "is truncated to size of pattern", () => {
				[
					[ "ABCD", "A??", "AB" ],
					[ "abcd", "A??", "AB" ],
					[ "ABCD", "a??", "ab" ],
					[ "abcd", "a??", "ab" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).formatted.value.should.be.equal( result );

						// there is more input than expected by pattern, so parse() should consider input invalid on demand
						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
					} );
			} );
		} );

		describe( "provides string which", () => {
			it( "is formatted by means of containing all intermittent literals of pattern", () => {
				for ( const [ input, pattern, , formatted ] of data() ) {
					Pattern.parse( input, pattern ).formatted.value.should.be.String().which.is.equal( formatted );
				}
			} );

			it( "is limited to valuable characters of pattern", () => {
				for ( const [ input, pattern, valuable ] of data() ) {
					Pattern.parse( input, pattern ).valuable.value.should.be.String().which.is.equal( valuable );
				}
			} );

			it( "is keeping marked literals of pattern in string limited to valuable characters", () => {
				for ( const [ input, pattern, valuable, formatted ] of keepingData() ) {
					Pattern.parse( input, pattern ).valuable.value.should.be.String().which.is.equal( valuable );
					Pattern.parse( input, pattern ).formatted.value.should.be.String().which.is.equal( formatted );
				}
			} );

			/**
			 * Generates test data.
			 *
			 * @return {IterableIterator<*>} generated data iterator
			 */
			function* data() {
				yield [ "ABC", "AAA", "ABC", "ABC" ];
				yield [ "ABC", "A AA", "ABC", "A BC" ];
				yield [ "A BC", "A AA", "ABC", "A BC" ];
				yield [ "A   BC", "A AA", "ABC", "A BC" ];
				yield [ "A   B  C  ", "A AA", "ABC", "A BC" ];
				yield [ "A.B-C", "A.A-A", "ABC", "A.B-C" ];
				yield [ "A.,_B&%-C", "AA A", "ABC", "AB C" ];
			}

			/**
			 * Generates further test data.
			 *
			 * @return {IterableIterator<*>} generated data iterator
			 */
			function* keepingData() {
				yield [ "123,456", "###,###", "123456", "123,456" ];
				yield [ "123,456", "###,!###", "123,456", "123,456" ];
				yield [ "123456", "###,!###", "123,456", "123,456" ];
				yield [ "123.456", "###,!###", "123,456", "123,456" ];
				yield [ "123456", "###,!###", "123,456", "123,456" ];
				yield [ "123,456", "###[.,]!###", "123,456", "123,456" ];
				yield [ "123456", "###[.,]!###", "123.456", "123.456" ];
			}
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
							Pattern.parse( input, pattern ).formatted.value.should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
							( () => Pattern.parse( input, pattern, { ignoreMissing: false } ) ).should.not.throw();
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
							Pattern.parse( input, pattern ).formatted.value.should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
							( () => Pattern.parse( input, pattern, { ignoreMissing: false } ) ).should.not.throw();
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
							Pattern.parse( input, pattern ).formatted.value.should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
							( () => Pattern.parse( input, pattern, { ignoreMissing: false } ) ).should.not.throw();
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
							Pattern.parse( input, pattern ).formatted.value.should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
							( () => Pattern.parse( input, pattern, { ignoreMissing: false } ) ).should.throw();
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
							Pattern.parse( input, pattern ).formatted.value.should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
							( () => Pattern.parse( input, pattern, { ignoreMissing: false } ) ).should.throw();
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
							Pattern.parse( input, pattern ).formatted.value.should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
							( () => Pattern.parse( input, pattern, { ignoreMissing: false } ) ).should.throw();
						} );
				} );
			} );

			describe( "contains less letters than _supported_ by pattern and", () => {
				it( "no literals", () => {
					[
						[ "ABC", "AA A??", "AB C" ],
						[ "abc", "AA A??", "AB C" ],
						[ "ABC", "aa a??", "ab c" ],
						[ "abc", "aa a??", "ab c" ],
						[ "ABC", "AA-A??", "AB-C" ],
						[ "abc", "AA-A??", "AB-C" ],
						[ "ABC", "aa-a??", "ab-c" ],
						[ "abc", "aa-a??", "ab-c" ],
						[ "ABC", "AA[ -]A??", "AB C" ],
						[ "abc", "AA[ -]A??", "AB C" ],
						[ "ABC", "aa[ -]a??", "ab c" ],
						[ "abc", "aa[ -]a??", "ab c" ],
						[ "ABC", "AA[- ]A??", "AB-C" ],
						[ "abc", "AA[- ]A??", "AB-C" ],
						[ "ABC", "aa[- ]a??", "ab-c" ],
						[ "abc", "aa[- ]a??", "ab-c" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern ).formatted.value.should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
							( () => Pattern.parse( input, pattern, { ignoreMissing: false } ) ).should.not.throw();
						} );
				} );

				it( "expected literals", () => {
					[
						[ "AB C", "AA A??", "AB C" ],
						[ "ab c", "AA A??", "AB C" ],
						[ "AB C", "aa a??", "ab c" ],
						[ "ab c", "aa a??", "ab c" ],
						[ "AB-C", "AA-A??", "AB-C" ],
						[ "ab-c", "AA-A??", "AB-C" ],
						[ "AB-C", "aa-a??", "ab-c" ],
						[ "ab-c", "aa-a??", "ab-c" ],
						[ "AB C", "AA[ -]A??", "AB C" ],
						[ "ab c", "AA[ -]A??", "AB C" ],
						[ "AB C", "aa[ -]a??", "ab c" ],
						[ "ab c", "aa[ -]a??", "ab c" ],
						[ "AB-C", "AA[- ]A??", "AB-C" ],
						[ "ab-c", "AA[- ]A??", "AB-C" ],
						[ "AB-C", "aa[- ]a??", "ab-c" ],
						[ "ab-c", "aa[- ]a??", "ab-c" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern ).formatted.value.should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
							( () => Pattern.parse( input, pattern, { ignoreMissing: false } ) ).should.not.throw();
						} );
				} );

				it( "unexpected literals to be ignored and replaced w/ (first) expected one", () => {
					[
						[ "AB-C", "AA A??", "AB C" ],
						[ "ab-c", "AA A??", "AB C" ],
						[ "AB-C", "aa a??", "ab c" ],
						[ "ab-c", "aa a??", "ab c" ],
						[ "AB C", "AA-A??", "AB-C" ],
						[ "ab c", "AA-A??", "AB-C" ],
						[ "AB C", "aa-a??", "ab-c" ],
						[ "ab c", "aa-a??", "ab-c" ],
						[ "AB_C", "AA-A??", "AB-C" ],
						[ "ab.c", "AA-A??", "AB-C" ],
						[ "AB/C", "aa-a??", "ab-c" ],
						[ "ab!c", "aa-a??", "ab-c" ],
						[ "AB_C", "AA[- ]A??", "AB-C" ],
						[ "ab.c", "AA[- ]A??", "AB-C" ],
						[ "AB/C", "aa[- ]a??", "ab-c" ],
						[ "ab!c", "aa[- ]a??", "ab-c" ],
						[ "AB_C", "AA[ -]A??", "AB C" ],
						[ "ab.c", "AA[ -]A??", "AB C" ],
						[ "AB/C", "aa[ -]a??", "ab c" ],
						[ "ab!c", "aa[ -]a??", "ab c" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern ).formatted.value.should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
							( () => Pattern.parse( input, pattern, { ignoreMissing: false } ) ).should.not.throw();
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
						Pattern.parse( input, pattern ).formatted.value.should.be.equal( result );

						// actually input doesn't match pattern, so parse() should consider input invalid on demand
						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
						( () => Pattern.parse( input, pattern, { ignoreMissing: false } ) ).should.not.throw();
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
						Pattern.parse( input, pattern ).formatted.value.should.be.equal( result );

						// actually input doesn't match pattern, so parse() should consider input invalid on demand
						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
						( () => Pattern.parse( input, pattern, { ignoreMissing: false } ) ).should.not.throw();
					} );
			} );

			it( "prematurely provides _expected_ literal on a pattern _supporting_ additional input preceding the expected literal", () => {
				[
					[ "A BC", "A?? A??", "A BC" ],
					[ "a bc", "A?? A??", "A BC" ],
					[ "A BC", "a?? a??", "a bc" ],
					[ "a bc", "a?? a??", "a bc" ],
					[ "A-BC", "A??-A??", "A-BC" ],
					[ "a-bc", "A??-A??", "A-BC" ],
					[ "A-BC", "a??-a??", "a-bc" ],
					[ "a-bc", "a??-a??", "a-bc" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).formatted.value.should.be.equal( result );

						// actually input matches pattern
						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
						( () => Pattern.parse( input, pattern, { ignoreMissing: false } ) ).should.not.throw();
					} );
			} );

			it( "prematurely provides _unexpected_ literal on a pattern _supporting_ additional input preceding the expected literal", () => {
				[
					[ "A-BC", "A?? A??", "AB C" ],
					[ "a-bc", "A?? A??", "AB C" ],
					[ "A-BC", "a?? a??", "ab c" ],
					[ "a-bc", "a?? a??", "ab c" ],
					[ "A BC", "A??-A??", "AB-C" ],
					[ "a bc", "A??-A??", "AB-C" ],
					[ "A BC", "a??-a??", "ab-c" ],
					[ "a bc", "a??-a??", "ab-c" ],
					[ "A_BC", "A??-A??", "AB-C" ],
					[ "a.bc", "A??-A??", "AB-C" ],
					[ "A/BC", "a??-a??", "ab-c" ],
					[ "a!bc", "a??-a??", "ab-c" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).formatted.value.should.be.equal( result );

						// actually input doesn't match pattern due to mismatching literal, so parse() should consider input invalid on demand
						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.throw();
						( () => Pattern.parse( input, pattern, { ignoreMissing: false } ) ).should.not.throw();
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
					[ "AB", "A?? AA", "AB" ],
					[ "ab", "A?? AA", "AB" ],
					[ "AB", "a?? aa", "ab" ],
					[ "ab", "a?? aa", "ab" ],
					[ "AB", "A??-AA", "AB" ],
					[ "ab", "A??-AA", "AB" ],
					[ "AB", "a??-aa", "ab" ],
					[ "ab", "a??-aa", "ab" ],
				]
					.forEach( ( [ input, pattern, result ] ) => {
						Pattern.parse( input, pattern ).formatted.value.should.be.equal( result );

						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
						( () => Pattern.parse( input, pattern, { ignoreMissing: false } ) ).should.throw();
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
						[ "AB ", "A?? AA", "AB " ],
						[ "ab ", "A?? AA", "AB " ],
						[ "AB ", "a?? aa", "ab " ],
						[ "ab ", "a?? aa", "ab " ],
						[ "AB-", "A??-AA", "AB-" ],
						[ "ab-", "A??-AA", "AB-" ],
						[ "AB-", "a??-aa", "ab-" ],
						[ "ab-", "a??-aa", "ab-" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern ).formatted.value.should.be.equal( result );

							( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
							( () => Pattern.parse( input, pattern, { ignoreMissing: false } ) ).should.throw();
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
						[ "AB ", "A?? AA", "AB" ],
						[ "ab ", "A?? AA", "AB" ],
						[ "AB ", "a?? aa", "ab" ],
						[ "ab ", "a?? aa", "ab" ],
						[ "AB-", "A??-AA", "AB" ],
						[ "ab-", "A??-AA", "AB" ],
						[ "AB-", "a??-aa", "ab" ],
						[ "ab-", "a??-aa", "ab" ],
					]
						.forEach( ( [ input, pattern, result ] ) => {
							Pattern.parse( input, pattern, { keepTrailingLiterals: false } ).formatted.value.should.be.equal( result );

							( () => Pattern.parse( input, pattern, { keepTrailingLiterals: false, ignoreInvalid: false } ) ).should.not.throw();
							( () => Pattern.parse( input, pattern, { keepTrailingLiterals: false, ignoreMissing: false } ) ).should.throw();
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
						Pattern.parse( input, pattern ).formatted.value.should.be.equal( output );

						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
						( () => Pattern.parse( input, pattern, { ignoreMissing: false } ) ).should.not.throw();
					} );
			} );

			it( "ignoring any trailing whitespace", () => {
				[
					[ "A    ", "A", "A" ],
					[ "A \r\t ", "A", "A" ],
					[ "A\n  \f", "A", "A" ],
				]
					.forEach( ( [ input, pattern, output ] ) => {
						Pattern.parse( input, pattern ).formatted.value.should.be.equal( output );

						( () => Pattern.parse( input, pattern, { ignoreInvalid: false } ) ).should.not.throw();
						( () => Pattern.parse( input, pattern, { ignoreMissing: false } ) ).should.not.throw();
					} );
			} );
		} );

		describe( "tracks cursor position according to provided input", () => {
			for ( const [ input, pattern, valuableCursor, , inputCursor = NaN, config = {} ] of data() ) {
				it( `for the valuable string on entering "${input}" with pattern "${pattern}" and cursor positioned at ${inputCursor}`, () => {
					Pattern.parse( input, pattern, Object.assign( {}, config, { cursorPosition: inputCursor } ) )
						.valuable.cursor.should.be.equal( valuableCursor );
				} );
			}

			for ( const [ input, pattern, , formattedCursor, inputCursor = NaN, config = {} ] of data() ) {
				it( `for the formatted string on entering "${input}" with pattern "${pattern}" and cursor positioned at ${inputCursor}`, () => {
					Pattern.parse( input, pattern, Object.assign( {}, config, { cursorPosition: inputCursor } ) )
						.formatted.cursor.should.be.equal( formattedCursor );
				} );
			}

			/**
			 * Generates data for current tests.
			 *
			 * @return {*[]} iterator for test records
			 */
			function* data() {
				yield [ " ", "", 0, 0 ];
				yield [ "  ", "", 0, 0 ];
				yield [ "  ", "", 0, 0, 1 ];
				yield [ "A", "A", 1, 1 ];
				yield [ "1", "A", 0, 0, 1 ];
				yield [ "1", "A", 0, 0, 0 ];
				yield [ "1", "#", 1, 1 ];
				yield [ "11", "# #", 2, 3 ];
				yield [ "11", "# #", 2, 3, 2 ];
				yield [ "11", "# #", 1, 2, 1 ];
				yield [ "11", "# !#", 2, 2, 1 ];
				yield [ "11", "# #", 0, 0, 0 ];
				yield [ "AA", "# #", 0, 0 ];
				yield [ "1A", "# #", 1, 1, Infinity, { keepTrailingLiterals: false } ];
				yield [ "1A", "# #", 1, 1, Infinity, { keepTrailingLiterals: true } ];
				yield [ "1 ", "# #", 1, 1, Infinity, { keepTrailingLiterals: false } ];
				yield [ "1 ", "# #", 1, 2, Infinity, { keepTrailingLiterals: true } ];
				yield [ "1 A", "# #", 1, 1, Infinity, { keepTrailingLiterals: false } ];
				yield [ "1 A", "# #", 1, 2, Infinity, { keepTrailingLiterals: true } ];
				yield [ "1", "# EUR", 1, 1, Infinity, { keepTrailingLiterals: false } ];
				yield [ "99", "#,#", 2, 3 ];
				yield [ "99", "#,!#", 3, 3 ];
			}
		} );
	} );
} );
