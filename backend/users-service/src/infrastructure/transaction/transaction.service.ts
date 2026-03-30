import { Injectable } from '@nestjs/common';

import { AsyncLocalStorage } from 'async_hooks';
import { DataSource, EntityManager } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel.js';

@Injectable()
export class TransactionService {
  private transactionStore = new AsyncLocalStorage<EntityManager>();

  constructor(private dataSource: DataSource) {}

  get manager() {
    return this.transactionStore.getStore() ?? this.dataSource.manager;
  }

  async run<T>(
    callback: () => Promise<T>,
    isolationLevel: IsolationLevel = 'READ COMMITTED',
  ) {
    const isStoreManager = this.transactionStore.getStore();

    if (isStoreManager !== undefined) {
      return callback();
    }

    const manager = this.dataSource.createEntityManager();

    return manager.transaction(isolationLevel, async (manager) => {
      return this.transactionStore.run(manager, callback);
    });
  }
}
