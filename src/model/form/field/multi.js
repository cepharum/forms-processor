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
	/**
	 * @param {FormModel} form reference on form this field belongs to
	 * @param {object} definition definition of field
	 * @param {int} fieldIndex index of field in set of containing form's fields
	 * @param {object} reactiveFieldInfo provided object to contain reactive information of field
	 * @param {CustomPropertyMap} customProperties defines custom properties to be exposed using custom property descriptor
	 */
	constructor( form, definition, fieldIndex, reactiveFieldInfo, customProperties ) {
		super( form, definition, fieldIndex, reactiveFieldInfo, {
			fields( v ) {
				let value = v;
				if( !Array.isArray( v ) ) {
					value = [v];
				}
				if( value.some( entry => typeof entry !== "object" ) ) {
					throw new Error( "provided invalid field description" );
				}
				if( value.some( entry => !form.sequence.registry.fields.hasOwnProperty( entry.type || "text" ) )
				) {
					throw new Error( "provided field of unknown type" );
				}
				return{ value };
			},

			initialSize( v ) {
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
		} );
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
		const errors = super.validate();

		const value = this.value;
		console.log(value);

		if ( this.required && !value.length ) {
			errors.push( "@VALIDATION.MISSING_REQUIRED" );
		}

		console.log(value.length, this.amount.isBelowRange( value.length ), this.amount.isAboveRange( value.length ))
		if( value.length || value.length === 0  ) {
			if ( this.amount.isBelowRange( value.length ) ) {
				errors.push( "@VALIDATION.TOO_FEW" );
			}

			if ( this.amount.isAboveRange( value.length ) ) {
				errors.push( "@VALIDATION.TOO_MANY" );
			}
		}
		if( errors.length ) console.error( errors );
		return errors;
	}

	/** @inheritDoc */
	renderFieldComponent( reactiveFieldInfo ) {
		const that = this;
		const { form: { writeValue, readValue }, qualifiedName } = that;

		return {
			render( createElement ) {
				const components = this.items.map( ( entry, index ) => {
					return createElement( "div", {}, [
						createElement( entry.field.component ),
						createElement( "button", { domProps: {
							onclick: () => this.remove(index),
						} }, "-" )
					] );
				} );
				return createElement( "div", {}, [ ...components, createElement( "button", { domProps: {
					onclick: this.add,
				} }, "+" ) ] );
			},
			mounted() {
				const { initialSize } = that;
				for( let index = 0; index < initialSize; index ++ ) {
					this.add();
				}
			},
			methods: {
				remove(index){
					this.items.splice(index, 1);
					that.value = this.value;
				},
				add() {
					const numOfItems = this.items.length;
					const numOfFields = that.fields.length;
					const field = Object.assign( {},that.fields[numOfItems % numOfFields],{ name: String( numOfItems ) } );
					const form = Object.assign( {},that.form,{
						readValue: key => {
							readValue( qualifiedName );
							const index = key.split( "." )[1];
							return this.items[index].value;
						},
						writeValue: ( key, value ) => {
							const index = key.split( "." )[1];
							this.items[index].value = value;
							writeValue( qualifiedName, this.value );
							reactiveFieldInfo.value = reactiveFieldInfo.formattedValue = this.value;
							reactiveFieldInfo.pristine = false;
							this.$emit( "input", this.value );
							that.value = this.value;
							this.$parent.$emit( "input", this.value ); // FIXME is this required due to $emit always forwarded to "parent"
						},
						name: this.name,
					} );
					const Manager = that.form.sequence.registry.fields[field.type || "text"];
					const newReactiveFieldInfo = {};
					this.items.push( {
						reactiveFieldInfo: newReactiveFieldInfo,
						field: new Manager( form, field, numOfItems, newReactiveFieldInfo ),
						value: null,
					} );
				}
			},
			data() {
				return {
					items: [],
				};
			},
			computed: {
				value() {
					return this.items.map( entry => entry.value );
				},
			}
		};
	}


}
