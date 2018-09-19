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
import Storage from "@/service/storage";
import FormSequenceModel from "../model/form/sequence";

let nextId = 1;

export default {
	namespaced: true,
	state: {
		id: null,
		definition: {},
		input: {},
		model: null,
	},
	actions: {
		/**
		 * Injects a form's definition and ID to be presented.
		 *
		 * @param {object} state refers to current module's state
		 * @param {function} commit callback for committing changes to state
		 * @param {function} dispatch callback for dispatching more actions
		 * @param {object<string,*>} getters set of current module's getters
		 * @param {object<string,*>} rootGetters set of non-namespaced getters
		 * @param {string|number} id unique ID of form to use on storing all input eventually
		 * @param {object} definition description of forms, their fields and additional context information
		 * @returns {void}
		 */
		define( { state, commit, dispatch, getters, rootGetters }, { id = null, definition } ) {
			const _id = id == null ? nextId++ : id;

			commit( "define", {
				id: _id,
				definition,
				model: new FormSequenceModel( definition, {
					write: ( name, value ) => dispatch( "writeInput", { name, value } ),
					read: getters.readInput,
					data: state.input,
				}, () => rootGetters.locale ),
			} );

			commit( "resetInput" );
		},

		/**
		 * Requests to update a field's value in state.
		 *
		 * @param {function} commit callback for committing changes to state
		 * @param {string} name qualified name of field to adjust
		 * @param {*} value new value of field
		 * @returns {void}
		 */
		writeInput( { commit }, { name, value } ) {
			const _name = Storage.normalizeName( name );
			if ( _name != null ) {
				commit( "writeInput", { name: _name, value } );
			}
		},
	},
	mutations: {
		define( state, { id, definition, model } ) {
			state.id = id;
			state.definition = definition;
			state.model = model;
		},

		resetInput( state ) {
			if ( state.model ) {
				let changed = false;
				const storage = new Storage( state.input );

				const fields = state.model.fields;
				const names = Object.keys( fields );
				const numFields = names.length;

				for ( let i = 0; i < numFields; i++ ) {
					const name = names[i];
					const field = fields[name];

					changed |= storage.write( name, field.normalizeValue( field.initial ) );
				}

				if ( changed ) {
					state.input = storage.data;
				}
			}
		},

		writeInput( state, { name, value } ) {
			const storage = new Storage( state.input );

			if ( storage.write( name, value ) ) {
				state.input = storage.data;
			}
		},
	},
	getters: {
		loaded( state ) {
			return state.model != null;
		},
		sequenceID( state ) {
			return state.id;
		},
		sequenceLabel( state, getters, rootState, rootGetters ) {
			return L10n.selectLocalized( state.definition.label || "", rootGetters.locale );
		},
		sequenceDescription( state, getters, rootState, rootGetters ) {
			return L10n.selectLocalized( state.definition.description || "", rootGetters.locale );
		},
		sequenceManager( state ) {
			return state.model;
		},
		sequenceInput( state ) {
			return state.input;
		},
		readInput: state => name => {
			return new Storage( state.input ).read( name );
		},
	},
};
