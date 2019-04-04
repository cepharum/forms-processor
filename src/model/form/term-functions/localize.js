/**
 * (c) 2019 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 cepharum GmbH
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

import L10n from "../../../service/l10n";


/**
 * Resolves internationalized input provided as object with different
 * localizations in separate properties with value of that property matching
 * current locale.
 *
 * An internationalized object is expected to have property named like current
 * locale's tag or otherwise have some property named `en` to expose an English
 * translation or have one of the properties named `*` or `any` to expose a
 * fallback.
 *
 * On providing non-object input or some object mismatching expectations this
 * input is return as-is.
 *
 * @this FormFieldAbstractModel
 * @param {*|object<string,*>} input some scalar to be passed, some object with properties per supported locale
 * @return {*} provided scalar value or value of given object's property matching current locale
 */
export default function localize( input ) {
	return L10n.selectLocalized( input, this.sequence.locale );
}
