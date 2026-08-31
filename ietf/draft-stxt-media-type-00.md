---
title: "The text/stxt Media Type"
abbrev: "text/stxt"
docname: draft-stxt-media-type-00
category: info
submissiontype: IETF
ipr: trust200902
area: ART
keyword:
  - STXT
  - media type
  - text/stxt

stand_alone: yes
pi: [toc, sortrefs, symrefs]

author:
  -
    ins: J. Costa Mombiela
    name: Joan Costa Mombiela
    email: joan.costa.mombiela@gmail.com
    uri: https://stxt.dev

normative:
  RFC2119:
  RFC8174:
  RFC3629:
  RFC6838:
  STXT-SPEC:
    title: "STXT Core — Base syntax of the language, version 1.0"
    author:
      -
        ins: J. Costa Mombiela
        name: Joan Costa Mombiela
    date: 2026
    target: https://stxt.dev/stxt-core-ref.html
  UNICODE:
    title: "The Unicode Standard"
    author:
      -
        org: The Unicode Consortium
    target: https://www.unicode.org/versions/latest/
  UAX15:
    title: "Unicode Standard Annex #15: Unicode Normalization Forms"
    author:
      -
        org: The Unicode Consortium
    target: https://www.unicode.org/reports/tr15/

informative:
  RFC2046:
  RFC6657:
  RFC7763:
  RFC8259:
  STXT-TREE-SPEC:
    title: "STXT Tree — Canonical JSON representation of the logical tree, version 1.0"
    author:
      -
        ins: J. Costa Mombiela
        name: Joan Costa Mombiela
    date: 2026
    target: https://stxt.dev/stxt-tree-ref.html
  STXT-SCHEMA-SPEC:
    title: "STXT Schema — Semantic validation, version 1.0"
    author:
      -
        ins: J. Costa Mombiela
        name: Joan Costa Mombiela
    date: 2026
    target: https://stxt.dev/stxt-schema-ref.html
  STXT-CONFORMANCE:
    title: "STXT Conformance Kit"
    author:
      -
        ins: J. Costa Mombiela
        name: Joan Costa Mombiela
    date: 2026
    target: https://github.com/stxt-lang/stxt-lang/tree/master/conformance
  XML:
    title: "Extensible Markup Language (XML) 1.0 (Fifth Edition)"
    author:
      -
        org: W3C
    date: 2008
    target: https://www.w3.org/TR/xml/
  YAML:
    title: "YAML Ain't Markup Language (YAML) Version 1.2"
    author:
      -
        org: YAML Language Development Team
    date: 2021
    target: https://yaml.org/spec/1.2.2/
  TOML:
    title: "TOML v1.0.0"
    author:
      -
        ins: T. Preston-Werner
        name: Tom Preston-Werner
    date: 2021
    target: https://toml.io/en/v1.0.0

--- abstract

This document registers the text/stxt media type for STXT, a plain-text,
indentation-based format for hierarchical documents that mix structured fields and free
text. It summarizes the syntax, specifies the encoding and line-ending conventions that
apply to the media type, and records the security properties of the format. The normative
definition of the syntax is the STXT Core specification, version 1.0, which this document
references.

--- middle

# Introduction

STXT is a textual format for hierarchical documents. Its design goal is to
be read and written by people first — a document looks like an indented outline of
"Name: value" lines and blocks of prose — while remaining trivial to parse: every line is
classified by looking at that line alone, and there are no escape sequences, quoting rules,
entities, anchors, includes, or evaluation of any kind.

The format is used for documents, content sources for publishing systems, configuration
files, and structured output produced by programs and by large language models. Its
structure can optionally be validated against a schema or template expressed in STXT
itself; that validation is a separate layer, defined in {{STXT-SCHEMA-SPEC}}, and is not
part of the media type.

This document registers the media type text/stxt in accordance with {{RFC6838}}. The
syntax itself is defined normatively by {{STXT-SPEC}}; {{syntax}} of this document is an
informative summary so that a reader of the registration can recognize the format and
understand the considerations in {{encoding}} and {{security}}.

## Conventions

{::boilerplate bcp14-tagged}

# Summary of the Syntax {#syntax}

This section is informative. Where it differs from {{STXT-SPEC}}, the specification
prevails.

## Nodes

