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

import Vue from "vue";



const ModifierKeys = {
	rewind: [
		{
			key: "ArrowLeft",
			shift: true,
			alt: true,
		}
	],
	advance: [
		"Enter",
		{
			key: "ArrowRight",
			shift: true,
			alt: true,
		}
	],
};



const tracks = [];



/**
 * Finds track on provided element matching same set of modifiers.
 *
 * @param {HTMLElement} element element desired track is associated with
 * @param {string[]} modifiers sorted list of modifiers used in tracked key handler
 * @returns {?object} found track or null if missing
 */
function findTrack( element, modifiers ) {
	const numTracks = tracks.length;
	const numModifiers = modifiers.length;

	for ( let i = 0; i < numTracks; i++ ) {
		const track = tracks[i];

		if ( track.element !== element ) {
			continue;
		}

		const trackedModifiers = track.modifiers;
		if ( trackedModifiers.length !== numModifiers ) {
			continue;
		}

		let j;
		for ( j = 0; j < numModifiers; j++ ) {
			if ( modifiers[j] !== trackedModifiers[j] ) {
				break;
			}
		}

		if ( j >= numModifiers ) {
			return {
				track,
				index: i,
			};
		}
	}

	return null;
}

/**
 * Handles certain key press events captured globally to be triggering invocation
 * of some method.
 *
 * @param {KeyboardEvent} event captured keyboard event
 * @param {HTMLElement} element element the directive was declared on
 * @param {string[]} modifiersNames lists modifiers used on directive
 * @param {function} method method to invoke on captured keyboard event is matching directive
 * @returns {boolean} true unless requesting to cancel further event propagation and default handling
 */
function onKeyPress( event, element, modifiersNames, method ) {

	let inTextarea = false;

	/*
	 * Is focus in scope of provided element annotated with directive?
	 */
	let iter = document.activeElement;
	while ( iter ) {
		if ( iter.nodeName.toLowerCase() === "textarea" ) {
			inTextarea = true;
		}
		if ( iter === element ) {
			break;
		}

		iter = iter.parentNode;
	}

	if ( !iter ) {
		// ignore any keyboard events while some other part of document is having focus
		return true;
	}


	const numModifiers = modifiersNames.length;
	for ( let i = 0; i < numModifiers; i++ ) {
		const relatedKeys = ModifierKeys[modifiersNames[i]];
		const numRelatedKeys = relatedKeys.length;

		for ( let j = 0; j < numRelatedKeys; j++ ) {
			let expecting = relatedKeys[j];
			if ( typeof expecting === "string" ) {
				expecting = { key: expecting };
			}

			if ( event.key === expecting.key ) {
				if ( ( expecting.alt ? 1 : 0 ) ^ ( event.altKey ? 1 : 0 ) ) {
					return true;
				}

				if ( ( expecting.ctrl ? 1 : 0 ) ^ ( event.ctrlKey ? 1 : 0 ) ) {
					return true;
				}

				if ( ( expecting.shift ? 1 : 0 ) ^ ( event.shiftKey ? 1 : 0 ) ) {
					return true;
				}

				if ( inTextarea && event.key === "Enter" ) {
					return true;
				}

				method();

				event.preventDefault();
				event.stopPropagation();

				return false;
			}
		}
	}

	return true;
}



export default Vue.directive( "global-key", {
	bind: function( element, { value, modifiers } ) {
		const modifiersNames = Object.keys( modifiers ).map( i => String( i ).trim().toLowerCase() ).sort();

		const { track } = findTrack( element, modifiersNames ) || {};
		if ( track ) {
			return;
		}

		const newTrack = {
			element,
			modifiers: modifiersNames,
			handler: event => onKeyPress( event, element, modifiersNames, value ),
		};

		window.addEventListener( "keyup", newTrack.handler, {
			capture: true,
		} );

		tracks.push( newTrack );
	},
	unbind: function( element, { modifiers } ) {
		const modifiersNames = Object.keys( modifiers ).sort();

		const { track, index } = findTrack( element, modifiersNames ) || {};
		if ( !track ) {
			return;
		}

		window.removeEventListener( "keyup", track.handler, {
			capture: true,
		} );

		tracks.splice( index, 1 );
	},
} );
