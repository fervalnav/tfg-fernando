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

export class DevSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const existingUser = await em.findOne(UserOrmEntity, { email: 'admin@demo.com' });
    if (existingUser) return;

    const accountId = uuidv7();
    const userId = uuidv7();
    const passwordHash = await bcrypt.hash('password123', 12);
    const now = new Date();

    // ── Cuenta y usuario ────────────────────────────────────────────────
    em.persist(new AccountOrmEntity({ id: accountId, name: 'Demo Account', createdAt: now }));
    em.persist(
      new UserOrmEntity({
        id: userId,
        email: 'admin@demo.com',
        passwordHash,
        firstName: 'Admin',
        lastName: 'Demo',
        avatarUrl: null,
        createdAt: now,
      }),
    );
    em.persist(
      new AccountMemberOrmEntity({
        id: uuidv7(),
        accountId,
        userId,
        role: 'ADMIN',
        isDefault: true,
        createdAt: now,
      }),
    );

    // ── Pipeline de licitaciones (por defecto) ───────────────────────────
    const pipelineId = uuidv7();
    const pipeline = new PipelineOrmEntity({
      id: pipelineId,
      accountId,
      name: 'Pipeline de licitaciones',
      createdAt: now,
      updatedAt: now,
    });
    em.persist(pipeline);

    const statuses: {
      name: string;
      isInitial?: boolean;
      isTerminal?: boolean;
      outcomeType: 'NONE' | 'WON' | 'LOST' | 'DROPPED';
      showInKanban: boolean;
      sortPoints: number;
    }[] = [
      { name: 'En análisis', isInitial: true, outcomeType: 'NONE', showInKanban: true, sortPoints: 100 },
      { name: 'Candidata', outcomeType: 'NONE', showInKanban: true, sortPoints: 200 },
      { name: 'En preparación', outcomeType: 'NONE', showInKanban: true, sortPoints: 300 },
      { name: 'Presentada', outcomeType: 'NONE', showInKanban: true, sortPoints: 400 },
      { name: 'Ganada', isTerminal: true, outcomeType: 'WON', showInKanban: true, sortPoints: 500 },
      { name: 'Perdida', isTerminal: true, outcomeType: 'LOST', showInKanban: true, sortPoints: 600 },
      { name: 'Descartada', isTerminal: true, outcomeType: 'DROPPED', showInKanban: false, sortPoints: 700 },
    ];

    for (const s of statuses) {
      em.persist(
        new PipelineStatusOrmEntity({
          id: uuidv7(),
          pipeline,
          name: s.name,
          description: null,
          backgroundColor: null,
          textColor: null,
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

    // ── Preguntas de control ─────────────────────────────────────────────
    const controlQuestions = [
      {
        question: '¿Se ha revisado el pliego de condiciones técnicas y administrativas?',
        answerType: 'BOOLEAN' as const,
        passConditionPrompt: 'La respuesta debe confirmar la revisión completa de ambos pliegos',
      },
      {
        question: '¿Cumplimos los requisitos de solvencia económica y técnica exigidos?',
        answerType: 'BOOLEAN' as const,
        passConditionPrompt: 'Debe confirmarse que se cumplen todos los requisitos de solvencia',
      },
      {
        question: '¿Cuál es el presupuesto base de licitación (sin IVA)?',
        answerType: 'TEXT' as const,
        passConditionPrompt: null,
      },
      {
        question: '¿Cuál es el plazo de ejecución del contrato?',
        answerType: 'TEXT' as const,
        passConditionPrompt: null,
      },
      {
        question: '¿Existe algún criterio de desempate que debamos considerar?',
        answerType: 'BOOLEAN' as const,
        passConditionPrompt: null,
      },
    ];

    for (const cq of controlQuestions) {
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

    // ── Campos personalizados ────────────────────────────────────────────
    const customFields = [
      {
        name: 'Presupuesto base (sin IVA)',
        description: 'Importe máximo de licitación antes de impuestos',
        type: 'NUMBER' as const,
        classifiers: [],
        canSelectMultiple: false,
        automatic: true,
        aiPrompt: 'Extrae el presupuesto base de licitación sin IVA del pliego o anuncio',
      },
      {
        name: 'Tipo de contrato',
        description: 'Clasificación según el objeto del contrato',
        type: 'CLASSIFIER' as const,
        classifiers: ['Obras', 'Servicios', 'Suministros', 'Concesión de obras', 'Concesión de servicios'],
        canSelectMultiple: false,
        automatic: true,
        aiPrompt: 'Clasifica el tipo de contrato según el objeto de la licitación',
      },
      {
        name: 'Plazo de ejecución',
        description: 'Duración del contrato en meses',
        type: 'NUMBER' as const,
        classifiers: [],
        canSelectMultiple: false,
        automatic: true,
        aiPrompt: 'Extrae el plazo de ejecución del contrato en meses',
      },
      {
        name: 'Sector',
        description: 'Sector al que pertenece la licitación',
        type: 'CLASSIFIER' as const,
        classifiers: [
          'TI y Telecomunicaciones',
          'Obra civil',
          'Servicios sociales',
          'Consultoría',
          'Energía',
          'Sanidad',
          'Educación',
          'Medio ambiente',
          'Seguridad',
          'Otros',
        ],
        canSelectMultiple: true,
        automatic: true,
        aiPrompt: 'Identifica el sector o sectores a los que pertenece esta licitación',
      },
      {
        name: 'Criterios de adjudicación',
        description: 'Descripción de los criterios de valoración',
        type: 'TEXT' as const,
        classifiers: [],
        canSelectMultiple: false,
        automatic: true,
        aiPrompt: 'Resume los criterios de adjudicación y sus ponderaciones',
      },
    ];

    for (const cf of customFields) {
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

    // ── Plantillas de resumen ────────────────────────────────────────────
    const summaryTemplates = [
      {
        name: 'Resumen ejecutivo',
        prompt:
          'Genera un resumen ejecutivo de esta licitación pública destacando: objeto del contrato, presupuesto base de licitación, plazo de ejecución, entidad licitadora, y los principales criterios de adjudicación con sus ponderaciones. Máximo 300 palabras.',
      },
      {
        name: 'Análisis de viabilidad',
        prompt:
          'Analiza la viabilidad de participar en esta licitación. Evalúa: requisitos de solvencia económica y técnica, complejidad técnica del objeto, competitividad del presupuesto, y posibles riesgos. Concluye con una recomendación (Participar / No participar / Estudiar en detalle). Máximo 400 palabras.',
      },
      {
        name: 'Análisis de criterios de adjudicación',
        prompt:
          'Analiza en detalle los criterios de adjudicación de esta licitación. Para cada criterio indica: nombre, ponderación, forma de valoración, y estrategia recomendada para maximizar la puntuación. Incluye tanto criterios automáticos como de juicio de valor.',
      },
    ];

    for (const st of summaryTemplates) {
      em.persist(
        new SummaryTemplateOrmEntity({
          id: uuidv7(),
          accountId,
          name: st.name,
          prompt: st.prompt,
          createdAt: now,
          updatedAt: now,
        }),
      );
    }

    await em.flush();
  }
}
