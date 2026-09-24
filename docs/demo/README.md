# Entorno de demostración Tendios

La seed de demo prepara un entorno local aislado para presentar el análisis de
licitaciones públicas. Está pensada para ejecutarse desde una base de datos
vacía y no debe utilizarse en producción.

## Preparación

1. Cargar Node 26.1.0: `nvm use`.
2. Para empezar desde cero, ejecutar `make db-refresh` y después `make migration-up`.
3. Levantar PostgreSQL, MinIO y MailHog con `make up`.
4. Ejecutar `make seed-demo`.
5. Iniciar la aplicación con `pnpm dev` y abrir `http://localhost:3001`.

La cuenta creada es **Tendios**. Todos los usuarios de demo usan la contraseña
`password123`:

| Usuario                | Rol           |
| ---------------------- | ------------- |
| `fernando@tendios.com` | Administrador |
| `manu@tendios.com`     | Miembro       |
| `sandra@tendios.com`   | Miembro       |

La seed crea un pipeline de licitación pública con estados de análisis,
preparación, presentación, resolución y los estados finales **Ganada**,
**Perdida** y **Descartada**. También crea el catálogo de preguntas de control,
campos personalizados y plantillas de resumen, además de una oportunidad de
ejemplo con el workflow completo asignado. La seed de demo añade además diez
oportunidades ficticias repartidas por los estados para probar filtros de
Kanban y listado.

## Workflows incluidos

| Workflow                                       | Uso en la demo                                                                                                                                                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Proceso estándar de licitación**             | Recorrido completo: documentación, extracción con IA, cualificación Go/No-Go, revisión de riesgos, estrategia, preparación y presentación.                                                                    |
| **Acuerdo Marco / Sistema Dinámico**           | Segundo recorrido completo para contratos marco, con análisis de lotes, solvencia, riesgos, estrategia y notificación final.                                                                                  |
| **Demo directo · Filtro de certificación ENS** | Workflow corto: responde la pregunta `¿Qué certificación ENS exige la licitación?` y decide. Solo `No requerida` cumple; si exige un nivel ENS, mueve la oportunidad a **Descartada** y detiene la ejecución. |
| **Demo directo · Análisis rápido con IA**      | Workflow corto para subir documentación, extraer presupuesto, fecha y criterios, responder solvencia y generar los resúmenes de viabilidad y riesgos.                                                         |

Los workflows completos incluyen acciones de adjuntos, campos, preguntas de
control, resúmenes, tareas y notificaciones por email para mostrar la variedad
de acciones disponibles. Las acciones de tarea y email sirven como definición
del proceso en esta demo; no se envían mensajes externos automáticamente.

## Recorrido sugerido

1. Entrar con Fernando y enseñar la cuenta, el equipo y el pipeline.
2. Abrir **Ajustes → Workflows** y comparar los dos procesos completos con los
   dos workflows directos.
3. En la oportunidad de ejemplo, adjuntar el PCAP y el PPTP en el primer paso.
4. Ejecutar el workflow rápido de IA para enseñar campos, preguntas de
   solvencia y los resúmenes de requisitos y viabilidad.
5. Ejecutar el workflow ENS en otra oportunidad: cuando el campo indique que
   se exige un certificado, la decisión la pasa a **Descartada** y el workflow
   se detiene; si indica `No requerida`, continúa al paso siguiente.

Conviene probar las acciones con el proveedor de IA configurado antes de
grabar. Los PDF se envían como buffers al proveedor y el consumo depende de su
tamaño, por lo que es preferible ejecutar cada acción una sola vez durante la
grabación.
