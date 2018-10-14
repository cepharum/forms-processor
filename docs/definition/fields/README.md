# Form Fields

Every form defines a list of fields. Every field's definition in this list is a set of properties describing either field.

## Common Definition Properties

The following properties are available without regards to a field's type. Every property is categorized with regards to different aspects:

* **Type:** Either property expects a certain type of information, such as a string, a boolean or any other type of value supported by JSON or Javascript.
* **Default:** Optional properties have a default value to be used in case of omitting it in a field's definition. Mandatory properties don't have a default. On those properties the default is given as "_none_".
* **Computable:** Properties may be computed from input values of other fields. This information indicates whether a field permits such a computation or _requires_ provision of static value instead.
* **Localizable:** Usually, properties defining text visible to the user support _localization_. Instead of providing single string to be displayed a _localizable definition property_ may be an object mapping from locale identifiers into strings to use with either locale.

  > **Example:**
  >
  > Instead of providing
  > 
  > ```JSON
  > {
  >     "label": "first name"
  > }
  > ```
  >
  > you might provide
  > 
  > ```JSON
  > {
  >     "label": {
  >         "de": "Vorname",
  >         "fr": "prénom",
  >         "*": "first name"
  >     }
  > }
  > ```

### type

* Type: `string`
* Default: `text`
* Computable: no
* Localizable: no

The field's type affects the field's visual appearance and its behaviour. The type selects what kind of information is requested and how a user is capable of providing it.

### name

* Type: `string`
* Default: _none_ (mandatory information)
* Computable: no
* Localizable: no

The name of a field is used to identify it in context of its form. That's why it must be unique. While processing the form and its definition a field's name is used case-insensitively. That's why its name provided here should be case-insensitively unique as well.

The name isn't visible to the user. It's used to address the resulting input value(s) of a field in a multidimensional set of input values.

### label

* Type: `string`
* Default: `""`
* Computable: yes
* Localizable: yes

The label is a short description of a field to be displayed next to it.

### hint

* Type: `string`
* Default: `""`
* Computable: yes
* Localizable: yes

### required

* Type: `boolean`
* Default: `false`
* Computable: yes
* Localizable: no

### visible

* Type: `boolean`
* Default: `true`
* Computable: yes
* Localizable: no

### noResult

* Type: `boolean`
* Default: `false`
* Computable: yes
* Localizable: no

By default the value of every _interactive_ field is included with the resulting set of data processed after user has submitted last form in a sequence of forms (unless it's unset and [mode option `fullResult`](../mode.md) isn't set). By setting this option on a field its value is never included with the result no matter it is set or not.

This might be used e.g. on fields used to control flow of forms, only

## Reserved Keywords

Basically, any new type of fields may introduce new properties to be used on customizing that type of field. However, some property names are reserved keywords and thus must not be used in definition of a field.

* form
* index
* originalName
* qualifiedName
* dependsOn
* dependents
* value
* pristine
* valid
* errors
