/* eslint-disable @typescript-eslint/unbound-method */
import { PipelineNotFoundException } from '../../../domain/exceptions/pipeline-not-found.exception';
import { PipelineStatus } from '../../../domain/pipeline-status.entity';
import { Pipeline } from '../../../domain/pipeline.entity';
import { PipelineStatusRepository } from '../../../domain/repositories/pipeline-status.repository';
import { PipelineRepository } from '../../../domain/repositories/pipeline.repository';
import { FindPipelineByIdHandler } from './find-pipeline-by-id.handler';
import { FindPipelineByIdQuery } from './find-pipeline-by-id.query';

describe('FindPipelineByIdHandler', () => {
  it('returns the pipeline with its statuses', async () => {
    const pipeline = Pipeline.create({ id: 'pipeline-id', accountId: 'account-id', name: 'Ventas' });
    const status = PipelineStatus.create({
      id: 'status-id',
      pipelineId: pipeline.id,
      name: 'Inicial',
      isInitial: true,
      sortPoints: 100,
    });
    const pipelineRepository = {
      findById: jest.fn().mockResolvedValue(pipeline),
    } as unknown as jest.Mocked<PipelineRepository>;
    const statusRepository = {
      findByPipelineId: jest.fn().mockResolvedValue([status]),
    } as unknown as jest.Mocked<PipelineStatusRepository>;
    const handler = new FindPipelineByIdHandler(pipelineRepository, statusRepository);

    const result = await handler.execute(new FindPipelineByIdQuery('pipeline-id', 'account-id'));

    expect(result).toMatchObject({
      id: 'pipeline-id',
      name: 'Ventas',
      statuses: [expect.objectContaining({ id: 'status-id', isInitial: true })],
    });
    expect(statusRepository.findByPipelineId).toHaveBeenCalledWith('pipeline-id');
  });

  it('does not load statuses when the pipeline belongs to another account', async () => {
    const pipeline = Pipeline.create({ id: 'pipeline-id', accountId: 'owner-account', name: 'Privado' });
    const pipelineRepository = {
      findById: jest.fn().mockResolvedValue(pipeline),
    } as unknown as jest.Mocked<PipelineRepository>;
    const statusRepository = {
      findByPipelineId: jest.fn(),
    } as unknown as jest.Mocked<PipelineStatusRepository>;
    const handler = new FindPipelineByIdHandler(pipelineRepository, statusRepository);

    await expect(handler.execute(new FindPipelineByIdQuery('pipeline-id', 'outsider-account'))).rejects.toBeInstanceOf(
      PipelineNotFoundException,
    );
    expect(statusRepository.findByPipelineId).not.toHaveBeenCalled();
  });
});
