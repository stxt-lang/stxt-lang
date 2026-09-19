# stxt-lang

**STXT** is a **Human-First** language, designed for documents and structured data.
This repository holds its five specifications, the conformance kit and the source of the
portal, <https://stxt.dev>. Everything here is written in STXT.

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

## The specifications

They live in `es/` (the canonical version, in Spanish), with an English mirror in `en/`.

| File | Specification | What it defines |
|---|---|---|
| `stxt-core-ref.stxt` | **STXT-SPEC** | The base syntax: indentation, inline nodes, text blocks, namespaces, comments, name normalisation, error rules and security |
| `stxt-tree-ref.stxt` | **STXT-TREE-SPEC** | The canonical JSON representation of a document's logical tree |
| `stxt-schema-ref.stxt` | **STXT-SCHEMA-SPEC** | `@stxt.schema`: semantic validation with `Node`/`Children`/`Child`, types and cardinalities |
| `stxt-template-ref.stxt` | **STXT-TEMPLATE-SPEC** | `@stxt.template`: the simplified authoring form, compilable to an equivalent schema |
| `stxt-discovery-ref.stxt` | **STXT-DISCOVERY-SPEC** | How tools locate schemas and templates (`.stxt/` directories, `$HOME/.stxt`, `/etc/stxt`, `STXT_PATH`) |

They carry no version number. Each one carries two values in its `Metadata`:

- **`Last modif`**: the date of its current text.
- **`Status`**: how much stability it promises. It only moves forward:
  `Genesis` → `Aurora` → `Zenith` → `Twilight` (*STXT-SPEC* §1.1).

The rest of `es/` and `en/` are the pages of the portal: tutorial, design principles, working
environment, tools, stability, comparisons, use cases and FAQ. `_index.stxt` is the table of contents.

## Layout

| Directory | Contents |
|---|---|
| `es/`, `en/` | The specifications and the portal pages, one `.stxt` file per page. `es/` is canonical, and `en/` mirrors it file by file |
| `conformance/` | The conformance kit (see below) |
| `.stxt/` | The repository's own resolution directory (STXT-DISCOVERY-SPEC), with one definition per namespace. `website/` holds `dev.stxt.website`, the template every portal page validates against. The other directories hold the example definitions (`com.example.*`, `org.example.*`...) |
| `docs/` | Example documents (emails, recipes, configuration files...) that use the definitions in `.stxt/`. They all parse and validate without errors or warnings |
| `examples/` | More example documents, plus `definitions/`: the same model written twice, as a schema and as a template. It is kept outside `.stxt/` so the two do not collide as duplicates of one namespace |

## The conformance kit

`conformance/` holds data-only cases that any implementation can run with a small runner.
The contract, and the declaration an implementation makes when it passes, are in
[`conformance/CONFORMANCE.md`](conformance/CONFORMANCE.md).

`manifest.json` lists every case: its category, its input, the expected result and, for the rules
the specifications leave in SHOULD or MAY, its requirement level.

| Directory | Cases | Specification |
|---|---|---|
| `tree/` | Documents, and the canonical JSON tree each must produce | *STXT-TREE-SPEC* |
| `parse/` | Invalid documents, with the error code and the line | *STXT-SPEC* §11.1 |
| `definitions/` | Schemas and templates, in pairs | |
| `validate/` | Documents that must validate, or fail, against those definitions | *STXT-SCHEMA-SPEC* §13.1 |
| `definition-errors/` | Invalid schemas and templates | *STXT-SCHEMA-SPEC* §13.1, *STXT-TEMPLATE-SPEC* §14.1 |
| `discovery/` | A virtual file system, and the chain, the active definitions and the errors it must resolve to | *STXT-DISCOVERY-SPEC* |
| `writer/`, `format/` | The canonical and the reformatted texts | *STXT-TREE-SPEC* §11 and §12 |

The cases are grouped in cumulative profiles (`core`, `schema`, `template`, `discovery`, plus
`text` for the writer and the formatter), so an implementation can certify only the layers it offers.

A new case is added only after checking that all the ports agree with its expected result.

## The corpus

The ports also run their test suites over the rest of the repository. They do not copy it:
they locate it as a sibling directory (`../stxt-lang`, or wherever `STXT_LANG` points), so a
change here is exercised by every port. What they check:

- Every definition in `.stxt/` and `examples/definitions/` loads, and a schema and the template
  of the same namespace validate identically.
- Every document in `docs/`, `es/` and `en/` parses and validates against its definition.
- Every `Code` block of the portal pages parses and validates. The ones marked with a
  `# ERROR` comment must fail.
- Every case of the conformance kit passes.
- `SPEC_VERSION` equals the STXT-SPEC date that `conformance/manifest.json` pins.

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

## License

MIT © stxt-lang
