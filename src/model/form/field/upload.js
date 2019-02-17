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
import Data from "../../../service/data";

/**
 * Manages single field of form representing data input.
 */
export default class FormFieldUploadModel extends FormFieldAbstractModel {
	/** @inheritDoc */
	constructor( form, definition, fieldIndex, reactiveFieldInfo, customProperties = {}, container = null ) {
		super( form, definition, fieldIndex, reactiveFieldInfo, {
			size( v ) {
				/**
				 * Defines valid range of the combined size of all provided files.
				 *
				 * @name FormFieldTextModel#size
				 * @property {Range}
				 * @readonly
				 */
				return { value: new Range( v ) };
			},

			amount( v ) {
				/**
				 * Defines valid range of the amount of files allowed.
				 *
				 * @name FormFieldTextModel#size
				 * @property {Range}
				 * @readonly
				 */
				return { value: new Range( v ) };
			},

			button( v ) {
				/**
				 * Defines valid range of the amount of files allowed.
				 *
				 * @name FormFieldTextModel#size
				 * @property {Range}
				 * @readonly
				 */
				return { value: Data.normalizeToBoolean( v, true ) };
			},

			dropZone( v ) {
				/**
				 * Defines valid range of the amount of files allowed.
				 *
				 * @name FormFieldTextModel#size
				 * @property {Range}
				 * @readonly
				 */
				return { value: Data.normalizeToBoolean( v, true ) };
			},

			multiple( v ) {
				/**
				 * Defines valid range of the amount of files allowed.
				 *
				 * @name FormFieldTextModel#size
				 * @property {Range}
				 * @readonly
				 */
				return { value: Data.normalizeToBoolean( v, true ) };
			},

			/**
			 * Generates property descriptor exposing options to choose from in
			 * list control.
			 *
			 * @param {*} definitionValue value of property provided in definition of field
			 * @param {string} definitionName name of property provided in definition of field
			 * @returns {PropertyDescriptor} description on how to expose this property in context of field's instance
			 * @this {FormFieldSelectModel}
			 */
			uploadLabel( definitionValue = {
				de: "Datei auswählen",
				any: "Add File",
			}, definitionName ) {
				const localizedValue = this.selectLocalization( definitionValue );

				return this.createGetter( localizedValue, definitionName );
			},

			...customProperties,
		}, container );
	}

	/** @inheritDoc */
	static get isInteractive() {
		return true;
	}

	/** @inheritDoc */
	renderFieldComponent( reactiveFieldInfo ) { // eslint-disable-line no-unused-vars
		const that = this;

		const { form: { readValue }, qualifiedName, mimeType, uploadLabel, button, dropZone, multiple } = that;

		return {
			template: `
				<span class="upload">
					<div class="files">
						<preview v-for="(file, index) of files" :file="file"
						:key="file.name + '_'+ file.lastModifiedDate" 
						@remove="()=> remove(index)"/>
					</div>
					<div v-if="dropZone" class="dropContainer" :class="dragOverClass"
						v-on:dragover="e => {
                            e.stopPropagation();
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'copy';
                            if(this.dragOverClass !== 'dragOver') this.dragOverClass = 'dragOver';
                        }"
                        v-on:dragenter="e => {
                            if(this.dragOverClass !== 'dragOver') this.dragOverClass = 'dragOver';
                        }"
                        v-on:dragleave="e=> {
                            this.dragOverClass = '';
                        }"
                        v-on:dragend="e=> {
                            this.dragOverClass = '';
                        }"
                        v-on:drop="e => {
                            e.stopPropagation();
                            e.preventDefault();
                            this.dragOverClass = '';
                            const files = e.dataTransfer.files;
                            selectedCallback(files);
                        }"
					>
					<svg width="100%" height="4rem" viewBox="0 0 3 3" version="1.1" xmlns="http://www.w3.org/2000/svg">
						<path d="M0,1l1,0l0,-1l1,0l0,1l1,0l0,1l-1,0l0,1l-1,0l0,-1l-1,0l0,-1Z"/>
					</svg>
					</div>
					<button title="" v-if="button">
						{{uploadLabel}}
						<input 
							type="file"
							:multiple="multiple"
							:id="name"
							:name="name"
							:accept="mimeType"
							@change="fileSelected"/>
					</button>
				</span>
			`,
			data: () => {
				return {
					dragOverClass: "",
					files: readValue( qualifiedName ) || [],
					name: qualifiedName,
				};
			},
			components: {
				preview: that.previewComponent,
			},
			computed: {
				mimeType: {
					get() {
						return mimeType;
					}
				},
				uploadLabel: {
					get() {
						return uploadLabel;
					}
				},
				button: {
					get() {
						return button;
					}
				},
				dropZone: {
					get() {
						return dropZone;
					}
				},
				multiple: {
					get() {
						return multiple;
					}
				}
			},
			methods: {
				remove( index ) {
					this.files.splice( index, 1 );

					this.$emit( "input", this.files );
				},
				fileSelected( e ) {
					if ( this.selectedCallback ) {
						if ( e.target.files ) {
							this.selectedCallback( e.target.files );
							e.target.value = "";
						} else {
							this.selectedCallback( null );
						}
					}
				},
				selectedCallback( fileArray ) {
					that.touch();

					if ( !fileArray ) {
						return;
					}

					for ( const entry of fileArray ) {
						this.files.push( that.normalizeValue( entry ).value );
					}

					this.$emit( "input", this.files );
				},
			},
		};
	}

	/**
	 * renders a Preview of the uploaded Files
	 * @return {{}} Vue Component that renders a preview for Files
	 */
	get previewComponent() {
		return {
			props: {
				file: {
					type: File,
					required: true,
				},
			},
			template: `
				<span class="preview">
					<span class="label">{{file.name}}</span> <span class="button" @click="()=>{this.$emit('remove')}">&times;</span>
				</span>
			`,
		};
	}

	/** @inheritDoc */
	normalizeValue( value ) {
		return {
			value,
			formattedValue: value,
		};
	}

	/** @inheritDoc */
	validate() {
		const errors = super.validate();
		const { value, mimeType } = this;

		if ( this.required && !value.length ) {
			errors.push( "@VALIDATION.MISSING_REQUIRED" );
		}

		if ( mimeType ) {
			let requiredTyes = mimeType.split( "," );
			requiredTyes = requiredTyes.map( e => e.trim() );
			if ( value.some( el => !requiredTyes.some( type => el.type === type ) ) ) {
				errors.push( "@VALIDATION.WRONG_TYPE" );
			}
		}

		const totalSize = value.reduce( ( a, b ) => a + Number( b.size ), 0 );
		if ( totalSize && this.size ) {
			if ( this.size.isBelowRange( totalSize ) ) {
				errors.push( "@VALIDATION.TOO_SHORT" );
			}

			if ( this.size.isAboveRange( totalSize ) ) {
				errors.push( "@VALIDATION.TOO_LONG" );
			}
		}

		if ( value.length && this.amount ) {
			if ( this.amount.isBelowRange( value.length ) ) {
				errors.push( "@VALIDATION.TOO_LITTLE" );
			}

			if ( this.amount.isAboveRange( value.length ) ) {
				errors.push( "@VALIDATION.TOO_MANY" );
			}
		}
		return errors;
	}
}
