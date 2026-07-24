import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import * as bcrypt from 'bcrypt';
import { v7 as uuidv7 } from 'uuid';
import { UserOrmEntity } from '../../../auth/infrastructure/persistence/user.orm-entity';
import { AccountOrmEntity } from '../../../auth/infrastructure/persistence/account.orm-entity';
import { AccountMemberOrmEntity } from '../../../auth/infrastructure/persistence/account-member.orm-entity';
import { PipelineOrmEntity } from '../../../pipeline/infrastructure/persistence/pipeline.orm-entity';
import { PipelineStatusOrmEntity } from '../../../pipeline/infrastructure/persistence/pipeline-status.orm-entity';
import { DefaultControlQuestionOrmEntity } from '../../../control-question/infrastructure/persistence/default-control-question.orm-entity';
import { DefaultCustomFieldOrmEntity } from '../../../custom-field/infrastructure/persistence/default-custom-field.orm-entity';
import { SummaryTemplateOrmEntity } from '../../../summary/infrastructure/persistence/summary-template.orm-entity';
import { WorkflowOrmEntity } from '../../../workflow/infrastructure/persistence/workflow.orm-entity';
import { WorkflowStepOrmEntity } from '../../../workflow/infrastructure/persistence/workflow-step.orm-entity';
import { DefaultWorkflowStepActionOrmEntity } from '../../../workflow/infrastructure/persistence/default-workflow-step-action.orm-entity';
import type { ActionTargetType, StepType } from '@tfg/types';

type StatusDef = {
  name: string;
  description?: string;
  backgroundColor?: string;
  textColor?: string;
  isInitial?: boolean;
  isTerminal?: boolean;
  outcomeType: 'NONE' | 'WON' | 'LOST' | 'DROPPED';
  showInKanban: boolean;
  sortPoints: number;
};

type StepDef = {
  name: string;
  type: StepType;
  condition: string | null;
  position: number;
};

type ActionDef = {
  name: string;
  targetType: ActionTargetType;
  metadata: Record<string, unknown> | null;
};

