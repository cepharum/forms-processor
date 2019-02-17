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
import Markdown from "../utility/markdown";
const md = Markdown.getRenderer();

/**
 * Manages single field of form representing non-editable text display.
 */
export default class FormFieldInfoModel extends FormFieldAbstractModel {
	/** @inheritDoc */
	renderFieldComponent( reactiveFieldInfo ) { // eslint-disable-line no-unused-vars
		const that = this;

		return {
			template: `<span class="static-info" v-html="renderedText"></span>`,
			data() {
				return {
					text: that.text,
				};
			},
			computed: {
				renderedText() {
					return md.render( this.text );
				}
			},
			methods: {
				updateOnDataChanged() {
					this.text = that.text;
				},
			}
		};
	}

	/** @inheritDoc */
	static get isInteractive() {
		return false;
	}
}
