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

/* eslint-disable max-nested-callbacks */

const { describe, it } = require( "mocha" );
const Should = require( "should" );

const TermTokenizer = require( "../../../../src/model/term/tokenizer" );
const TermCompiler = require( "../../../../src/model/term/compiler" );
const TokenTypes = TermTokenizer.Types;

describe( "Term Compiler", () => {
	it( "is available", () => {
		Should.exist( TermCompiler );
	} );

	describe( "provides static method `reduceTokens` which", () => {
		it( "is available", () => {
			TermCompiler.reduceTokens.should.be.Function().which.has.length( 2 );
		} );

		it( "is invoked w/ sequence of tokens and map of supported functions", () => {
			TermCompiler.reduceTokens( [], {} ).should.be.an.Array().which.is.empty();
		} );

		it( "reduces sequence of keyword tokens and dereferencing operator tokens into single keyword w/ combined value", () => {
			TermCompiler.reduceTokens( [
				{ type: TokenTypes.KEYWORD, value: "some" },
				{ type: TokenTypes.DEREF_OPERATOR, value: "." },
				{ type: TokenTypes.KEYWORD, value: "subordinated" },
				{ type: TokenTypes.DEREF_OPERATOR, value: "." },
				{ type: TokenTypes.KEYWORD, value: "name" },
			], {} )
				.map( token => ( { type: token.type, value: token.value } ) )
				.should.be.an.Array()
				.which.containEql( { type: TokenTypes.KEYWORD, value: "some.subordinated.name" } )
				.and.has.length( 1 );
		} );

		it( "partially reduces arbitrary but valid sequences of keyword tokens and dereferencing operator tokens", () => {
			TermCompiler.reduceTokens( [
				{ type: TokenTypes.KEYWORD, value: "some" },
				{ type: TokenTypes.KEYWORD, value: "subordinated" },
				{ type: TokenTypes.DEREF_OPERATOR, value: "." },
				{ type: TokenTypes.KEYWORD, value: "path" },
			], {} )
				.map( token => ( { type: token.type, value: token.value } ) )
				.should.be.an.Array()
				.which.is.deepEqual( [
					{ type: TokenTypes.KEYWORD, value: "some" },
					{ type: TokenTypes.KEYWORD, value: "subordinated.path" },
				] );

			TermCompiler.reduceTokens( [
				{ type: TokenTypes.KEYWORD, value: "some" },
				{ type: TokenTypes.DEREF_OPERATOR, value: "." },
				{ type: TokenTypes.KEYWORD, value: "subordinated" },
				{ type: TokenTypes.KEYWORD, value: "path" },
			], {} )
				.map( token => ( { type: token.type, value: token.value } ) )
				.should.be.an.Array()
				.which.is.deepEqual( [
					{ type: TokenTypes.KEYWORD, value: "some.subordinated" },
					{ type: TokenTypes.KEYWORD, value: "path" },
				] );
		} );

		it( "does not reduce and combine sequence of keyword tokens", () => {
			TermCompiler.reduceTokens( [
				{ type: TokenTypes.KEYWORD, value: "some" },
				{ type: TokenTypes.KEYWORD, value: "subordinated" },
				{ type: TokenTypes.KEYWORD, value: "name" },
			], {} )
				.map( token => ( { type: token.type, value: token.value } ) )
				.should.be.an.Array()
				.which.containEql( { type: TokenTypes.KEYWORD, value: "some" } )
				.which.containEql( { type: TokenTypes.KEYWORD, value: "subordinated" } )
				.which.containEql( { type: TokenTypes.KEYWORD, value: "name" } )
				.and.has.length( 3 );
		} );

		describe( "reduces sequence of negation operators by", () => {
			it( "replacing odd number of occurrences w/ single one", () => {
				TermCompiler.reduceTokens( [
					{ type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" },
				], {} )
					.map( token => ( { type: token.type, value: token.value } ) )
					.should.be.an.Array()
					.which.containEql( { type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" } )
					.and.has.length( 1 );

				TermCompiler.reduceTokens( [
					{ type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" },
					{ type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" },
					{ type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" },
				], {} )
					.map( token => ( { type: token.type, value: token.value } ) )
					.should.be.an.Array()
					.which.containEql( { type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" } )
					.and.has.length( 1 );

				TermCompiler.reduceTokens( [
					{ type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" },
					{ type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" },
					{ type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" },
					{ type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" },
					{ type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" },
				], {} )
					.map( token => ( { type: token.type, value: token.value } ) )
					.should.be.an.Array()
					.which.containEql( { type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" } )
					.and.has.length( 1 );
			} );

			it( "completely removing even number of occurrences", () => {
				TermCompiler.reduceTokens( [
					{ type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" },
					{ type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" },
				], {} )
					.map( token => ( { type: token.type, value: token.value } ) )
					.should.be.an.Array()
					.which.is.empty();

				TermCompiler.reduceTokens( [
					{ type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" },
					{ type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" },
					{ type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" },
					{ type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" },
				], {} )
					.map( token => ( { type: token.type, value: token.value } ) )
					.should.be.an.Array()
					.which.is.empty();

				TermCompiler.reduceTokens( [
					{ type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" },
					{ type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" },
					{ type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" },
					{ type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" },
					{ type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" },
					{ type: TokenTypes.UNARY_LOGIC_OPERATOR, value: "!" },
				], {} )
					.map( token => ( { type: token.type, value: token.value } ) )
					.should.be.an.Array()
					.which.is.empty();
			} );
		} );

		describe( "is tagging tokens in resulting sequence", () => {
			describe( "as literals", () => {
				it( "when representing integer value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.LITERAL_INTEGER },
					], {} )
						.map( token => token.literal )
						.should.be.an.Array()
						.which.is.deepEqual( [true] );
				} );

				it( "when representing float value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.LITERAL_FLOAT },
					], {} )
						.map( token => token.literal )
						.should.be.an.Array()
						.which.is.deepEqual( [true] );
				} );

				it( "when representing string value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.LITERAL_STRING, value: "''" },
					], {} )
						.map( token => token.literal )
						.should.be.an.Array()
						.which.is.deepEqual( [true] );
				} );

				it( "when representing special keyword representing boolean value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "true" },
						{ type: TokenTypes.KEYWORD, value: "false" },
					], {} )
						.map( token => token.literal )
						.should.be.an.Array()
						.which.is.deepEqual( [ true, true ] );
				} );

				it( "when representing special keyword representing `null` value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "null" },
					], {} )
						.map( token => token.literal )
						.should.be.an.Array()
						.which.is.deepEqual( [true] );
				} );
			} );

			describe( "as non-literals", () => {
				it( "when representing any keyword", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "_" },
					], {} )
						.map( token => token.literal )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );

					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "_" },
						{ type: TokenTypes.DEREF_OPERATOR, value: "." },
						{ type: TokenTypes.KEYWORD, value: "sub" },
					], {} )
						.map( token => token.literal )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );

					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "_" },
						{ type: TokenTypes.KEYWORD, value: "sub" },
					], {} )
						.map( token => token.literal )
						.should.be.an.Array()
						.which.is.deepEqual( [ false, false ] );
				} );

				it( "when representing parentheses", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.PARENTHESIS },
						{ type: TokenTypes.PARENTHESIS },
					], {} )
						.map( token => token.literal )
						.should.be.an.Array()
						.which.is.deepEqual( [ false, false ] );
				} );

				it( "when representing commata", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.COMMA },
					], {} )
						.map( token => token.literal )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );
				} );

				it( "when representing operators", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.BINARY_COMPARISON_OPERATOR },
						{ type: TokenTypes.BINARY_ARITHMETIC_OPERATOR },
						{ type: TokenTypes.BINARY_LOGIC_OPERATOR },
						{ type: TokenTypes.UNARY_LOGIC_OPERATOR },
					], {} )
						.map( token => token.literal )
						.should.be.an.Array()
						.which.is.deepEqual( [ false, false, false, false ] );
				} );
			} );

			describe( "as operands", () => {
				it( "when representing integer value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.LITERAL_INTEGER },
					], {} )
						.map( token => token.operand )
						.should.be.an.Array()
						.which.is.deepEqual( [true] );
				} );

				it( "when representing float value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.LITERAL_FLOAT },
					], {} )
						.map( token => token.operand )
						.should.be.an.Array()
						.which.is.deepEqual( [true] );
				} );

				it( "when representing string value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.LITERAL_STRING, value: "''" },
					], {} )
						.map( token => token.operand )
						.should.be.an.Array()
						.which.is.deepEqual( [true] );
				} );

				it( "when representing special keyword representing boolean value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "true" },
						{ type: TokenTypes.KEYWORD, value: "false" },
					], {} )
						.map( token => token.operand )
						.should.be.an.Array()
						.which.is.deepEqual( [ true, true ] );
				} );

				it( "when representing special keyword representing `null` value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "null" },
					], {} )
						.map( token => token.operand )
						.should.be.an.Array()
						.which.is.deepEqual( [true] );
				} );

				it( "when representing any keyword", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "_" },
					], {} )
						.map( token => token.operand )
						.should.be.an.Array()
						.which.is.deepEqual( [true] );

					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "_" },
						{ type: TokenTypes.DEREF_OPERATOR, value: "." },
						{ type: TokenTypes.KEYWORD, value: "sub" },
					], {} )
						.map( token => token.operand )
						.should.be.an.Array()
						.which.is.deepEqual( [true] );

					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "_" },
						{ type: TokenTypes.KEYWORD, value: "sub" },
					], {} )
						.map( token => token.operand )
						.should.be.an.Array()
						.which.is.deepEqual( [ true, true ] );
				} );
			} );

			describe( "as non-operands", () => {
				it( "when representing parentheses", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.PARENTHESIS },
						{ type: TokenTypes.PARENTHESIS },
					], {} )
						.map( token => token.operand )
						.should.be.an.Array()
						.which.is.deepEqual( [ false, false ] );
				} );

				it( "when representing commata", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.COMMA },
					], {} )
						.map( token => token.operand )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );
				} );

				it( "when representing operators", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.BINARY_COMPARISON_OPERATOR },
						{ type: TokenTypes.BINARY_ARITHMETIC_OPERATOR },
						{ type: TokenTypes.BINARY_LOGIC_OPERATOR },
						{ type: TokenTypes.UNARY_LOGIC_OPERATOR },
					], {} )
						.map( token => token.operand )
						.should.be.an.Array()
						.which.is.deepEqual( [ false, false, false, false ] );
				} );
			} );

			describe( "as operators", () => {
				it( "when representing operators", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.BINARY_COMPARISON_OPERATOR },
						{ type: TokenTypes.BINARY_ARITHMETIC_OPERATOR },
						{ type: TokenTypes.BINARY_LOGIC_OPERATOR },
						{ type: TokenTypes.UNARY_LOGIC_OPERATOR },
					], {} )
						.map( token => token.operator )
						.should.be.an.Array()
						.which.is.deepEqual( [ true, true, true, true ] );
				} );
			} );

			describe( "as non-operators", () => {
				it( "when representing integer value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.LITERAL_INTEGER },
					], {} )
						.map( token => token.operator )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );
				} );

				it( "when representing float value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.LITERAL_FLOAT },
					], {} )
						.map( token => token.operator )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );
				} );

				it( "when representing string value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.LITERAL_STRING, value: "''" },
					], {} )
						.map( token => token.operator )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );
				} );

				it( "when representing special keyword representing boolean value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "true" },
						{ type: TokenTypes.KEYWORD, value: "false" },
					], {} )
						.map( token => token.operator )
						.should.be.an.Array()
						.which.is.deepEqual( [ false, false ] );
				} );

				it( "when representing special keyword representing `null` value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "null" },
					], {} )
						.map( token => token.operator )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );
				} );

				it( "when representing any keyword", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "_" },
					], {} )
						.map( token => token.operator )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );

					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "_" },
						{ type: TokenTypes.DEREF_OPERATOR, value: "." },
						{ type: TokenTypes.KEYWORD, value: "sub" },
					], {} )
						.map( token => token.operator )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );

					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "_" },
						{ type: TokenTypes.KEYWORD, value: "sub" },
					], {} )
						.map( token => token.operator )
						.should.be.an.Array()
						.which.is.deepEqual( [ false, false ] );
				} );

				it( "when representing parentheses", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.PARENTHESIS },
						{ type: TokenTypes.PARENTHESIS },
					], {} )
						.map( token => token.operator )
						.should.be.an.Array()
						.which.is.deepEqual( [ false, false ] );
				} );

				it( "when representing commata", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.COMMA },
					], {} )
						.map( token => token.operator )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );
				} );
			} );

			describe( "as variable accessor", () => {
				it( "when representing any keyword not succeeded by opening parenthesis", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "_" },
					], {} )
						.map( token => token.variable )
						.should.be.an.Array()
						.which.is.deepEqual( [true] );

					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "_" },
						{ type: TokenTypes.DEREF_OPERATOR, value: "." },
						{ type: TokenTypes.KEYWORD, value: "sub" },
					], {} )
						.map( token => token.variable )
						.should.be.an.Array()
						.which.is.deepEqual( [true] );

					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "_" },
						{ type: TokenTypes.KEYWORD, value: "sub" },
					], {} )
						.map( token => token.variable )
						.should.be.an.Array()
						.which.is.deepEqual( [ true, true ] );
				} );

				it( "when representing sequence of keyword tokens and dereferencing operator tokens succeeded by opening parenthesis", () => {
					// by intention compiler does not support invocation of methods or organizing functions in namespaces
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "_" },
						{ type: TokenTypes.DEREF_OPERATOR, value: "." },
						{ type: TokenTypes.KEYWORD, value: "sub" },
						{ type: TokenTypes.PARENTHESIS, value: "(" },
					], {} )
						.map( token => token.variable )
						.should.be.an.Array()
						.which.is.deepEqual( [ true, false ] );
				} );
			} );

			describe( "as non-variable-accessor", () => {
				it( "when representing any keyword succeeded by opening parenthesis", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "_" },
						{ type: TokenTypes.PARENTHESIS, value: "(" },
					], { _: () => 0 } )
						.map( token => token.variable )
						.should.be.an.Array()
						.which.is.deepEqual( [ false, false ] );

					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "_" },
						{ type: TokenTypes.KEYWORD, value: "sub" },
						{ type: TokenTypes.PARENTHESIS, value: "(" },
					], { sub: () => 0 } )
						.map( token => token.variable )
						.should.be.an.Array()
						.which.is.deepEqual( [ true, false, false ] );
				} );

				it( "when representing integer value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.LITERAL_INTEGER },
					], {} )
						.map( token => token.variable )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );
				} );

				it( "when representing float value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.LITERAL_FLOAT },
					], {} )
						.map( token => token.variable )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );
				} );

				it( "when representing string value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.LITERAL_STRING, value: "''" },
					], {} )
						.map( token => token.variable )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );
				} );

				it( "when representing special keyword representing boolean value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "true" },
						{ type: TokenTypes.KEYWORD, value: "false" },
					], {} )
						.map( token => token.variable )
						.should.be.an.Array()
						.which.is.deepEqual( [ false, false ] );
				} );

				it( "when representing special keyword representing `null` value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "null" },
					], {} )
						.map( token => token.variable )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );
				} );

				it( "when representing parentheses", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.PARENTHESIS },
						{ type: TokenTypes.PARENTHESIS },
					], {} )
						.map( token => token.variable )
						.should.be.an.Array()
						.which.is.deepEqual( [ false, false ] );
				} );

				it( "when representing commata", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.COMMA },
					], {} )
						.map( token => token.variable )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );
				} );

				it( "when representing operators", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.BINARY_COMPARISON_OPERATOR },
						{ type: TokenTypes.BINARY_ARITHMETIC_OPERATOR },
						{ type: TokenTypes.BINARY_LOGIC_OPERATOR },
						{ type: TokenTypes.UNARY_LOGIC_OPERATOR },
					], {} )
						.map( token => token.variable )
						.should.be.an.Array()
						.which.is.deepEqual( [ false, false, false, false ] );
				} );
			} );

			describe( "as function accessor", () => {
				it( "when representing any keyword succeeded by opening parenthesis", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "_" },
						{ type: TokenTypes.PARENTHESIS, value: "(" },
					], { _: () => 0 } )
						.map( token => token.function )
						.should.be.an.Array()
						.which.is.deepEqual( [ true, false ] );

					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "_" },
						{ type: TokenTypes.KEYWORD, value: "sub" },
						{ type: TokenTypes.PARENTHESIS, value: "(" },
					], { sub: () => 0 } )
						.map( token => token.function )
						.should.be.an.Array()
						.which.is.deepEqual( [ false, true, false ] );
				} );
			} );

			describe( "as non-function-accessor", () => {
				it( "when representing any keyword not succeeded by opening parenthesis", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "_" },
					], {} )
						.map( token => token.function )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );

					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "_" },
						{ type: TokenTypes.DEREF_OPERATOR, value: "." },
						{ type: TokenTypes.KEYWORD, value: "sub" },
					], {} )
						.map( token => token.function )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );

					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "_" },
						{ type: TokenTypes.KEYWORD, value: "sub" },
					], {} )
						.map( token => token.function )
						.should.be.an.Array()
						.which.is.deepEqual( [ false, false ] );
				} );

				it( "when representing sequence of keyword tokens and dereferencing operator tokens succeeded by opening parenthesis", () => {
					// by intention compiler does not support invocation of methods or organizing functions in namespaces
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "_" },
						{ type: TokenTypes.DEREF_OPERATOR, value: "." },
						{ type: TokenTypes.KEYWORD, value: "sub" },
						{ type: TokenTypes.PARENTHESIS, value: "(" },
					], {} )
						.map( token => token.function )
						.should.be.an.Array()
						.which.is.deepEqual( [ false, false ] );
				} );

				it( "when representing integer value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.LITERAL_INTEGER },
					], {} )
						.map( token => token.function )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );
				} );

				it( "when representing float value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.LITERAL_FLOAT },
					], {} )
						.map( token => token.function )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );
				} );

				it( "when representing string value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.LITERAL_STRING, value: "''" },
					], {} )
						.map( token => token.function )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );
				} );

				it( "when representing special keyword representing boolean value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "true" },
						{ type: TokenTypes.KEYWORD, value: "false" },
					], {} )
						.map( token => token.function )
						.should.be.an.Array()
						.which.is.deepEqual( [ false, false ] );
				} );

				it( "when representing special keyword representing `null` value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.KEYWORD, value: "null" },
					], {} )
						.map( token => token.function )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );
				} );

				it( "when representing parentheses", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.PARENTHESIS },
						{ type: TokenTypes.PARENTHESIS },
					], {} )
						.map( token => token.function )
						.should.be.an.Array()
						.which.is.deepEqual( [ false, false ] );
				} );

				it( "when representing commata", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.COMMA },
					], {} )
						.map( token => token.function )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );
				} );

				it( "when representing operators", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.BINARY_COMPARISON_OPERATOR },
						{ type: TokenTypes.BINARY_ARITHMETIC_OPERATOR },
						{ type: TokenTypes.BINARY_LOGIC_OPERATOR },
						{ type: TokenTypes.UNARY_LOGIC_OPERATOR },
					], {} )
						.map( token => token.function )
						.should.be.an.Array()
						.which.is.deepEqual( [ false, false, false, false ] );
				} );
			} );
		} );

		describe( "throws on", () => {
			it( "whitespace tokens due to requiring those being removed prior to compilation", () => {
				( () => TermCompiler.reduceTokens( [
					{ type: TokenTypes.WHITESPACE, value: " " },
				], {} ) ).should.throw();
			} );

			it( "invalid sequences of keyword tokens and dereferencing operator tokens", () => {
				( () => TermCompiler.reduceTokens( [
					{ type: TokenTypes.KEYWORD, value: "some" },
					{ type: TokenTypes.DEREF_OPERATOR, value: "." },
				], {} ) ).should.throw();

				( () => TermCompiler.reduceTokens( [
					{ type: TokenTypes.KEYWORD, value: "some" },
					{ type: TokenTypes.DEREF_OPERATOR, value: "." },
					{ type: TokenTypes.DEREF_OPERATOR, value: "." },
				], {} ) ).should.throw();

				( () => TermCompiler.reduceTokens( [
					{ type: TokenTypes.KEYWORD, value: "some" },
					{ type: TokenTypes.KEYWORD, value: "subordinated" },
					{ type: TokenTypes.DEREF_OPERATOR, value: "." },
				], {} ) ).should.throw();

				( () => TermCompiler.reduceTokens( [
					{ type: TokenTypes.DEREF_OPERATOR, value: "." },
					{ type: TokenTypes.KEYWORD, value: "some" },
				], {} ) ).should.throw();
			} );

			it( "encountering dereferencing operator token w/o preceding keyword token", () => {
				( () => TermCompiler.reduceTokens( [
					{ type: TokenTypes.DEREF_OPERATOR, value: "." },
				], {} ) )
					.should.throw();
			} );

			it( "keyword token with succeeding parenthesis token addressing non-declared function", () => {
				( () => TermCompiler.reduceTokens( [
					{ type: TokenTypes.KEYWORD, value: "_" },
					{ type: TokenTypes.PARENTHESIS, value: "(" },
				], {} ) )
					.should.throw();

				( () => TermCompiler.reduceTokens( [
					{ type: TokenTypes.KEYWORD, value: "_" },
					{ type: TokenTypes.PARENTHESIS, value: "(" },
				], { _: null } ) )
					.should.throw();

				( () => TermCompiler.reduceTokens( [
					{ type: TokenTypes.KEYWORD, value: "_" },
					{ type: TokenTypes.PARENTHESIS, value: "(" },
				], { _: true } ) )
					.should.throw();

				( () => TermCompiler.reduceTokens( [
					{ type: TokenTypes.KEYWORD, value: "_" },
					{ type: TokenTypes.PARENTHESIS, value: "(" },
				], { _: () => 0 } ) )
					.should.not.throw();
			} );
		} );
	} );
} );
