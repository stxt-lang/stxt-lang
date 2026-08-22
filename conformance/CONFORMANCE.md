# The STXT conformance kit

This directory is the executable definition of what it means to implement STXT correctly. It
exists so that anyone can verify an implementation in any language against the specifications
**without reading the test suites of the existing ports**: the cases are data, the expected
results are data, and the runner is a few dozen lines you write once.

- `manifest.json` — the list of cases, with the category, the input file, the expected result
  and the section of the specification each one exercises.
- `tree/` — input documents and the canonical JSON tree each one must produce.
- `parse/` — invalid documents and the error each one must be rejected with.

The kit has its own version (`kit` in the manifest, currently **1.0**), independent of the
specifications' versions. Adding cases raises the minor; changing what an existing case expects
raises the major, and only happens when a specification changes.

## The contract

An implementation **conforms to the STXT conformance kit 1.0** if it passes every case in
`manifest.json`. Conformance is declared against the versions of the specifications the kit
covers (`specifications` in the manifest), never against the version of a package:

> Conforms to STXT-SPEC 1.0 and STXT-TREE-SPEC 1.0 (conformance kit 1.0).

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

## Running it

A runner needs to: read `manifest.json`; for every case read `input` as bytes, decode UTF-8,
and either parse and emit the tree, or parse and capture the first error; then compare. The
three reference runners are each under a hundred lines:

- TypeScript: `stxt-js/src/test/conformance.test.ts`
- Java: `stxt-java/src/test/java/dev/stxt/corpus/ConformanceKitTest.java`
- Python: `stxt-python/tests/test_conformance.py`

Each also checks that the manifest lists every `.stxt` file under `tree/` and `parse/` exactly
once, so a case cannot be added without being declared.

## Adding a case

1. Write the input under `tree/` or `parse/` with a name that says which rule it exercises.
2. For `tree`, write the expected `.json` by hand from the specification, not by running a
   port and saving its output.
3. Add the entry to `manifest.json`, with the specification section in `spec`.
4. Run the three reference ports. A case is accepted only when all three agree with the
   expected result; if they do not, the disagreement is a finding to resolve in the
   specification or the ports first, and the case waits.
5. Raise `kit` (minor).

## What the kit does not cover yet

Only the syntax (STXT-SPEC) and the tree (STXT-TREE-SPEC). Schema and template validation
(STXT-SCHEMA-SPEC, STXT-TEMPLATE-SPEC), the equivalence between a schema and its template,
schema discovery and the writer round-trip are exercised today by the ports' own suites over
the rest of this repository (`docs/`, `.stxt/`, `examples/definitions/`); turning them into
manifest categories is the next step of the kit.
