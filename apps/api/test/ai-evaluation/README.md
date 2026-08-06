# Protocolo de evaluación de IA

Este protocolo complementa los tests deterministas. Los tests automáticos validan integración, esquemas y errores; esta evaluación compara la calidad, latencia y coste de proveedores/modelos con documentos ficticios o públicos.

## Conjunto de evaluación

1. Preparar entre 5 y 10 licitaciones con PDF públicos o creados específicamente para la prueba.
2. Incluir variedad de longitud, número de documentos, idioma y dificultad.
3. No incorporar documentación privada ni datos personales.
4. Registrar cada caso en `evaluation-cases.json` y guardar sus PDF fuera del repositorio o como fixtures redistribuibles.
5. Elaborar las respuestas esperadas y la rúbrica antes de ejecutar los modelos.

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

El servicio `AiGenerationService` ya devuelve `provider`, `model`, `durationMs` y los tokens de entrada, salida y totales. El coste se calcula después con la tarifa oficial vigente en la fecha de la prueba:

`coste = inputTokens * precioEntrada / 1_000_000 + outputTokens * precioSalida / 1_000_000`

La fuente, moneda y fecha de cada tarifa deben constar en la memoria del TFG.

## Evaluación de calidad

Dos revisiones independientes puntúan cada salida de 0 a 2 en cuatro dimensiones:

- exactitud: no contradice los documentos;
- cobertura: incluye la información relevante definida en el caso;
- evidencia: justifica la respuesta con información localizable;
- utilidad: ayuda a tomar la decisión esperada sin contenido superfluo.

La puntuación máxima es 8. Los desacuerdos se resuelven mediante revisión conjunta. También se registran alucinaciones y errores de formato como conteos separados.

## Métricas y criterio de selección

Por proveedor/modelo se presentan:

- calidad media y desviación;
- tasa de respuestas válidas y tasa de fallos;
- latencia mediana y percentil 95;
- tokens medios de entrada y salida;
- coste medio por operación y por licitación;
- número de alucinaciones detectadas.

Un modelo es aceptable si obtiene al menos 6/8 de calidad media, genera una respuesta estructuralmente válida en al menos el 95 % de ejecuciones y no presenta alucinaciones críticas. Entre los modelos aceptables se elige el de menor coste; la latencia actúa como desempate. Estos umbrales deben revisarse si el conjunto final demuestra que no son adecuados, dejando constancia del cambio.

## Reproducibilidad

La entrega debe conservar la revisión del código, la fecha, configuración, identificadores exactos de proveedor/modelo, hashes de los documentos, casos, resultados brutos y hoja agregada. Las claves de API y los PDF no redistribuibles nunca se almacenan en Git.
