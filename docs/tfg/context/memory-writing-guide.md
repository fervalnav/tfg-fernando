# Guía de redacción de la memoria de LIA para Codex

Este documento define como debe redactarse y revisarse la memoria del TFG
**LIA: Integración de IA para análisis automático de licitaciones**. Su objetivo
es conservar criterios consistentes entre iteraciones y evitar que el texto se
adelante al estado real del proyecto.

## Referencias analizadas

La estructura propuesta se ha obtenido comparando las siguientes memorias de
referencia facilitadas por el autor:

- `docs/refs/TFG_Ignacio_Blanquero.pdf` (187 páginas).
- `docs/refs/TFG__Joaquín_Arregui___Simulación.pdf` (64 páginas).
- `docs/refs/TFG__José_Luis_ENTREGA___Premiun.pdf` (81 páginas).
- `docs/refs/example.tex`, usado como referencia adicional de estilo y formato.

El análisis específico del resumen y del capítulo de introducción se conserva
en `context/reference-m1-analysis.md`.

No se debe copiar texto, figuras, resultados ni decisiones de estas memorias.
Se utilizan exclusivamente para identificar patrones de organización y
profundidad.

## Patrones comunes de las memorias de referencia

Las tres memorias comparten un recorrido académico estable:

1. Contextualizan el problema, justifican su relevancia y formulan objetivos.
2. Explican la metodología, los sprints, la planificación temporal y los costes.
3. Formalizan actores, requisitos, reglas de negocio y trazabilidad.
4. Representan el sistema mediante modelos de dominio, componentes, secuencias,
   procesos y prototipos de interfaz.
5. Describen las tecnologías y las decisiones de implementación más relevantes.
6. Presentan pruebas con casos, evidencias y resultados, no solo una lista de
   herramientas de testing.
7. Incluyen instrucciones de instalación o despliegue y un manual de usuario con
   capturas.
8. Cierran el trabajo con conclusiones, limitaciones, mejoras futuras,
   bibliografía y anexos.

Las diferencias se encuentran principalmente en la profundidad. La memoria de
187 páginas desarrolla catálogos de requisitos, trazabilidad, UML, pruebas
unitarias y pruebas de carga con mucho detalle. Las otras dos condensan análisis,
implementación y pruebas en unas 60-80 páginas. Para LIA se debe buscar un punto
intermedio: formalidad suficiente para demostrar ingeniería del software, pero
sin convertir la memoria en una enumeración de clases o endpoints.

## Enfoque específico para LIA

La memoria debe dar protagonismo a los aspectos que diferencian el proyecto:

- análisis y cualificación de licitaciones públicas;
- gestión multiempresa de oportunidades, pipelines y workflows;
- instanciación de preguntas de control, campos personalizados y resúmenes;
- integración de inteligencia artificial generativa mediante un puerto
  independiente del proveedor;
- generación estructurada, tratamiento de errores y reintentos;
- almacenamiento de PDFs en MinIO y entrega de sus buffers al proveedor de IA;
- aislamiento de datos por cuenta;
- arquitectura hexagonal, DDD y CQRS en NestJS;
- SPA con Nuxt 4 y Vue 3 dentro de un monorepositorio Turborepo;
- equilibrio entre capacidad, coste, latencia y fiabilidad de los proveedores
  de IA.

No se debe presentar la IA como una capacidad mágica. Cada flujo documentado
debe indicar qué información recibe, qué salida estructurada produce, cómo se
valida, qué ocurre si falla y qué parte de la decisión sigue correspondiendo al
usuario.

## Estructura recomendada

### Elementos preliminares

- Portada institucional.
- Resumen en español y palabras clave.
- Abstract en inglés y keywords equivalentes.
- Agradecimientos, si el autor decide incluirlos.
- Índices general, de tablas, de figuras y de fragmentos de código.

### 1. Introducción

- Contexto de la contratación pública y del análisis de licitaciones.
- Problema que se pretende reducir.
- Motivación técnica y empresarial.
- Objetivo general y objetivos específicos registrados.
- Alcance confirmado y exclusiones.
- Estructura de la memoria.

La introducción necesita bibliografía sobre contratación pública, análisis
documental e IA generativa. El texto registrado en la Universidad es la fuente
autoritativa para título y objetivos, pero no sustituye a las referencias
académicas o institucionales.

### 2. Planificación y costes

- Adaptación de Scrum a un proyecto individual.
- Responsabilidades de autor y tutora sin inventar ceremonias o reuniones.
- Descripción resumida de los sprints de desarrollo.
- Diagrama de Gantt o cronograma equivalente.
- Estimación inicial, dedicación real y desviaciones justificadas.
- Costes de personal, infraestructura, herramientas y proveedores de IA.

