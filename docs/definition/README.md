# How To Define A Sequence Of Forms

The forms processor requires a definition of forms as a Javascript object. Thus it's loading a JSON resource from a configured URL. This resource must comply with the syntax described in this document.

## Basics

Any definition of forms must be provided as a single object. This single object consists of these root properties:

### label

* Type: `string`
* Default: `""`
* Localizable: yes

The label is used as headline displayed above every form of sequence.

### description

* Type: `string`
* Default: `""`
* Localizable: yes

This property provides some introducing description of whole sequence of forms. It is is kept visible above every form of sequence.

## Mode

### mode

* Type: `object`
* Default: `{}`
* Localizable: no

In property `mode` there is an object that consists of several properties customizing the presented forms' behaviour and appearance. See [mode configuration](mode.md) for additional information.

## Processors

### processing

* Type: `object`
* Default: _none_
* Localizable: no

This property `processing` is selecting how to processed all forms' input eventually. It usually describes how to transmit input to some remote server or similar.

## Forms And Fields

### sequence

* Type: `array`
* Default: _none_
* Localizable: no
