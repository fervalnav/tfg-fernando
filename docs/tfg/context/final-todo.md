# Comprobaciones antes de entregar la memoria

Esta lista reúne datos que deben revisarse con el autor durante la última
iteración. No autoriza a completar cifras o hechos mediante estimaciones no
confirmadas.

## Cerrado en la revisión del 14 de septiembre de 2026

- Portada: septiembre de 2026, confirmado por el autor.
- Precio de compra del MacBook Pro M4 Pro: 3.049 euros, confirmado por el autor.
- Aritmética del esfuerzo: 320 horas estimadas, 339 reales, +19 horas (+5,9 %).
- Redacción técnica de resultados, limitaciones, trabajo futuro y conclusiones;
  resumen y abstract actualizados a las 92 generaciones evaluadas.
- Pruebas unitarias/componentes repetidas: API, 41 suites y 158 pruebas; web,
  11 archivos y 35 pruebas. Cobertura actualizada. E2E/CI anteriores identificados
  como evidencia histórica, no como validación de los cambios posteriores.
- Anexo del código: URL real del repositorio y estructura de reproducción.
- Figuras y tablas de los capítulos incluidos mencionadas en el texto;
  referencias resueltas en la compilación completa y revisión visual de los
  capítulos modificados.

## Planificación y costes pendientes

- Mantener el cronograma en semanas relativas y no incorporar fechas inferidas
  del historial Git.
- Confirmar la fecha de adquisición y el periodo de uso imputable del MacBook
  Pro M4 Pro para calcular su amortización; no imputar toda la compra al TFG.
- La campaña experimental conserva 92 generaciones y su coste tarifario
  equivalente. Confirmar únicamente si existió una factura efectiva y las
  licencias de pago empleadas durante el desarrollo.
- Decidir si los 25,67 euros por hora se mantienen como tarifa de referencia
  procedente de contratación pública o si el coste se recalcula desde las
  tablas salariales del convenio de 2026. No describir esa tarifa como coste
  medio sin una fuente que lo demuestre.
- Recalcular o justificar el porcentaje empresarial: el 29,9 % actual debe
  contrastarse con todos los conceptos de cotización aplicables en 2026 y con
  el tipo de relación laboral supuesto para el presupuesto.
- Mantener separado el coste de desarrollo del coste operativo. Si la
  aplicación se despliega antes de la entrega, documentar para este último el
  alojamiento, base de datos, objetos, correo, observabilidad e inferencia, con
  proveedor, unidad, periodo, coste y evidencia.

## Despliegue y seguridad

- La topología de producción se documenta en presente como diseño operativo
  elegido. Antes de la entrega deben conservarse las comprobaciones del
  servidor real; no atribuir disponibilidad, rendimiento ni fechas sin ellas.
- La política pública `s3:GetObject` ya se retira durante el arranque y las
  pruebas verifican acceso mediante URL prefirmada, rechazo directo y
  caducidad. Antes de un despliegue real, confirmar la caducidad elegida y la
  configuración CORS definitiva.

## Revisión final pendiente

- Redactar agradecimientos: el autor solicita mantenerlos pendientes.
- Incorporar la valoración personal confirmada por el autor; la sección actual
  contiene únicamente un balance técnico, sin atribuir opiniones inventadas.
- Repetir E2E y CI sobre la versión integrada cuando exista infraestructura
  disponible y conservar sus resultados.
- Resuelto: el autor confirma mantener Flash-Lite en `deploy/.env.example`.
  La memoria diferencia la configuración elegida de la recomendación
  experimental de Flash para resúmenes y conserva el riesgo observado.
