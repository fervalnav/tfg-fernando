# Informe de evaluación de IA

El banco v2 contiene cinco expedientes ficticios, siete PDF y cuatro operaciones
por expediente. Cada operación se repite tres veces por modelo, para un total
previsto de 60 salidas por modelo. Dos revisores Codex independientes evaluaron
las salidas mediante copias ciegas; la reconciliación conserva las dos
puntuaciones originales.

| Modelo | Completadas | Calidad | Válidas | Mediana | P95 | Coste medio | Alucinaciones críticas |
|---|---:|---:|---:|---:|---:|---:|---:|
| Gemini 3 Flash Preview | 32/60 | 7,75/8 | 100 % | 2.152 ms | 8.716 ms | 0,001169 USD | 0 |
| Gemini 3.1 Flash-Lite | 60/60 | 7,53/8 | 100 % | 2.663 ms | 5.687 ms | 0,000800 USD | 2 |

Flash-Lite no es aceptable según el criterio congelado porque dos resúmenes del
caso de autobuses afirman que el candidato acredita rampa y espacio reservado,
cuando `DOSSIER 2.1` solo acredita la rampa. Esta atribución transforma un dato
ausente en cumplimiento de un requisito y se clasifica como alucinación crítica.

La cuota de Google limitó Flash a 32 salidas. La decisión conserva este tamaño
de muestra y utiliza los resultados observados: Flash se selecciona para
resúmenes; Flash-Lite, para preguntas de control, campos personalizados y
decisiones de workflow. Si se necesita un único modelo global, se selecciona
Flash porque no presenta alucinaciones críticas.
