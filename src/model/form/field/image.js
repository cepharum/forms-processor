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

import FormFieldUploadModel from "./upload";

/**
 * Manages single field of form representing image input.
 */
export default class FormFieldImageUploadModel extends FormFieldUploadModel {
	/** @inheritDoc */
	constructor( form, definition, fieldIndex, reactiveFieldInfo, customProperties = {}, container = null ) {
		if ( !definition.hasOwnProperty( "mimeType" ) ) {
			definition.mimeType = [ "image/jpeg", "image/png" ];
		}

		super( form, definition, fieldIndex, reactiveFieldInfo, {
			previewMode( v ) {
				/**
				 * Defines whether showing preview of image(s) selected for upload
				 * by using background image (via CSS styling) or by <img> HTML
				 * element ("foreground").
				 *
				 * @name FormFieldImageUploadModel#previewMode
				 * @property string
				 * @readonly
				 */
				if ( v == null ) {
					return { value: "foreground" };
				}

				if ( typeof v === "string" ) {
					switch ( v.toLowerCase().trim() ) {
						case "background" :
							return { value: "background" };

						case "foreground" :
							return { value: "foreground" };
					}
				}

				throw new TypeError( "invalid definition of preview mode" );
			},

			...customProperties,
		}, container );
	}

	/** @inheritDoc */
	get previewComponent() {
		const that = this;
		const { previewMode } = that;
		return {
			props: {
				file: {
					type: File,
					required: true,
				},
			},
			template: `
				<component :is="previewMode" :file="file" @remove="()=>{this.$emit('remove')}"></component>
			`,
			computed: {
				previewMode() {
					return previewMode;
				}
			},
			components: {
				background: {
					props: {
						file: {
							type: File,
							required: true,
						},
					},
					template: `
						<span class="preview image background" :title="file.name" :style="style">
							<span class="button" @click="()=>{this.$emit('remove')}">&times;</span>
						</span>
					`,
					computed: {
						style() {
							return {
								backgroundImage: `url(${URL.createObjectURL( this.file )})`,
							};
						},
					},
				},
				foreground: {
					props: {
						file: {
							type: File,
							required: true,
						},
					},
					template: `
						<span class="preview image foreground" :title="file.name">
							<img :src="url"/>
							<span class="button" @click="()=>{this.$emit('remove')}">&times;</span>
						</span>
					`,
					computed: {
						url() {
							return URL.createObjectURL( this.file );
						}
					},
				}
			}
		};
	}
}
