# The Forms API

By injecting forms processor into your HTML document an API is exposed as `CepharumForms` in global scope of your document. It is thus replacing any preliminary configuration of forms to be injected into your document which happens to be provided in same global variable by design. On injection the API is instantly processing that configuration.

## Exposed API in Detail

### create( element, options )

Invoke this method to create (another) forms processor attached to selected element of your HTML document.

* `element` is referring to a single element of your document. Optionally, it might be a string containing CSS-like selector so the forms processor is choosing first matching element of your document.
* `options` is an object providing created processor's configuration.

#### Supported Processor Options

##### id

* Type: `string`
* Default: `""`
* Localizable: no

A form should have a _permanently_ unique identifier. It is used on persisting entered data to the user's local storage and on sending all presented forms' input data to some remote service eventually. 

That's why the identifier should be uniquely addressing the occasion for presenting the form such as a particular checkout process or participation in a survey, no matter if the user is opening same forms multiple times on multiple occasions of same type doing so simultaneously or in a distance of years. 

If a user is permitted to run the same sequence of forms multiple times on different occasions by intention different IDs should be provided in this option each time the user is running it. On the other hand if you want to support user filling the form successively over multiple invocations you need to provide same ID.

##### name

* Type: `string`
* Default: value of `id`
* Localizable: no

Every sequence of forms may have a name which is an _temporary_ identifier to distinguish it from multiple sequences injected into the same HTML document. Thus it should be unique in context of a running HTML document, but it doesn't need to be permanently unique like the ID.

##### definition

* Type: `string`
* Default: _none_
* Localizable: no

This is the URL of a JSON file defining forms to be processed. See the separate description on [how to define a sequence of forms](definition/README.md).
