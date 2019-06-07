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
<script src="https://unpkg.com/vue"></script>
```

This will fetch VueJS from a CDN. However, it's totally fine to use a local copy instead.

## Inject Forms Processor

Next you are ready to add the line that's fetching Forms Processor by adding this line after the one you've added before:

```html
<script src="path/to/forms-processor/FormsProcessor.umd.min.js"></script>
```

> Any distribution of Forms Processor might consist of multiple files. In the HTML document you are injecting the one file mentioned above, only. All other files will be loaded by that injected script on demand. Thus, they must be available in same folder as the one you've injected explicitly.
>
> You might want to improve performance by marking those additional files for pre-fetching using HTML code like this in `<head>` element of your document (e.g. on additional file **FormsProcessor.umd.min.form.js**):
>
> ```html
> <link href="path/to/forms-processor/FormsProcessor.umd.min.form.js" rel="preload" as="script">
> ```
> 
> Injecting this code is optional.

Injecting this file exposes Forms Processor's API in global variable `FormsProcessor`. You may access it like this after having injected that file:

```javascript
FormsProcessor.addField( ... ); 
```

## Creating A Sequence Of Forms

At this point you're ready to inject some sequence of forms to be processed:

```html
<script type="text/javascript">
FormsProcessors.create( "#hook", {
	definition: "./example.json",
} );
</script>
```

Invoked method `create()` takes two arguments:

1. a reference on HTML element forms should be presented at or some CSS selector with first matching element of HTML document used for that
2. an object with options customizing the injected Forms Processor's behaviour

You need to require at least one option called `definition`. It is a URL addressing some JSON file describing all forms and their fields in presented sequence of forms as well as additional customizations such as a set of steps processing input data after submission of last form in sequence.

As an option you might provide the actual definition as an object instead of its URL in `definition`.

## Inject Proper Styling

Any visual component of Forms Processor comes without any particular styling. It's up to you to provide some desired styling yourself using CSS. However, for sake of quick-starting you might use some styling distributed with Forms Processor as an example. Inject this code in `<head>`-element of your HTML document:

```html
<link rel="stylesheet" href="path/to/forms-processor/style.css">
```

## Defining Forms

Up to this point we've set up HTML document to basically load and run the Forms Processor, however it still doesn't have any input to be processed. That's why opening this document in a browser would fail unless there is a proper JSON file at URL used in option `definition` before. Put this content in a file **example.json** located next to your HTML document:

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
     "text": "=lastName && firstName && lastName + ', ' + firstName || '-'",
     "visible": "=iban"
    }
   ]
  }
 ]
}
```

This JSON is describing two forms, each consisting of two fields including some conditionals e.g. for hiding the second field of second form until some input was provided on first field of second form.

## The Resulting HTML Document

For the sake of clarity here comes the resulting HTML document:

```html
<html>
 <head>
  <meta charset="utf-8">
  <title>FormsProcessor Demonstration</title>
  <link rel="stylesheet" href="path/to/forms-processor/style.css">
  <link href="path/to/forms-processor/FormsProcessor.umd.min.form.js" rel="preload" as="script">
  <link href="path/to/forms-processor/FormsProcessor.umd.min.l10n-en.js" rel="preload" as="script">
  <link href="path/to/forms-processor/FormsProcessor.umd.min.l10n-de.js" rel="preload" as="script">
 </head>
 <body>
  <div id="hook"></div>
  <script src="https://unpkg.com/vue"></script>
  <script src="path/to/forms-processor/FormsProcessor.umd.min.js"></script>
  <script type="text/javascript">
    FormsProcessors.create( "#hook", {
      definition: "./example.json",
    } );
  </script>
 </body>
</html>
```

## Customizing Forms Processor

Prior to creating a sequence of forms you may use `FormsProcessor.addField()` to register a custom type of fields. `FormsProcessor.addProcessor()` provides registration of custom input processors. Finally, `FormsProcessor.addTranslations()` is available to inject your own translations for display text.

Read more about this in [API documentation](./api.md).
