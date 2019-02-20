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

/**
 * @typedef {object<string,object<string,*>>} FormSequenceInputData
 */


export default {
	namespaced: true,
	state() {
		return {
			id: null,
			definition: {},
			input: {},
			model: null,
			result: {},
			localStoreId: null,
			_timer: null,
		};
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
		 * @param {string|number} id permanently unique ID of form to use on storing all input eventually
		 * @param {string|number} name temporarily unique ID of form identifying it in context of current HTML document
		 * @param {object} definition description of forms, their fields and additional context information
		 * @param {object} registry registry of custom field types and custom processors
		 * @returns {void}
		 */
		define( { state, commit, dispatch, getters, rootGetters }, { id = null, name = null, definition, registry = {} } ) {
			const _id = String( id == null ? nextId++ : id ).trim();
			const _name = name == null ? _id : String( name ).trim();

			const model = new FormSequenceModel( { id: _id, name: _name }, definition, registry, {
				write: ( key, value ) => dispatch( "writeInput", { name: key, value } ),
				read: getters.readInput,
				data: () => state.input,
			}, {
				locale: () => rootGetters.locale,
				translations: () => rootGetters.l10n,
			} );

			commit( "define", {
				id: _id,
				name: _name,
				definition,
				model,
			} );

			commit( "storeLocally", {
				enabled: model.mode.localStore.enabled,
				id: model.mode.localStore.id,
			} );

			commit( "resetInput" );

			if ( state.localStoreId ) {
				const rawStore = localStorage.getItem( state.localStoreId );
				if ( rawStore != null ) {
					let stored = null;

					try {
						stored = JSON.parse( rawStore );
					} catch( e ) {
						console.error( "failed reading locally persisted input:", e ); // eslint-disable-line no-console
					}

					if ( stored != null ) {
						if ( !model.mode.localStore.maxAge || ( stored.timestamp > Date.now() - model.mode.localStore.maxAge ) ) {
							commit( "loadInput", stored );
						}
					}
				}
			}


			model.initializeTerms();
		},

		/**
		 * Requests to update a field's value in state.
		 *
		 * @param {object} state current state
		 * @param {function} commit callback for committing changes to state
		 * @param {string} name qualified name of field to adjust
		 * @param {*} value new value of field
		 * @returns {void}
		 */
		writeInput( { state, commit }, { name, value } ) {
			if ( state.model ) {
				const _name = Storage.normalizeName( name );
				if ( _name != null ) {
					commit( "writeInput", { name: _name, value } );
				}
			}
		},

		result( { commit }, { success, redirect, text, error = null } ) {
			commit( "result", {
				success, redirect, text, error
			} );
		},
	},
	mutations: {
		define( state, { id, definition, model } ) {
			state.id = id;
			state.definition = definition;
			state.model = model;
		},

		storeLocally( state, { enabled, id } ) {
			if ( enabled && id && ( typeof id === "number" || typeof id === "string" ) ) {
				state.localStoreId = `forms_processor_${id}`;
			} else {
				state.localStoreId = null;
			}
		},

		resetInput( state ) {
			if ( state.model ) {
				const { fields } = state.model;
				const names = Object.keys( fields );
				const numFields = names.length;

				for ( let i = 0; i < numFields; i++ ) {
					const name = names[i];
					const field = fields[name];

					field.setValue( field.initial );
				}
			}
		},

		loadInput( state, { input, touched } ) {
			if ( state.model && input && typeof input === "object" ) {
				const { fields } = state.model;
				const names = Object.keys( fields );
				const numFields = names.length;
				const missing = {};

				for ( let i = 0; i < numFields; i++ ) {
					const name = names[i];
					const field = fields[name];

					if ( field.constructor.isInteractive ) {
						const storedValue = Storage.read( input, name, missing );
						if ( storedValue !== missing ) {
							field.setValue( storedValue );

							if ( touched && touched[name] ) {
								field.touch();
							}
						}
					}
				}
			}
		},

		writeInput( state, { name, value } ) {
			if ( Storage.write( state.input, name, value ) ) {
				state.input = state.input;
			}

			if ( state.localStoreId ) {
				clearTimeout( state._timer );

				const saver = () => {
					const { fields } = state.model;
					const names = Object.keys( fields );
					const numFields = names.length;

					const touched = {};

					for ( let i = 0; i < numFields; i++ ) {
						const fieldName = names[i];
						const field = fields[fieldName];

						if ( !field.pristine ) {
							touched[fieldName] = 1;
						}
					}

					localStorage.setItem( state.localStoreId, JSON.stringify( {
						timestamp: Date.now(),
						input: state.input,
						touched,
					} ) );
				};

				state._timer = setTimeout( saver, 500 );

				if ( !state._saveOnPageUnload ) {
					state._saveOnPageUnload = true;

					window.addEventListener( "beforeunload", saver );
				}
			}
		},

		result( state, { success, redirect, text, error = null } ) {
			state.result = {
				type: success ? "success" : "error",
				redirect, text, error,
			};
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
			return Storage.read( state.input, name );
		},
		hasResult: state => state.result.type != null,
		resultIsSuccess: state => state.result.type === "success",
		resultIsError: state => state.result.type === "error",
		resultRedirect: state => state.result.redirect,
		resultMessage: state => state.result.text,
		resultError: state => state.result.error,
	},
};
