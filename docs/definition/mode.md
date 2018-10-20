# Mode Configuration

The `mode` root property of forms definition is an optional part of forms definition consisting of the following properties to affect the behaviour and appearance of presented sequence of forms.

## validation

tba.

## navigation

tba.

## select

tba.

## view

tba.

### progress

This is a boolean option controlling whether the processor's HTML includes a progress bar or not.

### fullResult

By setting this boolean option the resulting set of data includes values of rather than omitting all unset values.

### onSuccess

* Type: `string`
* Default: _none_
* Computable: no
* Localizable: yes

This property is used to handle case of having successfully processed input data. It is either some message to be displayed instead of the forms or some URL to redirect browser to.

If provided string looks like a URL (e.g. by not containing any whitespace and probably starting with a URL scheme) the browser is redirected to that URL via `location.href`, thus creating new step in browser's history. 

Otherwise the string is considered to be a message to be displayed instead of the forms' view. In that case the string might include a very limited subset of markdown syntax to provide a structured message. Supported markdown features are:

* paragraphs
* headings
* unordered and ordered lists without nesting
* inline links

### onFailure

* Type: `string`
* Default: _none_
* Computable: no
* Localizable: yes

This property works similar to `onSuccess` and is used in case of processing input data has failed. It might be localized URL or message. Browser gets redirected in case of providing a URL. Otherwise message is displayed. In opposition to `onSuccess` the message isn't displayed instead of forms' view but as an error box above it.
