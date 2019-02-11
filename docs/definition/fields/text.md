# Single-Line Text Input Field

Single-line text-editing fields are defined with `type` attribute set to `text`.

```json
{
	"type": "text",
	"name": "nameOfValue"
}
```

In addition any field lacking explicit definition of a type is represented as a single-line text-editing field, either:

```json
{
	"name": "nameOfValue"
}
```

## Definition Attributes

All [commonly supported definition attributes](common-attributes.md#common-definition-attributes) can be used with text-editing fields, too.

### size

The size attribute describes a range of characters considered valid. When set the field requires user to enter some certain amount of characters.

The range can be given as string value complying with the format

```
min-max
```

By default any number of characters is accepted as input.

### pattern

The pattern controls to different aspects of a text input field:

1. It limits the permitted characters in either position of an input. This way it might prevent any further input from being entered.
2. It applies some visual formatting e.g. by automatically inserting spaces and special characters.

Patterns are provided as string values. Characters in a pattern either represent a certain class of characters that may be entered at this position of input value or some literal character that might be entered or gets inserted implicitly. 

Therefore every character in a pattern falls into one of three categories:

* Functional characters select a class of characters user is permitted to enter in related position of input string. Supported function characters are:  

  | Letter | Class of Permitted Characters                                       |
  | ------ | ------------------------------------------------------------------- |
  | `A`    | Latin characters, converted to UPPERCASE implicitly                 |
  | `a`    | Latin characters, converted to lowercase implicitly                 |
  | `#`    | Decimal digits from 0 to 9                                          |
  | `X`    | Hexadecimal digits from 0 to F, converted to UPPERCASE implicitly   |
  | `x`    | Hexadecimal digits from 0 to f, converted to lowercase implicitly   |
  | `W`    | Latin character or decimal digit, converted to UPPERCASE implicitly |
  | `w`    | Latin character or decimal digit, converted to lowercase implicitly |
  
* Quantifiers are supported right after some functional character:

  | Quantifier | Effect |
  | ---------- | ------ |
  | ? | This declares the immediately preceding functional character to be optional. |
  | * | This declares the immediately preceding functional character to be optional and repeatable. |
  | + | This declares the immediately preceding functional character to be repeatable. |

  Quantifiers succeeding another quantifier are extending the previous quantifier and thus are addressing the same functional character preceding that quantifier current one is succeeding.
  
  ::: tip Example
  Declaring pattern for entering IPv4 might look like this:

  ```json
  {
  	"pattern": "##??.##??.##??.##??"
  }
  ```
  
  The pattern `##??` is equivalent to expecting one mandatory digit and up to two more optional ones. It might be written as `##?#?` as well.
  :::
* Literal characters are considered separators in formatted value. They usually aren't included with the resulting input value e.g. as available in terms addressing a text field's value. Any character which neither functional character nor quantifier is considered literal character except for these two character:

  * An exclamation mark may succeed a literal character to keep it in value of text input field. Just consider the example on entering IPv4 address. In that example the IPv4 address would be properly formatted in text input field, but reading the field's internal value will result in a raw sequence of digits, only. This is due to literal characters being stripped off by default. Using the exclamation mark literal characters are meant to be kept in resulting value. In case of IPv4 addresses this is pretty essential, thus the pattern needs to be fixed like this:
  
    ```json
    {
    	"pattern": "##??.!##??.!##??.!##??"
    }
    ```
    
  * A backslash can be used to treat a succeeding character as literal instead of quantifier or functional. This applies to `!` and `\` itself as well.

::: tip Example
If your form asks for entering some coupon code you might have it instantly comply with a certain format used to print it out before using a pattern like this:

```json
{
	"pattern": "AAAAA-AAAAA-AAAAA-AAAAA"
}
```

This pattern permits input of up to 20 latin letters converting them to uppercase implicitly. Dashes might be entered in given positions as well. When omitted they are inserted implicitly, though.
:::

### upperCase

This optional boolean attribute declares to implicitly convert all text input into uppercase. It's computable.

### lowerCase

This optional boolean attribute declares to implicitly convert all text input into lowercase. It's computable.

### format

The format applies one of several available format checkers obeyed on validating field's input. Supported formats are:

| Value   | Resulting Format Checker Applied        |
| ------- | --------------------------------------- |
| `ipv4`  | IPv4 address, such as `10.0.0.123`      |
| `mail`  | mail address, such as `foo@example.com` |
| `phone` | phone number, such as `+49 (30) 123-01` |
| `iban`  | IBAN, such as `DE4323439349324238`      |
| `bic`   | BIC, such as `GENODEM1GLS`              |

The attribute is optional and there is no additional format checker applied when omitting it.

### prefix

The prefix is static string to appear in front of user input. It is optional resulting in input gathered without showing any prefixed text. It's computable.

### suffix

The suffix is static string to appear right after user input. It is optional resulting in input gathered without showing any suffixed text. It's computable.

### align

The attribute `align` is one of these values:

| Keyword | Resulting Alignment of Entered Text     |
| ------- | --------------------------------------- |
| `left`  | Text input is aligned left. This is the default on omitting the attribute. |
| `right` | Text input is aligned right.            |
