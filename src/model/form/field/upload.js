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
				 * Defines valid range of the size of either provided files.
				 *
				 * @name FormFieldTextModel#size
				 * @property {Range}
				 * @readonly
				 */
				return { value: new Range( v ) };
			},

			totalSize( v ) {
				/**
				 * Defines valid range of the total size of all provided files.
				 *
				 * @name FormFieldTextModel#totalSize
				 * @property {Range}
				 * @readonly
				 */
				return { value: new Range( v ) };
			},

			count( v ) {
				/**
				 * Defines valid range for the number of files.
				 *
				 * @name FormFieldTextModel#count
				 * @property {Range}
				 * @readonly
				 */
				return { value: new Range( v ) };
			},

			button( v ) {
				/**
				 * Indicates whether some button should be provided for
				 * triggering selection of files for upload.
				 *
				 * @name FormFieldTextModel#button
				 * @property {boolean}
				 * @readonly
				 */
				return { value: Data.normalizeToBoolean( v, true ) };
			},

			dropZone( v ) {
				/**
				 * Indicates whether some "drop zone" should be provided so the
				 * user can drag and drop files into for selection.
				 *
				 * @name FormFieldTextModel#dropZone
				 * @property {boolean}
				 * @readonly
				 */
				return { value: Data.normalizeToBoolean( v, true ) };
			},

			multiple( v ) {
				/**
				 * Indicates if multiple files may be selected at once.
				 *
				 * @name FormFieldTextModel#multiple
				 * @property {boolean}
				 * @readonly
				 */
				return { value: Data.normalizeToBoolean( v, true ) };
			},

			uploadLabel( v, _, __, termHandler ) {
				/**
				 * Provides label of button eventually triggering upload of
				 * selected files.
				 *
				 * @name FormFieldTextModel#uploadLabel
				 * @property {string}
				 * @readonly
				 */
				return termHandler( v, rawValue => {
					const value = rawValue == null ? {
						de: "Datei auswählen",
						any: "Add File",
					} : rawValue;

					const localized = this.selectLocalization( value );

					return localized == null ? null : String( localized ).trim() || null;
				} );
			},

			mimeType( v, _, __, termHandler ) {
				/**
				 * Optionally MIME identifiers explicitly granted for upload.
				 *
				 * @name FormFieldUploadModel#mimeType
				 * @property ?string[]
				 * @readonly
				 */
				return termHandler( v, rawValue => {
					const ptnValidMime = /^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/;
					let mimes;

					switch ( typeof rawValue ) {
						case "string" :
							mimes = rawValue.split( /\s*,[\s,]*/ );
							break;

						case "object" :
							if ( Array.isArray( rawValue ) ) {
								mimes = rawValue;
								break;
							}

							if ( rawValue == null ) {
								return null;
							}

							// falls through
						default :
							throw new TypeError( "invalid definition of valid MIME types" );
					}

					const numMimes = mimes.length;
					const filtered = new Array( numMimes );
					let write = 0;

					for ( let i = 0; i < numMimes; i++ ) {
						const mime = mimes[i];

						if ( mime != null ) {
							const asString = String( mime ).trim();

							if ( asString !== "" ) {
								if ( ptnValidMime.test( mime ) ) {
									filtered[write++] = mime;
								} else {
									throw new TypeError( `invalid MIME ${mime} in definition of valid MIME types` );
								}
							}
						}
					}

					if ( write > 0 ) {
						filtered.splice( write );

						return filtered;
					}

					return null;
				} );
			},

			...customProperties,
		}, container );
	}

	/** @inheritDoc */
	initializeReactive( reactiveFieldInfo ) {
		super.initializeReactive( reactiveFieldInfo );

		reactiveFieldInfo.dragOverClass = null;
	}

	/** @inheritDoc */
	renderFieldComponent( reactiveFieldInfo ) {
		const { previewComponent, qualifiedName } = this;

		return {
			template: `
				<span class="upload">
					<div class="files">
						<preview v-for="(file, index) of value" :file="file"
						:key="file.name + '_'+ file.lastModifiedDate" 
						@remove="remove(index)"/>
					</div>
					<div v-if="dropZone" class="dropContainer" :class="dragOverClass"
						@dragover="onDragOverDropZone"
                        @dragenter="onDragEnterDropZone"
                        @dragleave="onDragLeaveDropZone"
                        @dragend="onDragEndDropZone"
                        @drop="onDrop"
					>
					<svg style="max-width:50%;max-height:50%;" viewBox="0 0 3 3" version="1.1" xmlns="http://www.w3.org/2000/svg">
						<path d="M0,1l1,0l0,-1l1,0l0,1l1,0l0,1l-1,0l0,1l-1,0l0,-1l-1,0l0,-1Z"/>
					</svg>
					</div>
					<button v-if="button" @click="onClickButton">
						{{uploadLabel}}
						<input
							type="file"
							:multiple="multiple"
							:id="name"
							:name="name"
							:accept="mimeTypeAsString"
							ref="fileButton"
							style="visibility:hidden" 
							@change="fileSelected"/>
					</button>
				</span>
			`,
			data: () => reactiveFieldInfo,
			components: {
				preview: previewComponent,
			},
			computed: {
				name: () => qualifiedName,
				mimeTypeAsString() {
					return this.mimeType ? this.mimeType.join( "," ) : null;
				},
			},
			methods: {
				remove( index ) {
					this.value.splice( index, 1 );

					this.$emit( "input", this.value );
				},
				onClickButton() {
					this.$refs.fileButton.click();
				},
				fileSelected( event ) {
					if ( event.target.files ) {
						this.addFiles( event.target.files );

						event.target.value = "";
					}
				},
				addFiles( files ) {
					for ( const file of files ) {
						this.value.push( file );
					}

					this.$emit( "input", this.value );
				},
				onDragOverDropZone( event ) {
					event.stopPropagation();
					event.preventDefault();

					event.dataTransfer.dropEffect = "copy";

					if ( this.dragOverClass !== "dragOver" ) {
						this.dragOverClass = "dragOver";
					}
				},
				onDragEnterDropZone() {
					if ( this.dragOverClass !== "dragOver" ) {
						this.dragOverClass = "dragOver";
					}
				},
				onDragLeaveDropZone() {
					this.dragOverClass = "";
				},
				onDragEndDropZone() {
					this.dragOverClass = "";
				},
				onDrop( event ) {
					event.stopPropagation();
					event.preventDefault();

					this.dragOverClass = "";

					this.addFiles( event.dataTransfer.files );
				},
			},
		};
	}

	/**
	 * Renders preview of single file selected for upload.
	 *
	 * @return {object} description of Vue component presenting preview of file
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
		let normalized;

		if ( value == null ) {
			normalized = [];
		} else if ( Array.isArray( value ) ) {
			normalized = value;
		} else {
			normalized = [value];
		}

		return {
			value: normalized,
			formattedValue: normalized,
		};
	}

	/** @inheritDoc */
	validate() {
		const errors = super.validate();
		const { value: files, mimeType } = this;
		const numFiles = files.length;

		if ( this.required && !numFiles ) {
			errors.push( "@VALIDATION.MISSING_REQUIRED" );
		} else {
			if ( mimeType ) {
				if ( files.some( el => !mimeType.some( type => el.type === type ) ) ) {
					errors.push( "@VALIDATION.MIME_MISMATCH" );
				}
			}

			let totalSize = 0;
			for ( let i = 0; i < numFiles; i++ ) {
				const { size } = files[i];

				if ( this.size.isBelowRange( size ) ) {
					errors.push( "@VALIDATION.FILE.TOO_SMALL" );
				}

				if ( this.size.isAboveRange( size ) ) {
					errors.push( "@VALIDATION.FILE.TOO_BIG" );
				}

				totalSize += size;
			}

			if ( this.totalSize.isBelowRange( totalSize ) ) {
				errors.push( "@VALIDATION.FILE.TOO_SMALL_TOTAL" );
			}

			if ( this.totalSize.isAboveRange( totalSize ) ) {
				errors.push( "@VALIDATION.FILE.TOO_BIG_TOTAL" );
			}

			if ( this.count.isBelowRange( files.length ) ) {
				errors.push( "@VALIDATION.FILE.TOO_LITTLE" );
			}

			if ( this.count.isAboveRange( files.length ) ) {
				errors.push( "@VALIDATION.FILE.TOO_MANY" );
			}
		}

		return errors;
	}
}
