# Getting Started

Injecting Forms Processor into HTML document is a fairly simple task. Let's assume there is an HTML document as simple as this one:

```html
<html>
 <head>
  <meta charset="utf-8">
  <title>FormsProcessor Demonstration</title>
 </head>
 <body>
  <h1>Welcome!</h1>
  <p>
  This is an introduction statically included with the original HTML document.
  </p>
 </body>
</html>
```

Let's see how to inject Forms Processor there.

## Create Hook

Forms Processor requires existing element in document it is going to inject its content into. Usually, this is a `<div>`-element with a unique ID. The actual kind of element isn't important as long as you can uniquely address it by reference or by regular CSS selector. Let's place the hook next to the existing paragraph:

```html
<html>
 <head>
  <meta charset="utf-8">
  <title>FormsProcessor Demonstration</title>
 </head>
 <body>
  <h1>Welcome!</h1>
  <p>
  This is an introduction statically included with the original HTML document.
  </p>
  <div id="hook"></div>
 </body>
</html>
```

## Inject VueJS

Forms Processor has been implemented with [VueJS](https://vuejs.org/). VueJS is distributed separately, though. Thus you need to inject it yourself prior to injecting Forms Processor. Append the related `<script>` element at end of `<body>`:

```html
<html>
 <head>
  <meta charset="utf-8">
  <title>FormsProcessor Demonstration</title>
 </head>
 <body>
  <h1>Welcome!</h1>
  <p>
  This is an introduction statically included with the original HTML document.
  </p>
  <div id="hook"></div>
  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js" crossorigin="anonymous"></script>
 </body>
</html>
```

VueJS is retrieved from CDN which is okay for the sake of this demonstration. You might want to serve it locally, though. As a suggestion you should always use the same host for all the files particularly injected from CDN in this tutorial.

::: tip Information
Using attribute `crossorigin="anonymous"` might be important on trying to persist user's input in browser
:::

## Inject Forms Processor

Now it's time to fetch the Forms Processor itself. As mentioned before, you should use the same CDN:

```html
<html>
 <head>
  <meta charset="utf-8">
  <title>FormsProcessor Demonstration</title>
 </head>
 <body>
  <h1>Welcome!</h1>
  <p>
  This is an introduction statically included with the original HTML document.
  </p>
  <div id="hook"></div>
  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/forms-processor-browser/FormsProcessor.umd.min.js" crossorigin="anonymous"></script>
 </body>
</html>
```

To slightly improve performance on loading document you might want to add `<link>` elements controlling prefetch of additional code components:

```html
<html>
 <head>
  <meta charset="utf-8">
  <title>FormsProcessor Demonstration</title>
 </head>
 <body>
  <h1>Welcome!</h1>
  <p>
  This is an introduction statically included with the original HTML document.
  </p>
  <div id="hook"></div>
  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js" crossorigin="anonymous"></script>
  <link href="https://cdn.jsdelivr.net/npm/forms-processor-browser/FormsProcessor.umd.min.form.js" rel="preload" as="script" crossorigin="anonymous"/>
  <link href="https://cdn.jsdelivr.net/npm/forms-processor-browser/FormsProcessor.umd.min.l10n-de.js" rel="preload" as="script" crossorigin="anonymous"/>
  <script src="https://cdn.jsdelivr.net/npm/forms-processor-browser/FormsProcessor.umd.min.js" crossorigin="anonymous"></script>
 </body>
</html>
```

## Define and Present Sequence of Forms
 
At this point the Forms Processor is loaded in context of given HTML document. It is available via global variable `FormsProcessor`. But it isn't invoked to actually present some defined sequence of forms. This is achieved using separate script block with inline code:


```html
<html>
 <head>
  <meta charset="utf-8">
  <title>FormsProcessor Demonstration</title>
 </head>
 <body>
  <h1>Welcome!</h1>
  <p>
  This is an introduction statically included with the original HTML document.
  </p>
  <div id="hook"></div>
  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js" crossorigin="anonymous"></script>
  <link href="https://cdn.jsdelivr.net/npm/forms-processor-browser/FormsProcessor.umd.min.form.js" rel="preload" as="script" crossorigin="anonymous"/>
  <link href="https://cdn.jsdelivr.net/npm/forms-processor-browser/FormsProcessor.umd.min.l10n-de.js" rel="preload" as="script" crossorigin="anonymous"/>
  <script src="https://cdn.jsdelivr.net/npm/forms-processor-browser/FormsProcessor.umd.min.js" crossorigin="anonymous"></script>
  <script type="text/javascript">
  FormsProcessor.create( "#hook", {
    definition: {
  	  processors: [ { type: "dump" } ],
  	  sequence: [
  	    {
  	      name: "first",
  	      label: "First Page",
  	      fields: [
  	        { name: "lastname", label: "Last Name" },
  	        { name: "firstname", label: "First Name" }
  	      ]
  	    },
  	    {
  	      name: "second",
  	      label: "Second Page",
  	      fields: [
  	        { name: "mail", label: "Mail Address", format: "mail" }
  	      ]
  	    }
  	  ]
    }
  } );
  </script>
 </body>
</html>
```

The inline script is invoking method `FormsProcessor.create()` passing two arguments:

1. First argument is selecting the element provided for injecting Forms Processor output. Here we use a CSS selector addressing the element injected in first step above. You might also pass a direct reference on the element to be used.

2. Second argument is an object providing several information for presenting a sequence of forms. In its property `definition` there is information on the actually desired sequence of forms. Other properties can be used to customize translations, types of fields and input data processors.

   ::: tip Information
   The definition is given as object here. In addition you can provide it as a string containing same sort of definition in JSON or YAML. Finally you can provide the URL of a file containing actual definition in either format.
   :::

   ::: warning On YAML Support
   Forms Processor comes with a [very simple YAML parser](https://www.npmjs.com/package/instant-yaml) that has been proven to basically support definition of sequence using some YAML-like syntax. Due to its simplicity the YAML parser isn't complying with any existing YAML standard. So, whenever Forms Processor is rejecting your YAML you might want to try different notation in YAML or use JSON - e.g. converted from YAML - instead.
   :::

The resulting document is presenting two separate forms passed sequentially. The first one is consisting of two text fields asking for last and first name. A button labelled "Next" is provided to open second form which in turn is consisting of sole text input field asking for a mail address. That second form comes with two buttons for returning to previous form and for submitting input eventually.

## Fix Styling

The Forms Processor is generating HTML fragments without styling them. This is intended behaviour as you want to have individual styles applied most probably. For test-driving Forms Processor there is a rough styling included with Forms Processor. Just insert the related reference at the end of `<head>` element:

```html
<html>
 <head>
  <meta charset="utf-8">
  <title>FormsProcessor Demonstration</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/forms-processor-browser/style.min.css">
 </head>
 <body>
  ...
 </body>
</html>
```

## Customize

Prior to creating a sequence of forms you may use `FormsProcessor.addField()` to register a custom type of fields. `FormsProcessor.addProcessor()` provides registration of custom input processors. Finally, `FormsProcessor.addTranslations()` is available to inject your own translations for display text.

Read more about this in [API documentation](api/README.md).
