# Generate → validate → fix

An executable version of the loop described in the portal page *AI and LLMs*:
a model converts free text into an STXT document, `@stxt-lang/core` validates it
against a template, and the errors go back to the model until the document is
valid.

```
examples/llm/
├── .stxt/com.acme.reports.stxt   the template the document must satisfy
├── example.stxt                  a complete, valid document (goes in the prompt)
├── prompt.md                     the prompt template: format rules + template + example + source
├── source.txt                    the free text to convert (meeting notes)
└── generate.mjs                  the loop
```

## Run it

```sh
cd examples/llm
npm install
export ANTHROPIC_API_KEY=...          # any Anthropic credential the SDK accepts
node generate.mjs                     # converts source.txt
node generate.mjs my-notes.txt > report.stxt
```

The document goes to stdout; the attempts and the validator's findings, to
stderr. Exit code `0` when the final document validates, `1` otherwise. A typical
run:

```
--- attempt 1: 3 error(s)
    line 3: [INVALID_VALUE] Date: Invalid date (12 March 2026) (schema)
    line 5: [INVALID_VALUE] The value 'draft' not allowed. Only: Draft, Final (schema)
    line 1: [TOO_FEW_CHILDREN] 0 nodes of 'com.acme.reports:summary' and min is 1 (schema)
--- attempt 2: valid
```

`generate.mjs` uses the Anthropic SDK, but nothing in the loop depends on the
provider: replace the `client.messages.create` call with any model that returns
text.

## The same check from the shell

Step 2 of the loop is exactly what the CLI does on standard input. With
`@stxt-lang/cli` installed and the same `.stxt/` directory alongside:

```sh
node generate.mjs --max-attempts 1 2>/dev/null | stxt validate -
```

The CLI resolves the template through the directory chain, as the editor and
the playground do, and prints each finding as `<stdin>:line: [CODE] message`.

## What the validator catches

Every mistake an LLM typically makes with a structured format is an error with
a stable code and a line number, which is what the model needs to fix it:

| Mistake | Code |
|---|---|
| A node name that the template does not declare (closed content model) | `NODE_NOT_DEFINED_IN_SCHEMA`, `CHILD_NOT_DECLARED` |
| A mandatory node missing, or one repeated too often | `TOO_FEW_CHILDREN`, `TOO_MANY_CHILDREN` |
| A date that is not `YYYY-MM-DD`, a value outside an `ENUM` | `INVALID_VALUE` |
| A line that is not `Name:`, `Name >>` or indented text | `INVALID_LINE` |
| Indentation that skips a level, uses an odd number of spaces or mixes tabs and spaces | `INDENTATION_LEVEL_NOT_VALID`, `INDENTATION_SPACES_NOT_VALID`, `INDENTATION_MIXED` |

The prompt asks for the document without code fences; `generate.mjs` strips them
anyway, because models add them.
