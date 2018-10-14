# The Forms API

By injecting forms processor into your HTML document an API is exposed as `FormsProcessor` in global scope of your document. It is thus replacing any preliminary configuration of forms to be injected into your document which happens to be provided in same global variable by design. On injection the API is instantly processing that configuration.

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

### addField( typeName, implementationOrFactory )

This method registers type of field with current instance of Forms Processor. This type of field becomes available in all sequences of forms _created afterwards_.

* `typeName` is a string containing the name of type of field to be registered. This name is normalized by means of being trimmed and converted to all lowercase characters.
* `implementationOrFactory` is either some _class_ implementing particular behaviour of new type of field or some function generating this implementation on demand. In most cases providing factory function is preferred as it enables implementation to be properly derived from abstract base class as required by FormsProcessor.

  The factory function is invoked with [required base class of generated implementation](https://git.cepharum.de/cepharum/forms/client/blob/develop/src/model/form/field/abstract.js). To simplify inheritance setup with legacy Javascript this class exposes static method `makeInherit()` to be invoked with constructor function of new _class_ to become type's implementation. You need to set up inheritance before replacing elements of related prototype.
  
  ```javascript
  FormsProcessor.addField( "catalog", function( abstract ) {
    const catalogType = abstract.makeInherit( function( form, definition, fieldIndex, reactiveFieldInfo, omitProperties ) {
      this.$super( form, definition, fieldIndex, reactiveFieldInfo, omitProperties );
    
      // put your constructor code here  
    } );

    catalogType.prototype.validate = function() {};

    return catalogType;
  } );
  ```
  
  The same is possible with ES6 (though probably requiring to transpile the code to work in older browsers):

  ```javascript
  FormsProcessor.addField( "catalog", function( Abstract ) {
    return class FieldTypeCatalog extends Abstract {
      validate() {};
    }
  } );
  ```

A custom type of field's implementation is expected to overload one or more methods of its base class:

* `onUpdateValue( store, newValue, updatedFieldName = null )` ([see source](https://git.cepharum.de/cepharum/forms/client/blob/develop/src/model/form/field/abstract.js#L444))

  This method is invoked when value of field has been updated e.g. due to the field's dependencies.

* `_renderComponent( reactiveFieldInfo )` ([see source](https://git.cepharum.de/cepharum/forms/client/blob/develop/src/model/form/field/abstract.js#L496))

  This method is invoked to describe component injected into some container component controlled by abstract base class. The generated component focuses on part of field which is expected to have type-specific appearance and behaviour. Thus it shouldn't include the field's label, any errors or hints on it.

* `normalizeValue( value, options = {} )` ([see source](https://git.cepharum.de/cepharum/forms/client/blob/develop/src/model/form/field/abstract.js#L615))

  On processing input this method is invoked to adjust the input to comply with configured constraints of form. This method isn't expected to validate any input but focuses on preparing any raw input for the upcoming validation.

* `validate( live = false )` ([see source](https://git.cepharum.de/cepharum/forms/client/blob/develop/src/model/form/field/abstract.js#L630))

  After normalizing input this method is invoked to validate the field's current value. The method shouldn't throw exception on invalid data but return a list of strings each describing another failed step of validation. This list is used to provide error messages on screen.
  
  > Returned strings may be internationalized. Strings starting with `@` followed by name of an entry in current localization table using dot-notation is replaced with localized string of selected entry.
  > 
  > ```javascript
  > catalogType.prototype.validate = function( live ) {
  >   const errors = [];
  >
  >   if ( this.somethingFailed ) {
  >     errors.push( "@VALIDATION.MISSING_REQUIRED" );
  >   }
  >
  >   return errors;
  > };
  > ```

### addProcessor( typeName, implementationOrFactory )

When user is submitting last form in a sequence of forms a defined sequence of input data processors is invoked passing data returned by one input data processor into next one. The list of input data processors is customized in definition of sequence of forms.

This method enables registration of new types of input data processors with current instance of Forms Processor to be available in all sequences of forms _created afterwards_.

* `typeName` is a string containing the name of type of input data processor to be registered. This name is normalized by means of being trimmed and converted to all lowercase characters.
* `implementationOrFactory` is either some _class_ implementing particular behaviour of new type of input data processor or some function generating this implementation on demand. In most cases providing factory function is preferred as it enables implementation to be properly derived from abstract base class as required by FormsProcessor.

  The factory function is invoked with [required base class of generated implementation](https://git.cepharum.de/cepharum/forms/client/blob/develop/src/model/form/processor/abstract.js). To simplify inheritance setup with legacy Javascript this class exposes static method `makeInherit()` to be invoked with constructor function of new _class_ to become type's implementation. You need to set up inheritance before replacing elements of related prototype.
  
  ```javascript
  FormsProcessor.addProcessor( "encrypt", function( abstract ) {
    const encryptor = abstract.makeInherit( function( definition ) {
      this.$super( definition );
    
      // put your constructor code here
    } );

    encryptor.prototype.process = function( data ) {
      return Promise.resolve( data );  	
    };

    return encryptor;
  } );
  ```
  
  The same is possible with ES6 classes probably requiring to transpile the code for supporting older browsers:

  ```javascript
  FormsProcessor.addProcessor( "encrypt", function( Abstract ) {
    return class EncryptProcessor extends Abstract {
      process( data ) {
        return Promise.resolve( data );  	
      }
    };
  } );
  ```

A custom input data processor must overload this method:

* `process( data )` ([see source](https://git.cepharum.de/cepharum/forms/client/blob/develop/src/model/form/processor/abstract.js#L59))

  This method is invoked with all input data provided by user while filling the forms in a sequence (in case of being first selected input data processor) or with data as returned from previous input data processor in a row of such processors.
  
  Every input data processor should return some data. Whenever an input data processor isn't adjusting the provided data it should return the originally provided data, at least. By returning promise for resulting data the method may start asynchronous processes. This will defer invocation of further input data processors.

### addTranslations( locale, translationsOverlay )

FormsProcessor has internationalization support built in. Internal fields use lookup trees providing translations for current locale. This method is provided to add custom overlays to extend or replace existing entries in a translation tree.

> Translations are organized as "trees" by means of mapping some lookup string into a translation or into another object mapping from lookup strings into a translation or yet another object etc.

On rendering hints and errors on a field code might use `@` followed by a translation's name using dot notation syntax instead of some actual string to be used. Abstract field implementation will detect those strings and look up related translations for eventual use. On adding custom fields and processors you may use this syntax in combination with additional translations to utilize this localization support.

Any provided overlay of translations is associated with a particular locale to be selected in first argument. Multiple overlays per locale may be provided in succeeding invocations of this method with each overlay extending or replacing elements of previously applied overlay.

Due to the fact that API works in a global scope probably managing multiple instances of FormsProcessor with each one considering different locale to be current one, there is no possibility using this API to detect current locale and provide translation for that locale, only. Due to controlling all instances of FormsProcessor your code might have an option to decide what translations is required, though.

Applying translations affect FormsProcessor instances created afterwards, only.
