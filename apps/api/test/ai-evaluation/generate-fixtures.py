from pathlib import Path

from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer


OUTPUT = Path(__file__).parent / "fixtures"

CASES = {
    "fictitious-it-support-01": [
        (
            "",
            2,
            [
                ("PCAP 1.2 - Objeto y presupuesto", "Servicio integral de soporte remoto y presencial para 850 puestos de trabajo. Presupuesto base de licitación: 240.000 EUR sin IVA."),
                ("PCAP 4.1 - Duración", "La duración inicial del contrato es de 24 meses. No se incluyen las eventuales prórrogas en este plazo inicial."),
                ("PCAP 7.3 - Solvencia técnica", "Se exigen al menos dos contratos de soporte de tecnologías de la información, cada uno por importe igual o superior a 80.000 EUR, ejecutados satisfactoriamente."),
                ("DOSSIER 2.1 - Experiencia del candidato", "El candidato acredita dos contratos comparables: soporte a Red Norte por 95.000 EUR y soporte a Consorcio Delta por 87.000 EUR. Ambos certificados declaran ejecución satisfactoria."),
            ],
        )
    ],
    "fictitious-school-meals-02": [
        (
            "-tender",
            3,
            [
                ("PCAP 1.1 - Objeto", "Servicio de comedor escolar sostenible para los centros Alameda, Horizonte y Marisma: tres centros educativos."),
                ("PCAP 1.3 - Presupuesto y duración", "Presupuesto base: 510.000 EUR sin IVA. Duración inicial: 18 meses."),
                ("PCAP 1.4 - Clasificación", "Código CPV principal: 55523100-3, servicios de comidas para escuelas."),
                ("PCAP 5.2 - Habilitación sanitaria", "Es obligatorio presentar un registro sanitario vigente en la fecha límite de presentación."),
            ],
        ),
        (
            "-candidate",
            3,
            [
                ("DOSSIER 1.1 - Identificación", "La entidad candidata ficticia Cocina Circular presenta su documentación para los tres centros."),
                ("DOSSIER 3.1 - Registro del candidato", "Registro sanitario RS-AN-2024-1187, válido desde el 10 de enero de 2024 hasta el 10 de enero de 2028."),
                ("DOSSIER 4.1 - Nota informativa", "El plan de menús y las rutas logísticas se aportan únicamente como información técnica y no modifican el requisito sanitario."),
            ],
        ),
    ],
    "fictitious-solar-maintenance-03": [
        (
            "",
            2,
            [
                ("PCAP 1.2 - Objeto y presupuesto", "Mantenimiento preventivo y correctivo de 42 instalaciones fotovoltaicas. Presupuesto base: 175.000 EUR sin IVA."),
                ("PCAP 2.1 - División en lotes", "Lote Norte: 22 instalaciones. Lote Sur: 20 instalaciones. Se permite licitar a uno o a ambos lotes."),
                ("PCAP 3.2 - Visita opcional", "La visita técnica a las cubiertas es opcional y no afecta a la admisión de la oferta."),
                ("PCAP 4.4 - Criterio ambiental", "Se valorará un plan de reducción de desplazamientos, pero no constituye requisito de admisión."),
                ("PCAP 6.4 - Garantía provisional", "La oferta debe incorporar una garantía provisional equivalente al 2 % del presupuesto base. Su ausencia no es subsanable."),
                ("PPT 8.1 - Informes", "El adjudicatario entregará informes trimestrales de producción y mantenimiento."),
                ("DOSSIER 3.1 - Oferta técnica", "El candidato describe un equipo de cuatro técnicos y un protocolo de mantenimiento mensual."),
                ("DOSSIER 4.2 - Documentación presentada", "Relación cerrada de documentos: oferta técnica, oferta económica y declaración responsable. No se aporta aval, seguro de caución ni otra garantía provisional."),
            ],
        )
    ],
    "fictitious-archive-digitization-04": [
        (
            "",
            2,
            [
                ("TS 2.2 - Scope", "Digitisation, indexing and quality control of 320,000 pages from the historical archive."),
                ("AC 1.3 - Budget and term", "Base budget: EUR 98,000 excluding VAT. Initial term: 10 months."),
                ("TS 3.4 - Image quality", "Capture shall use a minimum resolution of 300 dots per inch."),
                ("AC 4.2 - Optional sample", "A ten-page sample may be supplied for technical scoring, but it is not an eligibility requirement."),
                ("AC 5.5 - Information security", "A current ISO/IEC 27001 certificate, or a current equivalent information-security certificate, is mandatory."),
                ("CANDIDATE 5.1 - Certificate", "The candidate supplies an ISO/IEC 27001 certificate that expired on 30 June 2026. No renewal or equivalent certificate is included."),
            ],
        )
    ],
    "fictitious-electric-buses-05": [
        (
            "-tender",
            2,
            [
                ("PCAP 1.2 - Objeto y presupuesto", "Suministro de seis minibuses eléctricos accesibles. Presupuesto base: 1.320.000 EUR sin IVA."),
                ("PPT 4.1 - Prestaciones", "Cada vehículo debe acreditar una autonomía mínima de 280 km según ciclo WLTP."),
                ("PCAP 4.3 - Plazo", "El plazo máximo de entrega es de 210 días naturales desde la formalización."),
                ("PPT 5.2 - Accesibilidad", "Las seis unidades deben incorporar rampa y espacio reservado, requisito independiente de la decisión evaluada."),
            ],
        ),
        (
            "-candidate",
            2,
            [
                ("DOSSIER 2.1 - Ficha técnica", "La ficha declara baterías LFP, rampa eléctrica y una autonomía homologada de 295 km WLTP por vehículo."),
                ("DOSSIER 6.2 - Oferta del candidato", "El candidato compromete la entrega de las seis unidades en 190 días naturales y confirma la autonomía homologada de 295 km WLTP."),
                ("DOSSIER 7.1 - Garantía comercial", "Se ofrece una garantía comercial de cinco años; este dato no modifica el plazo máximo ni la autonomía mínima."),
            ],
        ),
    ],
}


