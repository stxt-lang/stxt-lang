# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es este repositorio

Contenido fuente del sitio web / libro del lenguaje **STXT (Semantic Text)**, un formato textual jerárquico "Human-First" diseñado para ser legible por personas y trivial de parsear por máquinas. Todo el contenido está escrito en el propio lenguaje STXT (ficheros `.stxt`). No hay código fuente, sistema de build, linter ni tests: los cambios se validan leyendo las especificaciones y manteniendo la coherencia entre ficheros.

## Los cuatro ficheros más importantes

Las especificaciones normativas del lenguaje viven en `es/` (versión canónica) con espejo en `en/`:

1. **`es/stxt-core-ref.stxt`** — Especificación de la sintaxis base (STXT-SPEC): nodos inline `Nombre: valor` y bloques de texto `Nombre >>`, indentación estricta (tabs = 1 nivel, o múltiplos de 4 espacios), namespaces `(a.b.c)`, comentarios `#`, normalización de nombres/valores, reglas de error y seguridad.
2. **`es/stxt-schema-ref.stxt`** — Especificación de esquemas (`@stxt.schema`): validación semántica con `Node`/`Children`/`Child`, tipos (`INLINE`, `GROUP`, `BLOCK`, `TEXT`, `NUMBER`, `DATE`, `ENUM`…), cardinalidades `Min`/`Max` y modelo de contenido cerrado. Incluye el meta-schema oficial.
3. **`es/stxt-template-ref.stxt`** — Especificación de plantillas (`@stxt.template`): sintaxis simplificada equivalente a los schemas, con un bloque `Structure >>`, cardinalidades `(1)`, `(?)`, `(*)`, `(+)`, `(min,max)`, tipos tras la cardinalidad, `ENUM [a, b, c]` y referencias `@Nombre Nodo` (incluida recursión). Todo template es compilable a un schema equivalente.
4. **`es/stxt-discovery-ref.stxt`** — Especificación de resolución (STXT-DISCOVERY-SPEC): cómo las herramientas localizan schemas/templates en el sistema de ficheros. Cadena de niveles: directorios `.stxt` ascendentes desde el documento (todos, no solo el primero) → `$HOME/.stxt` → `/etc/stxt` (Windows: `%USERPROFILE%\.stxt`, `%ProgramData%\stxt`); precedencia **por namespace** (el nivel más cercano gana), duplicados en el mismo nivel = error, `STXT_PATH` sustituye la cadena completa.

Cualquier cambio conceptual en el lenguaje debe reflejarse de forma coherente en los cuatro documentos (se referencian entre sí como *STXT-SPEC*, *STXT-SCHEMA-SPEC*, *STXT-TEMPLATE-SPEC* y *STXT-DISCOVERY-SPEC*) y en su espejo inglés.

## Estructura del repositorio

- **`es/`** — Contenido canónico del sitio en español: `_index.stxt` (navegación del sitio: nodos `Link`/`Page`), `index.stxt` (portada), `lang-tutorial.stxt`, las cuatro referencias y las páginas `use-cases-*.stxt` (CMS, wikis, contratos, RFCs, configuración, editorial, docs corporativos).
- **`en/`** — Espejo en inglés de `es/`, con la misma estructura de ficheros. Al modificar contenido en `es/`, mantener sincronizado `en/`.
- **`.stxt/`** — El **directorio de resolución** del repo (STXT-DISCOVERY-SPEC): las definiciones que validan su contenido, con **una sola definición por namespace** — dos definiciones del mismo namespace en el mismo nivel son un error de resolución desde 2026-08-02. `website/dev.stxt.website.stxt` es el template del namespace `dev.stxt.website` (el que usan todas las páginas del sitio), más `schemas/` y `templates/` con definiciones de ejemplo (`com.example.*`, `org.example.*`…) usadas por los documentos de muestra.
- **`examples/definitions/`** — La segunda copia de los pares schema↔template ("el mismo modelo en las dos sintaxis"): vivían dentro de `.stxt/` hasta que la regla de duplicados los convirtió en conflicto, y se movieron aquí, fuera del directorio de resolución. Los tests de `../stxt-js` los siguen cargando (SCHEMA_DIRS) y su suite de equivalencia valida que cada par valida igual.
- **`docs/`** — Documentos STXT de ejemplo (emails, recetas, configuraciones tipo tomcat…) que instancian los schemas/templates de `.stxt/`.
- **`examples/`** y **`tutorial/`** — Más ficheros de ejemplo (casos de uso CMS, libro con/sin namespace).

## Formato de las páginas del sitio

Cada página en `es/`/`en/` es un documento del namespace `dev.stxt.website` (ver el template en `.stxt/website/dev.stxt.website.stxt`):

```
Document (dev.stxt.website): Título de la página
	Metadata:
		Author: ...
		Last modif: YYYY-MM-DD
	Header: Título H1
	Subheader: Sección
	Content >>
		Texto con sintaxis tipo markdown (**negrita**, listas, tablas, `código`).
	Code >>
		Ejemplos de código STXT; ***texto*** marca resaltado dentro del ejemplo.
```

Convenciones del contenido: `@STXT@` es la forma con la que se escribe el nombre del lenguaje en el texto; los nodos disponibles son `Metadata`, `Header`, `Subheader`, `Subsubheader`, `Content`, `Assert`, `Code`, `Grammar`, `Listing`, `Link`/`Page`.

Reparto de los bloques preformateados: `Code` es **exclusivamente STXT válido** (parseable; `***texto***` marca resaltado), `Grammar` es la gramática del lenguaje, y `Listing` es texto preformateado que no es STXT (diagramas de whitespace con la notación `.`/`|-->`, código en otros formatos, salidas de consola…). No poner contenido no parseable en un `Code`.

## Reglas críticas al editar ficheros `.stxt`

- La indentación **es** la estructura: estos ficheros usan **tabuladores** (1 tab = 1 nivel). La indentación de una línea debe ser homogénea — solo tabs o solo espacios (múltiplos de 4): **mezclar ambos en una misma línea es error de parseo** desde 2026-07-25, igual que los saltos de nivel no consecutivos. No convertir tabs a espacios.
- Todo lo indentado bajo un nodo `>>` es **texto literal** (los `#`, `:` y `>>` interiores no se interpretan), pero su indentación relativa se conserva: respetarla al editar.
- Un nodo es siempre `Nombre:` (inline) o `Nombre >>` (bloque); la línea del `>>` no lleva contenido detrás.
- Los namespaces solo admiten ASCII `[a-z0-9]` con formato `a.b` mínimo; `@` inicial marca namespaces especiales (`@stxt.schema`, `@stxt.template`, `dev.stxt.website`). La rama `@stxt.*` está reservada al lenguaje: no crear ejemplos con namespaces propios bajo `@stxt`.
