# Apéndice A — Relación con otros formatos (borrador en castellano)

Documento de trabajo: versión en castellano del apéndice A de `draft-stxt-media-type-00.md`,
para revisarlo y reescribirlo.

---

Este apéndice es informativo. Explica por qué el autor no ha reutilizado un formato ya
registrado, que es la pregunta razonable ante un subtipo `text` nuevo.

STXT se solapa con XML, YAML, TOML y JSON en que los cinco codifican datos jerárquicos en
texto, y con Markdown en que está pensado para escribirse a mano. Se diferencia de cada uno
de ellos en algo que es, precisamente, la razón de que exista:

- **Frente a XML**, que es el más cercano en propósito, STXT es un sustituto deliberado
  para el caso común. XML da a un documento estructura, namespaces y validación contra un
  esquema, y STXT también: un nodo con hijos es un elemento, un namespace entre paréntesis
  es una declaración de namespace que heredan los descendientes, y un esquema o una
  plantilla validan nombres, cardinalidades y tipos de valor. Lo que STXT deja fuera es lo
  que hace a XML costoso de leer y de parsear con seguridad: etiquetas de cierre,
  atributos, entidades y su expansión, DTD y subconjuntos externos, instrucciones de
  proceso, secciones CDATA y el escapado de los caracteres de marcado dentro del texto. Un
  bloque de texto contiene prosa arbitraria sin escapar nada; la jerarquía es la
  indentación que una persona escribiría de todos modos. El resultado cubre la mayor parte
  de aquello para lo que se usa XML en documentos y configuración, en una forma que la
  gente escribe a mano, con un parser que es una pequeña máquina de estados en lugar de un
  procesador XML completo con toda su superficie de ataque.

- **Frente a YAML**, STXT no tiene tipado implícito, ni sintaxis de flujo, ni anclas ni
  alias, ni etiquetas, ni marcadores de multidocumento, ni reglas de plegado de escalares
  sensibles a la indentación. Un parser de YAML tiene varios miles de líneas, y la
  especificación arrastra una larga historia de coerciones sorprendentes (`no`, `1e3`,
  `22:30`) y de carga insegura en bibliotecas muy usadas. Un parser de STXT va línea a
  línea y todo valor es una cadena; las dos formas de un nodo y la regla de los cuatro
  espacios son toda la sintaxis. Y donde YAML se queda en sintaxis, STXT sigue: YAML no
  tiene namespaces —un `Title` de un documento y el de otro no se distinguen más que por
  convención— y no define cómo validar un documento; la validación llega desde fuera, con
  JSON Schema sobre el resultado ya cargado, después de que las coerciones hayan actuado.
  En STXT el namespace es parte del lenguaje, lo heredan los hijos, y la validación es una
  especificación propia que se aplica al texto tal como se escribió: declara qué nodos
  existen, cuántos y de qué tipo, y la herramienta rechaza lo que no cuadra antes de que
  ningún programa lo cargue.

- **Frente a TOML**, STXT anida por indentación en lugar de por cabeceras de tabla,
  conserva el orden de los nodos, permite que un mismo nombre se repita (una lista son
  simplemente hermanos repetidos) y está pensado para documentos con párrafos de prosa, no
  solo para configuración. Las reglas de comillas y escapado de TOML son exactamente lo
  que STXT omite. TOML tampoco tiene namespaces ni esquema: las claves viven todas en el
  mismo espacio y no hay forma de declarar cuáles son válidas, obligatorias o de qué tipo,
  más allá del tipado implícito de cada valor. En STXT el fichero de configuración lleva
  su namespace, y una plantilla de diez líneas dice qué claves admite, cuáles son
  obligatorias y qué valores pueden tomar; el mismo validador sirve para el fichero de
  configuración y para el documento de prosa.

- **Frente a JSON**, STXT no tiene escapado ni comillas, lo que lo hace a la vez más fácil
  de escribir para las personas y una superficie de salida más fiable para programas y
  modelos de lenguaje que deben incrustar texto largo y arbitrario; y tiene comentarios.
  JSON sigue siendo la forma natural de intercambio del árbol ya parseado, y por eso
  STXT-TREE-SPEC define una.

- **Frente a Markdown**, STXT es un formato de datos con un árbol definido y una noción
  definida de validez: un documento Markdown nunca es inválido, y su estructura no es
  direccionable. Los dos se combinan bien —un bloque de texto contiene Markdown con
  frecuencia— y esa combinación es uno de los usos previstos del formato.
