# Internet-Draft: the `text/stxt` media type

Source of the Internet-Draft that requests the registration of `text/stxt` in the IANA
standards tree, as an Informational RFC (RFC 6838 §3.1 requires an IETF-stream RFC for
that tree). The model is `text/markdown` (RFC 7763), an individual submission sponsored
by an Area Director.

- `draft-stxt-media-type-00.md` — the draft, in [kramdown-rfc](https://github.com/cabo/kramdown-rfc)
  markdown. It summarizes the syntax, references STXT-SPEC 1.0 normatively, fixes the
  encoding conventions of the media type and carries the registration template.

## Building

No tool is needed to edit it. To render it, either:

- paste or upload the file at <https://author-tools.ietf.org/> (kramdown-rfc input, outputs
  XML, text and HTML), or
- install the tool and run it locally:

  ```sh
  gem install kramdown-rfc
  pip install xml2rfc
  kdrfc draft-stxt-media-type-00.md     # -> .xml, .txt, .html
  ```

## Submitting

1. Render and read the text output; check the idnits report that the author tools produce.
2. Submit at <https://datatracker.ietf.org/submit/> (a datatracker account is needed).
3. Announce it on `dispatch@ietf.org` asking for sponsorship by an ART Area Director,
   with a short note on what STXT is, the adoption it has, and the appendix on why not
   YAML/TOML/JSON.
4. Each revision increments the `-NN` suffix in the file name and in `docname`.

Until the registration exists, `text/stxt` is used unregistered, as `text/markdown` and
`application/json` were before their RFCs; `text/vnd.stxt` is deliberately not registered
in the meantime.
