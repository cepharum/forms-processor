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

import L10n from "@/service/l10n";
import FormSequenceModel from "../model/form/sequence";

let nextId = 1;

export default {
	namespaced: true,
	state: {
		id: null,
		definition: {},
		input: {},
		sequence: null,
	},
	actions: {
		define( { commit, rootGetters }, { id = null, definition } ) {
			const _id = id == null ? nextId++ : id;

			commit( "define", {
				id: _id,
				definition,
				locale: () => rootGetters.locale,
			} );

			commit( "resetInput" );
		},

		writeInput( { commit }, { name, value } ) {
			commit( "writeInput", { name, value } );
		},
	},
	mutations: {
		define( state, { id, definition, locale } ) {
			if ( !state.id && id && definition ) {
				state.id = id;
				state.definition = definition;
			}

			if ( !state.sequence && locale ) {
				state.sequence = new FormSequenceModel( state.definition, state.input, locale );
			}
		},

		resetInput( state ) {
			if ( state.sequence ) {
				const inputs = state.input;
				const initials = state.sequence.getInitialData();
				const segments = Object.keys( initials );
				const numSeqments = segments.length;

				for ( let i = 0; i < numSeqments; i++ ) {
					const major = segments[i];
					const initial = initials[major];
					const names = Object.keys( initial );
					const numNames = names.length;

					if ( typeof inputs[major] !== "object" || !inputs[major] ) {
						inputs[major] = {};
					}

					const input = inputs[major];

					for ( let j = 0; j < numNames; j++ ) {
						const minor = names[j];
						const value = initial[minor];

						input[minor] = value == null ? null : value;
					}
				}
			}
		},

		writeInput( state, { name, value } ) {
			const segments = String( name ).split( /\s*\.\s*/ );
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
	getters: {
		loaded( state ) {
			return state.sequence != null;
		},
		sequenceID( state ) {
			return state.id;
		},
		sequenceLabel( state, getters, rootState, rootGetters ) {
			return L10n.localize( state.definition.label || "", rootGetters.locale );
		},
		sequenceDescription( state, getters, rootState, rootGetters ) {
			return L10n.localize( state.definition.description || "", rootGetters.locale );
		},
		sequenceManager( state ) {
			return state.sequence;
		},
		sequenceInput( state ) {
			return state.input;
		},
		readInput: state => name => {
			const segments = String( name ).split( /\s*\.\s*/ );
			let data = state.input;

			for ( let i = 0, numSegments = segments.length - 1; i < numSegments; i++ ) {
				const segment = segments[i];

				if ( data.hasOwnProperty( segment ) && typeof data[segment] === "object" ) {
					data = data[segment];
				} else {
					return null;
				}
			}

			const lastSegment = segments.pop();
			if ( lastSegment && data.hasOwnProperty( lastSegment ) ) {
				return data[lastSegment];
			}

			return null;
		},
	},
};
