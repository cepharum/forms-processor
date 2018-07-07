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

import Definition from "../../api/Definition";
import FormSequenceModel from "../../model/form/sequence";

export default {
	state: {
		id: null,
		definition: {},
		currentStep: null,
		input: {},
	},
	getters: {
		hasForm( state ) {
			return state.id != null;
		},
		formSequenceID( state ) {
			return state.id;
		},
		formSequenceLabel( state ) {
			return state.definition.label || "";
		},
		formSequenceDescription( state ) {
			return state.definition.description || "";
		},
		formSequenceManager( state ) {
			return new FormSequenceModel( state.definition, state.input );
		},
		formSequenceInput( state ) {
			return state.input;
		},
		formReadInput: state => qualifiedName => {
			const [ formName, fieldName ] = String( qualifiedName ).split( /\s*\.\s*/ );

			if ( formName && fieldName && state.input.hasOwnProperty( formName ) ) {
				return state.input[formName][fieldName];
			}

			return null;
		},
	},
	mutations: {
		selectForm( state, { id, definition } ) {
			if ( !state.id && id && definition ) {
				state.id = id;
				state.definition = definition;
			}
		},

		resetFormInput( state ) {
			const initial = new FormSequenceModel( state.definition, state.input ).getInitialData();

			Object.keys( initial )
				.forEach( name => {
					state.input[name] = initial[name] == null ? null : initial[name];
				} );
		},

		writeInput( state, { name, value } ) {
			const segments = name.split( "." );
			let data = state.input;

			for ( let i = 0, numSegments = segments.length - 1; i < numSegments; i++ ) {
				const segment = segments[i];

				if ( data.hasOwnProperty( segment ) && typeof data[segment] === "object" ) {
					data = data[segment];
				} else {
					// don't adjust state as request is addressing unknown section
					return;
				}
			}

			const lastSegment = segments.pop();
			if ( lastSegment && data.hasOwnProperty( lastSegment ) ) {
				data[lastSegment] = value;
			}
		},
	},
	actions: {
		selectForm( { commit }, id ) {
			return Definition.load( id )
				.then( definition => {
					commit( "selectForm", {
						id,
						definition,
					} );

					commit( "resetFormInput" );
				} );
		},

		writeInput( { commit }, { name, value } ) {
			commit( "writeInput", { name, value } );
		},
	},
};
