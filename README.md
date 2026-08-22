# stxt-lang

The definition of **STXT** (Semantic Text): the five normative specifications, the conformance
corpus, and the source of the language portal at <https://stxt.dev>. Everything here is written
in STXT itself.

STXT is a plain-text format for structured, semantic documents: no braces, no closing tags, just
indentation. It is designed to be equally readable by people and by machines, and it comes with an
optional schema layer so documents can be validated.

```stxt
# A comment
Document (com.example.docs): Title
	Metadata:
		Author: Joan
		Date: 2026-08-09
	Content >>
		Everything indented under a ">>" node is literal text:
		the #, : and >> inside are not interpreted.
```

This repository contains no code, no build and no tests. It is the **first authority** of the
ecosystem: the implementations derive from it, never the other way around.

```
specifications (this repository)
  → stxt-impl  (neutral pseudocode)
      ├→ stxt-js      @stxt-lang/core on npm
      ├→ stxt-java    dev.stxt:stxt-core on Maven Central
      └→ stxt-python  stxt on PyPI
```

## The specifications

They live in `es/` (the canonical version, in Spanish) with an English mirror in `en/`. Each one
carries its own `Version` in its `Metadata`; all five are at **1.0**. "STXT 1.0" on its own means
the version of *STXT-SPEC*, which is what the implementations expose as `SPEC_VERSION`.

| File | Specification | What it defines |
|---|---|---|
| `stxt-core-ref.stxt` | **STXT-SPEC** | The base syntax: indentation, inline nodes, text blocks, namespaces, comments, name normalisation, error rules and security |
| `stxt-tree-ref.stxt` | **STXT-TREE-SPEC** | The canonical JSON representation of a document's logical tree |
| `stxt-schema-ref.stxt` | **STXT-SCHEMA-SPEC** | `@stxt.schema`: semantic validation with `Node`/`Children`/`Child`, types and cardinalities |
| `stxt-template-ref.stxt` | **STXT-TEMPLATE-SPEC** | `@stxt.template`: the simplified authoring form, compilable to an equivalent schema |
| `stxt-discovery-ref.stxt` | **STXT-DISCOVERY-SPEC** | How tools locate schemas and templates (`.stxt/` directories, `$HOME/.stxt`, `/etc/stxt`, `STXT_PATH`) |

The rest of `es/` and `en/` are the pages of the portal: tutorial, design principles, workflow,
tools, stability and versions, use cases and FAQ. `_index.stxt` is the table of contents.

## Layout

| Directory | Contents |
|---|---|
| `es/`, `en/` | The specifications and the portal pages, one `.stxt` file per page. `es/` is canonical; `en/` mirrors it file by file |
| `conformance/tree/` | **Normative pairs** `name.stxt` ↔ `name.json` for *STXT-TREE-SPEC*: a document and the canonical tree it must produce. One pair per rule (`empty`, `names`, `nfc`, `blank-line`, `block-literal`, `comment-indent`, `nbsp`…). Any implementation must reproduce every pair exactly |
| `.stxt/` | The repository's own resolution directory, as described by STXT-DISCOVERY-SPEC: one definition per namespace. `website/` holds `dev.stxt.website`, the template every portal page validates against; `schemas/`, `templates/`, `examples/` and `tutorial/` hold the example definitions (`com.example.*`, `org.example.*`…) the documents below use |
| `docs/` | Example STXT documents (emails, recipes, configuration files…) that instantiate the definitions in `.stxt/`. They must all parse and validate without errors or warnings |
| `examples/` | More example documents, plus `definitions/`: the same model written twice, as a schema and as a template, kept outside `.stxt/` so the two do not collide as duplicates of one namespace |
| `tutorial/` | The documents the tutorial page is built on |

## The conformance corpus

The implementations do not copy this repository: their test suites locate it as a sibling
directory (`../stxt-lang`, or wherever `STXT_LANG` points) and run over it directly, so a change
here is exercised by every port. What they check:

- every definition in `.stxt/` and `examples/definitions/` loads as a schema or template, and a
  schema and the template of the same namespace validate identically;
- every document in `docs/`, `es/` and `en/` parses and validates against its definition;
- every `Code` block of the portal pages parses and validates, and the ones marked with a
  `# ERROR` comment fail, as the text says they do;
- every pair in `conformance/tree/` produces exactly the canonical JSON tree;
- `SPEC_VERSION` equals `Metadata/Version` of `es/stxt-core-ref.stxt`.

A new conformance pair is added only after checking that all the ports produce the same tree.

## Editing

- Read the whole file before editing. Indentation is the structure: keep tabs as tabs.
- Inside a `>>` block everything is literal text, but its relative indentation is preserved:
  respect it.
- When a specification changes, change its English mirror in the same commit, and raise its
  `Version` as *STXT-SPEC* §1.1 requires: major if something valid stops being valid or changes
  meaning, minor if something is only added; editorial changes do not bump the version.
- A behavioural change of the language goes **spec → `stxt-impl` → every port**, with a
  conformance test in each.

## Ecosystem

| Repository | Role |
|---|---|
| [stxt-impl](https://github.com/stxt-lang/stxt-impl) | Neutral pseudocode of the implementation, second authority after the specifications |
| [stxt-js](https://github.com/stxt-lang/stxt-js) | TypeScript reference port, [`@stxt-lang/core`](https://www.npmjs.com/package/@stxt-lang/core) |
| [stxt-java](https://github.com/stxt-lang/stxt-java) | Java port, [`dev.stxt:stxt-core`](https://central.sonatype.com/artifact/dev.stxt/stxt-core) |
| [stxt-python](https://github.com/stxt-lang/stxt-python) | Python port, [`stxt`](https://pypi.org/project/stxt/) |
| [stxt-cli](https://github.com/stxt-lang/stxt-cli) | The `stxt` command, [`@stxt-lang/cli`](https://www.npmjs.com/package/@stxt-lang/cli) |
| [stxt-vscode](https://github.com/stxt-lang/stxt-vscode) | VS Code extension, [`stxt-lang.stxt`](https://marketplace.visualstudio.com/items?itemName=stxt-lang.stxt) |
| [stxt-play](https://github.com/stxt-lang/stxt-play) | The playground, <https://play.stxt.dev> |

Until 2026-08-22 this repository was named `stxt-web`; the old URL redirects.

## License

MIT © stxt-lang