def footer(canvas, document):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.drawString(20 * mm, 12 * mm, "DOCUMENTO COMPLETAMENTE FICTICIO - SOLO EVALUACION ACADEMICA")
    canvas.drawRightString(190 * mm, 12 * mm, f"Pagina {document.page}")
    canvas.restoreState()


def build(case_id, suffix, sections_per_page, sections):
    target = OUTPUT / f"{case_id}{suffix}.pdf"
    styles = getSampleStyleSheet()
    title = ParagraphStyle("TitleEval", parent=styles["Title"], fontName="Helvetica", alignment=TA_CENTER, spaceAfter=10 * mm)
    heading = ParagraphStyle("HeadingEval", parent=styles["Heading2"], fontName="Helvetica", spaceBefore=5 * mm, spaceAfter=2 * mm)
    body = ParagraphStyle("BodyEval", parent=styles["BodyText"], fontName="Helvetica", fontSize=11, leading=16)
    warning = ParagraphStyle("WarningEval", parent=body, alignment=TA_CENTER, textColor="#9b1c1c", spaceAfter=8 * mm)
    story = [
        Paragraph("Expediente ficticio para evaluación controlada de IA", title),
        Paragraph("This document is entirely fictitious. Names, amounts and references exist only for a reproducible academic test.", warning),
    ]
    for index, (section, section_text) in enumerate(sections):
        if index > 0 and index % sections_per_page == 0:
            story.append(PageBreak())
        story.extend([Paragraph(section, heading), Paragraph(section_text, body), Spacer(1, 4 * mm)])
    document = SimpleDocTemplate(
        str(target),
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=22 * mm,
        title=f"{case_id}{suffix}",
        author="TFG LIA - conjunto ficticio",
        invariant=1,
    )
    document.build(story, onFirstPage=footer, onLaterPages=footer)


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for case_id, documents in CASES.items():
        for suffix, sections_per_page, sections in documents:
            build(case_id, suffix, sections_per_page, sections)


if __name__ == "__main__":
    main()
