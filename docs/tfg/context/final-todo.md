# Comprobaciones antes de entregar la memoria

Esta lista reúne datos que deben revisarse con el autor durante la última
iteración. No autoriza a completar cifras o hechos mediante estimaciones no
confirmadas.

## Planificación y costes

- Mantener el cronograma en semanas relativas y no incorporar fechas inferidas
  del historial Git.
- Confirmar el precio y la fecha de adquisición del MacBook Pro M4 Pro para
  calcular la amortización imputable al TFG.
- La campaña experimental conserva 92 generaciones y su coste tarifario
  equivalente. Confirmar únicamente si existió una factura efectiva y las
  licencias de pago empleadas durante el desarrollo.
- Revisar antes de la entrega que las 320 horas estimadas, las 339 horas reales
  y las desviaciones por sprint coincidan con la versión final de la
  planificación y del presupuesto.
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

- La política pública `s3:GetObject` ya se retira durante el arranque y las
  pruebas verifican acceso mediante URL prefirmada, rechazo directo y
  caducidad. Antes de un despliegue real, confirmar la caducidad elegida y la
  configuración CORS definitiva.

## Revisión final

- Sustituir todos los datos académicos provisionales de la portada.
- Cerrar resultados, limitaciones, trabajo futuro y conclusiones con evidencias
  de la versión evaluada.
- Revisar que todas las figuras, tablas, referencias y anexos se mencionen en
  el texto.
