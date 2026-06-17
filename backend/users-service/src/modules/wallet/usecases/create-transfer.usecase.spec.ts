import { TransactionService } from '../../../infrastructure/transaction/transaction.service';
import { ConflictError, ValidationError } from '../../../shared/errors';
import {
  createTransactionServiceMock,
  createWalletMock,
  createWalletOperationMock,
  createWalletOperationsRepositoryMock,
  createWalletRepositoryMock,
  createWalletTransferMock,
  createWalletTransfersRepositoryMock,
  TransactionServiceMock,
  WalletOperationsRepositoryMock,
  WalletRepositoryMock,
  WalletTransfersRepositoryMock,
} from '../../../test/factory';
import {
  currencyMock,
  idempotencyKeyMock,
  recipientWalletIdMock,
  transferAmountMock,
  userIdMock,
  walletIdMock,
  walletOperationInIdMock,
  walletOperationOutIdMock,
  walletTransferIdMock,
} from '../../../test/mocks';
import { WALLET_OPERATION_TYPE } from '../constants/wallet.constant';

import { CreateWalletTransferUseCase } from './create-transfer.usecase';

const recipientUserIdMock = 'c9d2b9d8-bb41-4f4c-9ac3-bf6a6929c9a2';

describe('CreateWalletTransferUseCase', () => {
  let walletRepository: WalletRepositoryMock;
  let walletOperationsRepository: WalletOperationsRepositoryMock;
  let walletTransfersRepository: WalletTransfersRepositoryMock;
  let transactionService: TransactionServiceMock;

  let createWalletTransferUseCase: CreateWalletTransferUseCase;

  beforeEach(() => {
    walletRepository = createWalletRepositoryMock();
    walletOperationsRepository = createWalletOperationsRepositoryMock();
    walletTransfersRepository = createWalletTransfersRepositoryMock();
    transactionService = createTransactionServiceMock();

    transactionService.run.mockImplementation(async (callback) => {
      return await callback();
    });

    createWalletTransferUseCase = new CreateWalletTransferUseCase(
      walletRepository,
      walletOperationsRepository,
      walletTransfersRepository,
      transactionService as unknown as TransactionService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('переводит средства между кошельками и создает transfer + две операции', async () => {
    const fromWallet = createWalletMock({
      walletId: walletIdMock,
      userId: userIdMock,
      balance: 5000,
    });
    const toWallet = createWalletMock({
      walletId: recipientWalletIdMock,
      userId: recipientUserIdMock,
      balance: 2000,
    });
    const transfer = createWalletTransferMock({
      walletTransferId: walletTransferIdMock,
      fromWalletId: walletIdMock,
      toWalletId: recipientWalletIdMock,
      amount: transferAmountMock,
      currency: currencyMock,
      idempotencyKey: idempotencyKeyMock,
    });

    jest
      .spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce(walletTransferIdMock)
      .mockReturnValueOnce(walletOperationOutIdMock)
      .mockReturnValueOnce(walletOperationInIdMock);

    walletRepository.getByUserIds.mockResolvedValue([fromWallet, toWallet]);
    walletTransfersRepository.findByIdempotencyKey.mockResolvedValue(null);
    walletTransfersRepository.create.mockResolvedValue(transfer);
    walletOperationsRepository.create
      .mockResolvedValueOnce(
        createWalletOperationMock({
          walletOperationId: walletOperationOutIdMock,
          amount: transferAmountMock,
          operationType: WALLET_OPERATION_TYPE.TRANSFER_OUT,
          walletTransferId: walletTransferIdMock,
          walletId: walletIdMock,
        }),
      )
      .mockResolvedValueOnce(
        createWalletOperationMock({
          walletOperationId: walletOperationInIdMock,
          amount: transferAmountMock,
          operationType: WALLET_OPERATION_TYPE.TRANSFER_IN,
          walletTransferId: walletTransferIdMock,
          walletId: recipientWalletIdMock,
        }),
      );
    walletRepository.updateBalance.mockResolvedValue(true);

    const result = await createWalletTransferUseCase.execute(
      userIdMock,
      recipientUserIdMock,
      transferAmountMock,
      currencyMock,
      idempotencyKeyMock,
    );

    expect(transactionService.run).toHaveBeenCalledTimes(1);
    expect(walletRepository.getByUserIds).toHaveBeenCalledWith(
      [userIdMock, recipientUserIdMock],
      { currency: currencyMock, isLock: true },
    );
    expect(walletTransfersRepository.findByIdempotencyKey).toHaveBeenCalledWith(
      walletIdMock,
      idempotencyKeyMock,
    );
    expect(walletTransfersRepository.create).toHaveBeenCalledWith({
      transferId: walletTransferIdMock,
      fromWalletId: walletIdMock,
      toWalletId: recipientWalletIdMock,
      amount: transferAmountMock,
      currency: currencyMock,
      idempotencyKey: idempotencyKeyMock,
    });
    expect(walletOperationsRepository.create).toHaveBeenNthCalledWith(1, {
      operationId: walletOperationOutIdMock,
      amount: transferAmountMock,
      type: WALLET_OPERATION_TYPE.TRANSFER_OUT,
      transferId: walletTransferIdMock,
      walletId: walletIdMock,
    });
    expect(walletOperationsRepository.create).toHaveBeenNthCalledWith(2, {
      operationId: walletOperationInIdMock,
      amount: transferAmountMock,
      type: WALLET_OPERATION_TYPE.TRANSFER_IN,
      transferId: walletTransferIdMock,
      walletId: recipientWalletIdMock,
    });
    expect(walletRepository.updateBalance).toHaveBeenNthCalledWith(
      1,
      walletIdMock,
      4000,
    );
    expect(walletRepository.updateBalance).toHaveBeenNthCalledWith(
      2,
      recipientWalletIdMock,
      3000,
    );
    expect(result).toEqual({ amount: transferAmountMock });
  });

  it('возвращает существующий перевод при повторе с тем же idempotency key и теми же параметрами', async () => {
    const fromWallet = createWalletMock({
      walletId: walletIdMock,
      userId: userIdMock,
      balance: 5000,
    });
    const toWallet = createWalletMock({
      walletId: recipientWalletIdMock,
      userId: recipientUserIdMock,
      balance: 2000,
    });
    const transfer = createWalletTransferMock({
      fromWalletId: walletIdMock,
      toWalletId: recipientWalletIdMock,
      amount: transferAmountMock,
      currency: currencyMock,
      idempotencyKey: idempotencyKeyMock,
    });

    walletRepository.getByUserIds.mockResolvedValue([fromWallet, toWallet]);
    walletTransfersRepository.findByIdempotencyKey.mockResolvedValue(transfer);

    const result = await createWalletTransferUseCase.execute(
      userIdMock,
      recipientUserIdMock,
      transferAmountMock,
      currencyMock,
      idempotencyKeyMock,
    );

    expect(result).toEqual({ amount: transferAmountMock });
    expect(walletTransfersRepository.create).not.toHaveBeenCalled();
    expect(walletOperationsRepository.create).not.toHaveBeenCalled();
    expect(walletRepository.updateBalance).not.toHaveBeenCalled();
  });

  it('выбрасывает ConflictError, если idempotency key повторен с другими параметрами', async () => {
    const fromWallet = createWalletMock({
      walletId: walletIdMock,
      userId: userIdMock,
      balance: 5000,
    });
    const toWallet = createWalletMock({
      walletId: recipientWalletIdMock,
      userId: recipientUserIdMock,
      balance: 2000,
    });
    const transfer = createWalletTransferMock({
      fromWalletId: walletIdMock,
      toWalletId: recipientWalletIdMock,
      amount: transferAmountMock + 1,
      currency: currencyMock,
      idempotencyKey: idempotencyKeyMock,
    });

    walletRepository.getByUserIds.mockResolvedValue([fromWallet, toWallet]);
    walletTransfersRepository.findByIdempotencyKey.mockResolvedValue(transfer);

    await expect(
      createWalletTransferUseCase.execute(
        userIdMock,
        recipientUserIdMock,
        transferAmountMock,
        currencyMock,
        idempotencyKeyMock,
      ),
    ).rejects.toBeInstanceOf(ConflictError);

    expect(walletTransfersRepository.create).not.toHaveBeenCalled();
    expect(walletOperationsRepository.create).not.toHaveBeenCalled();
    expect(walletRepository.updateBalance).not.toHaveBeenCalled();
  });

  it('выбрасывает ValidationError при переводе самому себе', async () => {
    await expect(
      createWalletTransferUseCase.execute(
        userIdMock,
        userIdMock,
        transferAmountMock,
        currencyMock,
        idempotencyKeyMock,
      ),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(transactionService.run).not.toHaveBeenCalled();
    expect(walletRepository.getByUserIds).not.toHaveBeenCalled();
  });

  it('выбрасывает ValidationError, если кошелек получателя не найден', async () => {
    const fromWallet = createWalletMock({
      walletId: walletIdMock,
      userId: userIdMock,
      balance: 5000,
    });

    walletRepository.getByUserIds.mockResolvedValue([fromWallet]);

    await expect(
      createWalletTransferUseCase.execute(
        userIdMock,
        recipientUserIdMock,
        transferAmountMock,
        currencyMock,
        idempotencyKeyMock,
      ),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(
      walletTransfersRepository.findByIdempotencyKey,
    ).not.toHaveBeenCalled();
    expect(walletTransfersRepository.create).not.toHaveBeenCalled();
    expect(walletOperationsRepository.create).not.toHaveBeenCalled();
    expect(walletRepository.updateBalance).not.toHaveBeenCalled();
  });

  it('выбрасывает ValidationError, если на балансе недостаточно средств', async () => {
    const fromWallet = createWalletMock({
      walletId: walletIdMock,
      userId: userIdMock,
      balance: transferAmountMock - 1,
    });
    const toWallet = createWalletMock({
      walletId: recipientWalletIdMock,
      userId: recipientUserIdMock,
      balance: 2000,
    });

    walletRepository.getByUserIds.mockResolvedValue([fromWallet, toWallet]);
    walletTransfersRepository.findByIdempotencyKey.mockResolvedValue(null);

    await expect(
      createWalletTransferUseCase.execute(
        userIdMock,
        recipientUserIdMock,
        transferAmountMock,
        currencyMock,
        idempotencyKeyMock,
      ),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(walletTransfersRepository.create).not.toHaveBeenCalled();
    expect(walletOperationsRepository.create).not.toHaveBeenCalled();
    expect(walletRepository.updateBalance).not.toHaveBeenCalled();
  });
});
