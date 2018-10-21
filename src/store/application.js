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


export default {
	namespaced: false,
	state: {
		view: null,
	},
	actions: {
		switchView( { commit, state, getters }, view ) {
			let _view = view;

			switch ( _view ) {
				case "forms" :
					if ( _view !== "splash" && !getters.prepared ) {
						_view = "splash";
					}

					// falls through
				case "splash" :
					if ( state.view !== _view ) {
						commit( "switchView", _view );
					}
					break;

				default :
					console.error( `Invalid request for switching to view ${view} ignored.` ); // eslint-disable-line no-console
			}
		},
	},
	mutations: {
		switchView( state, view ) {
			state.view = view;
		},
	},
	getters: {
		prepared( state, getters, rootState, rootGetters ) {
			return rootGetters["l10n/prepared"] &&
			       rootGetters["form/loaded"];
		},
		showSplash( state ) {
			return state.view !== "forms";
		},
		showForms( state ) {
			return state.view === "forms";
		},
		locale( state, getters ) {
			return getters["l10n/current"];
		},
		l10n( state, getters ) {
			return getters["l10n/map"];
		},
		sequence( state, getters ) {
			return getters["form/sequenceManager"];
		},
	},
};
