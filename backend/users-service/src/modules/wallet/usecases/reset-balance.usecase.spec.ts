import { TransactionService } from '../../../infrastructure/transaction/transaction.service';
import { InternalError } from '../../../shared/errors';
import {
  createTransactionServiceMock,
  createWalletOperationsRepositoryMock,
  createWalletRepositoryMock,
  TransactionServiceMock,
  WalletOperationsRepositoryMock,
  WalletRepositoryMock,
} from '../../../test/factory';
import {
  recipientWalletIdMock,
  walletIdMock,
  walletOperationInIdMock,
  walletOperationOutIdMock,
} from '../../../test/mocks';
import {
  CURRENCY,
  WALLET_DEFAULT_BALANCE_CENTS,
  WALLET_OPERATION_TYPE,
} from '../constants/wallet.constant';

import { ResetWalletUseCase } from './reset-balance.usecase';

const defaultWalletIdMock = 'dfd09675-2d4e-463a-9708-924a1c06c85d';

describe('ResetWalletUseCase', () => {
  let walletRepository: WalletRepositoryMock;
  let walletOperationsRepository: WalletOperationsRepositoryMock;
  let transactionService: TransactionServiceMock;

  let resetWalletUseCase: ResetWalletUseCase;

  beforeEach(() => {
    walletRepository = createWalletRepositoryMock();
    walletOperationsRepository = createWalletOperationsRepositoryMock();
    transactionService = createTransactionServiceMock();

    transactionService.run.mockImplementation(async (callback) => {
      return await callback();
    });

    resetWalletUseCase = new ResetWalletUseCase(
      walletRepository,
      walletOperationsRepository,
      transactionService as unknown as TransactionService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('сбрасывает балансы к дефолтному значению и создает операции без transfer', async () => {
    jest
      .spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce(walletOperationInIdMock)
      .mockReturnValueOnce(walletOperationOutIdMock);

    walletRepository.findByCurrencyWithCursor
      .mockResolvedValueOnce([
        {
          walletId: walletIdMock,
          balance: WALLET_DEFAULT_BALANCE_CENTS - 1_000,
        },
        {
          walletId: defaultWalletIdMock,
          balance: WALLET_DEFAULT_BALANCE_CENTS,
        },
        {
          walletId: recipientWalletIdMock,
          balance: WALLET_DEFAULT_BALANCE_CENTS + 2_500,
        },
      ])
      .mockResolvedValueOnce([]);
    walletOperationsRepository.createMany.mockResolvedValue([]);
    walletRepository.updateManyBalance.mockResolvedValue(2);

    const result = await resetWalletUseCase.execute();

    expect(result).toEqual({ updatedWalletsCount: 2 });
    expect(transactionService.run).toHaveBeenCalledTimes(2);
    expect(walletRepository.findByCurrencyWithCursor).toHaveBeenNthCalledWith(
      1,
      undefined,
      CURRENCY.USD,
    );
    expect(walletRepository.findByCurrencyWithCursor).toHaveBeenNthCalledWith(
      2,
      recipientWalletIdMock,
      CURRENCY.USD,
    );
    expect(walletOperationsRepository.createMany).toHaveBeenCalledWith([
      {
        operationId: walletOperationInIdMock,
        amount: 1_000,
        type: WALLET_OPERATION_TYPE.TRANSFER_IN,
        walletId: walletIdMock,
      },
      {
        operationId: walletOperationOutIdMock,
        amount: 2_500,
        type: WALLET_OPERATION_TYPE.TRANSFER_OUT,
        walletId: recipientWalletIdMock,
      },
    ]);
    expect(walletRepository.updateManyBalance).toHaveBeenCalledWith(
      [walletIdMock, recipientWalletIdMock],
      WALLET_DEFAULT_BALANCE_CENTS,
    );
  });

  it('выбрасывает InternalError, если обновились не все выбранные кошельки', async () => {
    walletRepository.findByCurrencyWithCursor.mockResolvedValueOnce([
      {
        walletId: walletIdMock,
        balance: WALLET_DEFAULT_BALANCE_CENTS - 1_000,
      },
    ]);
    walletOperationsRepository.createMany.mockResolvedValue([]);
    walletRepository.updateManyBalance.mockResolvedValue(0);

    await expect(resetWalletUseCase.execute()).rejects.toBeInstanceOf(
      InternalError,
    );
  });
});
