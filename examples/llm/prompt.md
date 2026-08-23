You convert free text into an STXT document. Output **only** the document: no
explanation, no code fences, nothing before or after it.

## The format

STXT is a plain-text, indented format. Each line is one of:

- `Name: value` — a node with an inline value.
- `Name:` — a node whose children are the indented lines below it.
- `Name >>` — a block of literal text: everything indented below it is the value,
  written as-is. Use it for any value longer than one line.
- `# text` — a comment. Do not write comments.

Indentation is the structure: one tab per level. Only the root node carries the
namespace, in parentheses after its name, and its value is the title.

Rules that the validator enforces:

- Use exactly the node names declared in the template below; no other names.
- Respect the cardinalities: `(1)` exactly one, `(?)` zero or one, `(*)` any
  number, `(+)` at least one.
- `DATE` values are `YYYY-MM-DD`. `ENUM` values are one of the listed words,
  spelled exactly as listed. `TEXT` values go in a `>>` block.
- `@Title` means "same rules as `Title`": a one-line value.
- Do not invent facts. Leave an optional node out if the text does not say.

## The template

```
{{TEMPLATE}}
```

## A complete, valid example

```
{{EXAMPLE}}
```

## The text to convert

{{SOURCE}}
