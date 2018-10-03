# The Forms API

By injecting forms processor into your HTML document an API is exposed as `CepharumForms` in global scope of your document. It is thus replacing any preliminary configuration of forms to be injected into your document which happens to be provided in same global variable by design. On injection the API is instantly processing that configuration.

## Exposed API in Detail

### create( element, options )

Invoke this method to create (another) forms processor attached to selected element of your HTML document.

* `element` is referring to a single element of your document. Optionally, it might be a string containing CSS-like selector so the forms processor is choosing first matching element of your document.
* `options` is an object providing created processor's configuration.

#### Supported Processor Options

* `id` is the processed forms' unique ID e.g. for locally distinguishing their input from other forms' input.
* `definition` is the URL of a JSON file defining forms to be processed. See the separate description on [how to define a sequence of forms](definition/README.md).
