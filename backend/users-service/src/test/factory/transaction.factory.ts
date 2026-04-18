import { TransactionService } from '../../infrastructure/transaction/transaction.service';

export type TransactionServiceMock = jest.Mocked<
  Pick<TransactionService, 'run'>
>;

export const createTransactionServiceMock = (): TransactionServiceMock => ({
  run: jest.fn(),
});
