import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const API_URL = 'http://127.0.0.1:3100/api';
const PASSWORD = 'password123';
const IDS = {
  status: '0198f6b3-1fd7-7fba-8e79-53161b649951',
  controlQuestionTemplate: '0198f6b3-1fd7-7fba-8e79-53161b649952',
  customFieldTemplate: '0198f6b3-1fd7-7fba-8e79-53161b649953',
  summaryTemplate: '0198f6b3-1fd7-7fba-8e79-53161b649954',
  controlQuestion: '0198f6b3-1fd7-7fba-8e79-53161b649955',
  customField: '0198f6b3-1fd7-7fba-8e79-53161b649956',
  summary: '0198f6b3-1fd7-7fba-8e79-53161b649957',
} as const;

test('qualifies an opportunity with workflow, manual data, fake AI and a PDF', async ({ page }) => {
  await register(page);
  const request = page.request;
  const { pipelineId, workflowId } = await prepareCatalogs(request);

  await page.goto(`/opportunities/kanban/${pipelineId}`);
  await page.getByRole('button', { name: 'Añadir oportunidad' }).first().click();
  await page.getByPlaceholder('Nombre de la oportunidad').fill('Licitación navegador E2E');
  await page.getByPlaceholder('Descripción opcional').fill('Caso ficticio reproducible');
  await page.getByRole('button', { name: 'Crear oportunidad' }).click();
  await expect(page.getByRole('link', { name: 'Licitación navegador E2E' })).toBeVisible();
  await page.getByRole('link', { name: 'Licitación navegador E2E' }).click();
  await expect(page.getByRole('heading', { name: 'Licitación navegador E2E' })).toBeVisible();

  const opportunityId = await findOpportunityId(request, pipelineId);
  await addQualificationInstances(request, opportunityId);
  await page.reload();

  await page.getByRole('button', { name: 'Workflow' }).click();
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Workflow por defecto' }).click();
  await page.getByRole('button', { name: 'Asignar', exact: true }).click();
  await expect(page.getByText('Workflow por defecto')).toBeVisible();
  await expect.poll(async () => (await request.get(`${API_URL}/opportunities/${opportunityId}`)).status()).toBe(200);

  await page.getByRole('button', { name: /Preguntas de control/ }).click();
  await page.getByPlaceholder('Escribe la respuesta...').fill('Sí, cumple el requisito manual.');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByText('Respondida')).toBeVisible();

  await page.getByRole('button', { name: /Campos personalizados/ }).click();
  await page.locator('section input[type="text"]').fill('120 horas');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByText('Informado')).toBeVisible();

  await page.getByRole('button', { name: /Resúmenes/ }).click();
  await page.getByRole('button', { name: 'Generar con IA' }).click();
  await expect(page.getByRole('textbox')).toHaveValue('Resumen determinista generado para pruebas E2E.');
  await expect(page.getByRole('button', { name: 'Regenerar' })).toBeVisible();

  await page.getByRole('button', { name: /Documentación/ }).click();
  await page.locator('input[type="file"]').setInputFiles('tests/fixtures/anuncio-e2e.pdf');
  await page.getByRole('button', { name: 'Adjuntar' }).click();
  await expect(page.getByText('anuncio-e2e.pdf')).toBeVisible();

  await page.getByRole('button', { name: /Persona E2E/ }).click();
  await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/\/auth\/login$/u);

  expect(workflowId).toMatch(/[0-9a-f-]{36}/u);
});

test('validates login and shows invalid credentials before accepting a real session', async ({ page }) => {
  const registration = await page.request.post(`${API_URL}/auth/register`, {
    data: {
      email: 'login-browser@example.test',
      password: PASSWORD,
      firstName: 'Login',
      lastName: 'E2E',
      accountName: 'Cuenta login navegador',
    },
  });
  expect(registration.status()).toBe(201);
  await page.context().clearCookies();

  await page.goto('/auth/login');
  await page.getByLabel('Email').fill('email-invalido');
  await page.getByLabel('Contraseña').fill('temporal');
  await page.getByLabel('Contraseña').clear();
  await page.getByRole('button', { name: 'Iniciar sesion' }).click();
  await expect(page.getByText('Email inválido')).toBeVisible();
  await expect(page.getByText('La contraseña es obligatoria')).toBeVisible();

  await page.getByLabel('Email').fill('login-browser@example.test');
  await page.getByLabel('Contraseña').fill('incorrecta');
  await page.getByRole('button', { name: 'Iniciar sesion' }).click();
  await expect(page.getByText('Email o contraseña incorrectos')).toBeVisible();

  await page.getByLabel('Contraseña').fill(PASSWORD);
  await page.getByRole('button', { name: 'Iniciar sesion' }).click();
  await expect(page).toHaveURL(/\/$/u);
});

