# Creating Custom Field Types

The existing set of field types may be extended using [method `addField()`](../../api.md) exposed by global API of FormsProcessor. This document describes how to implement your custom type of field.

## Proper Inheritance

Any custom type of field's implementation (called a _field's implementation_ below for the sake of brevity) must be inheriting from an abstract base class which is internally called `FormFieldAbstractModel`. The same class is globally exposed as `FormsProcessor.AbstractFieldModel`, too. Eventually, on providing factory callback in second argument to `FormsProcessor.addField()` this callback is invoked with a reference to this abstract class expecting the callback to return derived class to be instantiated later.

The following code demonstrates use of a factory function with registering custom field implementation using legacy Javascript syntax. Note the use of `makeInherit()` exposed by provided reference on fields' abstract base class!

```javascript
FormsProcessor.addField( "my-custom", function( abstract ) {
  const MyCustomFieldType = abstract.makeInherit( function( form, definition, fieldIndex, reactiveFieldInfo ) {
    this.$super( form, definition, fieldIndex, reactiveFieldInfo );
  } );

  MyCustomFieldType.prototype.validate = function() {};

  return MyCustomFieldType;
} );
```

Using [ES6 class syntax](https://caniuse.com/#feat=es6-class) improves readability by achieving the same with less code:

```javascript
FormsProcessor.addField( "my-custom", function( Abstract ) {
  return class MyCustomFieldType extends Abstract {
    validate() {};
  }
} );
```

If you don't want to work with a factory function you might use globally exposed reference on base class instead. The same applies if you are going to register different type names with the same implementation:

```javascript
const MyCustomFieldType = FormsProcessor.AbstractFieldModel.makeInherit( function( form, definition, fieldIndex, reactiveFieldInfo ) {
  this.$super( form, definition, fieldIndex, reactiveFieldInfo );
} );

MyCustomFieldType.prototype.validate = function() {};

// registering same implementation using different names establishes aliasing:
FormsProcessor.addField( "my-custom", MyCustomFieldType );
FormsProcessor.addField( "my-other-custom", MyCustomFieldType );
```

Again, this becomes a lot simpler using ES6 class syntax:

```javascript
class MyCustomFieldType extends FormsProcessor.AbstractFieldModel {
    validate() {};
}

FormsProcessor.addField( "my-custom", MyCustomFieldType );
FormsProcessor.addField( "my-other-custom", MyCustomFieldType );
```

## A Field's API

Every implementation of a field must overload certain methods of its abstract base class and may overload additional methods.

### `static get isProvidingInput()` 

Any type of field may declare whether it is providing some value to be considered input for processing.

By default, the abstract base class is marking a field as _providing input_ when it is marked _interactive_ (see below). This dependency results in most fields being marked as _providing input_ unless overloading this getter on their own behalf.

### `static get isInteractive()` 

An interactive field is a field which is providing some visual component for interacting with the user. Usually an interactive field is providing some input, too. But this isn't a requirement.

By default, the abstract base class is marking field instances as _interactive_. This is reducing efforts required to implement most derived types of fields.

### `renderFieldComponent( reactiveFieldInfo )`

This method is invoked by abstract base class to describe a field's type-specific (_inner_) component to be injected into another (_outer_) component managed abstract base class.

While the outer component is used to provide common features of a field such as its label, an indicator for mandatory fields, a hint and a list of validation errors, the inner component is expected to provide controls according to the field's type-specific behaviour.

The returned object should comply with component descriptions as used in second argument to method `Vue.component()` of VueJS. All reactive information of a field is provided in `reactiveFieldInfo` e.g. to be used as `data` of described component.

Your field's implementation **must** overload this method.

### `onUpdateValue( store, newValue, updatedFieldName = null )`

This method is invoked when value of field has been updated e.g. due to the field's dependencies. 

Most custom fields **don't need** to overload this method.

### `normalizeValue( value, options = {} )`

On processing user input this method is invoked to adjust the actual input to comply with configured constraints of form. This method isn't expected to validate any input but focuses on preparing any raw input for the upcoming validation. But it is preparing raw input data to be stored and validated afterwards.

Custom fields **should** overload this function when expecting certain type of value resulting in set of gathered input data. The same applies when a field is providing complex or (partially) optional data.

### `validate( live = false )`

After normalizing raw input this method is invoked to validate the field's current value. The method shouldn't throw exceptions on invalid data but return a list of strings each describing another failed step of validation. This list is used to provide error messages on screen.

The argument `live` indicates whether validation is requested due to user currently changing the input or if validation occurs e.g. as part of validation whole form due to user advancing from current form to next one in a sequence of forms.

Custom fields usually **should** overload this function to implement type-specific validations. The abstract base class is capable of detecting required input actually missing, only

#### Localized Error Messages

Returned strings may be internationalized. Strings starting with `@` followed by name of an entry in current localization table using dot-notation is replaced with localized string of selected entry.
 
```javascript
MyCustomFieldType.prototype.validate = function( live ) {
  const errors = [];

  if ( this.somethingFailed ) {
    errors.push( "@VALIDATION.MISSING_REQUIRED" );
  }

  return errors;
};
```

When abstract base class is going to display error messages as part of the field it is detecting this string looking up translations of current locale expecting object in translation map at `VALIDATION` with its property `MISSING_REQUIRED` providing actual translation to show instead of this lookup. Assuming the following translation table in memory the resulting error message would appear in German:

```javascript
{
  VALIDATION: {
    MISSING_REQUIRED: "Die Angabe ist erforderlich!"
  }
}
```
