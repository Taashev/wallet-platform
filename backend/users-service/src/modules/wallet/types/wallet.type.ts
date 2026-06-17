import { CURRENCY, WALLET_OPERATION_TYPE } from '../constants/wallet.constant';

// wallet

export type CreateWallet = {
  walletId: string;
  currency: WalletCurrency;
  balance?: number;
  userId: string;
};

export type RestoreWallet = Required<CreateWallet>;

export type WalletCurrency = keyof typeof CURRENCY;

// wallet operations

export type CreateWalletOperation = {
  operationId: string;
  amount: number;
  type: WalletOperationType;
  transferId: string;
  walletId: string;
};

export type WalletOperationType =
  (typeof WALLET_OPERATION_TYPE)[keyof typeof WALLET_OPERATION_TYPE];

// wallet transfers

export type CreateWaleltTransfer = {
  transferId: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  currency: WalletCurrency;
  idempotencyKey: string;
};
