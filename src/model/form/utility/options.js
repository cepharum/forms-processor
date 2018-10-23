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

/**
 * Describes single option to choose out of a set of options.
 *
 * Each option consists of a value and a human-readable label briefly explaining
 * the option.
 *
 * @typedef {{label:string, value:string}} LabelledOption
 */

/**
 * Describes a sorted list of options to choose from.
 *
 * @typedef {LabelledOption[]} LabelledOptionsList
 */

/**
 * Describes property instantly delivering a sorted list of options to choose
 * from.
 *
 * @typedef {{value:LabelledOptionsList}} InstantLabelledOptionsListProperty
 */

/**
 * Describes property deferredly delivering a sorted list of options to choose
 * from.
 *
 * @typedef {{get:function():LabelledOptionsList}} DeferredLabelledOptionsListProperty
 */

/**
 * Describes property delivering a sorted list of options to choose from.
 *
 * @typedef {InstantLabelledOptionsListProperty|DeferredLabelledOptionsListProperty} LabelledOptionsListProperty
 */


/**
 * Provides helpers for working with a list of options to choose from e.g. in a
 * selector or in a set of checkboxes, buttons or radio buttons.
 */
export default class Options {
	/**
	 * Extracts normalized array of options to be listed in selector.
	 *
	 * @param {string|array<{label:string, value:string}>} definitionValue options as provided in field's definition
	 * @param {?LabelledOptionsListProperty} fallback to return if `definition` is missing/unset
	 * @param {function(string):string} localizer optional callback selecting matching translation from a map of available localizations
	 * @param {function(string):PropertyDescriptor} termHandler optional callback selecting matching translation from a map of available localizations
	 * @return {LabelledOptionsListProperty} property descriptor describing normalized list of options to choose from
	 */
	static createOptions( definitionValue, fallback = null, { localizer = null, termHandler = null } = {} ) {
		if ( !definitionValue ) {
			if ( fallback == null ) {
				throw new TypeError( "Missing list of options to offer in a selector." );
			}

			return fallback;
		}


		if ( Array.isArray( definitionValue ) ) {
			return normalizeOptions( definitionValue, termHandler );
		}

		{
			const _value = String( definitionValue ).trim();
			if ( termHandler ) {
				const { get, value } = termHandler( _value );

				if ( typeof get === "function" ) {
					return { get: () => normalizeOptions( get() ).value };
				}

				return normalizeOptions( value );
			}

			return normalizeOptions( _value );
		}


		/**
		 * Processes provided definition of list creating property descriptor
		 * delivering normalized list of options instantly or deferredly.
		 *
		 * @param {string|Array<string|object>} processedDefinitionValue definition of options, probably computed
		 * @param {function(string):PropertyDescriptor} cbTermHandler callback computing terms optionally embedded in passed value
		 * @return {LabelledOptionsListProperty} normalized list of options, probably deferred
		 */
		function normalizeOptions( processedDefinitionValue, cbTermHandler = null ) {
			if ( !processedDefinitionValue ) {
				return { value: [] };
			}

			// convert different ways of defining list of options into homogenic
			// list of options, though keeping track of items with deferred data
			const list = Array.isArray( processedDefinitionValue ) ? processedDefinitionValue : String( processedDefinitionValue ).trim().split( /(?:\s*,)+\s*/ );
			const numItems = list.length;
			const filtered = new Array( numItems );
			let write = 0;
			let hasDynamicItem = false;

			for ( let read = 0; read < numItems; read++ ) {
				const source = list[read];
				let value = null;
				let label = null;

				switch ( typeof source ) {
					case "string" : {
						const computed = cbTermHandler ? cbTermHandler( source ) : { value: source };
						if ( computed.get ) {
							hasDynamicItem = true;
							label = value = computed;
						} else if ( computed.value != null ) {
							label = value = computed;
						}

						break;
					}

					case "object" : {
						const localized = source && !source.hasOwnProperty( "value" ) && localizer ? localizer( source ) : source;

						if ( localized && localized.value != null ) {
							const _value = localizer ? localizer( localized.value ) : localized.value;
							const _label = localized.label == null ? _value : localizer ? localizer( localized.label ) : localized.label;

							if ( cbTermHandler ) {
								value = cbTermHandler( localized.value );
								label = cbTermHandler( _label );

								if ( value.get || label.get ) {
									hasDynamicItem = true;
								}
							} else {
								value = { value: localized.value };
								label = { value: _label };
							}
						}
						break;
					}

					case "undefined" :
						break;

					default :
						throw new TypeError( `Invalid option of type ${typeof source} rejected.` );
				}

				if ( value && label ) {
					filtered[write++] = { value, label };
				}
			}

			filtered.splice( write );


			// As soon as any option in resulting list of options relies on
			// computed data the whole list must be delivered using re-computing
			// function.

			if ( hasDynamicItem ) {
				return { get: () => {
					const copy = new Array( write );

					for ( let i = 0; i < write; i++ ) {
						const { label, value } = filtered[i];

						const _label = label.get ? label.get() : label.value;
						const _value = value.get ? value.get() : value.value;

						copy[i] = {
							label: localizer ? localizer( _label ) : _label,
							value: normalizeValue( localizer ? localizer( _value ) : _value ),
						};
					}

					return copy;
				} };
			}

			for ( let i = 0; i < write; i++ ) {
				const { label, value } = filtered[i];

				const _label = label.value;
				const _value = value.value;

				filtered[i] = {
					label: localizer ? localizer( _label ) : _label,
					value: normalizeValue( localizer ? localizer( _value ) : _value ),
				};
			}

			return { value: filtered };
		}

		/**
		 * Normalizes a single option's value.
		 *
		 * @param {*} value value to be normalized
		 * @return {*} normalized value
		 */
		function normalizeValue( value ) {
			switch ( typeof value ) {
				case "string" :
					return value.trim();

				case "number" :
				case "boolean" :
					return value;

				case "undefined" :
					return null;

				case "object" :
					return value;

				case "function" :
					throw new TypeError( "Rejecting function provided as option value." );
			}

			throw new TypeError( "Rejecting unknown data provided as option value." );
		}
	}

	/**
	 * Extracts parts of provided value(s) matching values in provided set of
	 * normalized option definitions.
	 *
	 * @param {*|Array} values one or more values to be filtered
	 * @param {LabelledOptionsList} normalizedOptions processed list of defined options
	 * @return {*} excerpt of of first list containing values also listed in second list, only
	 */
	static extractOptions( values, normalizedOptions ) {
		const numOptions = normalizedOptions.length;

		const rawValues = Array.isArray( values ) ? values : values == null ? [] : [values];
		const numRaw = rawValues.length;

		const extracted = new Array( numRaw );
		let write = 0;

		for ( let i = 0; i < numRaw; i++ ) {
			const item = rawValues[i];

			for ( let j = 0; j < numOptions; j++ ) {
				const option = normalizedOptions[j].value;

				if ( item === option || item === String( option ) ) {
					extracted[write++] = option;
					break;
				}
			}
		}

		extracted.splice( write );

		return normalizedOptions.length === 1 ? extracted[0] || null : extracted;
	}
}
