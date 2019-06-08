# Terms

One of the most remarkable features of Forms Processor is the support for [terms](https://www.npmjs.com/package/simple-terms) mostly used to make forms' fields depend on each other. When defining forms you can use a term instead of literal value to get the actually used value calculated at runtime. This calculation usually works with existing data which is representing current input of all defined forms' fields.

::: tip Limitations
All terms supported by Forms Processor are for read-only access on provided input data, only. 

In addition, terms don't come with extended features usually available in programming languages such as conditionals and loops. 

However, there are solutions to work around two of these limitations:

1. Forms Processor supports hidden fields with a defined value. By using a term for defining a hidden field's value it is possible to save the result of that term so other terms can re-use it. Using hidden fields helps to prevent very complex terms.

   ```yaml
   fields:
     - type: hidden
       name: some_name
       value: =some.value * some.factor + some.offset
   ```

2. By using function `test( condition, ifTrue, ifFalse )` it is possible to implement conditional calculations and processings. The first argument `condition` is a term evaluated as boolean value. If this results in `true` then second argument's value is returned. Otherwise third argument's value is returned. 

   ```yaml
   text: You've selected {{test(plan.selected=="pro","pro","standard")}} plan.
   ```
:::

## Syntax

A term can be used in two different ways.

### Completely Replacing Literal Value

A term may replace a property's value as a whole. In this case it must be prefixed with assignment operator:

```yaml
- name: billing
  fields:
    - name: address
- name: delivery
  fields:
    - name: address
      initial: =billing.address
```

In this fragment of a definition there are two forms named **billing** and **delivery**. Either form consists of a text input field named **address**. The latter has an initial value which is fetched from the former field's value.

In this example, the term is `billing.address`. Prepending `=` is required so Forms Processor detects the term as such instead of assuming it is meant literally.

### String Interpolation

Terms may be used in string literal to replace parts of the string with calculated information. This time the term must be wrapped in a double pair of curly braces:

```yaml
- name: billing
  fields:
    - name: address
- name: delivery
  fields:
    - name: address
      initial: Same as billing, which {{billing.address}} ...
```

This time there is no assignment operator prepended to the term.

## Fetching Information

Either term is capable of fetching current value of either defined fields. Terms support addressing fields by name. A name might be local thus referring to different fields of same form. Any field's name might be prepended with its containing form's name and a separating period resulting in the field's _qualified name_.

::: tip Information
Terms work case-insensitively by intention to improve convenience and fault tolerance. Thus, terms `billing.address` and `BillING.ADdResS` are both addressing the same field's value.
:::

A field's value might be an object consisting of different properties to be addressed individually. This is achieved by appending another period and desired property's name. This works recursively, of course.

## Simple Calculations

Terms can be combined with each other using certain operators resulting in a new, more complex term. There are arithmetic and logical operations for calculation:

| Operator | Type | Operation |
|---|---|---|
| `a + b` | arithmetic | sum of `a` and `b` | 
| `a - b` | arithmetic | difference between `a` and `b` | 
| `a * b` | arithmetic | product of `a` and `b` | 
| `a / b` | arithmetic | ratio of `a` and `b` |
| `-b` | arithmetic | negated value of `a` |
| `a && b` | logical | `true` if both `a` and `b` are _truthy_, `false` otherwise | 
| <code>a &#124;&#124; b</code> | logical | `true` if either `a` or `b` or both are _truthy_, `false` otherwise |
| `!b` | logical | `true` if `a` is _falsy_, `false` otherwise |

::: tip truthy vs. falsy
Basically, the only boolean values are _true_ and _false_. However, all other possible values are considered either _truthy_ (a.k.a. somewhat like `true`) or _falsy_ (somewhat like `false`). All values but the following are truthy:

* numeric value `0`
* `null`
* the empty string `""`
* `false`
:::

In addition there are operations for comparing two values resulting in a boolean value indicating whether the operation's comparison is satisfied or not:

| Operator | Comparison |
|---|---|
| `a = b` | Is `a` equal `b`? | 
| `a == b` | Is `a` equal `b`? | 
| `a <> b` | Are `a` and `b` different? | 
| `a != b` | Are `a` and `b` different? | 
| `a < b` | Is `a` less than `b`? | 
| `a <= b` | Is `a` less than or equal `b`? | 
| `a > b` | Is `a` greater than `b`? | 
| `a >= b` | Is `a` greater than or equal `b`? | 

Terms might use parentheses for grouping and for controlling order of calculation.

## Processing Information

Apart from simple calculations selected functions may be invoked to process some information and convert it into some resulting information. A function consists of a name immediately followed by a pair of parentheses containing an optional comma-separated list of one or more arguments.

::: tip Syntax of a Function Invocation
`function_name( arg1, arg2, arg3 )`
:::

Some powerful features of Forms Processor rely on functions available in terms. 


## Types of Value

Terms are processed using Javascript. Thus, all basic types available in Javascript are possible values in terms as well. This includes `null`, `undefined`, booleans, numerics, strings, arrays (a.k.a lists of data) and objects (a.k.a. maps or dictionaries). In the following list of available functions arrays and objects are commonly referred to as _sets_ of data.


## List of Available Functions

The list of available functions provides either function's signature in the subtitle. Next to the pattern for invoking either function there might be a colon followed by the type(s) of result value returned. This information is missing on functions that might return any type of data.

::: tip Information
Due to the paradigm of never adjusting any data all functions are implemented so that they don't alter any provided argument.
:::

### Testing

#### `test( condition, ifTruthy, ifFalsy )`

Tests whether value given in `condition` is truthy or not. If `condition` is truthy the function returns value in `ifTruthy`. The value optionally provided in `ifFalsy` is returned otherwise.

This method is highly useful in constructing conditional processings.

#### `isset( arg, arg, ... ) : boolean`

Detects if at least one provided argument is neither `undefined` nor `null`.

#### `empty( arg, arg, ... ) : boolean`

Detects if every provided argument is either `undefined` or `null`.

#### `first( arg, arg, ... )`

Fetches first provided argument that is neither `undefined` nor `null`. 

The function is very similar to `isset()` but returns the causing argument instead of related state information.


### Converting Values

#### `boolean( input ) : boolean`

Converts provided `input` value to its boolean counterpart.

#### `integer( input ) : number`

Converts provided `input` value to related integer value, that is the integer numeric that might be given as such or as a numeric value given as a string. 

Any digits following decimal separator are removed

#### `number( input, decimal, thousand ) : number`

Converts provided `input` value to related numeric value. Optionally provided information on `decimal` separator and `thousands` separator is used to properly detect those separators in provided input value.

In opposition to `integer()` digits following the decimal separator are not removed. 

#### `string( input ) : string`

Converts any provided `input` value into its string representation.


### Strings

#### `trim( input ) : string`

Removes leading and trailing whitespace from provided `input` string. On providing non-string value as `input` it is implicitly converted to string, first.

#### `leftpad( input, length, padding ) : string`

Prepends `padding` string to given `input` string until the resulting string has at least `length` characters. if `padding` is omitted `" "` used by default.

#### `rightpad( input, length, padding ) : string`

Appends `padding` string to given `input` string until the resulting string has at least `length` characters. If `padding` is omitted `" "` is used by default.

#### `centerpad( input, length, padding ) : string`

Mutually prepends and appends `padding` string to given `input` string until the resulting string has at least `length` characters. If `padding` is omitted `" "` is used by default.

#### `normalize( input ) : string`

Returns provided `input` string with any sequence of one or more arbitrary whitespace characters replaced with sole `" "` character.

#### `lowercase( input ) : string`

Returns `input` string with any contained uppercase letter replaced with its lowercase counterpart.

#### `uppercase( input ) : string`

Returns `input` string with any contained lowercase letter replaced with its uppercase counterpart.


### Numbers

#### `round( input, precision ) : number`

Rounds provided numeric value obeying requested precision which is the number of fractional digits to keep as-is on rounding. The precision might be negative to address a digit preceding decimal separator. The default precision is 0 when omitting second argument. 

#### `ceil( input, precision ) : number`

Rounds up provided numeric value obeying requested precision which is the number of fractional digits to keep as-is on rounding. The precision might be negative to address a digit preceding decimal separator. The default precision is 0 when omitting second argument. 

#### `floor( input, precision ) : number`

Rounds down provided numeric value obeying requested precision which is the number of fractional digits to keep as-is on rounding. The precision might be negative to address a digit preceding decimal separator. The default precision is 0 when omitting second argument. 

#### `abs( input ) : number`

Returns positive counterpart of provided negative number or provided positive number as-is.

#### `random( lowerInclusive, upperExclusive ) : number`

Returns random number (not safe for cryptography) in given range. Lower boundary is considered inclusively, while upper boundary is considered exclusively. Either number might be omitted resulting in default limits `0` and `1000` accordingly.

#### `min( arg, arg, arg, ... ) : number`

Returns least numeric value provided in either argument.

#### `max( arg, arg, arg, ... ) : number`

Returns highest numeric value provided in either argument.

#### `formatnumber( value, decimal, thousands, fraction, sign ) : string`

Formats a number given in `value` using particular `decimal` separator and optional `thousdans` separator. 

`fraction` selects the number of required fractional digits in resulting string. If `fraction` is negative the value is rounded in compliance with `round()` described before when providing negative `precision` there. 

If `sign` is given and truthy even positive values are rendered with a prepended `+` sign.


### Statistics

#### `sum( list ) : number`

Takes list of probably numeric values in sole argument returning the sum of all actually numeric values in that list.

#### `count( list ) : number`

Takes list of probably numeric values in sole argument returning the number of all actually numeric values in that list.

#### `average( list ) : number`

Takes list of probably numeric values in sole argument returning the average of all actually numeric values in that list.

#### `median( list ) : number`

Takes list of probably numeric values in sole argument returning the median of all actually numeric values in that list.


### Arrays

#### `array( item, item, item, ... ) : array`

Creates new list of items from provided arguments. The resulting list or array can be used with several functions expecting lists of data such as `indexof()` or `average()`.

#### `concat( arg, arg, arg, ... ) : array`

Returns a list containing elements of all provided lists of values as well as non-list arguments.

#### `length( input ) : number`

Expects a set of data and returns the number of items in provided set.

#### `indexof( haystack, needle, regexp ) : number`

Performs shallow search on a list of data provided in argument `haystack` for first list element which is equal value provided in argument `needle`. If argument `regexp` is provided and truthy the method assumes regular expression given in argument `needle` instead of a literal value.

The function returns numeric index of found element or `-1` if there is no matching item in list.

#### `item( list, index, fallback )`

Returns item at selected `index` of provided `list` of data. If there is no item at given index the optionally provided `fallback` is returned instead.

#### `filter( list ) : array`

Retrieves copy of provided list with all _falsy_ items of list removed.

#### `join( list, glue ) : string`

Accepts a `list` of data and returns string containing string representations of all items in list separated by given `glue` string from each other.

The default `glue` string is the empty string when omitting second argument.

#### `split( input, separator, regexp ) : array`

This method is the reversal of `join()` as it accepts a string as `input` and tries to split that string into chunks assumed to be separated by `separator` string in `input`. If third argument `regexp` is set and truthy then `separator` is assumed to be a regular expression matching flexible separators rather than fixed literal string.

By omitting `separator` the resulting list contains all characters of provided strings as dedicated items.


### Date/Time

::: tip On Unix Epoch
_Unix Epoch_ refers to special point in time which is January 1st 1970, 00:00:00.
:::

#### `parsedate( input ) : number`

Parses provided `input` for describing some date/time information returning any found timestamp as number of seconds since _unix epoch_. Given input may be string, some previously parsed timestamp or some object describing timestamp using separate properties.

If `input` is `null` the current timestamp is returned. If `input` can't be interpreted as a date/time information `NaN` (abbreviation of _not a number_) is returned.

::: tip Information
All the date/time functions listed below are passing arguments providing any sort of timestamp through this function. Thus, it is possible
:::

#### `describedate( timestamp, utc ) : object`

Describes provided `timestamp` by means of returning an object exposing particular pieces of given timestamp in these separate properties:

| Property | Type | Description | Range |
|---|---|---|---|
| year | number | the timestamp's year | 4-digit value |
| month | number | the timestamp's month | 1-12 |
| day | number | the timestamp's day of month | 1-31 |
| dow | number | the timestamp's day of the week | 0-7, 0 is for Sunday, 1 for Monday ...  |
| hour | number | the timestamp's hour | 0-23 |
| minute | number | the timestamp's minute | 0-59 |
| second | number | the timestamp's seconds| 0-59 |

On omitting `timestamp` current time is used by default. If second argument is given and truthy the resulting timestamp is assumed to describe time in UTC timezone.

#### `formatdate( format, timestamp ) : string`

Renders string representing given `timestamp` using description of `format`. If `timestamp` is omitted current timestamp is used.

The format is a string consisting of certain letters according to table below. Every listed letter is replaced with related value of selected timestamp. Letters and characters not listed in table are kept as-is. If you want to include one of the listed letters literally you need to prepend it with single back slash character. The same applies to case of keeping literal back slash.

::: tip Hint
All listed letters work case-insensitively. Thus, either variant must be _escaped_ by prepending back slash to literally get the letter in resulting string.
:::

| Format Character | Related Value | Padded |
|---|---|---|
| y | year, 4-digits | no |
| m | month | yes |
| n | month | no |
| d | day of month | yes |
| j | day of month | no |
| h | hour | yes |
| g | hour | no |
| i | minute | yes |
| s | second | yes |

#### `now( utc ) : number`

Returns current time and date represented as number of seconds since _unix epoch_. 

If second argument is given and truthy the resulting timestamp is assumed to describe current time in UTC timezone.

#### `droptime( timestamp ) : number`

Returns provided `timestamp` with information on time of day removed, thus always representing 00:00:00 of given day.

#### `datediff( timestamp, reference, unit, absolute ) : number`

Returns difference between provided `timestamp` and a `reference` timestamp in selected `unit`. If `absolute` is provided and truthy resulting value is always positive. 

Value of `unit` is a string according to following table:

| Value of `unit` | Unit of returned difference |
|---|---|
| s | seconds |
| i | minutes |
| h | hours |
| d | days |
| w | weeks |
| m | months |
| y | years |
 
If `reference` is omitted or `null` current date/time is used as reference by default. If `unit` is omitted the resulting difference is given in seconds by default.

#### `dateadd( timestamp, amount, unit ) : number`

Adjusts `timestamp` by provided `amount` of seconds, minutes, hours, etc. The actual unit of `amount` is selected by `unit`.

Value of `unit` is a string according to following table:

| Value of `unit` | Unit of `amount` |
|---|---|
| s | seconds |
| i | minutes |
| h | hours |
| d | days |
| w | weeks |
| m | months |
| y | years |
 
If `reference` is omitted or `null` current date/time is used by default. If `unit` is omitted seconds are assumed as unit of `amount` by default.


### Browser

#### `cookie( name, testOnly ) : string or boolean`

Fetches value of browser-based cookie selected by its `name`. If `testOnly` is given and truthy, the function returns `true` if there is a cookie with given name or `false` otherwise.