test('shows localized required messages and clears dialog errors when reopened', async ({ page }) => {
  await page.goto('/auth/register');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();

  await expect(page.getByText('El nombre es obligatorio')).toBeVisible();
  await expect(page.getByText('El apellido es obligatorio')).toBeVisible();
  await expect(page.getByText('El email es obligatorio')).toBeVisible();
  await expect(page.getByText('La contraseña es obligatoria')).toBeVisible();
  await expect(page.getByText('El nombre de la empresa es obligatorio')).toBeVisible();
  await expect(page.getByText('Required')).toHaveCount(0);

  await page.getByLabel('Nombre', { exact: true }).fill('Validación');
  await page.getByLabel('Apellido').fill('E2E');
  await page.getByLabel('Email').fill('validation-browser@example.test');
  await page.getByLabel('Contraseña').fill(PASSWORD);
  await page.getByLabel('Nombre de la empresa').fill('Cuenta validación navegador');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page).toHaveURL(/\/$/u);

  await page.goto('/settings/pipelines');
  await page.getByRole('button', { name: 'Nuevo pipeline' }).click();
  await page.getByRole('button', { name: 'Crear pipeline' }).click();
  await expect(page.getByText('El nombre es obligatorio')).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await page.getByRole('button', { name: 'Nuevo pipeline' }).click();
  await expect(page.getByText('El nombre es obligatorio')).toHaveCount(0);
});

test('distinguishes a loading failure from an empty pipeline list', async ({ page }) => {
  const registration = await page.request.post(`${API_URL}/auth/register`, {
    data: {
      email: 'query-error-browser@example.test',
      password: PASSWORD,
      firstName: 'Query',
      lastName: 'Error',
      accountName: 'Cuenta error navegador',
    },
  });
  expect(registration.status()).toBe(201);

  await page.route('**/api/pipelines**', (route) => route.abort());
  await page.goto('/settings/pipelines');

  await expect(page.getByRole('alert')).toContainText('No se pudieron cargar los pipelines.');
  await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible();
  await expect(page.getByText('No tienes pipelines aún. Crea uno para empezar.')).toHaveCount(0);
});

async function register(page: Page): Promise<void> {
  await page.goto('/auth/register');
  await page.getByLabel('Nombre', { exact: true }).fill('Persona');
  await page.getByLabel('Apellido').fill('E2E');
  await page.getByLabel('Email').fill('browser@example.test');
  await page.getByLabel('Contraseña').fill(PASSWORD);
  await page.getByLabel('Nombre de la empresa').fill('Cuenta navegador E2E');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page).toHaveURL(/\/$/u);
}

async function prepareCatalogs(request: APIRequestContext): Promise<{ pipelineId: string; workflowId: string }> {
  const pipelines = await json<{ items: Array<{ id: string }> }>(request.get(`${API_URL}/pipelines`));
  const workflows = await json<{ items: Array<{ id: string; name: string }> }>(request.get(`${API_URL}/workflows`));
  const pipelineId = required(pipelines.items[0]?.id, 'default pipeline');
  const workflowId = required(
    workflows.items.find((workflow) => workflow.name === 'Workflow por defecto')?.id,
    'default workflow',
  );

  await ok(
    request.post(`${API_URL}/pipelines/${pipelineId}/statuses`, {
      data: { id: IDS.status, name: 'Nueva', showInKanban: true },
    }),
  );
  await ok(request.patch(`${API_URL}/pipelines/${pipelineId}/statuses/${IDS.status}/initial`));
  await ok(
    request.post(`${API_URL}/control-questions/defaults`, {
      data: {
        id: IDS.controlQuestionTemplate,
        question: '¿Cumple solvencia técnica?',
        answerType: 'TEXT',
        passConditionPrompt: 'Debe justificar experiencia.',
      },
    }),
  );
  await ok(
    request.post(`${API_URL}/custom-fields/defaults`, {
      data: {
        id: IDS.customFieldTemplate,
        name: 'Esfuerzo estimado',
        description: 'Horas previstas',
        type: 'TEXT',
        automatic: false,
      },
    }),
  );
  await ok(
    request.post(`${API_URL}/summaries/templates`, {
      data: { id: IDS.summaryTemplate, name: 'Resumen ejecutivo', prompt: 'Resume la oportunidad y el PDF.' },
    }),
  );
  return { pipelineId, workflowId };
}

async function findOpportunityId(request: APIRequestContext, pipelineId: string): Promise<string> {
  const opportunities = await json<{ items: Array<{ id: string; title: string }> }>(
    request.get(`${API_URL}/opportunities?pipelineId=${pipelineId}`),
  );
  return required(
    opportunities.items.find((opportunity) => opportunity.title === 'Licitación navegador E2E')?.id,
    'created opportunity',
  );
}

async function addQualificationInstances(request: APIRequestContext, opportunityId: string): Promise<void> {
  await ok(
    request.post(`${API_URL}/opportunities/${opportunityId}/control-questions`, {
      data: { id: IDS.controlQuestion, defaultControlQuestionId: IDS.controlQuestionTemplate },
    }),
  );
  await ok(
    request.post(`${API_URL}/opportunities/${opportunityId}/custom-fields`, {
      data: { id: IDS.customField, defaultCustomFieldId: IDS.customFieldTemplate },
    }),
  );
  await ok(
    request.post(`${API_URL}/opportunities/${opportunityId}/summaries`, {
      data: { id: IDS.summary, summaryTemplateId: IDS.summaryTemplate },
    }),
  );
}

async function json<T>(responsePromise: ReturnType<APIRequestContext['get']>): Promise<T> {
  const response = await responsePromise;
  expect(response.ok()).toBe(true);
  return (await response.json()) as T;
}

async function ok(responsePromise: ReturnType<APIRequestContext['post']>): Promise<void> {
  const response = await responsePromise;
  expect(response.ok()).toBe(true);
}

function required(value: string | undefined, label: string): string {
  if (!value) throw new Error(`Missing ${label}`);
  return value;
}
