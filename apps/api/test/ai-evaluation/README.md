# Protocolo de evaluación de IA

Protocolo congelado el 13 de agosto de 2026 antes de ejecutar los modelos. Se
comparan `gemini-3-flash-preview` (Flash) y `gemini-3.1-flash-lite`
(Flash-Lite), ambos mediante el adaptador Google de producción. Se realizan
tres repeticiones de cuatro operaciones sobre cinco expedientes ficticios: 120
salidas previstas.

Este protocolo complementa los tests deterministas. Los tests automáticos validan integración, esquemas y errores; esta evaluación compara la calidad, latencia y coste de proveedores/modelos con documentos ficticios o públicos.

## Conjunto de evaluación

1. Preparar entre 5 y 10 licitaciones con PDF públicos o creados específicamente para la prueba.
2. Incluir variedad de longitud, número de documentos, idioma y dificultad.
3. No incorporar documentación privada ni datos personales.
4. Registrar cada caso en `evaluation-cases.json` y guardar sus PDF fuera del repositorio o como fixtures redistribuibles.
5. Elaborar las respuestas esperadas y la rúbrica antes de ejecutar los modelos.

En esta evaluación se usan siete PDF redistribuibles de `fixtures/`, agrupados
en cinco expedientes. Hay casos de uno y dos documentos, entre dos y cuatro
páginas, contenido accesorio y un expediente redactado en inglés. Todos
se declaran completamente ficticios tanto en el contenido como en
`evaluation-cases.json`; sus hashes SHA-256 quedan congelados en ese fichero.

Cada caso debe cubrir, como mínimo:

- un resumen;
- una pregunta de control con respuesta y evidencia;
- un campo personalizado con valor y evidencia;
- una decisión de workflow con evidencia.

## Ejecución

Para cada combinación de proveedor y modelo:

1. Fijar los prompts, esquemas, documentos y parámetros de generación.
2. Ejecutar cada caso tres veces para observar variabilidad.
3. Registrar una fila por operación y repetición usando `results-template.csv`.
4. Conservar también los resultados estructurados para una revisión posterior.
5. Si una ejecución falla o no informa tokens, registrarlo explícitamente; no sustituir datos ausentes por cero.

Parámetros comunes: nivel de razonamiento `low`, máximo de 2048 tokens de
salida y dos reintentos. Para respetar el límite gratuito observado de cinco
solicitudes por minuto, el ejecutor espera 13 segundos entre salidas; el valor
puede ajustarse con `AI_EVALUATION_DELAY_MS`, dejando constancia del cambio. El
ejecutor reanudable es `run-evaluation.ts`; conserva
una línea JSON por salida en `results/raw-results.jsonl` y la proyección tabular
en `results/results.csv`. Nunca almacena la clave de API.

Puede limitarse una reanudación a modelos concretos mediante
`AI_EVALUATION_MODELS`, separado por comas. Ante una cuota transitoria se espera
el tiempo indicado por Google y se reintenta la misma salida; después de dos
esperas se detiene sin registrar esa salida como fallo. El máximo se configura
con `AI_EVALUATION_MAX_QUOTA_WAITS`.

`generate-fixtures.py` emplea fuentes PDF estándar y modo invariante de
ReportLab. Dos regeneraciones consecutivas deben producir exactamente los
hashes registrados. Los ficheros `pilot-rate-limit-*` proceden de una ejecución
interrumpida al detectar el límite de cinco solicitudes por minuto; se guardan
como incidencia y no forman parte de la comparación final.

El servicio `AiGenerationService` ya devuelve `provider`, `model`, `durationMs` y los tokens de entrada, salida y totales. El coste se calcula después con la tarifa oficial vigente en la fecha de la prueba:

`coste = inputTokens * precioEntrada / 1_000_000 + outputTokens * precioSalida / 1_000_000`

La fuente, moneda y fecha de cada tarifa deben constar en la memoria del TFG.
Para la prueba del 13 de agosto de 2026 se congelan las tarifas estándar de la
documentación oficial de Google, en USD por millón de tokens:

