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
import DateProcessor from "../utility/date";

/**
 * Implements field type that provides date based utility
 */
export default class FormFieldDateModel extends FormFieldAbstractModel {
	/** @inheritDoc */
	constructor( form, definition, fieldIndex, reactiveFieldInfo, customProperties = {}, container = null ) {
		super( form, definition, fieldIndex, reactiveFieldInfo, {
			minDate( value, _, __, termHandler ) {
				/**
				 * Defines valid range of a value's length.
				 *
				 * @name FormFieldTextModel#size
				 * @property {Range}2
				 * @readonly
				 */
				return termHandler( value, rawValue => ( rawValue == null ? null : DateProcessor.normalizeSelector( rawValue ) ) );
			},

			maxDate( value, _, __, termHandler ) {
				/**
				 * Defines valid range of a value's length.
				 *
				 * @name FormFieldTextModel#size
				 * @property {Range}2
				 * @readonly
				 */
				return termHandler( value, rawValue => ( rawValue == null ? null : DateProcessor.normalizeSelector( rawValue ) ) );
			},

			...customProperties
		}, container );

		this.processor = new DateProcessor( this.format );
		this.normalizationErrors = [];
	}

	/** @inheritDoc */
	normalizeValue( input = "", _ ) {
		this.normalizationErrors = [];
		const options = {
			minDate: this.minDate,
			maxDate: this.maxDate,
			format: this.format,
			yearBuffer: this.yearBuffer,
			allowedWeekdays: this.allowedWeekdays,
			notAllowedDates: this.notAllowedDates,
		};
		let value = null;
		let formattedValue = "";
		if( input ) {
			try{
				value = this.processor.normalize( input, { ...options, format: this.format, acceptPartial: true } );
				formattedValue = input;
				// eslint-disable-next-line no-empty
			} catch ( e ) {}

			try{
				this.processor.normalize( input, { ...options, format: this.format, acceptPartial: false } );
			} catch ( e ) {
				this.normalizationErrors.push( "@VALIDATION.PATTERN_MISMATCH" );
			}
		}

		return {
			value,
			formattedValue,
		};
	}

	/** @inheritDoc */
	renderFieldComponent( reactiveFieldInfo ) {
		const that = this;
		let lastValue = "";

		return {
			template: `
				<input :value="formattedValue" @input="onInput"> 
			`,
			methods: {
				onInput( event ) {
					const { value: input, selectionStart } = event.target;

					const { formattedValue } = that.normalizeValue( input );

					const value = formattedValue == null ? lastValue : formattedValue;
					event.target.value = lastValue = value;
					event.target.setSelectionRange( selectionStart, selectionStart );

					// re-emit in scope of this field's type-specific
					// component (containing input element created here)
					this.$emit( "input", formattedValue || lastValue );
				},
			},
			data: () => reactiveFieldInfo,
		};
	}

	/** @inheritDoc */
	validate( live ) {
		const errors = [];

		if( !live ) {
			errors.splice( errors.length, 0, ...this.normalizationErrors );
			errors.splice( errors.length, 0, ...super.validate() );
		}

		if( this.value ) {
			if( this.minDate ) {
				try {
					this.processor.validate( this.value, { minDate: this.minDate } );
				} catch ( e ) {
					errors.push( "@VALIDATION.DATE.TOO_EARLY" );
				}
			}

			if( this.maxDate ) {
				try{
					this.processor.validate( this.value, { maxDate: this.maxDate } );
				} catch ( e ) {
					errors.push( "@VALIDATION.DATE.TOO_LATE" );
				}
			}

			if( this.allowedWeekdays ) {
				try{
					this.processor.validate( this.value, { allowedWeekdays: this.allowedWeekdays } );
				} catch ( e ) {
					errors.push( "@VALIDATION.DATE.DAY_NOT_ALLOWED" );
				}
			}

			if( this.notAllowedDates ) {
				try{
					this.processor.validate( this.value, { notAllowedDates: this.notAllowedDates } );
				} catch ( e ) {
					errors.push( "@VALIDATION.DATE.NOT_ALLOWED" );
				}
			}
		}

		return errors;
	}

}
