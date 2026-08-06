import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/core';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AiGenerationService } from '../src/ai/domain/ai-generation.service';
import { AttachmentStorageService } from '../src/attachment/domain/attachment-storage.service';
import { StorageService } from '../src/shared/infrastructure/storage/storage.service';
import { prepareE2eDatabase } from './support/e2e-database';
import { FakeAiGenerationService } from './support/fake-ai-generation.service';
import { InMemoryAttachmentStorageService } from './support/in-memory-attachment-storage.service';

type AuthBody = {
  accountId: string;
  user: { email: string };
};

type PaginatedBody<T> = {
  items: T[];
  total: number;
};

type WorkflowActionBody = {
  id: string;
  name: string;
  status: 'PENDING' | 'COMPLETED' | 'SKIPPED' | 'FAILED';
};

type TestAgent = ReturnType<typeof request.agent>;

const IDS = {
  pipeline: '0198f6b3-1fd7-7fba-8e79-53161b649901',
  status: '0198f6b3-1fd7-7fba-8e79-53161b649902',
  workflow: '0198f6b3-1fd7-7fba-8e79-53161b649903',
  step: '0198f6b3-1fd7-7fba-8e79-53161b649904',
  defaultAction: '0198f6b3-1fd7-7fba-8e79-53161b649905',
  opportunity: '0198f6b3-1fd7-7fba-8e79-53161b649906',
  attachment: '0198f6b3-1fd7-7fba-8e79-53161b649907',
  summaryTemplate: '0198f6b3-1fd7-7fba-8e79-53161b649908',
  summary: '0198f6b3-1fd7-7fba-8e79-53161b649909',
  controlQuestionTemplate: '0198f6b3-1fd7-7fba-8e79-53161b649910',
  controlQuestion: '0198f6b3-1fd7-7fba-8e79-53161b649911',
} as const;

