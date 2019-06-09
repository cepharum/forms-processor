# Extending Forms Processor

## Accessing Forms Processor

When loading release build of Forms Processor into browser it is exposing itself in global variable `FormsProcessor`. The same API is available when importing Forms Processor as a dependency in a project.

The [exposed API](../api/) helps with these tasks:

* creating sequences of forms to be processed

* adding extensions providing custom types of fields, term functions, input data processors or translations

## Global Registry vs. Individual Extensions

In case of extending Forms Processor the API is exposing a global registry of field handlers, processors, term functions and translations. Any extension registered there is injected into upcoming instances of Forms Processor created for running another sequence of forms.

* [Adding Field Type](../api/README.md#addfield-typename-implementationorfactory-)
* [Adding Processor](../api/README.md#addprocessor-typename-implementationorfactory-)
* [Adding Term Function](../api/README.md#addtermfunction-functionname-implementation-)
* [Adding Translation Overlay](../api/README.md#addtranslations-locale-translationsoverlay-)

In opposition to that you can pass either kind of extension as an additional option on [creating a sequence of forms](../api/README.md#create-element-options-). This results in an extension available in that particular instance, only.

```javascript
FormsProcessor.create( "#hook", {
	definition: { ... },
	registry: {
		fields: { ... },
		processors: { ... },
		termFunctions: { ... },
		translations: { ... }
	}
} );
```

In this example a registry overlay is part of provided options. The registry overlay is named **registry**. It contains separate objects for providing custom implementations for field types, input processors and term functions as well as overlays for translation hierarchies.

* **fields** maps strings to be used in definition in per-field attribute **type** for selecting this kind of field into classes or factory functions for generating instances derived from [FormFieldAbstractModel](https://github.com/cepharum/forms-processor/blob/master/src/model/form/field/abstract.js) each managing its own field.

* **processors** maps strings to be used in definition in per-processor attribute **type** for selecting this kind of input data processor into classes or factory functions for generating instances of either processor which must be derived from [FormProcessorAbstractModel](https://github.com/cepharum/forms-processor/blob/master/src/model/form/processor/abstract.js).

* **termFunctions** maps names of term functions into either function's implementation.

  ::: tip Information
  Term function names must be provided all lower-case to comply with the paradigm of case-insensitively addressing of data sources and functions in terms.
  :::

* **translations** maps locale identifiers into hierarchies of translations for either locale.

## Replacing Core Components

Using this extensibility of Forms Processor any component distributed as part of Forms Processor releases may be replaced as well. Just use the same name as an existing type of fields, input data processor or term function to replace its original implementation.
