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

After having processed the array in variable `CepharumForms` this variable is adjusted to contain an [API](api.md) for controlling all defined clients or add further instances to your document.

## Pre-Configuration in Detail

The pre-configuration assigned to global variable `CepharumForms` prior to loading the forms processor is expected to basically comply with one of two structures.

### Simple Structure

If you don't want to register any custom input processor or type of field it's sufficient to provide an array of form components to be injected into HTML document as soon as the forms processor has been loaded.

Every element in this array is yet another array consisting of these sub-elements:

1. First sub-element is a reference on an HTML element or a CSS query used to select first matching element of current HTML document. This element will be used to attach another forms component to.
2. Second sub-element is an object providing individual customizations of forms component to be injected. This includes provision of URL used to fetch forms' definition from.

### Complex Structure

In case you want to register custom input processors or additional types of fields you need to use a more complex structure. It starts with an object containing one or more of the following properties:

#### sequences

This property takes an array of component descriptors to be processed as soon as the forms processor has been loaded. This array is equivalent to the simple structure of pre-configuration described before. 

#### fields

This object maps names a field's type name into a function returning class instantiated for every field of that type used in injected forms' definition. This pattern is required due to any such class must properly inherit from an abstract base class defined by loaded forms processor. Thus you can't preliminary configure custom types of fields without loading the forms processor first but have to postpone definition of a type's class until then. 

The function is invoked with required base class in its first argument. This base class is exposing static method `makeInherit()` taking constructor of the desired sub-class to help with creating an actually inheriting class the original way. 

```javascript
function generateNewType( abstract ) {
	const newType = abstract.makeInherit( function( definition ) {
		this.$super( definition );
	} );

	newType.prototype.validate = function() { ... };

	return newType;
}
```

Of course using ES6 class syntax is possible as well:

```javascript
function generateNewType( abstract ) {
	return class NewType extends abstract {
		validate() { ... };
	};
}
```

#### processors

This object works mostly similar to the one in property `fields` above but maps type names of custom input processors into functions invoked with a different abstract base class for generating the related class of input processor instances per type.
