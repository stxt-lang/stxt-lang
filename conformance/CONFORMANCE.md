# The STXT conformance kit

This directory is the executable definition of what it means to implement STXT correctly. It
exists so that anyone can verify an implementation in any language against the specifications
**without reading the test suites of the existing ports**: the cases are data, the expected
results are data, and the runner is a few dozen lines you write once.

- `manifest.json` — the list of cases, with the category, the input file, the expected result
  and the section of the specification each one exercises.
- `tree/` — input documents and the canonical JSON tree each one must produce.
- `parse/` — invalid documents and the error each one must be rejected with.
- `definitions/` — the schemas and templates the validation cases use, named
  `<namespace>.schema.stxt` or `<namespace>.template.stxt`; a namespace described both ways is
  a pair that must behave identically.
- `validate/` — documents to validate against those definitions, valid and invalid.
- `definition-errors/` — invalid schemas and templates, and the error each one must be
  rejected with.
- `discovery/` — the files the discovery cases mount in a virtual file system: definitions,
  and a few files that are not.
- `writer/` — the canonical text form, in both indentation styles, of the documents of
  `tree/`.
- `format/` — documents to reformat, each with its reformatted text in both styles.

The kit has its own version (`kit` in the manifest, currently **1.0**), independent of the
specifications' versions. Adding cases raises the minor; changing what an existing case expects
raises the major, and only happens when a specification changes.

## The contract

The specifications are layered: the syntax is mandatory, and schemas, templates and discovery
are optional layers on top of it (STXT-SPEC §12, §17.3; STXT-DISCOVERY-SPEC §9). The kit
follows the same structure with **profiles**, declared in `profiles` of the manifest. Each
profile includes the previous one and names the categories —and, for `schema`, the subset of
cases— an implementation must pass:

| Profile | Includes | Specifications it certifies | Cases |
|---|---|---|---|
| `core` | — | STXT-SPEC, STXT-TREE-SPEC | `tree`, `parse-error` (59) |
| `schema` | `core` | + STXT-SCHEMA-SPEC | `validate`, `validate-error` with the definition sets that hold no template, `definition-error` with `kind` = `schema` (+129) |
| `template` | `schema` | + STXT-TEMPLATE-SPEC | the same categories, every set and every case (+38) |
| `discovery` | `template` | + STXT-DISCOVERY-SPEC | `discovery` (+23) |
| `text` | `core` | STXT-TREE-SPEC §11–12 (the writing operations) | `writer`, `format` (+27) |

`text` is a side branch: it needs only `core`, and `discovery` does not include it. An
implementation that offers the writer and the formatter certifies it on top of whichever
other profile it claims: "kit 1.0, `discovery` and `text` profiles".

An implementation **conforms to a profile of the kit** if it passes every case of that profile
and of the ones it includes. Conformance is declared against the versions of the specifications
the profile certifies (`specifications` in the manifest), never against the version of a
package:

> Conforms to STXT-SPEC 1.0 and STXT-TREE-SPEC 1.0 (conformance kit 1.0, `core` profile).

> Conforms to STXT-SPEC 1.0, STXT-TREE-SPEC 1.0, STXT-SCHEMA-SPEC 1.0, STXT-TEMPLATE-SPEC 1.0
> and STXT-DISCOVERY-SPEC 1.0 (conformance kit 1.0, `discovery` and `text` profiles).

The `core` profile asks for the canonical tree even though STXT-TREE-SPEC calls emitting it an
optional capability of a parser: the tree is how the kit checks *what* was parsed, and without
it a parser could only prove what it rejects. A parser that does not expose the tree can still
run `parse-error`, but cannot claim the profile.

Every input is a UTF-8 file read **byte by byte**: do not normalise line endings, Unicode
forms or whitespace when loading it (`.gitattributes` keeps git from doing it either). Several
cases depend on a BOM, a CRLF, a no-break space or a decomposed accent surviving the trip.

### Category `tree`

Parse `input`; it must succeed. Emit the canonical tree of STXT-TREE-SPEC and compare it with
`expected` **as a JSON value**: same members, same order of nodes and lines, same strings. Never
compare the text of the two files; key order and formatting are free.

### Category `parse-error`

Parse `input`; it must fail. The **first** error reported must carry `error.code` (one of the
stable codes of STXT-SPEC §11.1) and `error.line` (1-based, the line where the condition is
detected). Whether the implementation stops at the first error or collects them all is up to
it; the kit only looks at the first.

### Category `validate`

`definitions` is a list of **sets** of definition files. For every set: load its files into one
provider (schemas and templates told apart by their suffix), parse `input`, and validate each of
its root nodes with the recursive validator, the one that also validates the children declared
in other namespaces. There must be no error with any set. A case with two sets is the same
namespace described as a schema and as a template: both must accept the document. A case with
an empty set (`[[]]`) has no definition at all: a document without namespace is never
validated.

### Category `validate-error`

