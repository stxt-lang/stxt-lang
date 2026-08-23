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

The kit has its own version (`kit` in the manifest, currently **1.1**), independent of the
specifications' versions. Adding cases raises the minor; changing what an existing case expects
raises the major, and only happens when a specification changes.

## The contract

An implementation **conforms to the STXT conformance kit 1.0** if it passes every case in
`manifest.json`. Conformance is declared against the versions of the specifications the kit
covers (`specifications` in the manifest), never against the version of a package:

> Conforms to STXT-SPEC 1.0, STXT-TREE-SPEC 1.0, STXT-SCHEMA-SPEC 1.0 and STXT-TEMPLATE-SPEC 1.0
> (conformance kit 1.1).

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

## Running it

A runner needs to: read `manifest.json`; for every case read `input` as bytes, decode UTF-8,
and either parse and emit the tree, parse and capture the first error, load the definitions and
validate, or load a definition and capture the error; then compare. The three reference runners
are each around 150 lines:

- TypeScript: `stxt-js/src/test/conformance.test.ts`
- Java: `stxt-java/src/test/java/dev/stxt/corpus/ConformanceKitTest.java`
- Python: `stxt-python/tests/test_conformance.py`

Each also checks that the manifest lists every `.stxt` file under `tree/`, `parse/`,
`validate/` and `definition-errors/` exactly once, so a case cannot be added without being
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

## What the kit does not cover yet

Schema discovery (STXT-DISCOVERY-SPEC) and the writer round-trip are exercised today by the
ports' own suites; turning them into manifest categories is the next step of the kit. The
validation categories cover the 19 types, the cardinalities, the closed content model, the
cross-namespace children and every error code of STXT-SCHEMA-SPEC §13.1 and
STXT-TEMPLATE-SPEC §14.1 that an implementation can actually reach; the larger documents of
`docs/` remain a corpus of the existing ports, not kit cases.
