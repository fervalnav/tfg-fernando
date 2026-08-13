# Informe provisional de evaluación de IA — 13 de agosto de 2026

El banco v2 contiene cinco expedientes ficticios, siete PDF y cuatro operaciones
por expediente. Cada operación se repite tres veces por modelo, para un total
previsto de 60 salidas por modelo. Dos revisores Codex independientes evaluaron
las salidas mediante copias ciegas; la reconciliación conserva las dos
puntuaciones originales.

| Modelo | Completadas | Calidad | Válidas | Mediana | P95 | Coste medio | Alucinaciones críticas |
|---|---:|---:|---:|---:|---:|---:|---:|
| Gemini 3 Flash Preview | 10/60 | 7,80/8 | 100 % | 1.726 ms | 4.352 ms | 0,000941 USD | 0 |
| Gemini 3.1 Flash-Lite | 60/60 | 7,53/8 | 100 % | 2.663 ms | 5.687 ms | 0,000800 USD | 2 |

Flash-Lite no es aceptable según el criterio congelado porque dos resúmenes del
caso de autobuses afirman que el candidato acredita rampa y espacio reservado,
cuando `DOSSIER 2.1` solo acredita la rampa. Esta atribución transforma un dato
ausente en cumplimiento de un requisito y se clasifica como alucinación crítica.

Flash no puede compararse todavía de forma concluyente: la clave gratuita agotó
su cuota diaria tras diez salidas finales y un piloto previo. Las 50 salidas
restantes se reanudarán sin repetir las ya válidas. Por tanto, la tabla conserva
las métricas observadas, pero no permite seleccionar un modelo definitivo.
