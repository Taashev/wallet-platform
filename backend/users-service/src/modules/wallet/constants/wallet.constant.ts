export const CURRENCY = {
  USD: 'USD',
} as const;

export const WALLET_DEFAULT_BALANCE_CENTS = 500_000;

export const WALLET_DEFAULT_CURRENCY = CURRENCY.USD;

export const WALLET_OPERATION_TYPE = {
  TRANSFER_IN: 'transfer_in',
  TRANSFER_OUT: 'transfer_out',
} as const;

export const WALLET_QUEUE = 'wallet-queue';

export const WALLET_JOBS = { RESET_WALLET: 'reset-wallet' };