An STXT document is a sequence of lines. Every non-empty line that is neither a comment
nor part of a text block defines a *node*. A node has one of two forms:

~~~
Name: inline value
Name >>
~~~

The first form is an *inline node*: the value is the rest of the line, trimmed of leading
and trailing blanks, and MAY be empty. The second form is a *block node*: the node has no
value on its own line, and every following line indented more deeply than the node is the
literal text of the block. The line of a block node contains nothing after ">>" but
optional blanks.

The name MUST NOT be empty. It consists of Unicode {{UNICODE}} letters, digits and combining marks
plus the separators "-", "_" and space, and is compared through a canonical form: Unicode
NFC normalization {{UAX15}}, lowercasing, and collapsing of separator sequences into a
single "-". Thus "Node name", "node-name" and "NODE_NAME" are the same node, whereas
diacritics and scripts are preserved: "Cana" and "Caña" are different nodes.

## Indentation

Indentation is the hierarchy. A line indented one level deeper than the preceding node is
a child of that node. One tab is one level; alternatively, each group of exactly four
spaces is one level. The indentation of a single line MUST be homogeneous (only tabs or
only spaces); a number of spaces that is not a multiple of four, a mix of tabs and spaces
on one line, an indented first line, or a jump of more than one level are all parse
errors. Because the level of a line is a function of that line alone, a parser needs no
memory of how earlier lines were indented.

A document MAY have any number of root (level 0) nodes, including none; the order of
sibling nodes is preserved. As a consequence, the concatenation of two valid documents is a
valid document.

## Text blocks

Everything indented below a block node is literal text. Lines inside a block are not
interpreted in any way: a line containing ":", ">>" or a leading "#" is text, not a node or
a comment. Only the fixed block-level prefix of each line is removed; deeper indentation is
kept as part of the text, trailing blanks are removed, and empty lines that precede more
text are preserved (the final empty lines of a block are discarded when it closes). The
block ends at the first non-empty line indented at or above the level of the block node,
or at the end of the document.

~~~
Report: Quarterly summary
    Date: 2026-03-02
    Author: Ana García
    Summary >>
        The team agreed to move invoicing to the new service.
        Payments stay on the legacy system: no change there.

        # This line is text, not a comment.
    Section:
        Title: Risks
        Content >>
            The legacy export has no test coverage.
~~~

## Namespaces

A node MAY carry a namespace in parentheses after its name, such as
"Report (com.example.reports):". A namespace is a dot-separated sequence of at least two
ASCII labels, "[a-z0-9]+", optionally prefixed by "@"; uppercase ASCII is accepted in the
input and normalized to lowercase. Children inherit the namespace of their parent; root
nodes without one have the empty namespace, and there is no inheritance between sibling
root nodes. Namespaces under "@stxt" are reserved for the language itself. The ASCII
restriction is deliberate (see {{security}}).

## Comments

Outside a text block, a line whose first non-blank character is "#" is a comment. Comments
are discarded; their indentation is validated like that of a node but does not alter the
hierarchy.

## Logical tree

Parsing yields an ordered tree of named nodes with inline values or lists of text lines,
plus the effective namespace of each node. {{STXT-TREE-SPEC}} defines an interoperable JSON
representation of that tree; it is not part of the media type.

# Encoding Considerations {#encoding}

An STXT document is text encoded in UTF-8 {{RFC3629}}. The format does not define any
other encoding. A document SHOULD be written without a byte order mark; a parser SHOULD
accept a leading U+FEFF and discard it.

Both LF and CRLF line endings are accepted by a conforming parser; a trailing CR is
discarded before the line is processed and never forms part of a value. LF SHOULD be used
when writing. As with every "text" media type, the canonical form for transport under
{{RFC2046}} uses CRLF, and implementations that convert line endings in transit do not
alter the meaning of a document.

The only characters that count as blanks — for indentation, for trimming, and for deciding
that a line is empty — are U+0020 (space) and U+0009 (tab). Every other Unicode space or
control character is content. Parsers MUST NOT apply a broader platform notion of
whitespace.

The "charset" parameter is not required. If present, its value MUST be "utf-8" (compared
case-insensitively, as {{RFC6657}} requires for charset names). A recipient that receives
any other value SHOULD treat the document as malformed rather than transcode it.

# Interoperability Considerations {#interop}