export class DevSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const existingUser = await em.findOne(UserOrmEntity, { email: 'fernando@tendios.com' });
    if (existingUser) return;

    const now = new Date();
    const { accountId } = await this.seedAccountAndUsers(em, now);
    this.seedPipeline(em, accountId, now);
    this.seedControlQuestions(em, accountId, now);
    this.seedCustomFields(em, accountId, now);
    this.seedSummaryTemplates(em, accountId, now);
    this.seedWorkflows(em, accountId, now);

    await em.flush();
  }

  // ── Cuenta y usuarios ──────────────────────────────────────────────────

  private async seedAccountAndUsers(em: EntityManager, now: Date): Promise<{ accountId: string }> {
    const accountId = uuidv7();
    const passwordHash = await bcrypt.hash('password123', 12);

    em.persist(new AccountOrmEntity({ id: accountId, name: 'Tendios Technologies S.L.', createdAt: now }));

    const users = [
      { email: 'fernando@tendios.com', firstName: 'Alejandro', lastName: 'Morales', role: 'ADMIN' as const },
      { email: 'sara@tendios.es', firstName: 'Sara', lastName: 'Ibáñez', role: 'MEMBER' as const },
      { email: 'carlos@tendios.es', firstName: 'Carlos', lastName: 'Fuentes', role: 'MEMBER' as const },
    ];

    for (const u of users) {
      const userId = uuidv7();
      em.persist(
        new UserOrmEntity({
          id: userId,
          email: u.email,
          passwordHash,
          firstName: u.firstName,
          lastName: u.lastName,
          avatarUrl: null,
          createdAt: now,
        }),
      );
      em.persist(
        new AccountMemberOrmEntity({
          id: uuidv7(),
          accountId,
          userId,
          role: u.role,
          isDefault: true,
          createdAt: now,
        }),
      );
    }

    return { accountId };
  }

  // ── Pipeline ───────────────────────────────────────────────────────────

  private seedPipeline(em: EntityManager, accountId: string, now: Date): void {
    const pipeline = new PipelineOrmEntity({
      id: uuidv7(),
      accountId,
      name: 'Pipeline de licitaciones públicas',
      createdAt: now,
      updatedAt: now,
    });
    em.persist(pipeline);

    const statuses: StatusDef[] = [
      {
        name: 'Nueva',
        description: 'Licitación detectada, pendiente de análisis inicial',
        backgroundColor: '#6366f1',
        textColor: '#ffffff',
        isInitial: true,
        outcomeType: 'NONE',
        showInKanban: true,
        sortPoints: 100,
      },
      {
        name: 'En análisis',
        description: 'Se están revisando los pliegos y evaluando la viabilidad',
        backgroundColor: '#f59e0b',
        textColor: '#ffffff',
        outcomeType: 'NONE',
        showInKanban: true,
        sortPoints: 200,
      },
      {
        name: 'Candidata',
        description: 'Aprobada internamente para participar',
        backgroundColor: '#3b82f6',
        textColor: '#ffffff',
        outcomeType: 'NONE',
        showInKanban: true,
        sortPoints: 300,
      },
      {
        name: 'En preparación',
        description: 'Redacción de la oferta técnica y económica en curso',
        backgroundColor: '#8b5cf6',
        textColor: '#ffffff',
        outcomeType: 'NONE',
        showInKanban: true,
        sortPoints: 400,
      },
      {
        name: 'En revisión interna',
        description: 'Oferta completada, pendiente de aprobación final',
        backgroundColor: '#ec4899',
        textColor: '#ffffff',
        outcomeType: 'NONE',
        showInKanban: true,
        sortPoints: 500,
      },
      {
        name: 'Presentada',
        description: 'Oferta registrada en la plataforma de contratación',
        backgroundColor: '#06b6d4',
        textColor: '#ffffff',
        outcomeType: 'NONE',
        showInKanban: true,
        sortPoints: 600,
      },
      {
        name: 'En resolución',
        description: 'En espera del acuerdo de adjudicación provisional o definitivo',
        backgroundColor: '#64748b',
        textColor: '#ffffff',
        outcomeType: 'NONE',
        showInKanban: true,
        sortPoints: 700,
      },
      {
        name: 'Ganada',
        description: 'Contrato adjudicado a Nexum',
        backgroundColor: '#22c55e',
        textColor: '#ffffff',
        isTerminal: true,
        outcomeType: 'WON',
        showInKanban: true,
        sortPoints: 800,
      },
      {
        name: 'Perdida',
        description: 'Adjudicada a otro licitador',
        backgroundColor: '#ef4444',
        textColor: '#ffffff',
        isTerminal: true,
        outcomeType: 'LOST',
        showInKanban: true,
        sortPoints: 900,
      },
      {
        name: 'Descartada',
        description: 'Descartada antes de presentar (viabilidad negativa, sin recursos, etc.)',
        backgroundColor: '#94a3b8',
        textColor: '#ffffff',
        isTerminal: true,
        outcomeType: 'DROPPED',
        showInKanban: false,
        sortPoints: 1000,
      },
    ];

    for (const s of statuses) {
      em.persist(
        new PipelineStatusOrmEntity({
          id: uuidv7(),
          pipeline,
          name: s.name,
          description: s.description ?? null,
          backgroundColor: s.backgroundColor ?? null,
          textColor: s.textColor ?? null,
          isInitial: s.isInitial ?? false,
          isTerminal: s.isTerminal ?? false,
          outcomeType: s.outcomeType,
          showInKanban: s.showInKanban,
          sortPoints: s.sortPoints,
          createdAt: now,
          updatedAt: now,
        }),
      );
    }
  }

  // ── Preguntas de control ───────────────────────────────────────────────

  private seedControlQuestions(em: EntityManager, accountId: string, now: Date): void {
    const questions: { question: string; answerType: 'TEXT' | 'BOOLEAN'; passConditionPrompt: string | null }[] = [
      {
        question: '¿Se han descargado y revisado todos los documentos del expediente (PCAP, PPT, memoria y anexos)?',
        answerType: 'BOOLEAN',
        passConditionPrompt: 'La respuesta debe confirmar la revisión completa de toda la documentación del expediente',
      },
      {
        question:
          '¿Cumplimos los requisitos de solvencia económica y financiera exigidos (cifra de negocios mínima, seguros, etc.)?',
        answerType: 'BOOLEAN',
        passConditionPrompt:
          'Debe confirmarse el cumplimiento de todos los umbrales de solvencia económica y financiera',
      },
      {
        question:
          '¿Cumplimos los requisitos de solvencia técnica o profesional (certificaciones, medios humanos, experiencia acreditada)?',
        answerType: 'BOOLEAN',
        passConditionPrompt: 'Debe confirmarse que se cumplen todos los requisitos de solvencia técnica o profesional',
      },
      {
        question: '¿Hemos verificado que no existe ninguna causa de prohibición de contratar que nos afecte?',
        answerType: 'BOOLEAN',
        passConditionPrompt:
          'Debe confirmarse que la empresa no incurre en ninguna de las causas de prohibición previstas en la LCSP',
      },
      {
        question:
          '¿El presupuesto base de licitación es suficiente para ejecutar el contrato con un margen neto mínimo del 10%?',
        answerType: 'BOOLEAN',
        passConditionPrompt:
          'La respuesta debe confirmar que el análisis de costes garantiza un margen neto positivo de al menos el 10%',
      },
      {
        question:
          '¿Podemos acreditar experiencia en al menos tres contratos similares ejecutados en los últimos cinco años?',
        answerType: 'BOOLEAN',
        passConditionPrompt:
          'Debe confirmarse que disponemos de al menos tres referencias de contratos similares en el período exigido',
      },
      {
        question: '¿El plazo de ejecución es compatible con nuestra capacidad operativa y carga de trabajo actual?',
        answerType: 'BOOLEAN',
        passConditionPrompt:
          'Debe confirmarse que el equipo tiene capacidad suficiente para absorber el contrato en el plazo exigido',
      },
      {
        question:
          '¿Se requiere garantía provisional y, en su caso, disponemos de ella o tenemos línea de avales suficiente?',
        answerType: 'BOOLEAN',
        passConditionPrompt:
          'Si se exige garantía provisional, debe confirmarse que está disponible o puede obtenerse antes del plazo de presentación',
      },
      {
        question:
          '¿Hemos analizado la posición competitiva de los principales licitadores habituales en este tipo de contratos?',
        answerType: 'BOOLEAN',
        passConditionPrompt:
          'La respuesta debe confirmar que se ha realizado un análisis de competidores y se conoce la posición relativa de Nexum',
      },
      {
        question:
          '¿Se han identificado, evaluado y aceptado todos los riesgos técnicos, económicos y de plazo del contrato?',
        answerType: 'BOOLEAN',
        passConditionPrompt:
          'Debe confirmarse que el análisis de riesgos ha sido completado y los riesgos son asumibles',
      },
      {
        question: '¿Cuál es el presupuesto base de licitación sin IVA (en euros)?',
        answerType: 'TEXT',
        passConditionPrompt: null,
      },
      {
        question: '¿Cuál es el plazo de ejecución del contrato (en meses o semanas)?',
        answerType: 'TEXT',
        passConditionPrompt: null,
      },
      {
        question: '¿Requiere el contrato la constitución de una UTE con otro licitador?',
        answerType: 'BOOLEAN',
        passConditionPrompt: null,
      },
    ];

    for (const cq of questions) {
      em.persist(
        new DefaultControlQuestionOrmEntity({
          id: uuidv7(),
          accountId,
          question: cq.question,
          answerType: cq.answerType,
          passConditionPrompt: cq.passConditionPrompt,
          createdAt: now,
          updatedAt: now,
        }),
      );
    }
  }

  // ── Campos personalizados ─────────────────────────────────────────────

  private seedCustomFields(em: EntityManager, accountId: string, now: Date): void {
    const fields: {
      name: string;
      description: string;
      type: 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'CLASSIFIER';
      classifiers: string[];
      canSelectMultiple: boolean;
      automatic: boolean;
      aiPrompt: string | null;
    }[] = [
      {
        name: 'Presupuesto base sin IVA (€)',
        description: 'Importe máximo de licitación antes de aplicar el IVA',
        type: 'NUMBER',
        classifiers: [],
        canSelectMultiple: false,
        automatic: true,
        aiPrompt:
          'Extrae el presupuesto base de licitación sin IVA en euros. Devuelve solo el número, sin símbolo de moneda ni puntos de separación de miles.',
      },
      {
        name: 'Valor estimado del contrato (€)',
        description: 'Valor estimado total incluyendo posibles prórrogas y modificaciones',
        type: 'NUMBER',
        classifiers: [],
        canSelectMultiple: false,
        automatic: true,
        aiPrompt:
          'Extrae el valor estimado del contrato en euros, incluyendo prórrogas si se mencionan. Devuelve solo el número.',
      },
      {
        name: 'Plazo de ejecución (meses)',
        description: 'Duración total del contrato expresada en meses',
        type: 'NUMBER',
        classifiers: [],
        canSelectMultiple: false,
        automatic: true,
        aiPrompt:
          'Extrae el plazo de ejecución del contrato y conviértelo a meses. Si se indica en semanas o días, conviértelo. Devuelve solo el número.',
      },
      {
        name: 'Tipo de contrato',
        description: 'Clasificación del contrato según su objeto, conforme a la LCSP',
        type: 'CLASSIFIER',
        classifiers: ['Obras', 'Servicios', 'Suministros', 'Concesión de obras', 'Concesión de servicios', 'Privado'],
        canSelectMultiple: false,
        automatic: true,
        aiPrompt:
          'Clasifica el tipo de contrato público según la LCSP española: Obras, Servicios, Suministros, Concesión de obras, Concesión de servicios, o Privado.',
      },
      {
        name: 'Comunidad Autónoma',
        description: 'Comunidad autónoma en la que se ejecuta el contrato',
        type: 'CLASSIFIER',
        classifiers: [
          'Andalucía',
          'Aragón',
          'Asturias',
          'Baleares',
          'Canarias',
          'Cantabria',
          'Castilla-La Mancha',
          'Castilla y León',
          'Cataluña',
          'Ceuta',
          'Extremadura',
          'Galicia',
          'La Rioja',
          'Madrid',
          'Melilla',
          'Murcia',
          'Navarra',
          'País Vasco',
          'Valencia',
        ],
        canSelectMultiple: false,
        automatic: true,
        aiPrompt:
          'Identifica la comunidad autónoma en la que se ejecuta el contrato según el órgano de contratación o el lugar de ejecución.',
      },
      {
        name: 'Sector',
        description: 'Sector o sectores a los que pertenece el objeto del contrato',
        type: 'CLASSIFIER',
        classifiers: [
          'TI y Telecomunicaciones',
          'Obra civil e infraestructuras',
          'Servicios sociales y dependencia',
          'Consultoría y asesoría',
          'Energía y medio ambiente',
          'Sanidad y farmacia',
          'Educación y formación',
          'Seguridad y defensa',
          'Transporte y logística',
          'Administración electrónica',
          'Mantenimiento y facilities',
          'Otros',
        ],
        canSelectMultiple: true,
        automatic: true,
        aiPrompt:
          'Identifica el sector o sectores a los que pertenece el contrato. Pueden ser varios si el objeto es transversal.',
      },
      {
        name: 'Código CPV principal',
        description: 'Código CPV (Vocabulario Común de Contratos) del objeto principal',
        type: 'TEXT',
        classifiers: [],
        canSelectMultiple: false,
        automatic: true,
        aiPrompt:
          'Extrae el código CPV principal del anuncio de licitación. Devuelve solo el código numérico con su descripción, por ejemplo: "72000000 - Servicios de TI".',
      },
      {
        name: 'Órgano de contratación',
        description: 'Entidad o administración que publica la licitación',
        type: 'TEXT',
        classifiers: [],
        canSelectMultiple: false,
        automatic: true,
        aiPrompt:
          'Extrae el nombre completo del órgano de contratación o entidad adjudicadora tal como aparece en el pliego o anuncio.',
      },
      {
        name: 'Número de lotes',
        description: 'Cantidad de lotes en los que se divide el contrato (1 si es único)',
        type: 'NUMBER',
        classifiers: [],
        canSelectMultiple: false,
        automatic: true,
        aiPrompt: 'Extrae el número de lotes en los que se divide el contrato. Si no se divide en lotes, devuelve 1.',
      },
      {
        name: 'Criterio de adjudicación',
        description: 'Modalidad principal de valoración de las ofertas',
        type: 'CLASSIFIER',
        classifiers: ['Precio (único criterio)', 'Múltiples criterios', 'Subasta electrónica'],
        canSelectMultiple: false,
        automatic: true,
        aiPrompt:
          'Determina si el contrato se adjudica por precio como único criterio, por múltiples criterios (precio + técnicos) o por subasta electrónica.',
      },
      {
        name: 'Admite UTE',
        description: 'Indica si el pliego permite presentar oferta en Unión Temporal de Empresas',
        type: 'BOOLEAN',
        classifiers: [],
        canSelectMultiple: false,
        automatic: true,
        aiPrompt:
          'Determina si el pliego de condiciones administrativas permite la presentación de ofertas en UTE (Unión Temporal de Empresas). Responde true o false.',
      },
      {
        name: 'Fecha límite de presentación',
        description: 'Fecha y hora tope para registrar la oferta en la plataforma',
        type: 'DATE',
        classifiers: [],
        canSelectMultiple: false,
        automatic: true,
        aiPrompt:
          'Extrae la fecha límite de presentación de ofertas en formato ISO 8601 (YYYY-MM-DD). Si aparece con hora, inclúyela.',
      },
      {
        name: 'Plataforma de publicación',
        description: 'Portal o plataforma donde se ha publicado la licitación',
        type: 'CLASSIFIER',
        classifiers: [
          'PLACE (BOE)',
          'ROLECE',
          'PCSP (estatal)',
          'Plataforma autonómica',
          'Portal propio del órgano',
          'DOUE',
        ],
        canSelectMultiple: false,
        automatic: false,
        aiPrompt: null,
      },
    ];

    for (const cf of fields) {
      em.persist(
        new DefaultCustomFieldOrmEntity({
          id: uuidv7(),
          accountId,
          name: cf.name,
          description: cf.description,
          type: cf.type,
          classifiers: cf.classifiers,
          canSelectMultiple: cf.canSelectMultiple,
          automatic: cf.automatic,
          aiPrompt: cf.aiPrompt,
          createdAt: now,
          updatedAt: now,
        }),
      );
    }
  }

  // ── Plantillas de resumen ─────────────────────────────────────────────

  private seedSummaryTemplates(em: EntityManager, accountId: string, now: Date): void {
    const templates = [
      {
        name: 'Resumen ejecutivo',
        prompt:
          'Genera un resumen ejecutivo de esta licitación pública española para el equipo directivo de Nexum Licitaciones. ' +
          'Incluye: (1) objeto del contrato en una frase, (2) órgano de contratación, (3) presupuesto base sin IVA, ' +
          '(4) plazo de ejecución, (5) criterios de adjudicación con sus ponderaciones, y (6) fecha límite de presentación. ' +
          'Formato: párrafo introductorio + lista con viñetas. Máximo 300 palabras. Tono profesional y directo.',
      },
      {
        name: 'Análisis de viabilidad',
        prompt:
          'Realiza un análisis de viabilidad completo de esta licitación para decidir si Nexum Licitaciones debe presentar oferta. ' +
          'Evalúa los siguientes bloques: ' +
          '(1) Encaje estratégico: ¿el objeto del contrato es el núcleo de negocio o adyacente? ' +
          '(2) Solvencia: ¿los requisitos técnicos y económicos son alcanzables para una empresa mediana del sector? ' +
          '(3) Competitividad económica: ¿el presupuesto es competitivo para el mercado español? ' +
          '(4) Riesgos: identifica los tres principales riesgos del contrato. ' +
          '(5) Conclusión: recomienda una de estas tres opciones: PARTICIPAR / ESTUDIAR EN DETALLE / NO PARTICIPAR, con justificación en dos frases.',
      },
      {
        name: 'Estrategia de criterios de adjudicación',
        prompt:
          'Analiza en detalle los criterios de adjudicación de esta licitación y elabora una estrategia para maximizar la puntuación total. ' +
          'Para cada criterio indica: nombre, ponderación (puntos o %), tipo de valoración (automática por precio o por juicio de valor), ' +
          'y táctica concreta para obtener la máxima puntuación posible. ' +
          'Presta especial atención a los criterios de juicio de valor (memorias, metodologías, mejoras) donde hay más margen de diferenciación. ' +
          'Concluye con el orden de prioridad de esfuerzo por criterio. Máximo 500 palabras.',
      },
      {
        name: 'Guía de redacción de la oferta técnica',
        prompt:
          'Basándote en los pliegos de esta licitación, genera una guía detallada para redactar la oferta técnica de Nexum. ' +
          'Incluye: (1) estructura recomendada de la memoria técnica (secciones y orden), (2) puntos críticos que el evaluador valorará, ' +
          '(3) errores frecuentes que descartan ofertas en este tipo de contratos, (4) documentación complementaria recomendada, ' +
          'y (5) extensión máxima estimada por sección. Usa lenguaje claro y accionable para el equipo redactor.',
      },
      {
        name: 'Análisis de riesgos del contrato',
        prompt:
          'Realiza un análisis de riesgos detallado de este contrato público para Nexum Licitaciones. ' +
          'Identifica y evalúa los riesgos en las siguientes categorías: ' +
          '(1) Técnicos: complejidad de ejecución, dependencias tecnológicas, recursos necesarios. ' +
          '(2) Económicos: variaciones de costes, penalidades por demora, revisión de precios. ' +
          '(3) Legales y de cumplimiento: cláusulas especiales, condiciones especiales de ejecución, subcontratación. ' +
          '(4) De plazo: hitos intermedios, condicionantes externos, procedimientos de aprobación. ' +
          'Para cada riesgo indica: descripción, probabilidad (alta/media/baja), impacto (alto/medio/bajo) y medida de mitigación propuesta. ' +
          'Formato: tabla de riesgos + párrafo de conclusiones.',
      },
    ];

    for (const t of templates) {
      em.persist(
        new SummaryTemplateOrmEntity({
          id: uuidv7(),
          accountId,
          name: t.name,
          prompt: t.prompt,
          createdAt: now,
          updatedAt: now,
        }),
      );
    }
  }

  // ── Workflows ─────────────────────────────────────────────────────────

  private seedWorkflows(em: EntityManager, accountId: string, now: Date): void {
    this.seedWorkflowEstandar(em, accountId, now);
    this.seedWorkflowUrgente(em, accountId, now);
    this.seedWorkflowMarco(em, accountId, now);
  }

  private seedWorkflowEstandar(em: EntityManager, accountId: string, now: Date): void {
    const workflow = new WorkflowOrmEntity({
      id: uuidv7(),
      accountId,
      name: 'Proceso estándar de licitación',
      description:
        'Proceso completo de análisis, preparación y presentación de ofertas para licitaciones públicas de complejidad media-alta.',
      createdAt: now,
      updatedAt: now,
    });
    em.persist(workflow);

    const steps = this.createSteps(
      em,
      workflow,
      [
        { name: 'Captura y análisis inicial', type: 'step', condition: null, position: 1 },
        {
          name: '¿Es candidata?',
          type: 'decision',
          condition: '¿La licitación cumple los criterios mínimos de viabilidad estratégica y técnica?',
          position: 2,
        },
        { name: 'Due diligence y cualificación', type: 'step', condition: null, position: 3 },
        { name: 'Preparación de la oferta', type: 'step', condition: null, position: 4 },
        {
          name: '¿Aprobamos presentar?',
          type: 'decision',
          condition: '¿La oferta ha superado la revisión interna y el comité aprueba su presentación?',
          position: 5,
        },
        { name: 'Presentación y registro', type: 'step', condition: null, position: 6 },
      ],
      now,
    );

    const [s1, , s3, s4, , s6] = steps;

    if (s1) {
      this.createActions(
        em,
        s1,
        [
          { name: 'Adjuntar PCAP (pliego administrativo)', targetType: 'attachment', metadata: { label: 'PCAP' } },
          { name: 'Adjuntar PPT (pliego técnico)', targetType: 'attachment', metadata: { label: 'PPT' } },
          { name: 'Generar resumen ejecutivo', targetType: 'summary', metadata: null },
          { name: 'Generar análisis de viabilidad', targetType: 'summary', metadata: null },
          { name: 'Extraer campos clave automáticamente', targetType: 'custom_field', metadata: null },
        ],
        now,
      );
    }

    if (s3) {
      this.createActions(
        em,
        s3,
        [
          { name: 'Revisar todos los requisitos de solvencia', targetType: 'control_question', metadata: null },
          { name: 'Verificar ausencia de prohibiciones de contratar', targetType: 'control_question', metadata: null },
          {
            name: 'Confirmar experiencia acreditable en contratos similares',
            targetType: 'control_question',
            metadata: null,
          },
          { name: 'Validar margen económico del contrato (>10%)', targetType: 'control_question', metadata: null },
          { name: 'Evaluar riesgos técnicos y de plazo', targetType: 'control_question', metadata: null },
          { name: 'Generar estrategia de criterios de adjudicación', targetType: 'summary', metadata: null },
          { name: 'Generar análisis de riesgos del contrato', targetType: 'summary', metadata: null },
          {
            name: 'Adjuntar informe de referencias y experiencia',
            targetType: 'attachment',
            metadata: { label: 'Referencias y experiencia acreditada' },
          },
        ],
        now,
      );
    }

    if (s4) {
      this.createActions(
        em,
        s4,
        [
          {
            name: 'Redactar memoria técnica (borrador)',
            targetType: 'task',
            metadata: { title: 'Redactar memoria técnica de la oferta' },
          },
          {
            name: 'Calcular propuesta económica y análisis de costes',
            targetType: 'task',
            metadata: { title: 'Calcular precio de oferta y margen neto' },
          },
          {
            name: 'Preparar documentación administrativa (DEUC, seguros, etc.)',
            targetType: 'task',
            metadata: { title: 'Completar documentación administrativa obligatoria' },
          },
          {
            name: 'Adjuntar borrador de oferta técnica para revisión',
            targetType: 'attachment',
            metadata: { label: 'Borrador oferta técnica' },
          },
          { name: 'Generar guía de redacción de oferta técnica', targetType: 'summary', metadata: null },
        ],
        now,
      );
    }

    if (s6) {
      this.createActions(
        em,
        s6,
        [
          {
            name: 'Adjuntar oferta técnica definitiva',
            targetType: 'attachment',
            metadata: { label: 'Oferta técnica definitiva' },
          },
          {
            name: 'Adjuntar oferta económica definitiva',
            targetType: 'attachment',
            metadata: { label: 'Oferta económica definitiva' },
          },
          {
            name: 'Registrar oferta en la plataforma de contratación',
            targetType: 'task',
            metadata: { title: 'Subir documentos y registrar oferta en la plataforma' },
          },
          {
            name: 'Notificar presentación al equipo directivo',
            targetType: 'email_notification',
            metadata: {
              subject: 'Oferta presentada — {{licitación}}',
              message:
                'La oferta para la licitación ha sido registrada correctamente en la plataforma. El resultado se comunicará en cuanto esté disponible.',
            },
          },
        ],
        now,
      );
    }
  }

  private seedWorkflowUrgente(em: EntityManager, accountId: string, now: Date): void {
    const workflow = new WorkflowOrmEntity({
      id: uuidv7(),
      accountId,
      name: 'Licitación urgente (<48h)',
      description: 'Proceso acelerado para licitaciones con plazo de presentación inferior a 48 horas.',
      createdAt: now,
      updatedAt: now,
    });
    em.persist(workflow);

    const steps = this.createSteps(
      em,
      workflow,
      [
        { name: 'Análisis rápido de viabilidad', type: 'step', condition: null, position: 1 },
        {
          name: '¿Presentamos?',
          type: 'decision',
          condition: '¿La viabilidad es suficiente para presentar en tiempo limitado?',
          position: 2,
        },
        { name: 'Preparación y presentación express', type: 'step', condition: null, position: 3 },
      ],
      now,
    );

    const [s1, , s3] = steps;

    if (s1) {
      this.createActions(
        em,
        s1,
        [
          { name: 'Adjuntar pliego completo', targetType: 'attachment', metadata: { label: 'Pliego completo' } },
          { name: 'Generar resumen ejecutivo', targetType: 'summary', metadata: null },
          { name: 'Generar análisis de viabilidad', targetType: 'summary', metadata: null },
          { name: 'Verificar solvencia y ausencia de prohibiciones', targetType: 'control_question', metadata: null },
          { name: 'Confirmar margen económico suficiente', targetType: 'control_question', metadata: null },
          { name: 'Extraer campos clave', targetType: 'custom_field', metadata: null },
        ],
        now,
      );
    }

    if (s3) {
      this.createActions(
        em,
        s3,
        [
          {
            name: 'Adjuntar propuesta técnica y económica',
            targetType: 'attachment',
            metadata: { label: 'Propuesta completa' },
          },
          {
            name: 'Registrar en plataforma de contratación',
            targetType: 'task',
            metadata: { title: 'Subir oferta a la plataforma — urgente' },
          },
          {
            name: 'Notificar presentación urgente al equipo',
            targetType: 'email_notification',
            metadata: {
              subject: 'Oferta urgente presentada',
              message: 'Se ha registrado la oferta dentro del plazo establecido.',
            },
          },
        ],
        now,
      );
    }
  }

  private seedWorkflowMarco(em: EntityManager, accountId: string, now: Date): void {
    const workflow = new WorkflowOrmEntity({
      id: uuidv7(),
      accountId,
      name: 'Acuerdo Marco / Sistema Dinámico',
      description:
        'Proceso para la adhesión a acuerdos marco y sistemas dinámicos de adquisición. Mayor énfasis en la fase legal y de revisión.',
      createdAt: now,
      updatedAt: now,
    });
    em.persist(workflow);

    const steps = this.createSteps(
      em,
      workflow,
      [
        { name: 'Análisis del acuerdo marco', type: 'step', condition: null, position: 1 },
        {
          name: '¿Encaja en nuestra estrategia?',
          type: 'decision',
          condition:
            '¿El acuerdo marco es relevante para el portfolio de servicios de Nexum y la inversión es justificable?',
          position: 2,
        },
        { name: 'Preparación de la candidatura', type: 'step', condition: null, position: 3 },
        { name: 'Revisión jurídica', type: 'step', condition: null, position: 4 },
        { name: 'Presentación de candidatura', type: 'step', condition: null, position: 5 },
      ],
      now,
    );

    const [s1, , s3, s4, s5] = steps;

    if (s1) {
      this.createActions(
        em,
        s1,
        [
          {
            name: 'Adjuntar documentación del acuerdo marco',
            targetType: 'attachment',
            metadata: { label: 'Documentación del acuerdo marco' },
          },
          { name: 'Generar resumen ejecutivo', targetType: 'summary', metadata: null },
          { name: 'Generar análisis de viabilidad', targetType: 'summary', metadata: null },
          { name: 'Extraer campos clave del acuerdo', targetType: 'custom_field', metadata: null },
        ],
        now,
      );
    }

    if (s3) {
      this.createActions(
        em,
        s3,
        [
          {
            name: 'Verificar todos los requisitos de solvencia del marco',
            targetType: 'control_question',
            metadata: null,
          },
          {
            name: 'Redactar memoria de capacidades técnicas',
            targetType: 'task',
            metadata: { title: 'Redactar memoria de capacidades y recursos' },
          },
          {
            name: 'Recopilar certificaciones y acreditaciones',
            targetType: 'task',
            metadata: { title: 'Reunir certificados ISO, CMMI u otros exigidos' },
          },
          {
            name: 'Adjuntar fichas de proyectos de referencia',
            targetType: 'attachment',
            metadata: { label: 'Fichas de proyectos de referencia' },
          },
          {
            name: 'Preparar documentación administrativa (DEUC, etc.)',
            targetType: 'task',
            metadata: { title: 'Completar DEUC y documentación administrativa del marco' },
          },
        ],
        now,
      );
    }

    if (s4) {
      this.createActions(
        em,
        s4,
        [
          {
            name: 'Revisar cláusulas especiales y condiciones de ejecución',
            targetType: 'task',
            metadata: { title: 'Revisión jurídica de condiciones especiales del acuerdo' },
          },
          {
            name: 'Adjuntar informe jurídico',
            targetType: 'attachment',
            metadata: { label: 'Informe de revisión jurídica' },
          },
          { name: 'Generar análisis de riesgos del contrato', targetType: 'summary', metadata: null },
        ],
        now,
      );
    }

    if (s5) {
      this.createActions(
        em,
        s5,
        [
          {
            name: 'Adjuntar candidatura definitiva completa',
            targetType: 'attachment',
            metadata: { label: 'Candidatura definitiva al acuerdo marco' },
          },
          {
            name: 'Registrar candidatura en la plataforma',
            targetType: 'task',
            metadata: { title: 'Subir candidatura al acuerdo marco en la plataforma' },
          },
          {
            name: 'Notificar presentación al equipo directivo',
            targetType: 'email_notification',
            metadata: {
              subject: 'Candidatura a acuerdo marco presentada',
              message:
                'La candidatura ha sido registrada en la plataforma de contratación. Se comunicará el resultado cuando esté disponible.',
            },
          },
        ],
        now,
      );
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  private createSteps(
    em: EntityManager,
    workflow: WorkflowOrmEntity,
    defs: StepDef[],
    now: Date,
  ): WorkflowStepOrmEntity[] {
    return defs.map((def) => {
      const step = new WorkflowStepOrmEntity({
        id: uuidv7(),
        workflow,
        name: def.name,
        type: def.type,
        condition: def.condition,
        position: def.position,
        createdAt: now,
        updatedAt: now,
      });
      em.persist(step);
      return step;
    });
  }

  private createActions(em: EntityManager, step: WorkflowStepOrmEntity, defs: ActionDef[], now: Date): void {
    defs.forEach((def, i) => {
      em.persist(
        new DefaultWorkflowStepActionOrmEntity({
          id: uuidv7(),
          step,
          name: def.name,
          targetType: def.targetType,
          targetId: null,
          metadata: def.metadata,
          position: i + 1,
          createdAt: now,
          updatedAt: now,
        }),
      );
    });
  }
}
