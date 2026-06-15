import { CURRENCY } from '../constants/wallet.constant';

export type CreateWallet = {
  walletId: string;
  currency: keyof typeof CURRENCY;
  balance?: number;
  userId: string;
};

export type RestoreWallet = Required<CreateWallet>;
