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
