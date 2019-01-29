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

import MapProcessor from "../../../../../src/model/form/processor/map";


describe( "MapProcessor", () => {
	it( "is available", () => {
		Should( MapProcessor ).be.ok();
	} );

	it( "can be constructed when passing definition containing proper map", () => {
		( () => new MapProcessor() ).should.throw();
		( () => new MapProcessor( null ) ).should.throw();
		( () => new MapProcessor( {} ) ).should.throw();
		( () => new MapProcessor( { something: true } ) ).should.throw();
		( () => new MapProcessor( { something: "true" } ) ).should.throw();
		( () => new MapProcessor( { map: null } ) ).should.throw();
		( () => new MapProcessor( { map: true } ) ).should.throw();
		( () => new MapProcessor( { map: "true" } ) ).should.throw();
		( () => new MapProcessor( { map: {} } ) ).should.throw();

		( () => new MapProcessor( { map: { something: null } } ) ).should.not.throw();
		( () => new MapProcessor( { map: { something: true } } ) ).should.not.throw();
		( () => new MapProcessor( { map: { something: "true" } } ) ).should.not.throw();
		( () => new MapProcessor( { map: { something: {} } } ) ).should.not.throw();
		( () => new MapProcessor( { map: { something: { sub: null } } } ) ).should.not.throw();
		( () => new MapProcessor( { map: { something: { sub: true } } } ) ).should.not.throw();
		( () => new MapProcessor( { map: { something: { sub: "true" } } } ) ).should.not.throw();
		( () => new MapProcessor( { map: { something: { sub: {} } } } ) ).should.not.throw();
	} );

	it( "creates exact copy of map containing literals only", () => {
		const mapper = new MapProcessor( { map: {
			major: "test",
		} } );

		const mapped = mapper.process( {} );
		mapped.should.be.Promise();

		return mapped
			.then( created => {
				created.should.be.Object().which.has.size( 1 ).and.has.property( "major" ).which.is.a.String().and.equal( "test" );
			} );
	} );

	it( "replaces element of map consisting of a term's source with value in a provided set of named values addressed by that term", () => {
		const mapper = new MapProcessor( { map: {
			major: "=test",
		} } );

		const mapped = mapper.process( { test: "replaced" } );
		mapped.should.be.Promise();

		return mapped
			.then( created => {
				created.should.be.Object().which.has.size( 1 ).and.has.property( "major" ).which.is.a.String().and.equal( "replaced" );
			} );
	} );

	it( "replaces element of map consisting of a term's source with `undefined` if value addressed by term is missing in provided set of named values", () => {
		const mapper = new MapProcessor( { map: {
			major: "=test",
		} } );

		const mapped = mapper.process( { different: "replaced" } );
		mapped.should.be.Promise();

		return mapped
			.then( created => {
				created.should.be.Object().which.has.size( 1 ).and.has.property( "major" ).which.is.undefined();
			} );
	} );

	it( "replaces parts of string considered injected term to be evaluated in scope of a provided set of named values", () => {
		const mapper = new MapProcessor( { map: {
			major: "The {{ test }} value.",
		} } );

		const mapped = mapper.process( { test: "replaced" } );
		mapped.should.be.Promise();

		return mapped
			.then( created => {
				created.should.be.Object().which.has.size( 1 ).and.has.property( "major" ).which.is.a.String().and.equal( "The replaced value." );
			} );
	} );

	it( "handles deep structures mixing literal strings while whole-term elements and string containing injected terms", () => {
		const mapper = new MapProcessor( { map: {
			shallowLiteral: " the literal string ",
			shallowWhole: " =replacement ",
			shallowSolePartial: " sole {{ replacement }} string ",
			shallowMultiPartial: " multiple {{ replacement }} elements in a {{ compiling }} string ",
			deepData: {
				literal: " the deep literal string ",
				whole: " =some.deep.replacement ",
				solePartial: " sole {{ some.deep.replacement }} string ",
				multiPartial: " multiple {{ some.deep.replacement }} elements in a {{ different.deep.compiling }} string ",
			},
			deep: {
				Map: {
					literal: " the deep literal string ",
					whole: " =replacement ",
					solePartial: " sole {{ replacement }} string ",
					multiPartial: " multiple {{ replacement }} elements in a {{ compiling }} string ",
				},
			},
		} } );

		const mapped = mapper.process( {
			replacement: "replaced",
			compiling: "compiled",
			some: {
				deep: {
					replacement: " deeply replaced ",
				},
			},
			different: {
				deep: {
					compiling: " deeply compiled ",
				},
			},
		} );
		mapped.should.be.Promise();

		return mapped
			.then( created => {
				created.should.be.Object().which.has.size( 6 )
					.and.has.properties( "shallowLiteral", "shallowWhole", "shallowSolePartial", "shallowMultiPartial", "deepData", "deep" );

				created.shallowLiteral.should.be.String().which.is.equal( " the literal string " );
				created.shallowWhole.should.be.String().which.is.equal( "replaced" );
				created.shallowSolePartial.should.be.String().which.is.equal( " sole replaced string " );
				created.shallowMultiPartial.should.be.String().which.is.equal( " multiple replaced elements in a compiled string " );

				created.deepData.should.be.an.Object().which.has.size( 4 )
					.and.has.properties( "literal", "whole", "solePartial", "multiPartial" );

				created.deepData.literal.should.be.String().and.equal( " the deep literal string " );
				created.deepData.whole.should.be.String().and.equal( " deeply replaced " );
				created.deepData.solePartial.should.be.String().and.equal( " sole  deeply replaced  string " );
				created.deepData.multiPartial.should.be.String().and.equal( " multiple  deeply replaced  elements in a  deeply compiled  string " );

				created.deep.Map.should.be.an.Object().which.has.size( 4 )
					.and.has.properties( "literal", "whole", "solePartial", "multiPartial" );

				created.deep.Map.literal.should.be.String().and.equal( " the deep literal string " );
				created.deep.Map.whole.should.be.String().and.equal( "replaced" );
				created.deep.Map.solePartial.should.be.String().and.equal( " sole replaced string " );
				created.deep.Map.multiPartial.should.be.String().and.equal( " multiple replaced elements in a compiled string " );
			} );
	} );
} );