Same, but with every set the **first** error must carry `error.code` (a code of the document
table of STXT-SCHEMA-SPEC §13.1) and `error.line`: the line of the node the error is about — the
child for `CHILD_NOT_DECLARED`, the parent for `TOO_FEW_CHILDREN` / `TOO_MANY_CHILDREN`, the
node itself for a value or form error.

### Category `definition-error`

Load `input` as a definition of `kind` (`schema` or `template`); it must fail. The first error
must carry `error.code` and `error.line`. Two conventions follow from the specifications:

- A schema or template document is validated **as a document against its meta-definition
  first** (STXT-SCHEMA-SPEC §13.1, STXT-TEMPLATE-SPEC §14.1), so its form errors come with the
  codes of the document table: a root that is not `Schema` is `NODE_NOT_DEFINED_IN_SCHEMA`, a
  `Node` written as a block is `BLOCK_FORM_NOT_ALLOWED`, a missing `Structure` is
  `TOO_FEW_CHILDREN`.
- Errors about the definition as a whole rather than one line (`NODE_DUPLICATED`,
  `CHILD_DUPLICATED`, `CHILD_NOT_DEFINED`, `SCHEMA_MULTIPLE_ROOTS`, `TEMPLATE_MULTIPLE_ROOTS`)
  carry **line 0**. Errors inside a `Structure >>` or `Description >>` block carry the line of
  the template, not the line within the block.

### Category `discovery`

The input is not a file but a **file system**. `files` maps virtual absolute paths (always
`/`-separated, rooted at `/`) to real files of this directory; `dirs` lists empty directories
that must exist too (every ancestor of a file exists implicitly). `environment` is what the
host would tell the tool: `stxtPath` (`null` = the variable is not defined, `[]` = defined and
empty, otherwise the list of directories in order), `userDir` and `systemDir` (`null` = no such
level). Mount them in an in-memory file system, give them to the resolver and resolve for
`documentDir` (`null` = a document with no location). Then compare:

- `expected.chain`: the ordered list of level directories;
- `expected.active`: for each namespace, the virtual path of its active definition, or `null`
  (undefined, or conflicting at the nearest level that defines it);
- `expected.errors`: the resolution errors of STXT-DISCOVERY-SPEC §8, as a set: each expected
  error must match one actual error by `code` and, when given, `file` and `namespace`. For a
  duplicate namespace the file is not given, because which of the two files is reported
  depends on the listing order of the directory.

The three reference runners mount the cases with the same in-memory adapters their own
discovery tests use (`DiscoveryFileSystem` / `DiscoveryEnvironment`), so no real file system
is touched.

### Category `writer`

Parse `input` and write its root nodes in the canonical text form of STXT-TREE-SPEC §11.1,
once with tabs and once with four spaces; each result must equal `expected.tabs` /
`expected.spaces` **byte for byte** (`LF` endings, final newline included). The inputs are
the documents of `tree/`: the writer is a function of the tree, so the same tree cases serve.

### Category `format`

Reformat `input` as STXT-TREE-SPEC §12.1 says, once per style; the text must equal
`expected.tabs` / `expected.spaces` byte for byte (the expected file keeps `CRLF`, the missing
final newline or the dropped BOM of its input), and the syntax errors reported must be exactly
`errors` — code and line, in order — with both styles. A case with errors is there to check
that the document is **not** repaired.

## Running it

A runner needs to: read `manifest.json`; for every case read `input` as bytes, decode UTF-8,
and either parse and emit the tree, parse and capture the first error, load the definitions and
validate, load a definition and capture the error, mount a virtual file system and resolve, or
write and reformat; then compare. The three reference runners are each around 200 lines:

- TypeScript: `stxt-js/src/test/conformance.test.ts`
- Java: `stxt-java/src/test/java/dev/stxt/corpus/ConformanceKitTest.java`
- Python: `stxt-python/tests/test_conformance.py`

Each also checks that the manifest lists every `.stxt` file under `tree/`, `parse/`,
`validate/`, `definition-errors/` and `format/` (inputs, not the `.tabs` / `.spaces` outputs)
exactly once, so a case cannot be added without being
declared.

## Adding a case

1. Write the input under the directory of its category with a name that says which rule it
   exercises; a new definition goes to `definitions/`, ideally as a schema **and** a template.
2. For `tree`, write the expected `.json` by hand from the specification, not by running a
   port and saving its output.
3. Add the entry to `manifest.json`, with the specification section in `spec`.
4. Run the three reference ports. A case is accepted only when all three agree with the
   expected result; if they do not, the disagreement is a finding to resolve in the
   specification or the ports first, and the case waits.
5. Raise `kit` (minor).

## What the kit covers

Every operation the five specifications define, plus the two writing operations of
STXT-TREE-SPEC §11–12, which became normative on 2026-08-23 so that the `text` profile could
exist. The validation categories cover the 19 types, the cardinalities, the closed content model, the
cross-namespace children and every error code of STXT-SCHEMA-SPEC §13.1 and
STXT-TEMPLATE-SPEC §14.1 that an implementation can actually reach; the larger documents of
`docs/` remain a corpus of the existing ports, not kit cases.
