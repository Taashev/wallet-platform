import { ValidationError } from '../../../shared/errors';
import {
  CURRENCY,
  WALLET_DEFAULT_BALANCE_CENTS,
} from '../constants/wallet.constant';
import { CreateWallet, RestoreWallet } from '../types/wallet.type';

export interface WalletProps {
  walletId: string;
  currency: keyof typeof CURRENCY;
  balance: number;
  userId: string;
}

export class WalletEntity {
  private readonly _walletId: string;
  private readonly _currency: keyof typeof CURRENCY;
  private _balance: number;
  private readonly _userId: string;

  private constructor(props: WalletProps) {
    this._walletId = props.walletId;
    this._currency = props.currency;
    this._balance = props.balance;
    this._userId = props.userId;
  }

  get walletId() {
    return this._walletId;
  }

  get currency() {
    return this._currency;
  }

  get balance() {
    return this._balance;
  }

  get userId() {
    return this._userId;
  }

  static validateCurrency(value: string) {
    if (CURRENCY[value] === undefined) {
      return new ValidationError({
        message: 'Невалидная валюта ',
        expose: true,
      });
    }
  }

  static validateBalance(balance: number) {
    if (!Number.isInteger(balance) || balance < 0) {
      throw new ValidationError({
        message: 'Баланс не может быть отрицательным',
        expose: true,
      });
    }
  }

  static create(props: CreateWallet) {
    this.validateCurrency(props.currency);

    if (props.balance !== undefined) {
      this.validateBalance(props.balance);
    }

    return new WalletEntity({
      walletId: props.walletId,
      currency: props.currency ?? CURRENCY.USD,
      balance: props.balance ?? WALLET_DEFAULT_BALANCE_CENTS,
      userId: props.userId,
    });
  }

  static restore(props: RestoreWallet) {
    return new WalletEntity(props);
  }
}
