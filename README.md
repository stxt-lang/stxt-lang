# stxt-lang

The definition of **STXT**: the five normative specifications, the conformance
corpus, and the source of the language portal at <https://stxt.dev>. Everything here is written
in STXT itself.

STXT is a plain-text format for structured documents: no braces, no closing tags, just
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
| `conformance/` | **The conformance kit**: `manifest.json` lists every case with its category, input and expected result; `tree/` holds documents with the canonical JSON tree each must produce (*STXT-TREE-SPEC*), `parse/` invalid documents with the error code and line each must be rejected with (*STXT-SPEC* §11.1), `definitions/` schemas and templates in pairs, `validate/` documents that must validate or fail against them (*STXT-SCHEMA-SPEC* §13.1), `definition-errors/` invalid schemas and templates (§13.1, *STXT-TEMPLATE-SPEC* §14.1), `discovery/` the files of the discovery cases, which describe a virtual file system in the manifest and the chain, active definitions and errors it must resolve to (*STXT-DISCOVERY-SPEC*), and `writer/` and `format/` the canonical and reformatted texts of *STXT-TREE-SPEC* §11–12. The contract and how to run it are in [`conformance/CONFORMANCE.md`](conformance/CONFORMANCE.md) |
| `.stxt/` | The repository's own resolution directory, as described by STXT-DISCOVERY-SPEC: one definition per namespace. `website/` holds `dev.stxt.website`, the template every portal page validates against; `schemas/`, `templates/`, `examples/` and `tutorial/` hold the example definitions (`com.example.*`, `org.example.*`…) the documents below use |
| `docs/` | Example STXT documents (emails, recipes, configuration files…) that instantiate the definitions in `.stxt/`. They must all parse and validate without errors or warnings |
| `examples/` | More example documents, plus `definitions/`: the same model written twice, as a schema and as a template, kept outside `.stxt/` so the two do not collide as duplicates of one namespace |
| `tutorial/` | The documents the tutorial page is built on |

## The conformance kit and the corpus

`conformance/` is the kit proper: data-only cases any implementation can run with a small
runner, and the declaration an implementation makes when it passes them
([`CONFORMANCE.md`](conformance/CONFORMANCE.md)). It covers the five specifications in cumulative
profiles —`core`, `schema`, `template`, `discovery`, plus `text` for the writer and the
formatter— so an implementation can certify just the layers it offers.

The rest of the repository is the corpus the existing ports also run over. They do not copy it:
their test suites locate it as a sibling directory (`../stxt-lang`, or wherever `STXT_LANG`
points), so a change here is exercised by every port. What they check:

- every definition in `.stxt/` and `examples/definitions/` loads as a schema or template, and a
  schema and the template of the same namespace validate identically;
- every document in `docs/`, `es/` and `en/` parses and validates against its definition;
- every `Code` block of the portal pages parses and validates, and the ones marked with a
  `# ERROR` comment fail, as the text says they do;
- every case of the conformance kit passes;
- `SPEC_VERSION` equals `Metadata/Version` of `es/stxt-core-ref.stxt`.

A new kit case is added only after checking that all the ports agree with its expected result.

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
