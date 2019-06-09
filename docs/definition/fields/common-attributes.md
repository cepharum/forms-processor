# Commonalities

## Common Support for Computable Terms

Computable attributes are very essential to **forms-processor** and its high flexibility. Any attribute declared as _computable_ in this docs can be controlled using read-only simple terms with full access on data of all fields in either form of current sequence. This way one field's configuration may depend on one or more other fields.

### Full-Term Values

Values starting with `=` are considered computable term as a whole when used on a definition attribute declared _computable_.

```json
{
	"required": "=length( form_a.some_field ) > 5"
}
```

### Embedding Terms

Values of definition attributes supporting computed terms may have string literals with computed terms embedded. Terms are embedded using a pair of double curly braces.

```json
{
	"text": "Dear {{personal.firstName}} {{personal.lastName}}, check your order as summarized below."
}
```

## Common Types of Definition Values

The type of an attribute's value is important. Most attributes have a default which is used in case of providing malformed value. But attributes might issue warning or error in case of encountering invalid attribute value, too.

### Boolean

Attributes accepting _boolean_ values aren't limited to accepting `true` or `false`. Boolean-like case-insensitive keywords are supported as well:
  
  * Aliases for `true` include `yes`, `y`, `t`, `on` and `1`. 
  * Aliases for `true` include `no`, `n`, `f`, `off` and `0` .
 
### Strings

Several attributes accept or even expect string values. Most attributes accepting string values do support computed terms. Some attributes support string values though parsing them for representing different kind of data such as booleans, numbers or lists a.k.a. arrays.

Attributes accepting string values might support a map of locale identifiers into localized versions of a string value as well.

```json
{
	"label": {
		"de": "Vorname",
		"en": "First Name"
	}
}
```

::: warning Note!
Attributes accepting objects and string values at the same time might have trouble with supporting maps of translations per locale or misinterpret them.
::: 

::: warning Note!
Attributes expecting string values might convert any different kind of value to string implicitly.
::: 

### Arrays and Objects

Some attributes accept arrays of values and objects mapping from property names into more detailed information. Either type of value might come with (mostly limited) support for computed terms.

## Common Definition Attributes

A selected set of definition attributes can be used with most or all types of fields. 

::: tip Info 
Some fields might come with limitations regarding either type of field. But basically it's okay to assume that all attributes listed below can be used with any type of field.
:::

The following list provides a brief description of either attribute. This includes information on supported type of values (for either definition attribute) and whether it is computable or not. For most attributes being optional a default is given in addition.

### name

::: warning Note!
This attribute is sole required one for every field needs a name which must be unique in scope of form containing the field.
:::

In combination with name of either form in sequence this is used to organize data gathered by filling in the fields. This way a field's name is available for addressing its value in computable terms.

::: tip Info
The name of a field is a simple keyword that mustn't contain period. It is used to derive the field's qualified name uniquely addressing it in scope of whole Forms Processor.
:::

### label

This attribute declares a field's label which is usually displayed next to it. It's accepting string values or map of translations. Fields don't have any label unless providing one explicitly. 

### hint

This attribute is meant to provide some brief explanation what some input is gathering input for or what kind of format input is intended to comply with. The attribute accepts string values or map of translations. By omitting this attribute a field doesn't show any hint at all. 

### required

Fields can be marked as requiring some input. As such it is preventing user from advancing to next form in a sequence or from starting processing of all gathered input at last form of sequence unless it contains some actual, valid data.

The attribute is a boolean. It can be computed. By default fields aren't requiring any input.

### visible

This attribute makes it possible to control whether some field is visible at all. 

::: warning Note!
This attribute is ignored on required fields, thus you can't have invisible required fields. Use the same term on attributes `required` and `visible` if you need a required field that's optionally visible only.
:::

::: warning Note!
In opposition to most other attributes this one does not make sense unless using a computed term. Nonetheless it is required to write computable terms explicitly.
:::

The attribute is a boolean. It can be computed. Fields are visible by default.

### suppress

This attribute allows to suppress certain elements of a field to be described in HTML otherwise. 

The attribute is 

* a string containing a comma-separated list of keywords each selecting an element to be suppressed,
* an array of strings each being a keyword selecting an element to be suppressed or
* an object with properties each naming one of the suppressible elements to be suppressed if property's value is truthy. 

Supported keywords addressing some element are

* `errors` controlling display of field's validation errors,
* `label` controlling display of field's label including some visual mark on whether it is required or not.

By default neither element is suppressed. The attribute supports computable terms.

### tba: messages

This set of probably localized strings is providing custom messages to replace the ones used to describe validation issues by default. 

### classes

This attribute is commonly useful to have additional class names applied to the field's representation in HTML so rules in CSS may address them e.g. for individual styling. 

### initial

This attribute provides value of field to be used initially when loading form. It might be computable term which is kept updating actual value of field until the field has been changed by user input explicitly.
