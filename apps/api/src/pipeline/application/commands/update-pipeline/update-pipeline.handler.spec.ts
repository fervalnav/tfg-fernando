/* eslint-disable @typescript-eslint/unbound-method */
import { PipelineNotFoundException } from '../../../domain/exceptions/pipeline-not-found.exception';
import { Pipeline } from '../../../domain/pipeline.entity';
import { PipelineRepository } from '../../../domain/repositories/pipeline.repository';
import { UpdatePipelineCommand } from './update-pipeline.command';
import { UpdatePipelineHandler } from './update-pipeline.handler';

describe('UpdatePipelineHandler', () => {
  it('renames a pipeline owned by the account', async () => {
    const pipeline = Pipeline.create({ id: 'pipeline-id', accountId: 'account-id', name: 'Anterior' });
    const repository = {
      findById: jest.fn().mockResolvedValue(pipeline),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<PipelineRepository>;
    const handler = new UpdatePipelineHandler(repository);

    await handler.execute(new UpdatePipelineCommand('pipeline-id', 'account-id', 'Renombrado'));

    expect(pipeline.name).toBe('Renombrado');
    expect(repository.save).toHaveBeenCalledWith(pipeline);
  });

  it('hides a pipeline owned by another account', async () => {
    const pipeline = Pipeline.create({ id: 'pipeline-id', accountId: 'owner-account', name: 'Privado' });
    const repository = {
      findById: jest.fn().mockResolvedValue(pipeline),
      save: jest.fn(),
    } as unknown as jest.Mocked<PipelineRepository>;
    const handler = new UpdatePipelineHandler(repository);

    await expect(
      handler.execute(new UpdatePipelineCommand('pipeline-id', 'outsider-account', 'Intrusión')),
    ).rejects.toBeInstanceOf(PipelineNotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
