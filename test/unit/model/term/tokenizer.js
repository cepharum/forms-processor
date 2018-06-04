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

const { describe, it } = require( "mocha" );
const Should = require( "should" );

const TermTokenizer = require( "../../../../src/model/term/tokenizer" );
const TokenTypes = TermTokenizer.Types;

describe( "Term Tokenizer", () => {
	/**
	 * Checks tokenizer for converting provided code into expected sequence of
	 * types of tokens.
	 *
	 * @param {string} code code to be tokenized
	 * @param {TokenTypes[]} expectedTypes expected sequence of types of resulting tokens
	 * @param {boolean} omitWhitespace set true to request exclusion of whitespace tokens from resulting sequence
	 * @returns {void}
	 */
	function checkTypes( code, expectedTypes, omitWhitespace = false ) {
		const tokens = TermTokenizer.tokenizeString( code, omitWhitespace );

		tokens.map( token => token.type )
			.should.be.an.Array()
			.which.is.deepEqual( expectedTypes )
			.and.has.length( expectedTypes.length );

		tokens
			.forEach( token => {
				token.value
					.should.be.String().which.is.not.empty();
			} );

		expectedTypes.forEach( ( type, index ) => {
			if ( type === TokenTypes.WHITESPACE ) {
				tokens[index].value.should.be.String().which.match( /^\s+$/ );
			}
		} );
	}

	/**
	 * Checks tokenizer for converting provided code into expected sequence of
	 * tokens matching by type and value as given.
	 *
	 * @param {string} code code to be tokenized
	 * @param {Token[]} expectedTokens expected sequence of tokens
	 * @param {boolean} omitWhitespace set true to request exclusion of whitespace tokens from resulting sequence
	 * @returns {void}
	 */
	function checkTypesAndValues( code, expectedTokens, omitWhitespace = false ) {
		const tokens = TermTokenizer.tokenizeString( code, omitWhitespace );

		tokens.map( token => ( { type: token.type, value: token.value } ) )
			.should.be.an.Array()
			.which.is.deepEqual( expectedTokens )
			.and.has.length( expectedTokens.length );
	}

	it( "is available", () => {
		Should.exist( TermTokenizer );
	} );

	describe( "tokenizes strings which", () => {
		it( "are empty", () => {
			TermTokenizer.tokenizeString( "" ).should.be.an.Array().which.is.empty();
		} );

		describe( "contain single", () => {
			it( "sequence of whitespace", () => {
				[
					" ",
					"\r",
					"\n",
					"\t",
					"\f",
					"    ",
					"  \r\n  ",
					"  \r\r  ",
					"  \r\t  ",
					"  \n \r \t  ",
				]
					.forEach( code => checkTypesAndValues( code, [{ type: TokenTypes.WHITESPACE, value: code }] ) );
			} );

			it( "integer", () => {
				[
					"0",
					"+0",
					"-0",
					"00000",
					"+00000",
					"-00000",
					"1",
					"+1",
					"-1",
					"12345678901234567890123456789012345678901234567890",
					"+12345678901234567890123456789012345678901234567890",
					"-12345678901234567890123456789012345678901234567890",
				]
					.forEach( code => checkTypesAndValues( code, [{ type: TokenTypes.LITERAL_INTEGER, value: code }] ) );
			} );

			it( "float", () => {
				[
					"0.",
					"+0.",
					"-0.",
					".0",
					"+.0",
					"-.0",
					"0.0",
					"+0.0",
					"-0.0",
					"00000.",
					"+00000.",
					"-00000.",
					".00000",
					"+.00000",
					"-.00000",
					"00000.00000",
					"+00000.00000",
					"-00000.00000",
					"1.",
					"+1.",
					"-1.",
					".1",
					"+.1",
					"-.1",
					"1.1",
					"+1.1",
					"-1.1",
					"1.0",
					"+1.0",
					"-1.0",
					"12345678901234567890123456789012345678901234567890.",
					"+12345678901234567890123456789012345678901234567890.",
					"-12345678901234567890123456789012345678901234567890.",
					".12345678901234567890123456789012345678901234567890",
					"+.12345678901234567890123456789012345678901234567890",
					"-.12345678901234567890123456789012345678901234567890",
					"0.12345678901234567890123456789012345678901234567890",
					"+0.12345678901234567890123456789012345678901234567890",
					"-0.12345678901234567890123456789012345678901234567890",
					"1234567890.12345678901234567890123456789012345678901234567890",
					"+1234567890.12345678901234567890123456789012345678901234567890",
					"-1234567890.12345678901234567890123456789012345678901234567890",
				]
					.forEach( code => checkTypesAndValues( code, [{ type: TokenTypes.LITERAL_FLOAT, value: code }] ) );
			} );

			it( "keyword", () => {
				[
					"a",
					"abc",
					"a1",
					"abc123",
					"_",
					"_a",
					"_abc",
					"_a1",
					"_abc123",
					"_abc_123",
					"_abc_123_",
					"A",
					"ABC",
					"A1",
					"ABC123",
					"_",
					"_A",
					"_ABC",
					"_A1",
					"_ABC123",
					"_ABC_123",
					"_ABC_123_",
					"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
				]
					.forEach( code => checkTypesAndValues( code, [{ type: TokenTypes.KEYWORD, value: code }] ) );
			} );

			it( "binary comparison operator", () => {
				[
					"==",
					">=",
					"<=",
					"<>",
				]
					.forEach( code => checkTypesAndValues( code, [{ type: TokenTypes.BINARY_COMPARISON_OPERATOR, value: code }] ) );
			} );

			it( "binary arithmetic operator", () => {
				[
					"+",
					"-",
					"*",
					"/",
				]
					.forEach( code => checkTypesAndValues( code, [{ type: TokenTypes.BINARY_ARITHMETIC_OPERATOR, value: code }] ) );
			} );

			it( "binary logic operator", () => {
				[
					"&",
					"|",
					"&&",
					"||",
				]
					.forEach( code => checkTypesAndValues( code, [{ type: TokenTypes.BINARY_LOGIC_OPERATOR, value: code }] ) );
			} );

			it( "unary logic operator", () => {
				[
					"!",
				]
					.forEach( code => checkTypesAndValues( code, [{ type: TokenTypes.UNARY_LOGIC_OPERATOR, value: code }] ) );
			} );

			it( "comma", () => {
				[
					",",
				]
					.forEach( code => checkTypesAndValues( code, [{ type: TokenTypes.COMMA, value: code }] ) );
			} );

			it( "dereferencing operator", () => {
				[
					".",
				]
					.forEach( code => checkTypesAndValues( code, [{ type: TokenTypes.DEREF_OPERATOR, value: code }] ) );
			} );

			it( "parenthesis", () => {
				[
					"(",
					")",
				]
					.forEach( code => checkTypesAndValues( code, [{ type: TokenTypes.PARENTHESIS, value: code }] ) );
			} );

			it( "string", () => {
				[
					"''",
					'""',
					"'some string + 1, 2 (or more) characters usually considered non-string token'",
					'"some string + 1, 2 (or more) characters usually considered non-string token"',
				]
					.forEach( code => checkTypesAndValues( code, [{ type: TokenTypes.LITERAL_STRING, value: code }] ) );
			} );
		} );

		describe( "contain sequence of adjoining", () => {
			it( "integer and keyword", () => {
				[
					"0e",
					"123_",
					"+45extra",
					"-67name",
				]
					.forEach( code => checkTypes( code, [ TokenTypes.LITERAL_INTEGER, TokenTypes.KEYWORD ] ) );
			} );

			it( "keyword and opening parenthesis", () => {
				[
					"_(",
					"abcdefg(",
				]
					.forEach( code => checkTypes( code, [ TokenTypes.KEYWORD, TokenTypes.PARENTHESIS ] ) );
			} );

			it( "binary comparison operators", () => {
				[
					"===",
					"====",
					"<>=",
					"=<>",
					"<><>",
					"<<>",
					"<>>",
					"=>",
					"=<",
					"><",
				]
					.forEach( code => checkTypes( code, [ TokenTypes.BINARY_COMPARISON_OPERATOR, TokenTypes.BINARY_COMPARISON_OPERATOR ] ) );
			} );

			it( "binary arithmetic operators", () => {
				[
					"**",
					"++",
					"--",
					"//",
					"+-",
					"-+",
					"*-",
					"*+",
					"-/",
					"-*",
				]
					.forEach( code => checkTypes( code, [ TokenTypes.BINARY_ARITHMETIC_OPERATOR, TokenTypes.BINARY_ARITHMETIC_OPERATOR ] ) );
			} );

			it( "binary logic operators", () => {
				[
					"&&&",
					"&&&&",
					"|||",
					"||||",
					"|&",
					"&|",
					"&&|",
					"&||",
					"||&",
					"|&&",
				]
					.forEach( code => checkTypes( code, [ TokenTypes.BINARY_LOGIC_OPERATOR, TokenTypes.BINARY_LOGIC_OPERATOR ] ) );
			} );

			it( "unary logic operators", () => {
				[
					"!!",
				]
					.forEach( code => checkTypes( code, [ TokenTypes.UNARY_LOGIC_OPERATOR, TokenTypes.UNARY_LOGIC_OPERATOR ] ) );
			} );

			it( "strings", () => {
				[
					"''''",
					'""""',
					"''\"\"",
					'""\'\'',
				]
					.forEach( code => checkTypes( code, [ TokenTypes.LITERAL_STRING, TokenTypes.LITERAL_STRING ] ) );
			} );

			it( "parentheses", () => {
				[
					"()",
					"((",
					"))",
					")(",
				]
					.forEach( code => checkTypes( code, [ TokenTypes.PARENTHESIS, TokenTypes.PARENTHESIS ] ) );
			} );

			it( "parenthesis and integer", () => {
				[
					"(1",
					"(-3",
					")-5",
					")0",
				]
					.forEach( code => checkTypes( code, [ TokenTypes.PARENTHESIS, TokenTypes.LITERAL_INTEGER ] ) );
			} );

			it( "keyword, parenthesis and integer", () => {
				[
					"some(1",
					"a(-3",
					"_)-5",
					"ARBItraryLonGWord)0",
				]
					.forEach( code => checkTypes( code, [ TokenTypes.KEYWORD, TokenTypes.PARENTHESIS, TokenTypes.LITERAL_INTEGER ] ) );
			} );

			it( "commata", () => {
				[
					",,",
				]
					.forEach( code => checkTypes( code, [ TokenTypes.COMMA, TokenTypes.COMMA ] ) );
			} );
		} );

		describe( "contain whitespace that", () => {
			it( "is preceding single integer", () => {
				[
					" 0",
					"\r+0",
					"\n-123",
					"\t4567",
					"\f\r\n9473658393",
					"  \n \r \t  00000000000000000000000000000000000000000000000000000000000000001",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.WHITESPACE,
						TokenTypes.LITERAL_INTEGER,
					] ) );
			} );

			it( "is succeeding single integer", () => {
				[
					"0 ",
					"+0\r",
					"-123\n",
					"4567\t",
					"9473658393\f\n",
					"00000000000000000000000000000000000000000000000000000000000000001  \n \n \t  ",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.LITERAL_INTEGER,
						TokenTypes.WHITESPACE,
					] ) );
			} );

			it( "is wrapping single integer", () => {
				[
					"\f0 ",
					"\n+0\r",
					"\t-123\n",
					" 4567\t",
					"\r\n9473658393\f\n",
					"    \t  \r 00000000000000000000000000000000000000000000000000000000000000001  \n \n \t  ",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.WHITESPACE,
						TokenTypes.LITERAL_INTEGER,
						TokenTypes.WHITESPACE,
					] ) );
			} );

			it( "is breaking single integer", () => {
				[
					"1 23",
					"45\t67",
					"+12 3",
					"-45\r67",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.LITERAL_INTEGER,
						TokenTypes.WHITESPACE,
						TokenTypes.LITERAL_INTEGER,
					] ) );
			} );

			it( "is separating single integer from its sign", () => {
				[
					"+ 123",
					"-\t456",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.BINARY_ARITHMETIC_OPERATOR,
						TokenTypes.WHITESPACE,
						TokenTypes.LITERAL_INTEGER,
					] ) );
			} );

			it( "is preceding single float", () => {
				[
					" 0.",
					"\r+.0",
					"\n-1.23",
					"\t45.67",
					"\f\r\n9473.658393",
					"  \n \r \t  0000000000000000000000000000000000000.0000000000000000000000000001",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.WHITESPACE,
						TokenTypes.LITERAL_FLOAT,
					] ) );
			} );

			it( "is succeeding single float", () => {
				[
					"0. ",
					"+.0\r",
					"-1.23\n",
					"45.67\t",
					"9473.658393\f\n",
					"0000000000000000000000000000000000.0000000000000000000000000000001  \n \n \t  ",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.LITERAL_FLOAT,
						TokenTypes.WHITESPACE,
					] ) );
			} );

			it( "is wrapping single float", () => {
				[
					"\f0. ",
					"\n+.0\r",
					"\t-1.23\n",
					" 45.67\t",
					"\r\n9473.658393\f\n",
					"    \t  \r 000000000000000000000000000000000.00000000000000000000000000000001  \n \n \t  ",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.WHITESPACE,
						TokenTypes.LITERAL_FLOAT,
						TokenTypes.WHITESPACE,
					] ) );
			} );

			it( "is breaking single float", () => {
				new Map( [
					[ "0 .0", [ "LITERAL_INTEGER", "WHITESPACE", "LITERAL_FLOAT" ] ],
					[ "0. 0", [ "LITERAL_FLOAT", "WHITESPACE", "LITERAL_INTEGER" ] ],
					[ "+0 .0", [ "LITERAL_INTEGER", "WHITESPACE", "LITERAL_FLOAT" ] ],
					[ "+0. 0", [ "LITERAL_FLOAT", "WHITESPACE", "LITERAL_INTEGER" ] ],
					[ "-0 .0", [ "LITERAL_INTEGER", "WHITESPACE", "LITERAL_FLOAT" ] ],
					[ "-0. 0", [ "LITERAL_FLOAT", "WHITESPACE", "LITERAL_INTEGER" ] ],
					[ "123 .456", [ "LITERAL_INTEGER", "WHITESPACE", "LITERAL_FLOAT" ] ],
					[ "123. 456", [ "LITERAL_FLOAT", "WHITESPACE", "LITERAL_INTEGER" ] ],
					[ "+123 .456", [ "LITERAL_INTEGER", "WHITESPACE", "LITERAL_FLOAT" ] ],
					[ "+123. 456", [ "LITERAL_FLOAT", "WHITESPACE", "LITERAL_INTEGER" ] ],
					[ "-123 .456", [ "LITERAL_INTEGER", "WHITESPACE", "LITERAL_FLOAT" ] ],
					[ "-123. 456", [ "LITERAL_FLOAT", "WHITESPACE", "LITERAL_INTEGER" ] ],
				] )
					.forEach( ( pattern, code ) => checkTypes( code, pattern.map( name => TokenTypes[name] ) ) ); // eslint-disable-line max-nested-callbacks
			} );

			it( "is separating single integer from its sign", () => {
				[
					"+ 1.23",
					"+ .123",
					"+ 123.",
					"-\t4.56",
					"-\t.456",
					"-\t456.",
					"-\t \r4.56",
					"-\n \r.456",
					"-\f \t456.",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.BINARY_ARITHMETIC_OPERATOR,
						TokenTypes.WHITESPACE,
						TokenTypes.LITERAL_FLOAT,
					] ) );
			} );

			it( "is preceding single keyword", () => {
				[
					" a",
					"\rabc",
					"\na1",
					"\tabc123",
					"\f_",
					" _a",
					"\n_abc",
					"\r_a1",
					"\f_abc123",
					"\t_abc_123",
					" _abc_123_",
					"\r A",
					" \tABC",
					"\n A1",
					" \fABC123",
					"  _",
					" \r _A",
					" \t _ABC",
					" \n\f _A1",
					" \r _ABC123",
					" \n\r _ABC_123",
					" \r \t _ABC_123_",
					" \t \n\r abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.WHITESPACE,
						TokenTypes.KEYWORD,
					] ) );
			} );

			it( "is succeeding single keyword", () => {
				[
					"a ",
					"abc ",
					"a1\r",
					"abc123\f",
					"_\n",
					"_a\n",
					"_abc\r ",
					"_a1 \n",
					"_abc123\t ",
					"_abc_123 \f",
					"_abc_123_ \r ",
					"A \n\r ",
					"ABC \t ",
					"A1\t \r",
					"ABC123\f\f ",
					"_\r\t ",
					"_A\t\t",
					"_ABC\r",
					"_A1 \n\r\t\f",
					"_ABC123 \r",
					"_ABC_123\n ",
					"_ABC_123_ \r",
					"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\r \n  \t \f\f ",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.KEYWORD,
						TokenTypes.WHITESPACE,
					] ) );
			} );

			it( "is wrapping single keyword", () => {
				[
					" a ",
					"\rabc ",
					"\na1\r",
					"\tabc123\f",
					"\f_\n",
					" _a\n",
					"\n_abc\r ",
					"\r_a1 \n",
					"\f_abc123\t ",
					"\t_abc_123 \f",
					" _abc_123_ \r ",
					"\r A \n\r ",
					" \tABC \t ",
					"\n A1\t \r",
					" \fABC123\f\f ",
					"  _\r\t ",
					" \r _A\t\t",
					" \t _ABC\r",
					" \n\f _A1 \n\r\t\f",
					" \r _ABC123 \r",
					" \n\r _ABC_123\n ",
					" \r \t _ABC_123_ \r",
					" \t \n\r abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\r \n  \t \f\f ",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.WHITESPACE,
						TokenTypes.KEYWORD,
						TokenTypes.WHITESPACE,
					] ) );
			} );

			it( "is breaking single keyword", () => {
				[
					"a bc",
					"ab c123",
					"_\fa",
					"_ab\tc",
					"_\ra1",
					"_ab\nc123",
					"_abc _123",
					"_ab\tc_123_",
					"AB\fC",
					"AB\nC123",
					"_\rA",
					"_A BC",
					"_\tA1",
					"_A\fBC123",
					"_ABC\n_123",
					"_AB\rC_123_",
					"abcdefghijklmn\r \t \n opqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.KEYWORD,
						TokenTypes.WHITESPACE,
						TokenTypes.KEYWORD,
					] ) );
			} );
		} );

		describe( "contain eventually ignored whitespace that", () => {
			it( "is preceding single integer", () => {
				[
					" 0",
					"\r+0",
					"\n-123",
					"\t4567",
					"\f\r\n9473658393",
					"  \n \r \t  00000000000000000000000000000000000000000000000000000000000000001",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.LITERAL_INTEGER,
					], true ) );
			} );

			it( "is succeeding single integer", () => {
				[
					"0 ",
					"+0\r",
					"-123\n",
					"4567\t",
					"9473658393\f\n",
					"00000000000000000000000000000000000000000000000000000000000000001  \n \n \t  ",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.LITERAL_INTEGER,
					], true ) );
			} );

			it( "is wrapping single integer", () => {
				[
					"\f0 ",
					"\n+0\r",
					"\t-123\n",
					" 4567\t",
					"\r\n9473658393\f\n",
					"    \t  \r 00000000000000000000000000000000000000000000000000000000000000001  \n \n \t  ",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.LITERAL_INTEGER,
					], true ) );
			} );

			it( "is breaking single integer", () => {
				[
					"1 23",
					"45\t67",
					"+12 3",
					"-45\r67",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.LITERAL_INTEGER,
						TokenTypes.LITERAL_INTEGER,
					], true ) );
			} );

			it( "is separating single integer from its sign", () => {
				[
					"+ 123",
					"-\t456",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.BINARY_ARITHMETIC_OPERATOR,
						TokenTypes.LITERAL_INTEGER,
					], true ) );
			} );

			it( "is preceding single float", () => {
				[
					" 0.",
					"\r+.0",
					"\n-1.23",
					"\t45.67",
					"\f\r\n9473.658393",
					"  \n \r \t  0000000000000000000000000000000000000.0000000000000000000000000001",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.LITERAL_FLOAT,
					], true ) );
			} );

			it( "is succeeding single float", () => {
				[
					"0. ",
					"+.0\r",
					"-1.23\n",
					"45.67\t",
					"9473.658393\f\n",
					"0000000000000000000000000000000000.0000000000000000000000000000001  \n \n \t  ",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.LITERAL_FLOAT,
					], true ) );
			} );

			it( "is wrapping single float", () => {
				[
					"\f0. ",
					"\n+.0\r",
					"\t-1.23\n",
					" 45.67\t",
					"\r\n9473.658393\f\n",
					"    \t  \r 000000000000000000000000000000000.00000000000000000000000000000001  \n \n \t  ",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.LITERAL_FLOAT,
					], true ) );
			} );

			it( "is breaking single float", () => {
				new Map( [
					[ "0 .0", [ "LITERAL_INTEGER", "LITERAL_FLOAT" ] ],
					[ "0. 0", [ "LITERAL_FLOAT", "LITERAL_INTEGER" ] ],
					[ "+0 .0", [ "LITERAL_INTEGER", "LITERAL_FLOAT" ] ],
					[ "+0. 0", [ "LITERAL_FLOAT", "LITERAL_INTEGER" ] ],
					[ "-0 .0", [ "LITERAL_INTEGER", "LITERAL_FLOAT" ] ],
					[ "-0. 0", [ "LITERAL_FLOAT", "LITERAL_INTEGER" ] ],
					[ "123 .456", [ "LITERAL_INTEGER", "LITERAL_FLOAT" ] ],
					[ "123. 456", [ "LITERAL_FLOAT", "LITERAL_INTEGER" ] ],
					[ "+123 .456", [ "LITERAL_INTEGER", "LITERAL_FLOAT" ] ],
					[ "+123. 456", [ "LITERAL_FLOAT", "LITERAL_INTEGER" ] ],
					[ "-123 .456", [ "LITERAL_INTEGER", "LITERAL_FLOAT" ] ],
					[ "-123. 456", [ "LITERAL_FLOAT", "LITERAL_INTEGER" ] ],
				] )
					.forEach( ( pattern, code ) => checkTypes( code, pattern.map( name => TokenTypes[name] ), true ) ); // eslint-disable-line max-nested-callbacks
			} );

			it( "is separating single integer from its sign", () => {
				[
					"+ 1.23",
					"+ .123",
					"+ 123.",
					"-\t4.56",
					"-\t.456",
					"-\t456.",
					"-\t \r4.56",
					"-\n \r.456",
					"-\f \t456.",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.BINARY_ARITHMETIC_OPERATOR,
						TokenTypes.LITERAL_FLOAT,
					], true ) );
			} );

			it( "is preceding single keyword", () => {
				[
					" a",
					"\rabc",
					"\na1",
					"\tabc123",
					"\f_",
					" _a",
					"\n_abc",
					"\r_a1",
					"\f_abc123",
					"\t_abc_123",
					" _abc_123_",
					"\r A",
					" \tABC",
					"\n A1",
					" \fABC123",
					"  _",
					" \r _A",
					" \t _ABC",
					" \n\f _A1",
					" \r _ABC123",
					" \n\r _ABC_123",
					" \r \t _ABC_123_",
					" \t \n\r abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.KEYWORD,
					], true ) );
			} );

			it( "is succeeding single keyword", () => {
				[
					"a ",
					"abc ",
					"a1\r",
					"abc123\f",
					"_\n",
					"_a\n",
					"_abc\r ",
					"_a1 \n",
					"_abc123\t ",
					"_abc_123 \f",
					"_abc_123_ \r ",
					"A \n\r ",
					"ABC \t ",
					"A1\t \r",
					"ABC123\f\f ",
					"_\r\t ",
					"_A\t\t",
					"_ABC\r",
					"_A1 \n\r\t\f",
					"_ABC123 \r",
					"_ABC_123\n ",
					"_ABC_123_ \r",
					"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\r \n  \t \f\f ",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.KEYWORD,
					], true ) );
			} );

			it( "is wrapping single keyword", () => {
				[
					" a ",
					"\rabc ",
					"\na1\r",
					"\tabc123\f",
					"\f_\n",
					" _a\n",
					"\n_abc\r ",
					"\r_a1 \n",
					"\f_abc123\t ",
					"\t_abc_123 \f",
					" _abc_123_ \r ",
					"\r A \n\r ",
					" \tABC \t ",
					"\n A1\t \r",
					" \fABC123\f\f ",
					"  _\r\t ",
					" \r _A\t\t",
					" \t _ABC\r",
					" \n\f _A1 \n\r\t\f",
					" \r _ABC123 \r",
					" \n\r _ABC_123\n ",
					" \r \t _ABC_123_ \r",
					" \t \n\r abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\r \n  \t \f\f ",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.KEYWORD,
					], true ) );
			} );

			it( "is breaking single keyword", () => {
				[
					"a bc",
					"ab c123",
					"_\fa",
					"_ab\tc",
					"_\ra1",
					"_ab\nc123",
					"_abc _123",
					"_ab\tc_123_",
					"AB\fC",
					"AB\nC123",
					"_\rA",
					"_A BC",
					"_\tA1",
					"_A\fBC123",
					"_ABC\n_123",
					"_AB\rC_123_",
					"abcdefghijklmn\r \t \n opqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
				]
					.forEach( code => checkTypes( code, [
						TokenTypes.KEYWORD,
						TokenTypes.KEYWORD,
					], true ) );
			} );
		} );
	} );
} );