La planificación inicial debe presentarse antes que la ejecución real. Las
horas estimadas y reales se distribuyen por sprint y las diferencias se
explican mediante sus desviaciones y las incidencias relevantes.

### 3. Análisis de requisitos

- Objetivos generales del sistema.
- Actores y permisos.
- Requisitos funcionales identificados de forma estable (`RF-XXX`).
- Requisitos de información (`RI-XXX`).
- Reglas de negocio (`RN-XXX`).
- Requisitos no funcionales (`RNF-XXX`).
- Matriz de trazabilidad entre objetivos, requisitos, implementación y pruebas.

Los requisitos deben derivarse del alcance confirmado y del comportamiento
implementado. Una ruta HTTP o una clase no equivale por sí sola a un requisito.

### 4. Análisis y diseño del sistema

- Modelo de dominio y relaciones principales.
- Casos de uso o historias de usuario representativas.
- Procesos de negocio: alta y cualificación de una oportunidad, ejecución de un
  workflow, generación por IA y gestión documental.
- Diagramas de secuencia para los flujos con mayor complejidad.
- Navegabilidad y diseño de interfaz.

No es necesario crear un diagrama por cada endpoint. Se priorizan los modelos
que expliquen decisiones o relaciones que no sean evidentes mediante texto.
Esta selección no puede ocultar partes relevantes del producto: cada área
funcional debe quedar representada al menos una vez. En particular, la
cualificación de una oportunidad se documentará separando documentación,
preguntas de control, campos personalizados, resúmenes y ejecución del
workflow. Los prototipos de este capítulo son diseños conceptuales previos a la
implementación; las capturas de la aplicación terminada se reservan para el
manual de usuario.

### 5. Arquitectura del sistema

- Vista de contexto y componentes.
- Monorepositorio y tipos compartidos.
- Backend hexagonal con DDD y CQRS.
- Arquitectura modular del frontend.
- Persistencia PostgreSQL/MikroORM.
- Almacenamiento de adjuntos en MinIO/S3.
- Integración de IA y selección configurable de proveedor.
- Despliegue e infraestructura realmente verificados.
- Decisiones arquitectónicas, alternativas y compromisos.

### 6. Implementación

- Entorno y herramientas.
- Autenticación, cuentas y aislamiento multiempresa.
- Pipelines, oportunidades y filtros.
- Definición y ejecución de workflows.
- Cualificación mediante preguntas, campos y resúmenes.
- Adjuntos y contexto documental.
- Generación por IA, estados, fallos y reintentos.

Se deben seleccionar fragmentos pequeños que ilustren patrones relevantes. No
se debe recorrer el repositorio archivo por archivo ni incluir grandes bloques
de código que puedan consultarse directamente en el repositorio.

### 7. Pruebas y validación

- Estrategia y niveles de prueba.
- Unitarias de dominio y casos de uso.
- Integración de persistencia, almacenamiento y API.
- Pruebas de componentes y flujos del frontend.
- E2E de los recorridos críticos.
- Evaluación de IA con un conjunto controlado de documentos y criterios.
- Pruebas no funcionales relevantes: aislamiento, seguridad, rendimiento,
  límites de archivo y recuperación ante fallos.
- Resultados medibles, incidencias encontradas y limitaciones.

No se debe escribir que una prueba existe solo porque el flujo se haya probado
manualmente. Los porcentajes de cobertura deben regenerarse en la iteración en
la que se cierre el capítulo.

### 8. Manuales

- Requisitos previos y puesta en marcha local.
- Configuración de servicios y variables de entorno sin revelar secretos.
- Manual de usuario por objetivos, no por componentes técnicos.
- Capturas de los flujos estables con datos ficticios y sin información
  sensible.

Si se valida un despliegue real, se documentará como manual de despliegue. Si no
se valida, solo se describirá el entorno local y el despliegue quedará como
limitación o trabajo futuro.

### 9. Dificultades, limitaciones y trabajo futuro

- Problemas técnicos realmente encontrados y decisiones adoptadas.
- Limitaciones funcionales y no funcionales verificadas.
- Riesgos y limitaciones propios de la IA generativa.
- Funcionalidades deliberadamente excluidas.
- Mejoras futuras priorizadas, sin presentarlas como implementadas.

### 10. Conclusiones

- Resultados alcanzados.
- Evaluación de cada objetivo registrado mediante evidencias.
- Aportaciones y aprendizajes.
- Valoración personal del autor.

