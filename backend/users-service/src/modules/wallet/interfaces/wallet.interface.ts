import { WalletCurrency, WalletOperationType } from '../types/wallet.type';

export interface WalletOperation {
  walletOperationId: string;
  amount: number;
  operationType: WalletOperationType;
  walletTransferId: string;
  walletId: string;
}

export interface WalletTransfer {
  walletTransferId: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  currency: WalletCurrency;
  idempotencyKey: string;
}
