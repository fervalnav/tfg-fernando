from pathlib import Path

from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer


OUTPUT = Path(__file__).parent / "fixtures"
FONT_PATH = Path("/System/Library/Fonts/Supplemental/Arial.ttf")

CASES = {
    "fictitious-it-support-01": [
        ("PCAP 1.2 - Objeto y presupuesto", "Servicio integral de soporte remoto y presencial para 850 puestos de trabajo. Presupuesto base de licitación: 240.000 EUR sin IVA."),
        ("PCAP 4.1 - Duración", "La duración inicial del contrato es de 24 meses. No se incluyen las eventuales prórrogas en este plazo inicial."),
        ("PCAP 7.3 - Solvencia técnica", "Se exigen al menos dos contratos de soporte de tecnologías de la información, cada uno por importe igual o superior a 80.000 EUR, ejecutados satisfactoriamente."),
        ("DOSSIER 2.1 - Experiencia del candidato", "El candidato acredita dos contratos comparables: soporte a Red Norte por 95.000 EUR y soporte a Consorcio Delta por 87.000 EUR. Ambos certificados declaran ejecución satisfactoria."),
    ],
    "fictitious-school-meals-02": [
        ("PCAP 1.1 - Objeto", "Servicio de comedor escolar sostenible para los centros Alameda, Horizonte y Marisma: tres centros educativos."),
        ("PCAP 1.3 - Presupuesto y duración", "Presupuesto base: 510.000 EUR sin IVA. Duración inicial: 18 meses."),
        ("PCAP 1.4 - Clasificación", "Código CPV principal: 55523100-3, servicios de comidas para escuelas."),
        ("PCAP 5.2 - Habilitación sanitaria", "Es obligatorio presentar un registro sanitario vigente en la fecha límite de presentación."),
        ("DOSSIER 3.1 - Registro del candidato", "Registro sanitario RS-AN-2024-1187, válido desde el 10 de enero de 2024 hasta el 10 de enero de 2028."),
    ],
    "fictitious-solar-maintenance-03": [
        ("PCAP 1.2 - Objeto y presupuesto", "Mantenimiento preventivo y correctivo de 42 instalaciones fotovoltaicas. Presupuesto base: 175.000 EUR sin IVA."),
        ("PCAP 2.1 - División en lotes", "Lote Norte: 22 instalaciones. Lote Sur: 20 instalaciones. Se permite licitar a uno o a ambos lotes."),
        ("PCAP 6.4 - Garantía provisional", "La oferta debe incorporar una garantía provisional equivalente al 2 % del presupuesto base. Su ausencia no es subsanable."),
        ("DOSSIER 4.2 - Documentación presentada", "Relación cerrada de documentos: oferta técnica, oferta económica y declaración responsable. No se aporta aval, seguro de caución ni otra garantía provisional."),
    ],
    "fictitious-archive-digitization-04": [
        ("PPT 2.2 - Alcance", "Digitalización, indexación y control de calidad de 320.000 páginas del archivo histórico."),
        ("PCAP 1.3 - Presupuesto y duración", "Presupuesto base: 98.000 EUR sin IVA. Duración inicial: 10 meses."),
        ("PPT 3.4 - Calidad de imagen", "La captura debe realizarse con una resolución mínima de 300 puntos por pulgada."),
        ("PCAP 5.5 - Seguridad", "Se exige ISO/IEC 27001 vigente o certificación equivalente vigente en seguridad de la información."),
        ("DOSSIER 5.1 - Certificación", "El candidato presenta certificado ISO/IEC 27001 con fecha de expiración 30 de junio de 2026. No consta renovación ni certificación equivalente."),
    ],
    "fictitious-electric-buses-05": [
        ("PCAP 1.2 - Objeto y presupuesto", "Suministro de seis minibuses eléctricos accesibles. Presupuesto base: 1.320.000 EUR sin IVA."),
        ("PPT 4.1 - Prestaciones", "Cada vehículo debe acreditar una autonomía mínima de 280 km según ciclo WLTP."),
        ("PCAP 4.3 - Plazo", "El plazo máximo de entrega es de 210 días naturales desde la formalización."),
        ("DOSSIER 6.2 - Oferta del candidato", "El candidato compromete la entrega de las seis unidades en 190 días naturales y declara una autonomía homologada de 295 km WLTP por vehículo."),
    ],
}


def footer(canvas, document):
    canvas.saveState()
    canvas.setFont("EvalFont", 8)
    canvas.drawString(20 * mm, 12 * mm, "DOCUMENTO COMPLETAMENTE FICTICIO - SOLO EVALUACION ACADEMICA")
    canvas.drawRightString(190 * mm, 12 * mm, f"Pagina {document.page}")
    canvas.restoreState()


def build(case_id, sections):
    target = OUTPUT / f"{case_id}.pdf"
    styles = getSampleStyleSheet()
    title = ParagraphStyle("TitleEval", parent=styles["Title"], fontName="EvalFont", alignment=TA_CENTER, spaceAfter=10 * mm)
    heading = ParagraphStyle("HeadingEval", parent=styles["Heading2"], fontName="EvalFont", spaceBefore=5 * mm, spaceAfter=2 * mm)
    body = ParagraphStyle("BodyEval", parent=styles["BodyText"], fontName="EvalFont", fontSize=11, leading=16)
    warning = ParagraphStyle("WarningEval", parent=body, alignment=TA_CENTER, textColor="#9b1c1c", spaceAfter=8 * mm)
    story = [
        Paragraph("Expediente ficticio para evaluación controlada de IA", title),
        Paragraph("Este documento no corresponde a una licitación, empresa ni certificado reales. Todos los nombres, importes y referencias han sido creados para una prueba académica reproducible.", warning),
    ]
    for index, (section, text) in enumerate(sections):
        if index == max(2, len(sections) // 2):
            story.append(PageBreak())
        story.extend([Paragraph(section, heading), Paragraph(text, body), Spacer(1, 4 * mm)])
    document = SimpleDocTemplate(str(target), pagesize=A4, rightMargin=20 * mm, leftMargin=20 * mm, topMargin=20 * mm, bottomMargin=22 * mm, title=case_id, author="TFG LIA - conjunto ficticio")
    document.build(story, onFirstPage=footer, onLaterPages=footer)


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    if FONT_PATH.exists():
        pdfmetrics.registerFont(TTFont("EvalFont", str(FONT_PATH)))
    else:
        raise SystemExit(f"Fuente no encontrada: {FONT_PATH}")
    for case_id, sections in CASES.items():
        build(case_id, sections)


if __name__ == "__main__":
    main()