| Modelo | Entrada | Salida, incluido razonamiento |
|---|---:|---:|
| `gemini-3-flash-preview` | 0,50 USD | 3,00 USD |
| `gemini-3.1-flash-lite` | 0,25 USD | 1,50 USD |

Fuente: <https://ai.google.dev/gemini-api/docs/pricing>.

## Evaluación de calidad

Dos revisiones independientes puntúan cada salida de 0 a 2 en cuatro dimensiones:

- exactitud: no contradice los documentos;
- cobertura: incluye la información relevante definida en el caso;
- evidencia: justifica la respuesta con información localizable;
- utilidad: ayuda a tomar la decisión esperada sin contenido superfluo.

La puntuación máxima es 8. Los dos revisores evalúan una copia ciega que oculta
modelo, repetición, métricas y puntuación ajena. El revisor 1 es el agente
principal de Codex y el revisor 2 es un agente Codex independiente. No se
presentan como revisores humanos. Primero se congelan ambas revisiones; después
se resuelven los desacuerdos conservando las puntuaciones originales y la
acordada. Por dimensión se adopta la valoración sustentada más estricta y se
conserva cualquier alucinación o error detectado por uno de los revisores.

Rúbrica por dimensión:

| Puntos | Exactitud | Cobertura | Evidencia | Utilidad |
|---:|---|---|---|---|
| 2 | Todo respaldado y sin contradicciones | Incluye todos los hechos relevantes esperados | Justifica con datos y secciones localizables | Directa, accionable y sin ruido |
| 1 | Imprecisión menor que no cambia la conclusión | Omite información secundaria | Evidencia correcta pero parcial o vaga | Usable con interpretación o limpieza menor |
| 0 | Contradicción o error material | Omite un dato esencial o no responde | Ausente, no localizable o incompatible | No permite decidir o induce a error |

`valid_schema` se registra aparte de la calidad semántica. Una alucinación es
una afirmación verificable no sustentada por los documentos; es crítica si
altera elegibilidad, plazo, importe, obligación o decisión Go/No-Go. No se
cuentan como alucinaciones las paráfrasis legítimas, omisiones o errores de
formato. Cada descuento debe llevar un comentario breve y evidencia documental.

Para el resumen, cuyo esquema productivo solo contiene `result`, se exige que
las referencias de sección aparezcan dentro del propio texto. Los otros tres
esquemas conservan su campo `evidence`.

## Métricas y criterio de selección

Por proveedor/modelo se presentan:

- calidad media y desviación;
- tasa de respuestas válidas y tasa de fallos;
- latencia mediana y percentil 95;
- tokens medios de entrada y salida;
- coste medio por operación y por licitación;
- número de alucinaciones detectadas.

Un modelo es aceptable si obtiene al menos 6/8 de calidad media, genera una respuesta estructuralmente válida en al menos el 95 % de ejecuciones y no presenta alucinaciones críticas. Entre los modelos aceptables se elige el de menor coste; la latencia actúa como desempate. Estos umbrales deben revisarse si el conjunto final demuestra que no son adecuados, dejando constancia del cambio.

## Resultado de la campaña

- Flash-Lite: 60/60 salidas, 100 % válidas, calidad acordada 7,53/8. Presenta
  dos alucinaciones críticas en resúmenes del caso de autobuses, por lo que no
  se selecciona para esa operación pese a su buena media.
- Flash: la cuota de Google limitó la muestra a 32/60 salidas, todas
  estructuralmente válidas y revisadas, con calidad 7,75/8 y sin
  alucinaciones. El tamaño real se conserva en los resultados y no se completan
  las ejecuciones ausentes mediante estimaciones.
- Decisión: Flash para resúmenes; Flash-Lite para preguntas de control, campos
  personalizados y decisiones de workflow. Si se necesita un único modelo
  global, se selecciona Flash por su ausencia de alucinaciones críticas.
- La puntuación original de ambos revisores y la acordada se conservan en
  `reviews/`; los agregados reproducibles están en `results/aggregate.json`.

## Reproducibilidad

La entrega debe conservar la revisión del código, la fecha, configuración, identificadores exactos de proveedor/modelo, hashes de los documentos, casos, resultados brutos y hoja agregada. Las claves de API y los PDF no redistribuibles nunca se almacenan en Git.
