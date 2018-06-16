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

import { describe, it } from "mocha";
import Should from "should";

import TermTokenizer from "../../../../src/model/term/tokenizer";
import TermCompiler from "../../../../src/model/term/compiler";

describe( "Term Compiler", () => {
	const TokenTypes = TermTokenizer.Types;

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
		} );

		describe( "is tagging tokens in resulting sequence", () => {
			describe( "as literals", () => {
				it( "when representing integer value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.LITERAL_INTEGER, value: "0" },
					], {} )
						.map( token => token.literal )
						.should.be.an.Array()
						.which.is.deepEqual( [true] );
				} );

				it( "when representing float value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.LITERAL_FLOAT, value: "0.0" },
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
						{ type: TokenTypes.LITERAL_INTEGER, value: "0" },
					], {} )
						.map( token => token.operand )
						.should.be.an.Array()
						.which.is.deepEqual( [true] );
				} );

				it( "when representing float value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.LITERAL_FLOAT, value: "0.0" },
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
						{ type: TokenTypes.LITERAL_INTEGER, value: "0" },
					], {} )
						.map( token => token.operator )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );
				} );

				it( "when representing float value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.LITERAL_FLOAT, value: "0.0" },
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
						{ type: TokenTypes.LITERAL_INTEGER, value: "0" },
					], {} )
						.map( token => token.variable )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );
				} );

				it( "when representing float value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.LITERAL_FLOAT, value: "0.0" },
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
						{ type: TokenTypes.LITERAL_INTEGER, value: "0" },
					], {} )
						.map( token => token.function )
						.should.be.an.Array()
						.which.is.deepEqual( [false] );
				} );

				it( "when representing float value", () => {
					TermCompiler.reduceTokens( [
						{ type: TokenTypes.LITERAL_FLOAT, value: "0.0" },
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

	describe( "provides static method `compile()` which", () => {
		it( "requires provision of non-empty source code", () => {
			( () => TermCompiler.compile() ).should.throw();
			( () => TermCompiler.compile( null ) ).should.throw();
			( () => TermCompiler.compile( undefined ) ).should.throw();
			( () => TermCompiler.compile( "" ) ).should.throw();
			( () => TermCompiler.compile( "    " ) ).should.throw();
			( () => TermCompiler.compile( "  \r\n \t " ) ).should.throw();
		} );

		it( "converts string containing source code of a term into invocable function", () => {
			const compiled = TermCompiler.compile( "1" );

			compiled.should.be.Function();
			compiled().should.be.equal( 1 );
		} );

		describe( "properly compiles", () => {
			it( "literal integers", () => {
				TermCompiler.compile( "0" )().should.be.equal( 0 );
				TermCompiler.compile( "00000000000123" )().should.be.equal( 123 );
				TermCompiler.compile( "+00000000000123" )().should.be.equal( 123 );
				TermCompiler.compile( "-00000000000123" )().should.be.equal( -123 );
			} );

			it( "literal floating-point numbers", () => {
				TermCompiler.compile( "0.0" )().should.be.equal( 0.0 );
				TermCompiler.compile( ".5" )().should.be.equal( 0.5 );
				TermCompiler.compile( "000000000001.23" )().should.be.equal( 1.23 );
				TermCompiler.compile( "+00000000000.123" )().should.be.equal( 0.123 );
				TermCompiler.compile( "-0000000000.0123" )().should.be.equal( -0.0123 );
			} );

			it( "literal strings", () => {
				TermCompiler.compile( "''" )().should.be.equal( "" );
				TermCompiler.compile( '""' )().should.be.equal( "" );
				TermCompiler.compile( "'Hello World!'" )().should.be.equal( "Hello World!" );
				TermCompiler.compile( '"Hello World!"' )().should.be.equal( "Hello World!" );
			} );

			it( "literal booleans", () => {
				TermCompiler.compile( "true" )().should.be.true();
				TermCompiler.compile( "TruE" )().should.be.true();
				TermCompiler.compile( "TRUE" )().should.be.true();
				TermCompiler.compile( "false" )().should.be.false();
				TermCompiler.compile( "FaLse" )().should.be.false();
				TermCompiler.compile( "FALSE" )().should.be.false();
			} );

			it( "literal null", () => {
				Should( TermCompiler.compile( "null" )() ).be.null();
				Should( TermCompiler.compile( "NuLl" )() ).be.null();
				Should( TermCompiler.compile( "NULL" )() ).be.null();

				Should( TermCompiler.compile( "  null" )() ).be.null();
				Should( TermCompiler.compile( "NuLl\r" )() ).be.null();
				Should( TermCompiler.compile( "\n NULL \f " )() ).be.null();
			} );

			it( "read-access on variables", () => {
				( () => TermCompiler.compile( "someKey" )() ).should.throw();

				Should( TermCompiler.compile( "someKey" )( {} ) ).be.undefined();
				Should( TermCompiler.compile( "someKey" )( { someKey: true } ) ).be.undefined();
				Should( TermCompiler.compile( "someKey" )( { somekey: true } ) ).be.true();
				Should( TermCompiler.compile( "SOMEKey" )( { somekey: true } ) ).be.true();
				Should( TermCompiler.compile( "SOMEKEY" )( { somekey: true } ) ).be.true();
				Should( TermCompiler.compile( "somekey" )( { somekey: true } ) ).be.true();
				Should( TermCompiler.compile( "somekey" )( { SOMEKEY: true } ) ).be.undefined();

				const data = {
					major: {
						minor: {
							micro: "baz",
							nano: {
								foo: "bar",
							},
						}
					}
				};

				Should( TermCompiler.compile( "MAJOR" )( data ) ).be.Object().which.has.property( "minor" );
				Should( TermCompiler.compile( "MINOR" )( data ) ).be.undefined();
				Should( TermCompiler.compile( "MAJOR.MINOR" )( data ) ).be.Object().which.has.properties( [ "micro", "nano" ] );
				Should( TermCompiler.compile( "MAJOR.MINOR.foo" )( data ) ).be.undefined();
				Should( TermCompiler.compile( "MAJOR.MINOR.MICRO" )( data ) ).be.equal( "baz" );
				Should( TermCompiler.compile( "MAJOR.MINOR.nano.foo" )( data ) ).be.equal( "bar" );
			} );

			it( "binary arithmetic operations", () => {
				TermCompiler.compile( "0 + 4" )().should.be.equal( 4 );
				TermCompiler.compile( "40*40" )().should.be.equal( 1600 );
				TermCompiler.compile( "500/2" )().should.be.equal( 250 );
				TermCompiler.compile( " 6-2 " )().should.be.equal( 4 );

				TermCompiler.compile( "0 + 4 +5" )().should.be.equal( 9 );
				TermCompiler.compile( "40* 40*2 " )().should.be.equal( 3200 );
				TermCompiler.compile( "500/2 /5" )().should.be.equal( 50 );
				TermCompiler.compile( " 6-2 - 1" )().should.be.equal( 3 );

				TermCompiler.compile( "0 + 4 *5" )().should.be.equal( 20 );
				TermCompiler.compile( "40* 40-2 " )().should.be.equal( 1598 );
				TermCompiler.compile( "500/2 *5" )().should.be.equal( 1250 );
				TermCompiler.compile( " 6-2 / 0.5" )().should.be.equal( 2 );

				TermCompiler.compile( "40* (40-2 ) " )().should.be.equal( 1520 );
				TermCompiler.compile( "( 6-2 )/ 0.5" )().should.be.equal( 8 );

				TermCompiler.compile( "2 * amount" )( { amount: 5 } ).should.be.equal( 10 );
				TermCompiler.compile( "amount + 4" )( { amount: 5 } ).should.be.equal( 9 );
				TermCompiler.compile( "amount++3.0" )( { amount: 5 } ).should.be.equal( 8 );
				TermCompiler.compile( "amount - -2" )( { amount: 5 } ).should.be.equal( 7 );
				TermCompiler.compile( "amount--1" )( { amount: 5 } ).should.be.equal( 6 );
				TermCompiler.compile( "25/amount" )( { amount: 5 } ).should.be.equal( 5 );
				TermCompiler.compile( "16/( amount- 1)" )( { amount: 5 } ).should.be.equal( 4 );
			} );

			it( "binary logical operations", () => {
				TermCompiler.compile( "1 & 4" )().should.be.equal( 0 );
				TermCompiler.compile( "1 | 4" )().should.be.equal( 5 );
				TermCompiler.compile( "1 && 4" )().should.be.equal( 4 );
				TermCompiler.compile( "1 || 4" )().should.be.equal( 1 );

				TermCompiler.compile( "0 && 4 && 5" )().should.be.equal( 0 );
				TermCompiler.compile( "false && 4 && 5" )().should.be.equal( false );
				TermCompiler.compile( "0 || 4 || 5" )().should.be.equal( 4 );
				TermCompiler.compile( "false || 4 || 5" )().should.be.equal( 4 );

				TermCompiler.compile( "0 && 4 || 5" )().should.be.equal( 5 );
				TermCompiler.compile( "false || 4 && 5" )().should.be.equal( 5 );
				TermCompiler.compile( "0 || 4 && 5" )().should.be.equal( 5 );
				TermCompiler.compile( "false && 4 || 5" )().should.be.equal( 5 );

				TermCompiler.compile( "amount || 3" )( { amount: true } ).should.be.equal( true );
				TermCompiler.compile( "amount && 3" )( { amount: true } ).should.be.equal( 3 );
				TermCompiler.compile( "amount | 3" )( { amount: 4 } ).should.be.equal( 7 );
				TermCompiler.compile( "amount & 4" )( { amount: 7 } ).should.be.equal( 4 );

				TermCompiler.compile( "( amount & 1 ) || 3" )( { amount: 4 } ).should.be.equal( 3 );
				TermCompiler.compile( "amount | ( 2 && 8 )" )( { amount: 4 } ).should.be.equal( 12 );
			} );

			it( "binary comparison operations", () => {
				TermCompiler.compile( "0 < 4" )().should.be.true();
				TermCompiler.compile( "4 < 4" )().should.be.false();
				TermCompiler.compile( "'4' < 4" )().should.be.false();
				TermCompiler.compile( "4.5 > 4" )().should.be.true();
				TermCompiler.compile( "4 > 4" )().should.be.false();
				TermCompiler.compile( "4 > '4'" )().should.be.false();

				TermCompiler.compile( "3.5 <= 4" )().should.be.true();
				TermCompiler.compile( "4 <= 4" )().should.be.true();
				TermCompiler.compile( "4 <= '4'" )().should.be.true();
				TermCompiler.compile( "4.5 >= 4" )().should.be.true();
				TermCompiler.compile( "4 >= 4" )().should.be.true();
				TermCompiler.compile( "'4' >= 4" )().should.be.true();

				TermCompiler.compile( "0 == 0" )().should.be.true();
				TermCompiler.compile( "'4'==4" )().should.be.true();
				TermCompiler.compile( "0 <> 0" )().should.be.false();
				TermCompiler.compile( "0<>'0'" )().should.be.false();
			} );

			it( "unary logical operations", () => {
				TermCompiler.compile( "!true" )().should.be.false();
				TermCompiler.compile( "!1" )().should.be.false();
				TermCompiler.compile( "!'hello world'" )().should.be.false();
				TermCompiler.compile( "!!'hello world'" )().should.be.true();
				TermCompiler.compile( "!!('hello world')" )().should.be.true();
				TermCompiler.compile( "!(!('hello world'))" )().should.be.true();
				TermCompiler.compile( "!!null" )().should.be.false();
			} );

			it( "function invocations", () => {
				( () => TermCompiler.compile( "myfunc()" ) ).should.throw();
				( () => TermCompiler.compile( "myfunc()", { myfunc: null } ) ).should.throw();
				( () => TermCompiler.compile( "myfunc()", { myfunc: true } ) ).should.throw();
				( () => TermCompiler.compile( "myfunc()", { myFunc: true } ) ).should.throw();
				( () => TermCompiler.compile( "myFunc()", { myFunc: true } ) ).should.throw();
				( () => TermCompiler.compile( "myfunc()", { myfunc: () => null } ) ).should.not.throw();
				( () => TermCompiler.compile( "myFunc()", { myFunc: () => null } ) ).should.throw();
				( () => TermCompiler.compile( "myFunc()", { myfunc: () => null } ) ).should.not.throw();

				( () => TermCompiler.compile( "myFunc()", { myfunc: () => null } )() ).should.throw();
				( () => TermCompiler.compile( "myFunc()", { myfunc: () => null } )( {} ) ).should.throw();
				( () => TermCompiler.compile( "myFunc()", { myfunc: () => null } )( {}, { myfunc: null } ) ).should.throw();
				( () => TermCompiler.compile( "myFunc()", { myfunc: () => null } )( {}, { myfunc: true } ) ).should.throw();
				( () => TermCompiler.compile( "myFunc()", { myfunc: () => null } )( {}, { myfunc: () => null } ) ).should.not.throw();
				( () => TermCompiler.compile( "myFunc()", { myfunc: () => null } )( {}, { myFunc: () => null } ) ).should.throw();

				Should( TermCompiler.compile( "myFunc()", { myfunc: () => null } )( {}, { myfunc: () => null } ) )
					.be.null();
				TermCompiler.compile( "myFunc()", { myfunc: () => null } )( {}, { myfunc: () => true } ).should.be.true();

				TermCompiler.compile( "square( 4 )", { square: a => a } )( {}, { square: a => a * a } ).should.be.equal( 16 );
				TermCompiler.compile( "sum( 4,5 )", { sum: () => null } )( {}, { sum: ( a, b ) => a + b } ).should.be.equal( 9 );
				TermCompiler.compile( "UPPER( 'hello' )", { upper: () => null } )( {}, { upper: s => s.toUpperCase() } ).should.be.equal( "HELLO" );

				TermCompiler.compile( "sQUARE( Sum(4, 5) + 2 )", { square: a => a, sum: a => a } )( {}, { square: a => a * a, sum: ( a, b ) => a + b } ).should.be.equal( 121 );
			} );

			it( "operations w/ complex operands ", () => {
				const functions = {
					square: a => a * a,
					sum: ( a, b ) => a + b,
				};

				TermCompiler.compile( "sQUARE( Sum(4, 5) + 2 ) - 10 < ( ( 3 + 5 ) * SUM( 30, 10 ) / SUM( 1, SQUARE( 0.7 ) ) )", functions )( {}, functions )
					.should.be.true();
			} );
		} );
	} );
} );
