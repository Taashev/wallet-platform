import { WalletEntity } from '../../modules/wallet/entities/wallet.entity';
import { WalletOperationsRepository } from '../../modules/wallet/interfaces/wallet-operations-repository.interface';
import { WalletRepository } from '../../modules/wallet/interfaces/wallet-repository.intreface';
import { WalletTransfersRepository } from '../../modules/wallet/interfaces/wallet-transfers-repository.interface';
import {
  WalletOperation,
  WalletTransfer,
} from '../../modules/wallet/interfaces/wallet.interface';
import { WalletCurrency } from '../../modules/wallet/types/wallet.type';
import {
  balanceMock,
  currencyMock,
  idempotencyKeyMock,
  transferAmountMock,
  userIdMock,
  walletIdMock,
  walletOperationInIdMock,
  walletTransferIdMock,
} from '../mocks';

export type WalletRepositoryMock = jest.Mocked<
  Pick<
    WalletRepository,
    | 'create'
    | 'getByUserId'
    | 'getByUserIds'
    | 'findByCurrencyWithCursor'
    | 'updateBalance'
    | 'updateManyBalance'
  >
>;

export type WalletOperationsRepositoryMock = jest.Mocked<
  Pick<WalletOperationsRepository, 'create' | 'createMany'>
>;

export type WalletTransfersRepositoryMock = jest.Mocked<
  Pick<WalletTransfersRepository, 'create' | 'findByIdempotencyKey'>
>;

export const createWalletRepositoryMock = (): WalletRepositoryMock => ({
  create: jest.fn(),
  getByUserId: jest.fn(),
  getByUserIds: jest.fn(),
  findByCurrencyWithCursor: jest.fn(),
  updateBalance: jest.fn(),
  updateManyBalance: jest.fn(),
});

export const createWalletOperationsRepositoryMock =
  (): WalletOperationsRepositoryMock => ({
    create: jest.fn(),
    createMany: jest.fn(),
  });

export const createWalletTransfersRepositoryMock =
  (): WalletTransfersRepositoryMock => ({
    create: jest.fn(),
    findByIdempotencyKey: jest.fn(),
  });

export const createWalletMock = (
  props: {
    walletId?: string;
    userId?: string;
    currency?: WalletCurrency;
    balance?: number;
  } = {},
): WalletEntity => {
  return WalletEntity.create({
    walletId: props.walletId ?? walletIdMock,
    currency: props?.currency ?? currencyMock,
    balance: props?.balance ?? Number(balanceMock),
    userId: props.userId ?? userIdMock,
  });
};

export const createWalletTransferMock = (
  props: {
    walletTransferId?: string;
    fromWalletId?: string;
    toWalletId?: string;
    amount?: number;
    currency?: WalletCurrency;
    idempotencyKey?: string;
  } = {},
): WalletTransfer => ({
  walletTransferId: props.walletTransferId ?? walletTransferIdMock,
  fromWalletId: props.fromWalletId ?? walletIdMock,
  toWalletId: props.toWalletId ?? walletIdMock,
  amount: props.amount ?? transferAmountMock,
  currency: props.currency ?? currencyMock,
  idempotencyKey: props.idempotencyKey ?? idempotencyKeyMock,
});

export const createWalletOperationMock = (
  props: {
    walletOperationId?: string;
    amount?: number;
    operationType?: WalletOperation['operationType'];
    walletTransferId?: string;
    walletId?: string;
  } = {},
): WalletOperation => ({
  walletOperationId: props.walletOperationId ?? walletOperationInIdMock,
  amount: props.amount ?? transferAmountMock,
  operationType: props.operationType ?? 'transfer_in',
  walletTransferId: props.walletTransferId ?? walletTransferIdMock,
  walletId: props.walletId ?? walletIdMock,
});
