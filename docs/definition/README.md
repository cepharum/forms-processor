# How To Define A Sequence Of Forms

The Forms Processor always requires a definition of forms. This can be provided in different ways:
 
1. as a literal object
2. as a string representing that object using JSON
3. as a string representing that object using "[YAML](../features/intuitive-language.md#yaml-format)"
3. as a string containing URL for fetching the separately available definition (provided in JSON or YAML)
 
The definition object that is provided either way must comply with a certain structure which is to be described in this part of documentation.

## Basic Hierarchy

The definition object has up to three properties at root level dividing the definition into three sections accordingly.

* **mode** provides global customizations of Forms Processor's behaviour and appearance. The value is another set of properties. A definition works without this part as there are default values for every particular option.

  * [Mode Configuration](mode.md)

* **sequence** defines a list of forms to be processed. The list of forms is required.

  * [Defining Forms](forms.md)

* **processors** defines a list of post-form input data processors. The list of processors is required, too.

  * [Defining Processors](processors/)

In addition properties **label** and **description** may be used at root level to provide some static headline and introducing text to appear above every form of sequence.
