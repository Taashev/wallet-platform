import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';

import { Queue } from 'bullmq';

import { AvatarJobs } from '../constants/avatar-jobs';
import { UPLOAD_AVATAR_QUEUE_NAME } from '../constants/avatar.keys';
import { ProcessAvatarPayload } from '../types/avatar.type';

@Injectable()
export class AvatarProducer {
  constructor(
    @InjectQueue(UPLOAD_AVATAR_QUEUE_NAME)
    private avatarQueue: Queue,
  ) {}

  async sendUploadAvatar(avatarId: string, payload: ProcessAvatarPayload) {
    await this.avatarQueue.add(
      AvatarJobs.PROCESS,
      {
        avatarId: payload.avatarId,
        userId: payload.userId,
      },
      {
        jobId: avatarId,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 1000,
        removeOnFail: 1000,
      },
    );
  }
}