STXT 1.0 is the version of {{STXT-SPEC}} referenced by this registration. The
specification commits that every document valid under version 1.0 remains valid, with the
same meaning, under every later 1.x version; an incompatible change would raise the major
version. There is therefore no version parameter on the media type: a recipient that
implements any 1.x parser reads any 1.x document.

STXT has no escape mechanism and no quoting; a value that must contain a line break is
written as a text block. A document that fails any rule of the syntax is rejected as a
whole; conforming parsers report stable, language-independent error codes defined in
{{STXT-SPEC}}, so that tools written in different languages reject the same input for the
same reason.

Semantic validation against schemas and templates is optional and outside the media type:
a document that names a namespace for which no definition is available is still a valid
STXT document. A publicly available conformance kit {{STXT-CONFORMANCE}} allows an
implementation to verify that it produces the same logical tree, or the same error, as the
reference implementations for several hundred documented cases.

# Security Considerations {#security}

STXT was designed with parsing safety as a primary goal, and a conforming parser is a
small, line-oriented state machine. The following properties are stated normatively in
{{STXT-SPEC}}, Section 15, and apply to every document of this media type:

- The format has no entities, macros, anchors, aliases, references, includes, or any
  mechanism to name a remote or local resource. Entity-expansion attacks such as "billion
  laughs" and external-entity disclosure have no equivalent.

- The format has no tags, type annotations, constructors, or evaluation of any kind. The
  only result of parsing is a tree of names and strings; nothing in a document can cause a
  parser to instantiate objects or run code. Implementations MUST NOT add extensions that
  load external content or evaluate content without explicit, opt-in security measures.

- The content of a text block is never interpreted. Text that happens to contain STXT
  syntax cannot change the structure of the document it is embedded in, which removes the
  usual injection risk when a program writes untrusted text into a document.

- Namespaces are restricted to ASCII, so identifiers that decide how a document is
  interpreted cannot be spoofed with visually confusable Unicode characters. Node names do
  accept all scripts, but are compared after NFC normalization and lowercasing, and they
  do not select any behavior by themselves.

- Structural complexity is bounded by the strict indentation rules: levels are consecutive
  and there are no backward references, so a parser MAY operate in streaming mode,
  emitting each root node as soon as the next one begins, with memory proportional to the
  largest root tree rather than to the document size. {{STXT-SPEC}} additionally
  recommends configurable parser limits — nesting depth, line length and input size — with
  stable error codes and default values that the official implementations enable;
  implementations SHOULD apply such limits when processing untrusted input.

Beyond the format itself, the usual considerations for text apply: a document may contain
bidirectional control characters or other content that renders misleadingly in a
viewer, and an application that displays or acts on values taken from a document is
responsible for the meaning it assigns to them. An application that resolves schemas or
templates by namespace is responsible for where it loads them from; the format does not
define or trigger that resolution.

# IANA Considerations {#iana}

IANA is requested to register the following media type in the standards tree, per
{{RFC6838}}.

Type name:
: text

Subtype name:
: stxt

Required parameters:
: None.

Optional parameters:
: charset. If present, MUST be "utf-8"; the content is always UTF-8. See {{encoding}}.

Encoding considerations:
: 8bit. STXT documents are UTF-8 text; they contain line breaks and MAY contain any
  Unicode character outside the structural positions described in {{syntax}}. See
  {{encoding}}.

Security considerations:
: See {{security}} of this document and Section 15 of {{STXT-SPEC}}.

Interoperability considerations:
: See {{interop}}. Documents are versioned by the specification, not by the media type.

Published specification:
: {{STXT-SPEC}}, available at https://stxt.dev/stxt-core-ref.html, and this document.

Applications that use this media type:
: Document authoring and publishing tools, static site generators, configuration readers,
  editors and language servers, validation pipelines, and programs that exchange
  structured documents that include free text, including output produced by language
  models and validated before use.

Fragment identifier considerations:
: None. This registration does not define fragment identifier syntax for text/stxt;
  applications that need to address a node within a document are expected to do so by
  other means.

Additional information:
: Deprecated alias names for this type: None.

    Magic number(s): None; an STXT document has no signature, and its first line is a
    root node or a comment at level 0.

    File extension(s): .stxt

    Macintosh file type code(s): TEXT

Person & email address to contact for further information:
: Joan Costa Mombiela, joan.costa.mombiela@gmail.com

