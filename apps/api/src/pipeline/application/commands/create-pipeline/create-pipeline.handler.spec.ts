/* eslint-disable @typescript-eslint/unbound-method */
import { IdService } from '@/shared/domain/services/id.service';
import { PipelineStatusRepository } from '../../../domain/repositories/pipeline-status.repository';
import { PipelineRepository } from '../../../domain/repositories/pipeline.repository';
import { CreatePipelineCommand } from './create-pipeline.command';
import { CreatePipelineHandler } from './create-pipeline.handler';

describe('CreatePipelineHandler', () => {
  it('creates the pipeline and its ordered default statuses', async () => {
    const pipelineRepository = {
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<PipelineRepository>;
    const statusRepository = {
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<PipelineStatusRepository>;
    const idService = {
      generate: jest
        .fn()
        .mockReturnValueOnce('status-1')
        .mockReturnValueOnce('status-2')
        .mockReturnValueOnce('status-3')
        .mockReturnValueOnce('status-4')
        .mockReturnValueOnce('status-5')
        .mockReturnValueOnce('status-6')
        .mockReturnValueOnce('status-7'),
    } as unknown as jest.Mocked<IdService>;
    const handler = new CreatePipelineHandler(pipelineRepository, statusRepository, idService);

    await handler.execute(new CreatePipelineCommand('pipeline-id', 'account-id', 'Ventas'));

    expect(pipelineRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'pipeline-id', accountId: 'account-id', name: 'Ventas' }),
    );
    expect(statusRepository.save).toHaveBeenCalledTimes(7);
    expect(statusRepository.save).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ id: 'status-1', name: 'En análisis', isInitial: true, sortPoints: 100 }),
    );
    expect(statusRepository.save).toHaveBeenNthCalledWith(
      7,
      expect.objectContaining({ id: 'status-7', name: 'Descartada', outcomeType: 'DROPPED', showInKanban: false }),
    );
  });
});
