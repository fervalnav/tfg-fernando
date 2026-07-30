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
import { OpportunityOrmEntity } from '../../../opportunity/infrastructure/persistence/opportunity.orm-entity';
import { WorkflowStepActionOrmEntity } from '../../../opportunity/infrastructure/persistence/workflow-step-action.orm-entity';
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
  targetId?: string;
  metadata: Record<string, unknown> | null;
};

type QualificationCatalog = {
  controlQuestions: Map<string, string>;
  customFields: Map<string, string>;
  summaries: Map<string, string>;
};

type PipelineSeed = {
  pipelineId: string;
  initialStatusId: string;
};

type WorkflowSeed = {
  workflow: WorkflowOrmEntity;
  firstStep: WorkflowStepOrmEntity;
  firstStepActions: DefaultWorkflowStepActionOrmEntity[];
};

export class DevSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const existingUser = await em.findOne(UserOrmEntity, { email: 'admin@nexum.es' });
    if (existingUser) return;

    const now = new Date();
    const { accountId, adminUserId } = await this.seedAccountAndUsers(em, now);
    const pipeline = this.seedPipeline(em, accountId, now);
    const catalog: QualificationCatalog = {
      controlQuestions: this.seedControlQuestions(em, accountId, now),
      customFields: this.seedCustomFields(em, accountId, now),
      summaries: this.seedSummaryTemplates(em, accountId, now),
    };
    const workflow = this.seedWorkflows(em, accountId, catalog, now);
    await em.flush();
    await this.seedTenderOpportunity(em, accountId, adminUserId, pipeline, workflow, now);

    await em.flush();
  }

  // ── Cuenta y usuarios ──────────────────────────────────────────────────

  private async seedAccountAndUsers(em: EntityManager, now: Date): Promise<{ accountId: string; adminUserId: string }> {
    const accountId = uuidv7();
    const passwordHash = await bcrypt.hash('password123', 12);

    em.persist(new AccountOrmEntity({ id: accountId, name: 'Nexum Licitaciones S.L.', createdAt: now }));

    const users = [
      { email: 'admin@nexum.es', firstName: 'Fernando', lastName: 'Valdés', role: 'ADMIN' as const },
      { email: 'sara@nexum.es', firstName: 'Sara', lastName: 'Ibáñez', role: 'MEMBER' as const },
      { email: 'carlos@nexum.es', firstName: 'Carlos', lastName: 'Fuentes', role: 'MEMBER' as const },
    ];

    let adminUserId = '';
    for (const u of users) {
      const userId = uuidv7();
      if (u.role === 'ADMIN') adminUserId = userId;
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

    if (!adminUserId) throw new Error('La seed requiere un usuario administrador');
    return { accountId, adminUserId };
  }

  // ── Pipeline ───────────────────────────────────────────────────────────

  private seedPipeline(em: EntityManager, accountId: string, now: Date): PipelineSeed {
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

    let initialStatusId = '';
    for (const s of statuses) {
      const id = uuidv7();
      if (s.isInitial) initialStatusId = id;
      em.persist(
        new PipelineStatusOrmEntity({
          id,
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
    if (!initialStatusId) throw new Error('La seed requiere un estado inicial de pipeline');
    return { pipelineId: pipeline.id, initialStatusId };
  }

  // ── Preguntas de control ───────────────────────────────────────────────

  private seedControlQuestions(em: EntityManager, accountId: string, now: Date): Map<string, string> {
    const catalog = new Map<string, string>();
    const questions: { question: string; answerType: 'TEXT' | 'BOOLEAN'; passConditionPrompt: string | null }[] = [
      {
        question: '¿Se han descargado y revisado todos los documentos del expediente (PCAP, PPT, memoria y anexos)?',
        answerType: 'BOOLEAN',
        passConditionPrompt: 'La respuesta debe confirmar la revisión completa de toda la documentación del expediente',
      },
      {
        question:
          '¿Disponemos de todos los perfiles profesionales y medios personales que el pliego exige adscribir al contrato?',
        answerType: 'BOOLEAN',
        passConditionPrompt:
          'Debe verificarse cada perfil, titulación, experiencia mínima y documento acreditativo exigido por el pliego',
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
        question:
          '¿Podemos separar correctamente la documentación administrativa, técnica subjetiva y económica sin revelar información entre sobres?',
        answerType: 'BOOLEAN',
        passConditionPrompt:
          'Debe confirmarse que la documentación se distribuye en los sobres o archivos exigidos sin anticipar datos económicos',
      },
      {
        question:
          '¿Cumplimos las garantías y seguros exigidos, incluidos sus importes, coberturas, franquicias y vigencia?',
        answerType: 'BOOLEAN',
        passConditionPrompt:
          'Debe comprobarse cada garantía y seguro exigido en el PCAP y el PPTP, sin asumir coberturas no acreditadas',
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
      const id = uuidv7();
      em.persist(
        new DefaultControlQuestionOrmEntity({
          id,
          accountId,
          question: cq.question,
          answerType: cq.answerType,
          passConditionPrompt: cq.passConditionPrompt,
          createdAt: now,
          updatedAt: now,
        }),
      );
      catalog.set(cq.question, id);
    }
    return catalog;
  }

  // ── Campos personalizados ─────────────────────────────────────────────

  private seedCustomFields(em: EntityManager, accountId: string, now: Date): Map<string, string> {
    const catalog = new Map<string, string>();
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
        name: 'Número de expediente',
        description: 'Identificador oficial del expediente de contratación',
        type: 'TEXT',
        classifiers: [],
        canSelectMultiple: false,
        automatic: true,
        aiPrompt: 'Extrae el número oficial del expediente. Devuelve exactamente el identificador publicado.',
      },
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
        name: 'Procedimiento de adjudicación',
        description: 'Procedimiento y tipo de tramitación de la licitación',
        type: 'CLASSIFIER',
        classifiers: [
          'Abierto ordinario',
          'Abierto simplificado',
          'Abierto simplificado abreviado',
          'Restringido',
          'Negociado con publicidad',
          'Negociado sin publicidad',
          'Diálogo competitivo',
          'Asociación para la innovación',
          'Otro',
        ],
        canSelectMultiple: false,
        automatic: true,
        aiPrompt:
          'Clasifica el procedimiento de adjudicación usando exactamente una de las opciones permitidas e incluye la tramitación cuando corresponda.',
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
      const id = uuidv7();
      em.persist(
        new DefaultCustomFieldOrmEntity({
          id,
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
      catalog.set(cf.name, id);
    }
    return catalog;
  }

  // ── Plantillas de resumen ─────────────────────────────────────────────

  private seedSummaryTemplates(em: EntityManager, accountId: string, now: Date): Map<string, string> {
    const catalog = new Map<string, string>();
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
        name: 'Matriz de requisitos y causas de exclusión',
        prompt:
          'Construye una matriz verificable de requisitos de esta licitación. Para cada requisito indica: categoría, requisito literal resumido, ' +
          'documento y cláusula de origen, evidencia que debe aportar la empresa, estado CUMPLE / NO CUMPLE / PENDIENTE y consecuencia del incumplimiento. ' +
          'Incluye como mínimo solvencia económica, solvencia técnica, clasificación, perfiles y medios adscritos, garantías, seguros, documentación por sobres, ' +
          'plazos y límites económicos. No marques CUMPLE si la evidencia de la empresa no está disponible.',
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
      const id = uuidv7();
      em.persist(
        new SummaryTemplateOrmEntity({
          id,
          accountId,
          name: t.name,
          prompt: t.prompt,
          createdAt: now,
          updatedAt: now,
        }),
      );
      catalog.set(t.name, id);
    }
    return catalog;
  }

  // ── Workflows ─────────────────────────────────────────────────────────

  private seedWorkflows(em: EntityManager, accountId: string, catalog: QualificationCatalog, now: Date): WorkflowSeed {
    const standard = this.seedWorkflowEstandar(em, accountId, catalog, now);
    this.seedWorkflowUrgente(em, accountId, catalog, now);
    this.seedWorkflowMarco(em, accountId, catalog, now);
    return standard;
  }

  private seedWorkflowEstandar(
    em: EntityManager,
    accountId: string,
    catalog: QualificationCatalog,
    now: Date,
  ): WorkflowSeed {
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
        { name: 'Documentación del expediente', type: 'step', condition: null, position: 1 },
        { name: 'Lectura y estructuración con IA', type: 'step', condition: null, position: 2 },
        { name: 'Cualificación Go/No-Go', type: 'step', condition: null, position: 3 },
        {
          name: '¿Requiere revisión reforzada?',
          type: 'decision',
          condition:
            '¿Existen riesgos, requisitos de solvencia o incertidumbres relevantes que requieren una revisión reforzada antes de decidir?',
          position: 4,
        },
        { name: 'Estrategia para maximizar la puntuación', type: 'step', condition: null, position: 5 },
        { name: 'Preparación y revisión de la oferta', type: 'step', condition: null, position: 6 },
        { name: 'Presentación y seguimiento', type: 'step', condition: null, position: 7 },
      ],
      now,
    );

    const [s1, s2, s3, s4, s5, s6, s7] = steps;

    let firstStepActions: DefaultWorkflowStepActionOrmEntity[] = [];
    if (s1) {
      firstStepActions = this.createActions(
        em,
        s1,
        [
          { name: 'Adjuntar PCAP (pliego administrativo)', targetType: 'attachment', metadata: { label: 'PCAP' } },
          { name: 'Adjuntar PPTP (pliego técnico)', targetType: 'attachment', metadata: { label: 'PPTP' } },
        ],
        now,
      );
    }

    if (s2) {
      this.createActions(
        em,
        s2,
        [
          this.summaryAction('Generar resumen ejecutivo', 'Resumen ejecutivo', catalog),
          this.summaryAction(
            'Construir matriz de requisitos y exclusiones',
            'Matriz de requisitos y causas de exclusión',
            catalog,
          ),
          this.customFieldAction('Extraer número de expediente', 'Número de expediente', catalog),
          this.customFieldAction('Extraer presupuesto base sin IVA', 'Presupuesto base sin IVA (€)', catalog),
          this.customFieldAction('Extraer valor estimado del contrato', 'Valor estimado del contrato (€)', catalog),
          this.customFieldAction('Extraer plazo de ejecución', 'Plazo de ejecución (meses)', catalog),
          this.customFieldAction('Clasificar el tipo de contrato', 'Tipo de contrato', catalog),
          this.customFieldAction(
            'Identificar el procedimiento de adjudicación',
            'Procedimiento de adjudicación',
            catalog,
          ),
          this.customFieldAction('Identificar el lugar de ejecución', 'Comunidad Autónoma', catalog),
          this.customFieldAction('Clasificar el sector', 'Sector', catalog),
          this.customFieldAction('Extraer el CPV principal', 'Código CPV principal', catalog),
          this.customFieldAction('Identificar el órgano de contratación', 'Órgano de contratación', catalog),
          this.customFieldAction('Extraer el número de lotes', 'Número de lotes', catalog),
          this.customFieldAction('Identificar el criterio de adjudicación', 'Criterio de adjudicación', catalog),
          this.customFieldAction('Comprobar si admite UTE', 'Admite UTE', catalog),
          this.customFieldAction('Extraer la fecha límite', 'Fecha límite de presentación', catalog),
        ],
        now,
      );
    }

    if (s3) {
      this.createActions(
        em,
        s3,
        [
          this.controlQuestionAction(
            'Verificar solvencia económica y financiera',
            '¿Cumplimos los requisitos de solvencia económica y financiera exigidos (cifra de negocios mínima, seguros, etc.)?',
            catalog,
          ),
          this.controlQuestionAction(
            'Verificar solvencia técnica o profesional',
            '¿Cumplimos los requisitos de solvencia técnica o profesional (certificaciones, medios humanos, experiencia acreditada)?',
            catalog,
          ),
          this.controlQuestionAction(
            'Verificar perfiles y medios adscritos',
            '¿Disponemos de todos los perfiles profesionales y medios personales que el pliego exige adscribir al contrato?',
            catalog,
          ),
          this.controlQuestionAction(
            'Verificar ausencia de prohibiciones de contratar',
            '¿Hemos verificado que no existe ninguna causa de prohibición de contratar que nos afecte?',
            catalog,
          ),
          this.controlQuestionAction(
            'Validar el margen económico objetivo',
            '¿El presupuesto base de licitación es suficiente para ejecutar el contrato con un margen neto mínimo del 10%?',
            catalog,
          ),
          this.controlQuestionAction(
            'Confirmar experiencia acreditable',
            '¿Podemos acreditar experiencia en al menos tres contratos similares ejecutados en los últimos cinco años?',
            catalog,
          ),
          this.controlQuestionAction(
            'Verificar garantías y seguros',
            '¿Cumplimos las garantías y seguros exigidos, incluidos sus importes, coberturas, franquicias y vigencia?',
            catalog,
          ),
          this.controlQuestionAction(
            'Validar capacidad operativa y plazo',
            '¿El plazo de ejecución es compatible con nuestra capacidad operativa y carga de trabajo actual?',
            catalog,
          ),
          this.summaryAction('Generar recomendación Go/No-Go', 'Análisis de viabilidad', catalog),
        ],
        now,
      );
    }

    if (s4) {
      this.createActions(
        em,
        s4,
        [
          this.controlQuestionAction(
            'Comprobar disponibilidad de garantías',
            '¿Se requiere garantía provisional y, en su caso, disponemos de ella o tenemos línea de avales suficiente?',
            catalog,
          ),
          this.controlQuestionAction(
            'Revisar riesgos técnicos, económicos y de plazo',
            '¿Se han identificado, evaluado y aceptado todos los riesgos técnicos, económicos y de plazo del contrato?',
            catalog,
          ),
          this.summaryAction('Generar análisis de riesgos reforzado', 'Análisis de riesgos del contrato', catalog),
        ],
        now,
      );
    }

    if (s5) {
      this.createActions(
        em,
        s5,
        [
          this.controlQuestionAction(
            'Analizar la posición competitiva',
            '¿Hemos analizado la posición competitiva de los principales licitadores habituales en este tipo de contratos?',
            catalog,
          ),
          this.summaryAction(
            'Diseñar la estrategia por criterios de adjudicación',
            'Estrategia de criterios de adjudicación',
            catalog,
          ),
          this.summaryAction(
            'Generar guía de redacción de la oferta',
            'Guía de redacción de la oferta técnica',
            catalog,
          ),
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
            name: 'Redactar memoria técnica',
            targetType: 'task',
            metadata: { title: 'Redactar la memoria siguiendo los criterios y límites del pliego' },
          },
          {
            name: 'Preparar propuesta económica y validar margen',
            targetType: 'task',
            metadata: { title: 'Calcular precio, costes, contingencia y margen de la oferta' },
          },
          {
            name: 'Completar documentación administrativa',
            targetType: 'task',
            metadata: { title: 'Completar DEUC, declaraciones, solvencia y documentación administrativa' },
          },
          this.controlQuestionAction(
            'Validar separación de documentos por sobres',
            '¿Podemos separar correctamente la documentación administrativa, técnica subjetiva y económica sin revelar información entre sobres?',
            catalog,
          ),
          {
            name: 'Adjuntar oferta para revisión interna',
            targetType: 'attachment',
            metadata: { label: 'Oferta completa para revisión' },
          },
        ],
        now,
      );
    }

    if (s7) {
      this.createActions(
        em,
        s7,
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

    if (!s1) throw new Error('El workflow estándar requiere un primer paso');
    return { workflow, firstStep: s1, firstStepActions };
  }

  private seedWorkflowUrgente(em: EntityManager, accountId: string, catalog: QualificationCatalog, now: Date): void {
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
        { name: 'Documentación imprescindible', type: 'step', condition: null, position: 1 },
        { name: 'Análisis rápido con IA', type: 'step', condition: null, position: 2 },
        {
          name: '¿Requiere validación adicional?',
          type: 'decision',
          condition:
            '¿Hay algún requisito excluyente o riesgo crítico que deba validar una persona antes de continuar?',
          position: 3,
        },
        { name: 'Preparación express', type: 'step', condition: null, position: 4 },
        { name: 'Presentación', type: 'step', condition: null, position: 5 },
      ],
      now,
    );

    const [s1, s2, s3, s4, s5] = steps;

    if (s1) {
      this.createActions(
        em,
        s1,
        [
          { name: 'Adjuntar pliego completo', targetType: 'attachment', metadata: { label: 'Pliego completo' } },
          {
            name: 'Adjuntar anexos y modelos obligatorios',
            targetType: 'attachment',
            metadata: { label: 'Anexos y modelos' },
          },
        ],
        now,
      );
    }

    if (s2) {
      this.createActions(
        em,
        s2,
        [
          this.summaryAction('Generar resumen ejecutivo', 'Resumen ejecutivo', catalog),
          this.summaryAction('Generar recomendación rápida Go/No-Go', 'Análisis de viabilidad', catalog),
          this.customFieldAction('Extraer presupuesto base', 'Presupuesto base sin IVA (€)', catalog),
          this.customFieldAction('Extraer fecha límite', 'Fecha límite de presentación', catalog),
          this.customFieldAction('Extraer criterios de adjudicación', 'Criterio de adjudicación', catalog),
          this.controlQuestionAction(
            'Verificar solvencia económica',
            '¿Cumplimos los requisitos de solvencia económica y financiera exigidos (cifra de negocios mínima, seguros, etc.)?',
            catalog,
          ),
          this.controlQuestionAction(
            'Verificar solvencia técnica',
            '¿Cumplimos los requisitos de solvencia técnica o profesional (certificaciones, medios humanos, experiencia acreditada)?',
            catalog,
          ),
        ],
        now,
      );
    }

    if (s3) {
      this.createActions(
        em,
        s3,
        [
          this.controlQuestionAction(
            'Validar margen económico',
            '¿El presupuesto base de licitación es suficiente para ejecutar el contrato con un margen neto mínimo del 10%?',
            catalog,
          ),
          this.summaryAction('Generar análisis de riesgos urgente', 'Análisis de riesgos del contrato', catalog),
        ],
        now,
      );
    }

    if (s4) {
      this.createActions(
        em,
        s4,
        [
          this.summaryAction('Generar guía de redacción express', 'Guía de redacción de la oferta técnica', catalog),
          {
            name: 'Preparar propuesta técnica y económica',
            targetType: 'task',
            metadata: { title: 'Preparar y revisar la propuesta dentro del plazo urgente' },
          },
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

  private seedWorkflowMarco(em: EntityManager, accountId: string, catalog: QualificationCatalog, now: Date): void {
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
        { name: 'Documentación del acuerdo marco', type: 'step', condition: null, position: 1 },
        { name: 'Análisis del acuerdo con IA', type: 'step', condition: null, position: 2 },
        {
          name: '¿Requiere revisión estratégica reforzada?',
          type: 'decision',
          condition:
            '¿Hay dudas sobre el encaje con el portfolio de Nexum, la solvencia o la inversión necesaria para participar?',
          position: 3,
        },
        { name: 'Preparación de la candidatura', type: 'step', condition: null, position: 4 },
        { name: 'Revisión jurídica', type: 'step', condition: null, position: 5 },
        { name: 'Presentación de candidatura', type: 'step', condition: null, position: 6 },
      ],
      now,
    );

    const [s1, s2, s3, s4, s5, s6] = steps;

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
          {
            name: 'Adjuntar anexos y modelos de adhesión',
            targetType: 'attachment',
            metadata: { label: 'Anexos y modelos de adhesión' },
          },
        ],
        now,
      );
    }

    if (s2) {
      this.createActions(
        em,
        s2,
        [
          this.summaryAction('Generar resumen ejecutivo', 'Resumen ejecutivo', catalog),
          this.summaryAction('Analizar viabilidad del acuerdo', 'Análisis de viabilidad', catalog),
          this.customFieldAction('Extraer valor estimado', 'Valor estimado del contrato (€)', catalog),
          this.customFieldAction('Extraer plazo de vigencia', 'Plazo de ejecución (meses)', catalog),
          this.customFieldAction('Identificar lotes', 'Número de lotes', catalog),
          this.customFieldAction('Identificar CPV principal', 'Código CPV principal', catalog),
        ],
        now,
      );
    }

    if (s3) {
      this.createActions(
        em,
        s3,
        [
          this.controlQuestionAction(
            'Verificar solvencia económica del acuerdo',
            '¿Cumplimos los requisitos de solvencia económica y financiera exigidos (cifra de negocios mínima, seguros, etc.)?',
            catalog,
          ),
          this.controlQuestionAction(
            'Verificar solvencia técnica del acuerdo',
            '¿Cumplimos los requisitos de solvencia técnica o profesional (certificaciones, medios humanos, experiencia acreditada)?',
            catalog,
          ),
          this.summaryAction('Generar análisis de riesgos del acuerdo', 'Análisis de riesgos del contrato', catalog),
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

    if (s5) {
      this.createActions(
        em,
        s5,
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
          this.summaryAction('Actualizar análisis de riesgos jurídicos', 'Análisis de riesgos del contrato', catalog),
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

  // ── Caso de demostración ───────────────────────────────────────────────

  private async seedTenderOpportunity(
    em: EntityManager,
    accountId: string,
    adminUserId: string,
    pipeline: PipelineSeed,
    workflow: WorkflowSeed,
    now: Date,
  ): Promise<void> {
    const opportunityId = uuidv7();
    const description = [
      'Expediente 2026-P2-12 de Fundación Punta Begoña Fundazioa.',
      'Objeto: acceso y musealización del espacio geológico-arquitectónico bajo el primer tramo de la Galería Suroeste y adaptación de espacio para exposiciones en las Galerías Punta Begoña, Getxo.',
      'Contrato privado de obras, procedimiento abierto y tramitación ordinaria, sin división en lotes.',
      'Presupuesto base: 126.190,44 EUR con IVA. Base sin IVA y valor estimado: 104.289,62 EUR.',
      'CPV principal 45212350-4 (edificios de interés histórico o arquitectónico). CPV secundarios 31527260-6, 32342410-9 y 32321300-2.',
      'Plazo máximo de ejecución: un mes, sin prórroga ordinaria. Garantía definitiva: 5% del precio ofertado sin IVA. Garantía de obra mínima: un año.',
      'Solvencia económica: volumen anual de negocio del mejor de los tres últimos ejercicios superior al valor estimado.',
      'Solvencia técnica: tres obras similares en los últimos cinco años, cada una por importe igual o superior al presupuesto base, acreditadas mediante certificados de buena ejecución.',
      'Medios obligatorios: arquitecto o arquitecto técnico, coordinador general, museógrafo e historiador; cada perfil debe acreditar tres actuaciones similares. Una persona puede asumir varios perfiles si acredita todos los requisitos.',
      'Criterios: memoria técnica 49 puntos (32 estudio y propuesta constructiva/museográfica, 12 organización y planificación, 5 reducción de afecciones); oferta económica 36 puntos; ampliación de garantía 15 puntos.',
      'La oferta se presenta electrónicamente en tres archivos: A administrativo, B técnico sujeto a juicio de valor y C técnico objetivo y económico. El archivo B no puede revelar información económica.',
      'Seguro de responsabilidad civil: límite mínimo de 300.000 EUR por siniestro y franquicia máxima de 10.000 EUR.',
      'Fuentes: FPB.3-26-P2-12-PCAP-Obra_bunker.pdf y FPB.4-26-P2-12-PPTP-Obra_bunker.pdf.',
      'La fecha límite concreta no figura en estos dos pliegos y debe obtenerse del anuncio de licitación.',
    ].join('\n');

    em.persist(
      new OpportunityOrmEntity({
        id: opportunityId,
        accountId,
        title: '2026-P2-12 - Acceso y musealización de las Galerías Punta Begoña',
        description,
        amount: 104289.62,
        currency: 'EUR',
        pipelineId: pipeline.pipelineId,
        pipelineStatusId: pipeline.initialStatusId,
        sortPoints: 1000,
        workflowId: workflow.workflow.id,
        workflowStepId: workflow.firstStep.id,
        organizationId: null,
        dueDate: null,
        finalOutcomeType: null,
        closedAt: null,
        responsibleUserIds: [adminUserId],
        responsibleTeamIds: [],
        createdAt: now,
        updatedAt: now,
      }),
    );
    await em.flush();

    for (const defaultAction of workflow.firstStepActions) {
      em.persist(
        new WorkflowStepActionOrmEntity({
          id: uuidv7(),
          accountId,
          opportunityId,
          workflowStepId: workflow.firstStep.id,
          defaultWorkflowStepActionId: defaultAction.id,
          name: defaultAction.name,
          targetType: defaultAction.targetType,
          targetId: null,
          metadata: defaultAction.metadata,
          position: defaultAction.position,
          status: 'PENDING',
          errorMessage: null,
          completedAt: null,
          createdAt: now,
          updatedAt: now,
        }),
      );
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  private summaryAction(name: string, templateName: string, catalog: QualificationCatalog): ActionDef {
    return {
      name,
      targetType: 'summary',
      targetId: this.requiredTarget(catalog.summaries, templateName),
      metadata: null,
    };
  }

  private customFieldAction(name: string, fieldName: string, catalog: QualificationCatalog): ActionDef {
    return {
      name,
      targetType: 'custom_field',
      targetId: this.requiredTarget(catalog.customFields, fieldName),
      metadata: null,
    };
  }

  private controlQuestionAction(name: string, question: string, catalog: QualificationCatalog): ActionDef {
    return {
      name,
      targetType: 'control_question',
      targetId: this.requiredTarget(catalog.controlQuestions, question),
      metadata: null,
    };
  }

  private requiredTarget(catalog: Map<string, string>, key: string): string {
    const id = catalog.get(key);
    if (!id) throw new Error(`No existe la plantilla requerida por la seed: ${key}`);
    return id;
  }

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

  private createActions(
    em: EntityManager,
    step: WorkflowStepOrmEntity,
    defs: ActionDef[],
    now: Date,
  ): DefaultWorkflowStepActionOrmEntity[] {
    return defs.map((def, i) => {
      const action = new DefaultWorkflowStepActionOrmEntity({
        id: uuidv7(),
        step,
        name: def.name,
        targetType: def.targetType,
        targetId: def.targetId ?? null,
        metadata: def.metadata,
        position: i + 1,
        createdAt: now,
        updatedAt: now,
      });
      em.persist(action);
      return action;
    });
  }
}
