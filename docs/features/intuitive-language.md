# Intuitive Language

Well, as a beginner in using Forms Processor calling its definition language intuitive might sound awkward. Nonetheless, we try to make it _as intuitive as possible_ so that people with little skills in software development are enabled to write their own definitions.

## Case-Insensitive Addressing In Terms

When writing terms all names used on selecting a function or on reading some existing field's input value are considered case-insensitive. Thus it won't matter whether you are using upper or lower case letters. This is reducing probability of typos and thus amount to fault tolerance.

## Intuitive Booleans

Boolean properties are assumed to have value `true` or `false`. But in addition, the following case-insensitive string literals can be used to represent either value as well:

| Boolean Value | Support Literal Considered Equal |
|---|---|
| `true` | `y`, `yes`, `on`, `1` |
| `false` | `n`, `no`, `off`, `0` |

## YAML Format

By supporting definitions written in YAML hierarchies are a lot easier to write than sticking with JSON. The YAML format is designed to represent hierarchically structured data in more human-readable fashion. The included YAML-parser is capable of handling most common use cases for the syntax of YAML format.
