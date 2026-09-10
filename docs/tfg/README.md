# Memoria del TFG

Memoria académica en LaTeX del proyecto **LIA: Integración de IA para análisis
automático de licitaciones**.

El documento se divide en archivos pequeños para facilitar su mantenimiento y
la revisión independiente de cada capítulo.

## Estructura

```text
docs/tfg/
├── main.tex
├── config/
│   ├── metadata.tex
│   └── preamble.tex
├── context/
│   ├── registered-proposal.md
│   ├── scope-evidence-inventory.md
│   ├── reference-m1-analysis.md
│   ├── reference-m2-analysis.md
│   ├── final-todo.md
│   ├── memory-writing-guide.md
│   └── memory-sprint-plan.md
├── figure-sources/
│   └── tikz/
├── frontmatter/
│   ├── cover.tex
│   ├── resumen.tex
│   ├── abstract.tex
│   └── acknowledgements.tex
├── chapters/
├── appendices/
├── bibliography/
├── assets/
└── figures/
```

Los datos académicos y la fecha de la portada se editan únicamente en
`config/metadata.tex`.

## Guía de redacción

- `context/memory-writing-guide.md` recoge la estructura, fuentes, reglas de
  veracidad y criterios de calidad que debe seguir Codex.
- `context/scope-evidence-inventory.md` fija el alcance confirmado y separa las
  funcionalidades implementadas, parciales y futuras.
- `context/reference-m1-analysis.md` recoge criterios internos para redactar el
  resumen y la introducción.
- `context/reference-m2-analysis.md` recoge criterios internos para la
  planificación, la distribución de horas y la valoración económica.
- `context/final-todo.md` reúne los datos que deben confirmarse antes de la
  entrega, incluidos el coste y la evidencia externa del despliegue.
- `context/memory-sprint-plan.md` organiza la memoria en iteraciones y mantiene
  el backlog técnico que debe completarse antes de documentar resultados.

## Logotipo

Guarda el logotipo institucional en una de estas rutas:

```text
assets/university-logo.pdf
assets/university-logo.png
```

Se recomienda PDF para conservar la calidad vectorial.

## Compilar

Con una distribución TeX instalada:

```bash
cd docs/tfg
latexmk -pdf main.tex
```

El PDF resultante será `main.pdf`.
