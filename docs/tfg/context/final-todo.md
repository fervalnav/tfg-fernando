# Comprobaciones antes de entregar la memoria

Esta lista reúne datos que deben revisarse con el autor durante la última
iteración. No autoriza a completar cifras o hechos mediante estimaciones no
confirmadas.

## Planificación y costes

- Confirmar, si se desea representar una desviación por sprint, el desglose de
  horas estimadas inicialmente y horas ejecutadas de cada iteración. La memoria
  solo dispone ahora del total acordado y de una reconstrucción por bloques; no
  debe inventarse una comparación más granular.
- Confirmar las fechas naturales de inicio y fin del desarrollo si se decide
  mostrarlas junto al cronograma relativo de sprints.
- Confirmar el precio y la fecha de adquisición del MacBook Pro M4 Pro para
  calcular la amortización imputable al TFG.
- Confirmar el consumo real de proveedores de IA y las licencias de pago.
- Decidir si los 25,67 euros por hora se mantienen como tarifa de referencia
  procedente de contratación pública o si el coste se recalcula desde las
  tablas salariales del convenio de 2026. No describir esa tarifa como coste
  medio sin una fuente que lo demuestre.
- Recalcular o justificar el porcentaje empresarial: el 29,9 % actual debe
  contrastarse con todos los conceptos de cotización aplicables en 2026 y con
  el tipo de relación laboral supuesto para el presupuesto.
- Añadir el plan de Hetzner contratado, periodo, coste y evidencia externa del
  despliegue cuando se cree el servidor ya definido mediante IaC.

## Despliegue y seguridad

- La topología de producción se documenta en presente como diseño operativo
  elegido. Antes de la entrega deben conservarse las comprobaciones del
  servidor real; no atribuir disponibilidad, rendimiento ni fechas sin ellas.
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