Las conclusiones se escriben al final y no deben introducir funcionalidades,
métricas ni argumentos que no hayan aparecido previamente.

### Anexos

Reservar los anexos para diagramas completos, configuración reproducible,
catálogos extensos, resultados detallados y declaración del uso de herramientas
de IA cuando lo requiera la normativa. Evitar anexar copias masivas del código.

## Fuentes y orden de autoridad

Codex debe aplicar el siguiente orden:

1. Información registrada en `context/registered-proposal.md` para título,
   descripción y objetivos oficiales.
2. Decisiones confirmadas directamente por el autor.
3. Comportamiento y tecnologías comprobados en el repositorio.
4. Documentos de alcance y planificación, después de comprobar que están
   actualizados.
5. Fuentes académicas, legales u oficiales citadas para el contexto externo.
6. Memorias de referencia solo para estructura y nivel de detalle.

Cuando dos fuentes se contradigan, se detiene la afirmación y se solicita una
decisión. La discrepancia histórica sobre las licitaciones se resolvió en la
iteración M0: forman parte central del TFG, mientras que su descubrimiento o
importación automática queda fuera del alcance. El detalle verificable se
mantiene en `context/scope-evidence-inventory.md`.

## Reglas de redacción

- Espanol académico, claro y directo; abstract en inglés.
- No inventar cifras, fechas, resultados, reuniones, costes ni motivaciones.
- Separar siempre implementado, planificado y trabajo futuro.
- Usar presente para describir el sistema y pasado para el trabajo realizado.
- Definir cada sigla en su primera aparición.
- Citar las afirmaciones externas; el código propio no necesita cita
  bibliográfica, pero sí evidencia verificable.
- Mantener identificadores estables para requisitos, figuras y tablas.
- Referenciar toda figura o tabla desde el texto y explicar que demuestra.
- No sustituir una cobertura completa por una selección excesivamente
  resumida. Antes de redactar cada capítulo se inventariarán todas sus áreas y
  se comprobará explícitamente que ninguna queda sin explicar.
- Usar capturas reales con datos ficticios. No incorporar secretos, tokens,
  nombres de clientes ni documentos confidenciales.
- Evitar lenguaje promocional y afirmaciones absolutas sobre la IA.
- No mencionar ni reproducir código interno de Tendios.
- Antes de fijar una decisión documental relevante, Codex debe presentar la
  cuestión al autor y esperar su confirmación. Esta regla incluye fechas del
  proyecto, ceremonias y roles de la metodología, incidencias, distribución de
  esfuerzo, criterios de presupuesto, actores, alcance y resultados de
  evaluación.
- El repositorio y las memorias de referencia pueden aportar evidencias y
  alternativas, pero no sustituyen la confirmación del autor cuando una
  decisión admita varias interpretaciones razonables.

### Uso interno de las memorias modelo

Las memorias conservadas en `docs/refs` se utilizan exclusivamente como apoyo
interno para comprender la estructura, el nivel de detalle y el estilo
académico esperado. Su consulta nunca debe hacerse visible en el documento
entregable.

- No mencionar en capítulos, preliminares, anexos, títulos, pies de figura ni
  tablas que LIA se basa, se guía o toma como referencia otros TFG.
- No incluir las memorias modelo en la bibliografía ni citarlas para justificar
  decisiones del proyecto.
- No nombrar a sus autores, títulos o proyectos en el texto de la memoria.
- Cuando una memoria modelo conduzca a un dato externo, localizar y citar la
  fuente original, primaria u oficial que respalda ese dato.
- Usar los patrones observados únicamente para decidir la organización y la
  profundidad del contenido; toda afirmación sobre LIA debe proceder del autor,
  del sistema comprobado o de una fuente externa legítima.
- Antes de cerrar cada iteración, buscar expresiones como «memoria de
  referencia», «otro TFG», «proyecto de referencia» o «siguiendo el ejemplo» en
  todas las fuentes LaTeX publicables y eliminarlas.

## Criterio de cierre de cada iteración

Una iteración de memoria se considera terminada cuando:

1. las afirmaciones están respaldadas por una fuente o una confirmación;
2. los `TODO` y preguntas abiertas se han listado para el autor;
3. el documento LaTeX completo compila sin errores;
4. las páginas modificadas se han renderizado y revisado visualmente;
5. no hay figuras recortadas, tablas desbordadas ni referencias rotas;
6. se ha actualizado el estado del plan de redacción;
7. no se ha realizado ningún commit salvo solicitud explícita del autor.
