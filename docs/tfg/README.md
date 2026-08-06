# Memoria del TFG

Memoria académica en LaTeX del proyecto **Plataforma de Gestión de
Oportunidades Comerciales**.

La organización toma como referencia `docs/refs/example.tex`, pero separa el
documento en archivos pequeños para facilitar su mantenimiento.

## Estructura

```text
docs/tfg/
├── main.tex
├── config/
│   ├── metadata.tex
│   └── preamble.tex
├── context/
│   ├── registered-proposal.md
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
