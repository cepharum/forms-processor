# Using Forms Processor - Quick Start

The Forms Processor may be injected into any HTML document to process one or more sequences of forms according to some definition describing what fields should be presented in either forms included with a sequence of forms and how the input should be processed eventually. This document describes how to achieve that.

So, let's assume there is an HTML document similar to this one:

```html
<html>
 <head>
  <meta charset="utf-8">
  <title>FormsProcessor Demonstration</title>
 </head>
 <body>
  <div id="hook"></div>
 </body>
</html>
```

Injecting Forms Processor requires to add a few lines of HTML code to a document like this one:

## Inject VueJS

Forms Processor has been implemented with VueJS. It is though distributed without it. Thus you need to inject it yourself prior to injecting Forms Processor by appending this line right before the closing tag of your `<body>` element:

```html
<script src="https://cdn.jsdelivr.net/npm/vue@2.5.17/dist/vue.js"></script>
```

This will fetch VueJS from a CDN. However, it's totally fine to use a local copy instead.

## Inject Forms Processor

Next you are ready to add the line that's fetching Forms Processor by adding this line after the one you've added before:

```html
<script src="path/to/forms-processor.umd.min.js"></script>
```

Injecting this file exposes Forms Processor's API in global variable `FormsProcessor`. Due to supporting ES6 modules that variable is containing an object with a single property `default` actually exposing the API. So, you might access it like this after having injected that file:

```javascript
FormsProcessor.default.addField( ... ); 
```

## Creating A Sequence Of Forms

At this point you're ready to inject some sequence of forms to be processed:

```html
<script type="text/javascript">
FormsProcessors.default.create( "#slot", {
	definition: "./example.json",
} );
</script>
```

Invoked method `create()` takes two arguments:

1. a reference on HTML element forms should be presented at or some CSS selector with first matching element of HTML document used for that
2. an object with options customizing the injected Forms Processor's behaviour

You need to require at least one option called `definition`. It is a URL addressing some JSON file describing all forms and their fields in presented sequence of forms as well as additional customizations such as a set of steps processing input data after submission of last form in sequence.

As an option you might provide the actual definition as an object instead of its URL in `definition`.

## The Resulting HTML Document

For the sake of clarity here comes the resulting HTML document:

```html
<html>
 <head>
  <meta charset="utf-8">
  <title>FormsProcessor Demonstration</title>
 </head>
 <body>
  <div id="hook"></div>
  <script src="https://cdn.jsdelivr.net/npm/vue@2.5.17/dist/vue.js"></script>
  <script src="path/to/forms-processor.umd.min.js"></script>
  <script type="text/javascript">
    FormsProcessors.default.create( "#slot", {
      definition: "./example.json",
    } );
  </script>
 </body>
</html>
```

## Defining Forms

On opening this document in a browser it will fail unless there is a proper JSON file at URL used in option `definition`. Start with something as little as this:

```json
{
 "label": "Sequence Headline",
 "description": "Some sequence description ...",
 "processors": [
  {
   "url": "./store/{id}"
  }
 ],
 "sequence": [
  {
   "name": "firstForm",
   "label": "First Form's Headline",
   "description": "First form's description ...",
   "fields": [
    {
     "name": "lastName",
     "label": "Last Name",
     "type": "text"
    },
    {
     "name": "firstName",
     "label": "First Name",
     "required": "=lastName"
    }
   ]
  },
  {
   "name": "secondForm",
   "label": "Second Form's Headline",
   "description": "Second form's description ...",
   "fields": [
    {
     "name": "iban",
     "label": "IBAN",
     "required": true,
     "pattern": "AA## #### #### #### #### ##"
    },
    {
     "name": "fullName",
     "label": "Full Name",
     "type": "info",
     "text": "=lastName && firstName && lastName + ', ' + firstName || '-'"
    }
   ]
  }
 ]
}
```

## Adding Custom Fields And Processors

Prior to creating a sequence of forms you may use `FormsProcessor.default.addField()` to register a custom type of fields. `FormsProcessor.default.addProcessor()` may be used to register custom types of input processors.

## Running A Whole Configuration

By invoking `FormsProcessor.default.runConfiguration()` a single configuration defining fields and processors to register as well as sequences of forms to inject in current HTML document is conveniently customizing injected Forms Processor. The provided configuration is expected to basically comply with one of two structures.

### Simple Structure

If you don't want to register any custom input processor or type of field it's sufficient to provide an array of form components to be injected into HTML document as soon as the forms processor has been loaded.

Every element in this array is yet another array consisting of these sub-elements:

1. First sub-element is a reference on an HTML element or a CSS query used to select first matching element of current HTML document. This element will be used to attach another forms component to.
2. Second sub-element is an object providing individual customizations of forms component to be injected. This includes provision of URL used to fetch forms' definition from.

### Complex Structure

In case you want to register custom input processors or additional types of fields you need to use a more complex structure. It starts with an object containing one or more of the following properties:

#### sequences

This property takes an array of component descriptors to be processed as soon as the forms processor has been loaded. This array is equivalent to the simple structure of configuration described before. 

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
