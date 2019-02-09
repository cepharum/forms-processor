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

import FormFieldAbstractModel from "./abstract";
import Range from "../utility/range";

/**
 * Manages multiple fields of form representing text input.
 */
export default class FormFieldMultiModel extends FormFieldAbstractModel {
	/** @inheritDoc */
	constructor( form, definition, fieldIndex, reactiveFieldInfo, customProperties = {}, container = null ) {
		super( form, definition, fieldIndex, reactiveFieldInfo, {
			fields( v ) {
				let value = v;
				if( Array.isArray( v ) ) {
					[value] = v;
				}
				if( typeof value !== "object" ) {
					throw new Error( "provided invalid field description" );
				}
				if( !form.sequence.registry.fields.hasOwnProperty( value.type || "text" )
				) {
					throw new Error( "provided field of unknown type" );
				}
				return{ value };
			},

			initialSize( v = 1 ) {
				if( v ) {
					if( isNaN( v ) ) {
						throw new Error( "provided NaN as initialSize " );
					}
				}
				return { value: Number( v ) };
			},

			amount( v ) {
				/**
				 * Defines valid range of the amount of text fields
				 *
				 * @name FormFieldTextModel#size
				 * @property {Range}
				 * @readonly
				 */
				return { value: new Range( v ) };
			},

			...customProperties,
		}, container );

		this.items = [];
	}

	/** @inheritDoc */
	normalizeValue( value, options = {} ) {
		const fixedValues = value || [];
		for( let index = 0, length = fixedValues.length; index < length; index ++ ) {
			fixedValues[index] = super.normalizeValue( fixedValues[index], options );
		}
		return {
			value: fixedValues.map( v => v.value ),
			formattedValue: fixedValues.map( v => v.formattedValue ),
		};
	}

	/** @inheritDoc */
	initializeReactive( reactiveFieldInfo ) {
		const initial = super.initializeReactive( reactiveFieldInfo );

		reactiveFieldInfo.options = this.options;
		return initial;
	}

	/** @inheritDoc */
	static get isInteractive() {
		return true;
	}

	/** @inheritDoc */
	validate( live ) {
		const errors = super.validate( live );
		const fields = this.items.map( entry => entry.field );
		const value = this.items.map( entry => entry.value );

		if ( this.required && !value.length ) {
			errors.push( "@VALIDATION.MISSING_REQUIRED" );
		}

		if( value.length || value.length === 0 ) {
			if ( this.amount.isBelowRange( value.length ) ) {
				errors.push( "@VALIDATION.TOO_FEW" );
			}

			if ( this.amount.isAboveRange( value.length ) ) {
				errors.push( "@VALIDATION.TOO_MANY" );
			}
		}

		for( const entry of fields ) {
			const subErrrors = entry.validate( live );
			if( subErrrors && subErrrors.length ) {
				for( const error of subErrrors ) {
					errors.push( error );
				}
			}
		}

		return errors;
	}

	/** @inheritDoc */
	renderFieldComponent( reactiveFieldInfo ) {
		const that = this;
		const { form: { writeValue, readValue }, qualifiedName } = that;

		return {
			render( createElement ) {
				const components = this.items.map( ( entry, index ) => {
					return createElement( "div", { class: "multi-field-container" }, [
						createElement( entry.field.component ),
						createElement( "button", {
							domProps: {
								onclick: () => this.remove( index ),
								disabled: !this.removeEnabled,
							},
							class: `remove ${this.removeEnabled ? "enabled" : "disabled"}`,
						}, "-" ),
						createElement( "button", {
							domProps: {
								onclick: () => this.add( index + 1 ),
								disabled: !this.addEnabled,
							},
							class: `add ${this.addEnabled ? "enabled" : "disabled"}`,
						}, "+" )
					] );
				} );
				return createElement( "div", {}, components );
			},
			mounted() {
				const { initialSize } = that;
				for( let index = 0; index < initialSize; index ++ ) {
					this.add();
				}
			},
			methods: {
				remove( index ) {
					if( this.removeEnabled ) {
						this.items.splice( index, 1 );
					}
					writeValue( qualifiedName, this.items );
				},
				add( index ) {
					if( this.addEnabled ) {
						const numOfItems = this.items.length;
						const mostRecentItem = this.items[numOfItems - 1];
						let mostRecentName = -1;
						if( mostRecentItem ) mostRecentName = Number( mostRecentItem.field.name );
						const field = Object.assign( {},that.fields,{
							name: String( mostRecentName + 1 ),
						} );
						const form = Object.create( that.form );
						Object.defineProperties( form, {
							readValue: {
								value: key => {
									readValue( qualifiedName );
									const item = this.items.find( entry => {
										return entry.field.qualifiedName === key;
									} );
									return item.value;
								}
							},
							writeValue: {
								value: ( key, value ) => {
									const item = this.items.find( entry => {
										return entry.field.qualifiedName === key;
									} );
									item.value = value;
									writeValue( qualifiedName, this.value );
									reactiveFieldInfo.value = reactiveFieldInfo.formattedValue = this.value;
									reactiveFieldInfo.pristine = false;
									this.$emit( "input", this.value );
									this.$parent.$emit( "input", this.value ); // FIXME is this required due to $emit always forwarded to "parent"
								}
							},
							name: {
								value: qualifiedName,
							}
						} );
						const Manager = that.form.sequence.registry.fields[field.type || "text"];
						const newReactiveFieldInfo = {};
						const item = {
							reactiveFieldInfo: newReactiveFieldInfo,
							field: new Manager( form, field, numOfItems, newReactiveFieldInfo ),
							value: null,
						};
						if( index || index === 0 ) {
							this.items.splice( index, 0, item );
						} else {
							this.items.push( item );
						}
					}

				}
			},
			data() {
				if( !that.items ) {
					that.items = [];
				}
				return {
					items: that.items,
				};
			},
			computed: {
				value() {
					return this.items.map( entry => entry.value );
				},
				removeEnabled() {
					return this.items.length > 1;
				},
				addEnabled() {
					return !that.amount.isAboveRange( this.items.length + 1 );
				}
			}
		};
	}


}