Intended usage:
: COMMON

Restrictions on usage:
: None.

Author:
: Joan Costa Mombiela

Change controller:
: IETF

Provisional registration? (standards tree only):
: No

--- back

# Relationship to Other Formats {#others}

This appendix is informative. It explains why the author did not reuse an existing
registered format, which is a question that reasonably arises for a new "text" subtype.

STXT overlaps with XML {{XML}}, YAML {{YAML}}, TOML {{TOML}} and JSON {{RFC8259}} in
that all five encode hierarchical data in text, and with Markdown {{RFC7763}} in that it
is meant to be written by hand. It differs from each of them in a way that is the reason
for its existence:

- Compared with XML, which is the closest in purpose, STXT is a deliberate replacement
  for the common case. XML gives a document structure, namespaces and validation against
  a schema, and so does STXT: a node with children is an element, a namespace in
  parentheses is a namespace declaration that the descendants inherit, and a schema or
  template validates names, cardinalities and value types. What STXT leaves out is what
  makes XML costly to read and to parse safely: closing tags, attributes, entities and
  entity expansion, DTDs and external subsets, processing instructions, CDATA sections
  and escaping of markup characters inside text. A text block holds arbitrary prose
  without any escaping; the hierarchy is the indentation a person would write anyway.
  The result covers most of what XML is used for in documents and configuration, in a
  form that people write by hand, with a parser that is a small state machine instead of
  a full XML processor and its attack surface.

- Compared with YAML, STXT has no implicit typing, no flow syntax, no anchors or aliases,
  no tags, no multi-document markers and no indentation-sensitive scalar folding rules. A
  YAML parser is several thousand lines, and YAML 1.1 — still what most libraries
  implement — has a long history of surprising coercions ("no", "022", "22:30") and of
  unsafe loading in common libraries.
  An STXT parser is line-oriented and every value is a string; the two forms of a node
  and the four-space rule are the whole syntax. And where YAML stops at syntax, STXT
  goes on: YAML has no namespaces — a "Title" in one document and in another are told
  apart only by convention — and does not define how a document is validated; validation
  comes from outside, typically with JSON Schema applied to the already-loaded result,
  after the coercions have taken effect. In STXT the namespace is part of the language
  and is inherited by children, and validation is a specification of its own, applied to
  the text as written: it declares which nodes exist, how many and of what type, and a
  tool rejects what does not fit before any program loads it.

- Compared with TOML, STXT is nested by indentation rather than by table headers, keeps the
  order of nodes, allows the same name to repeat (a list is simply repeated siblings), and
  is meant for documents with paragraphs of prose, not only for configuration. TOML's
  quoting and escape rules are precisely what STXT omits. TOML has no namespaces or
  schema either: all keys live in the same space, and there is no way to declare which
  ones are valid, mandatory or of what type beyond the type each value's syntax implies. In
  STXT a configuration file carries its namespace, and a ten-line template states which
  keys it accepts, which are mandatory and which values they may take; the same validator
  serves the configuration file and the prose document.

- Compared with JSON, STXT has no escaping and no quoting, which makes it both easier for
  people to write and a more reliable output surface for programs and language models
  that must embed long, arbitrary text; and it has comments. JSON remains the natural
  interchange form of the parsed tree, which is why {{STXT-TREE-SPEC}} defines one.

- Compared with Markdown, STXT is a data format with a defined tree and a defined notion of
  validity: a Markdown document is never invalid, and its structure is not addressable.
  The two compose well — a text block commonly contains Markdown — and that composition is
  one of the intended uses of the format.

# Example Document {#example}

This appendix is informative. The document below is valid STXT. It uses tabs for
indentation, shown here as four spaces; a document indented with four spaces per level
parses to the same tree.

~~~
# A book record in a publisher's catalogue.
Book (com.example.catalogue): Modern Software Architecture
    Authors:
        Author: María Pérez
        Author: Juan García
    ISBN: 978-84-123456-7-8
    Published: 2025-10-01
    Summary >>
        A practical introduction to the subject, in four parts.

        Part one sets the vocabulary: components, connectors, views.
    Chapter: Introduction
        Content >>
            Goals of the book and how to read it.
~~~

# Acknowledgements
{:numbered="false"}

The structure of this registration follows that of {{RFC7763}}.
