# AGENTS.md — Instrucciones para Mistral Vibe en el ecosistema STXT

## Contexto del Proyecto

Este workspace (`/home/joan/eclipse-workspace/`) contiene el **ecosistema completo del lenguaje STXT (Semantic Text)**, un formato textual jerárquico "Human-First" diseñado para ser legible por personas y fácilmente parseable por máquinas.

### Repositorios del ecosistema STXT

| Repositorio | Tipo | Propósito | Ubicación |
|-------------|------|-----------|----------|
| **stxt-web** | Especificación | Documentación normativa del lenguaje, escrita en STXT. Contiene las 4 specs canónicas: core, schema, template, discovery | `./stxt-web/` |
| **stxt-impl** | Pseudocódigo | Implementación de referencia en pseudocódigo language-neutral. Blueprint para nuevas implementaciones | `./stxt-impl/` |
| **stxt-js** | Implementación | Implementación oficial en TypeScript. npm `@stxt-lang/core` | `./stxt-js/` |
| **stxt-java** | Implementación | Porto a Java. Maven Central `dev.stxt:stxt-core` | `./stxt-java/` |
| **stxt-python** | Implementación | Esqueleto inicial en Python | `./stxt-python/` |
| **stxt-cli** | Herramienta | Interfaz de línea de comandos | `./stxt-cli/` |
| **stxt-vscode** | Extensión | Extensión para VS Code | `./stxt-vscode/` |
| **stxt-cms** | Aplicación | Sistema de gestión de contenidos basado en STXT | `./stxt-cms/` |

### Jerarquía de autoridad (normativa)
```
spec (stxt-web) → stxt-impl (pseudocódigo) → stxt-js → stxt-java
```

---

## Estructura clave de stxt-web (especificación)

```
stxt-web/
├── es/                  # Contenido canónico (español)
│   ├── _index.stxt      # Navegación del sitio
│   ├── index.stxt       # Portada
│   ├── stxt-core-ref.stxt      # STXT-SPEC: sintaxis base
│   ├── stxt-schema-ref.stxt     # STXT-SCHEMA-SPEC: validación semántica
│   ├── stxt-template-ref.stxt   # STXT-TEMPLATE-SPEC: plantillas
│   ├── stxt-discovery-ref.stxt  # STXT-DISCOVERY-SPEC: resolución
│   └── use-cases-*.stxt # Casos de uso
│
├── en/                  # Espejo en inglés de es/
├── .stxt/               # Directorio de resolución
│   └── website/
│       └── dev.stxt.website.stxt  # Template de las páginas del sitio
├── docs/                # Ejemplos de documentos STXT
├── examples/            # Más ejemplos y casos de uso
└── tutorial/            # Material de tutorial
```

---

## Convenciones y Reglas Críticas

### Formato de archivos .stxt
- **Indentación**: Usan **tabuladores** (1 tab = 1 nivel). Mezclar tabs y espacios en una misma línea es **error de parseo** (STXT-SPEC §8.1/§8.3)
- **Comentarios**: Líneas que empiezan por `#`
- **Nodos**: `Nombre: valor` (inline) o `Nombre >>` (bloque de texto)
- **Namespaces**: Formato `a.b` mínimo, solo ASCII `[a-z0-9]`, opcional `@` inicial (ej: `@stxt.schema`)
- **Normalización de nombres**: Trim → NFC → lowercase → separadores (`-`, `_`, espacios) se colapsan a `-` único

### Validación
- Todo el contenido debe validarse contra las especificaciones en `es/` (versión canónica)
- Los cambios conceptuales deben reflejarse de forma coherente en los 4 documentos de especificación
- Los ejemplos en `docs/` y `examples/` deben ser STXT válido y parseable

---

## Instrucciones para Mistral Vibe

### Al trabajar con archivos .stxt
1. **Siempre** lee el archivo completo antes de editarlo
2. Respetar la indentación existente (tabs vs espacios)
3. No convertir tabs a espacios
4. Bloques `>>` contienen texto literal (el contenido interior no se interpreta)

### Al implementar funcionalidad
1. Consulta primero `stxt-impl/` (pseudocódigo normativo)
2. Luego verifica `stxt-js/` o `stxt-java/` para ejemplos de implementación real
3. Usa los mismos códigos de error que aparecen en el pseudocódigo

### Preferencias
- Responde en **español** (a menos que se solicite lo contrario)
- Sé **conciso** pero claro
- Proporciona **pruebas de concepto** en el scratchpad cuando sea útil
- Anticipa preguntas sobre el ecosistema STXT

---

## Referencias Rápidas

- **STXT-SPEC (Core)**: `stxt-web/es/stxt-core-ref.stxt`
- **STXT-SCHEMA-SPEC**: `stxt-web/es/stxt-schema-ref.stxt`
- **STXT-TEMPLATE-SPEC**: `stxt-web/es/stxt-template-ref.stxt`
- **STXT-DISCOVERY-SPEC**: `stxt-web/es/stxt-discovery-ref.stxt`
- **Pseudocódigo**: `stxt-impl/` (ver CLAUDE.md para mapeo detallado)
- **Implementación JS**: `stxt-js/src/`
- **Implementación Java**: `stxt-java/src/`

---

## Notas Adicionales

- Este workspace usa Eclipse como IDE (archivos `.project` y `.settings/`)
- El usuario principal es **Joan Costa Mombiela** (autor de las especificaciones)
- Fechas de última modificación relevantes: 2026-08-02 (specs), 2026-08-03 (pseudocódigo)
- No hacer `git commit` ni `git push` — el usuario lo hace manualmente
