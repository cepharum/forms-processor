# Using Forms Client

The forms client is capable of being injected into any HTML document to process a form according to some definition describing what fields should be presented and how the input should be processed. This document describes how to do that.

## Quick Start

The forms client is distributed in a Javascript file to be injected into your HTML document. Simply paste this line right before the closing `</body>` tag of your document:

```html
<script type="text/javascript" src="path/to/forms-client.min.js"></script>
```

This will load the forms client's code. It won't start presenting any forms, though. You need to define a configuration to be processed by the injected code file. Thus you should inject the following code _before_ the line pasted above:

```html
<script type="text/javascript">
var CepharumForms = [ [ "#form-anchor", {
	definition: "url/to/definition/file.json",
} ] ];
</script> 
```

This is the minimum configuration required to start presentation of a form. The code is declaring a global variable. It must be named `CepharumForms` as this is the name looked up by injected code. The variable is expected to contain an array of arrays. Every inner array consists of two values: first there is a string selecting an HTML element of your document or a reference to such an element. Second value is an object with options for customizing the desired instance of forms client. A mandatory option `definition` is a string selecting the source to be fetched for the form's definition. Alternatively this option might be an object considered the required definition itself.

After having processed the array in variable `CepharumForms` this variable is adjusted to contain an API for controlling all defined clients or add further instances to your document.
