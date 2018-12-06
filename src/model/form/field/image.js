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

import upload from "./upload";
import Range from "../utility/range";
import Data from "../../../service/data";

/**
 * Manages single field of form representing image input.
 */
export default class image extends upload {
	/**
	 * @param {FormModel} form reference on form this field belongs to
	 * @param {object} definition definition of field
	 * @param {int} fieldIndex index of field in set of containing form's fields
	 * @param {object} reactiveFieldInfo provided object to contain reactive information of field
	 * @param {CustomPropertyMap} customProperties defines custom properties to be exposed using custom property descriptor
	 */
	constructor( form, definition, fieldIndex, reactiveFieldInfo, customProperties, ) {
		super( form, definition, fieldIndex, reactiveFieldInfo, {

			/**
			 * sets mimeType to allow only images
			 *
			 * @param {*} definitionValue value of property provided in definition of field
			 * @param {string} definitionName name of property provided in definition of field
			 * @returns {PropertyDescriptor} description on how to expose this property in context of field's instance
			 * @this {FormFieldSelectModel}
			 */
			mimeType( definitionValue = "image/jpeg, image/png", definitionName ) {
				return this.createGetter( definitionValue, definitionName );
			},

			/**
			 * Generates property descriptor exposing options to choose from in
			 * list control.
			 *
			 * @param {*} v value of property provided in definition of field
			 * @returns {PropertyDescriptor} description on how to expose this property in context of field's instance
			 * @this {FormFieldSelectModel}
			 */
			previewMode( v = "foreground" ) {
				let value = "foreground";
				switch ( v.toLowerCase().trim() ) {
					case "background" :
						value = "background";
						break;
				}
				return { value };
			},

			...customProperties,
		} );
	}

	/**
	 * renders a Preview of the uploaded Files
	 * @return {{}} Vue Component that renders a preview for Files
	 */
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