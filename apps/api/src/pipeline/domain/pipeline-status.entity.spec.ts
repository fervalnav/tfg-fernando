import { InvalidPipelineStatusException } from './exceptions/invalid-pipeline-status.exception';
import { PipelineStatus } from './pipeline-status.entity';

describe('PipelineStatus', () => {
  it('creates a normal visible status and supports updates and ordering', () => {
    const status = PipelineStatus.create({
      id: 'status-id',
      pipelineId: 'pipeline-id',
      name: 'Análisis',
      sortPoints: 1000,
    });

    status.update({ name: 'Analizando', description: 'Revisión', showInKanban: false });
    status.setSortPoints(2000);
    status.setInitial(true);

    expect(status.toPrimitives()).toMatchObject({
      name: 'Analizando',
      description: 'Revisión',
      isInitial: true,
      isTerminal: false,
      outcomeType: 'NONE',
      showInKanban: false,
      sortPoints: 2000,
    });
  });

  it.each([
    [{ isInitial: true, isTerminal: true, outcomeType: 'WON' as const }, 'both initial and terminal'],
    [{ isTerminal: false, outcomeType: 'WON' as const }, 'Non-terminal status'],
    [{ isTerminal: true, outcomeType: 'NONE' as const }, 'Terminal status'],
  ])('rejects invalid lifecycle combinations', (invalid, expectedMessage) => {
    expect(() =>
      PipelineStatus.create({
        id: 'status-id',
        pipelineId: 'pipeline-id',
        name: 'Inválido',
        sortPoints: 1000,
        ...invalid,
      }),
    ).toThrow(expectedMessage);
  });

  it('cannot make a terminal status initial', () => {
    const terminal = PipelineStatus.create({
      id: 'status-id',
      pipelineId: 'pipeline-id',
      name: 'Ganada',
      isTerminal: true,
      outcomeType: 'WON',
      sortPoints: 1000,
    });

    expect(() => terminal.setInitial(true)).toThrow(InvalidPipelineStatusException);
  });
});