describe('TFG API (e2e)', () => {
  let app: INestApplication<App>;
  let orm: MikroORM;
  const ai = new FakeAiGenerationService();
  const storage = new InMemoryAttachmentStorageService();

  beforeAll(async () => {
    await prepareE2eDatabase();
    const { AppModule } = await import('../src/app.module');
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(AiGenerationService)
      .useValue(ai)
      .overrideProvider(AttachmentStorageService)
      .useValue(storage)
      .overrideProvider(StorageService)
      .useValue({})
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
    orm = app.get(MikroORM);
  });

  beforeEach(async () => {
    await orm.getSchemaGenerator().clearDatabase();
    ai.reset();
    storage.reset();
  });

  afterAll(async () => {
    if (orm) await orm.close(true);
    if (app) await app.close();
  });

  it('exposes a public health check', async () => {
    await request(app.getHttpServer()).get('/api/health').expect(200, { status: 'ok' });
  });

  it('registers a user, creates an isolated account and returns the current session', async () => {
    const agent = request.agent(app.getHttpServer());
    const registration = await register(agent, 'owner-one@example.test', 'Cuenta Uno');

    expect(registration.accountId).toEqual(expect.any(String));
    expect(registration.user.email).toBe('owner-one@example.test');
    await agent
      .get('/api/auth/me')
      .expect(200)
      .expect(({ body }: { body: AuthBody }) => {
        expect(body.accountId).toBe(registration.accountId);
        expect(body.user.email).toBe('owner-one@example.test');
      });
  });

  it('logs in with valid credentials and rejects invalid credentials', async () => {
    const registrationAgent = request.agent(app.getHttpServer());
    await register(registrationAgent, 'login@example.test', 'Cuenta Login');

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'login@example.test', password: 'wrong-password' })
      .expect(401);

    const loginAgent = request.agent(app.getHttpServer());
    await loginAgent
      .post('/api/auth/login')
      .send({ email: 'login@example.test', password: 'password123' })
      .expect(200)
      .expect(({ body }: { body: AuthBody }) => {
        expect(body.user.email).toBe('login@example.test');
      });
    await loginAgent.get('/api/auth/me').expect(200);
  });

  it('rejects protected routes without authentication', async () => {
    await request(app.getHttpServer()).get('/api/opportunities').expect(401);
  });

  it('validates malformed registration and opportunity payloads', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'invalid', password: 'short' })
      .expect(400);

    const agent = request.agent(app.getHttpServer());
    await register(agent, 'validation@example.test', 'Cuenta Validación');
    await agent
      .post('/api/opportunities')
      .send({ id: 'not-a-uuid', title: '', pipelineId: 'bad', pipelineStatusId: 'bad' })
      .expect(400);
  });

  it('creates and reads an opportunity in the authenticated account', async () => {
    const agent = request.agent(app.getHttpServer());
    await register(agent, 'opportunity@example.test', 'Cuenta Oportunidad');
    await createPipeline(agent);

    await agent.post('/api/opportunities').send(opportunityPayload()).expect(201);
    await agent
      .get(`/api/opportunities/${IDS.opportunity}`)
      .expect(200)
      .expect(({ body }: { body: { id: string; title: string } }) => {
        expect(body).toMatchObject({ id: IDS.opportunity, title: 'Licitación E2E' });
      });

    await agent
      .get(`/api/opportunities?pipelineId=${IDS.pipeline}`)
      .expect(200)
      .expect(({ body }: { body: PaginatedBody<{ id: string }> }) => {
        expect(body.total).toBe(1);
        expect(body.items).toEqual([expect.objectContaining({ id: IDS.opportunity })]);
      });
  });

  it('assigns a workflow and completes a runtime action', async () => {
    const agent = request.agent(app.getHttpServer());
    await register(agent, 'workflow@example.test', 'Cuenta Workflow');
    await createPipeline(agent);
    await createWorkflow(agent);
    await agent.post('/api/opportunities').send(opportunityPayload()).expect(201);

    await agent.post(`/api/opportunities/${IDS.opportunity}/workflow`).send({ workflowId: IDS.workflow }).expect(204);

    const actionsResponse = await agent.get(`/api/opportunities/${IDS.opportunity}/workflow/actions`).expect(200);
    const actions = actionsResponse.body as WorkflowActionBody[];
    expect(actions).toEqual([expect.objectContaining({ name: 'Revisión manual E2E', status: 'PENDING' })]);

    await agent.post(`/api/opportunities/${IDS.opportunity}/workflow/actions/${actions[0]?.id}/complete`).expect(204);
    await agent
      .get(`/api/opportunities/${IDS.opportunity}/workflow/actions`)
      .expect(200)
      .expect(({ body }: { body: WorkflowActionBody[] }) => {
        expect(body[0]?.status).toBe('COMPLETED');
      });
  });

  it('stores a PDF with the fake storage and sends its buffer to deterministic AI generation', async () => {
    const agent = request.agent(app.getHttpServer());
    await register(agent, 'documents@example.test', 'Cuenta Documentos');
    await createPipeline(agent);
    await agent.post('/api/opportunities').send(opportunityPayload()).expect(201);
    const pdf = Buffer.from('%PDF-1.4\nE2E fixture');

    await agent
      .post(`/api/opportunities/${IDS.opportunity}/attachments`)
      .field('id', IDS.attachment)
      .field('description', 'Anuncio ficticio')
      .attach('file', pdf, { filename: 'anuncio.pdf', contentType: 'application/pdf' })
      .expect(201);
    await agent
      .get(`/api/opportunities/${IDS.opportunity}/attachments`)
      .expect(200)
      .expect(({ body }: { body: Array<{ id: string; name: string }> }) => {
        expect(body).toEqual([expect.objectContaining({ id: IDS.attachment, name: 'anuncio.pdf' })]);
      });

    await agent
      .post('/api/summaries/templates')
      .send({ id: IDS.summaryTemplate, name: 'Resumen E2E', prompt: 'Resume los documentos.' })
      .expect(201);
    await agent
      .post(`/api/opportunities/${IDS.opportunity}/summaries`)
      .send({ id: IDS.summary, summaryTemplateId: IDS.summaryTemplate })
      .expect(201);
    await agent.post(`/api/opportunities/${IDS.opportunity}/summaries/${IDS.summary}/generate`).expect(202);

    await waitForSummary(agent, 'COMPLETED');
    expect(ai.requests).toHaveLength(1);
    expect(ai.requests[0]?.documents).toEqual([
      expect.objectContaining({
        filename: 'anuncio.pdf',
        mediaType: 'application/pdf',
        data: expect.any(Uint8Array),
      }),
    ]);
    expect(Buffer.from(ai.requests[0]?.documents?.[0]?.data ?? [])).toEqual(pdf);

    await agent.delete(`/api/opportunities/${IDS.opportunity}/attachments/${IDS.attachment}`).expect(204);
    await agent.get(`/api/opportunities/${IDS.opportunity}/attachments`).expect(200, []);
  });

  it('rejects a non-PDF attachment before reaching storage', async () => {
    const agent = request.agent(app.getHttpServer());
    await register(agent, 'invalid-file@example.test', 'Cuenta Archivo Inválido');
    await createPipeline(agent);
    await agent.post('/api/opportunities').send(opportunityPayload()).expect(201);

    await agent
      .post(`/api/opportunities/${IDS.opportunity}/attachments`)
      .field('id', IDS.attachment)
      .attach('file', Buffer.from('plain text'), { filename: 'notas.txt', contentType: 'text/plain' })
      .expect(400);
    await agent.get(`/api/opportunities/${IDS.opportunity}/attachments`).expect(200, []);
  });

  it('prevents users from reading or modifying another account opportunity', async () => {
    const owner = request.agent(app.getHttpServer());
    const outsider = request.agent(app.getHttpServer());
    await register(owner, 'owner@example.test', 'Cuenta Propietaria');
    await createPipeline(owner);
    await owner.post('/api/opportunities').send(opportunityPayload()).expect(201);
    await register(outsider, 'outsider@example.test', 'Cuenta Ajena');

    await outsider.get(`/api/opportunities/${IDS.opportunity}`).expect(404);
    await outsider.patch(`/api/opportunities/${IDS.opportunity}`).send({ title: 'Intrusión' }).expect(404);
    await outsider.delete(`/api/opportunities/${IDS.opportunity}`).expect(404);
  });

  it('isolates attachments, workflows and qualification instances between accounts', async () => {
    const owner = request.agent(app.getHttpServer());
    const outsider = request.agent(app.getHttpServer());
    await register(owner, 'resources-owner@example.test', 'Cuenta Recursos');
    await createPipeline(owner);
    await createWorkflow(owner);
    await owner.post('/api/opportunities').send(opportunityPayload()).expect(201);
    await owner
      .post(`/api/opportunities/${IDS.opportunity}/attachments`)
      .field('id', IDS.attachment)
      .attach('file', Buffer.from('%PDF-1.4\nPrivate fixture'), {
        filename: 'privado.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);
    await owner
      .post('/api/control-questions/defaults')
      .send({
        id: IDS.controlQuestionTemplate,
        question: '¿Cumple la solvencia?',
        answerType: 'BOOLEAN',
      })
      .expect(201);
    await owner
      .post(`/api/opportunities/${IDS.opportunity}/control-questions`)
      .send({ id: IDS.controlQuestion, defaultControlQuestionId: IDS.controlQuestionTemplate })
      .expect(201);

    await register(outsider, 'resources-outsider@example.test', 'Cuenta Ajena');

    await outsider.get(`/api/opportunities/${IDS.opportunity}/attachments`).expect(404);
    await outsider.get(`/api/workflows/${IDS.workflow}`).expect(404);
    await outsider.get(`/api/opportunities/${IDS.opportunity}/control-questions`).expect(200, []);
    await outsider
      .patch(`/api/opportunities/${IDS.opportunity}/control-questions/${IDS.controlQuestion}`)
      .send({ answer: true })
      .expect(404);
  });

  async function register(agent: TestAgent, email: string, accountName: string): Promise<AuthBody> {
    const response = await agent
      .post('/api/auth/register')
      .send({
        email,
        password: 'password123',
        firstName: 'Persona',
        lastName: 'E2E',
        accountName,
      })
      .expect(201);
    await waitForAccountDefaults(agent);
    return response.body as AuthBody;
  }

  async function waitForAccountDefaults(agent: TestAgent): Promise<void> {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const [pipelines, workflows] = await Promise.all([
        agent.get('/api/pipelines').expect(200),
        agent.get('/api/workflows').expect(200),
      ]);
      const pipelineBody = pipelines.body as PaginatedBody<unknown>;
      const workflowBody = workflows.body as PaginatedBody<{ id: string }>;
      const defaultWorkflowId = workflowBody.items[0]?.id;
      if (pipelineBody.total > 0 && defaultWorkflowId) {
        const detail = await agent.get(`/api/workflows/${defaultWorkflowId}`).expect(200);
        if ((detail.body as { stepsCount: number }).stepsCount === 3) return;
      }
      await new Promise<void>((resolve) => setTimeout(resolve, 25));
    }
    throw new Error('Default account resources were not created in time');
  }

  async function createPipeline(agent: TestAgent): Promise<void> {
    await agent.post('/api/pipelines').send({ id: IDS.pipeline, name: 'Pipeline E2E' }).expect(201);
    await agent
      .post(`/api/pipelines/${IDS.pipeline}/statuses`)
      .send({ id: IDS.status, name: 'Nuevo', showInKanban: true })
      .expect(201);
    await agent.patch(`/api/pipelines/${IDS.pipeline}/statuses/${IDS.status}/initial`).expect(200);
  }

  async function createWorkflow(agent: TestAgent): Promise<void> {
    await agent
      .post('/api/workflows')
      .send({ id: IDS.workflow, name: 'Workflow E2E', description: 'Flujo determinista' })
      .expect(201);
    await agent
      .patch(`/api/workflows/${IDS.workflow}/steps`)
      .send({ steps: [{ id: IDS.step, name: 'Análisis', type: 'step', position: 1 }] })
      .expect(200);
    await agent
      .post(`/api/workflows/${IDS.workflow}/steps/${IDS.step}/actions`)
      .send({
        id: IDS.defaultAction,
        name: 'Revisión manual E2E',
        targetType: 'task',
        position: 1,
      })
      .expect(201);
  }

  async function waitForSummary(agent: TestAgent, expectedStatus: string): Promise<void> {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const response = await agent.get(`/api/opportunities/${IDS.opportunity}/summaries`).expect(200);
      const summaries = response.body as Array<{ generationStatus: string; result: string | null }>;
      if (summaries[0]?.generationStatus === expectedStatus) {
        expect(summaries[0]?.result).toBe('Resumen determinista generado en E2E.');
        return;
      }
      await new Promise<void>((resolve) => setTimeout(resolve, 25));
    }
    throw new Error(`Summary did not reach ${expectedStatus}`);
  }

  function opportunityPayload(): Record<string, unknown> {
    return {
      id: IDS.opportunity,
      title: 'Licitación E2E',
      description: 'Datos ficticios para pruebas',
      amount: 12000,
      currency: 'EUR',
      pipelineId: IDS.pipeline,
      pipelineStatusId: IDS.status,
    };
  }
});
