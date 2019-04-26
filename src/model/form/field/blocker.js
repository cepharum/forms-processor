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
 * Implements custom field type blocking form validation on some term failing.
 *
 * @param {class} Abstract abstract base class of fields
 * @return {class} class implementing custom field blocking form validation on failing term
 */
export default function( Abstract ) {
	return class BlockerField extends Abstract {
		/** @inheritDoc */
		constructor( form, definition, fieldIndex, reactiveFieldInfo, customProperties = {}, container = null ) {
			super( form, definition, fieldIndex, reactiveFieldInfo, {
				/**
				 * Generates property descriptor exposing term evaluated for
				 * checking whether form's validation should be prevented.
				 *
				 * @param {*} definitionValue value of property provided in definition of field
				 * @param {string} definitionName name of property provided in definition of field
				 * @param {object<string,*>} definitions all properties of qualified definition of field
				 * @param {CustomPropertyLimitedTermHandler} cbTermHandler term handler detecting computable terms in a provided string returning property map
				 * @returns {PropertyDescriptor} description on how to expose this property in context of field's instance
				 * @this {DownloadFieldType}
				 */
				block( definitionValue, definitionName, definitions, cbTermHandler ) { // eslint-disable-line no-unused-vars
					/**
					 * Indicates whether form's validation should be blocked or
					 * not.
					 *
					 * @name DownloadFieldType#block
					 * @property {boolean}
					 * @readonly
					 */
					if ( !definitionValue ) {
						throw new TypeError( "invalid or missing blocker term" );
					}

					return this.createGetter( definitionValue, definitionName );
				},

				/**
				 * Generates property descriptor exposing term evaluated for
				 * checking whether this blocker is ready for probably blocking
				 * a form's validation.
				 *
				 * @param {*} definitionValue value of property provided in definition of field
				 * @param {string} definitionName name of property provided in definition of field
				 * @param {object<string,*>} definitions all properties of qualified definition of field
				 * @param {CustomPropertyLimitedTermHandler} cbTermHandler term handler detecting computable terms in a provided string returning property map
				 * @returns {PropertyDescriptor} description on how to expose this property in context of field's instance
				 * @this {DownloadFieldType}
				 */
				prepared( definitionValue, definitionName, definitions, cbTermHandler ) { // eslint-disable-line no-unused-vars
					/**
					 * Indicates whether term for probably blocking a form's
					 * validation is ready or not.
					 *
					 * @name DownloadFieldType#prepared
					 * @property {boolean}
					 * @readonly
					 */
					if ( definitionValue == null ) {
						return this.createGetter( true, definitionName );
					}

					return this.createGetter( definitionValue, definitionName );
				},

				/**
				 * Generates property descriptor exposing text to display if
				 * form's validation has been prevented.
				 *
				 * @param {*} definitionValue value of property provided in definition of field
				 * @param {string} definitionName name of property provided in definition of field
				 * @param {object<string,*>} definitions all properties of qualified definition of field
				 * @param {CustomPropertyLimitedTermHandler} cbTermHandler term handler detecting computable terms in a provided string returning property map
				 * @returns {PropertyDescriptor} description on how to expose this property in context of field's instance
				 * @this {DownloadFieldType}
				 */
				text( definitionValue, definitionName, definitions, cbTermHandler ) { // eslint-disable-line no-unused-vars
					/**
					 * Provides text to display in case of form's validation
					 * should be prevented.
					 *
					 * @name DownloadFieldType#text
					 * @property {boolean}
					 * @readonly
					 */
					if ( !definitionValue ) {
						throw new TypeError( "invalid or missing text to show on blocking form validation" );
					}

					return this.createGetter( definitionValue, definitionName );
				},

				...customProperties,
			}, container );
		}

		/** @inheritDoc */
		static isInteractive() {
			return true;
		}

		/** @inheritDoc */
		static isProvidingInput() {
			return false;
		}

		/** @inheritDoc */
		renderFieldComponent() {
			return {
				template: `<div/>`,
			};
		}

		/** @inheritDoc */
		validate( live = false ) {
			const errors = super.validate( live );

			if ( !errors.length && this.block ) {
				errors.push( live || this.pristine ? true : this.prepared ? this.text : true );
			}

			return errors;
		}
	};
}
