import { Processor, WorkerHost } from '@nestjs/bullmq';

import { Job } from 'bullmq';

import { UPLOAD_AVATAR_QUEUE_NAME } from '../constants/avatar.keys';
import { ProcessAvatarPayload } from '../types/avatar.type';
import { ProcessAvatarUseCase } from '../usecases/process-avatar.usecase';

@Processor(UPLOAD_AVATAR_QUEUE_NAME, { concurrency: 1 })
export class AvatarProcessor extends WorkerHost {
  constructor(private processAvatarUseCase: ProcessAvatarUseCase) {
    super();
  }

  // исключение приводит к retry или переводит задачу в failed
  // return говорит о том что все ок, переводит задачу в completed, при этом retry не выполняется
  async process(job: Job<ProcessAvatarPayload>) {
    const { avatarId, userId } = job.data;

    // количество выставленных retry для джобы
    const attemptsLimit = job.opts.attempts ?? 1;

    // job.attemptsMade - мутирующее свойство bullmq (+1 на каждую попытку)
    // проверка последняя ли это попытка
    const isLastAttempt = job.attemptsMade + 1 >= attemptsLimit;

    await this.processAvatarUseCase.execute(avatarId, userId, !isLastAttempt);
  }
}
