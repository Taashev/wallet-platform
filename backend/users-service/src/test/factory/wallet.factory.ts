import { WalletEntity } from '../../modules/wallet/entities/wallet.entity';
import { WalletRepository } from '../../modules/wallet/interfaces/wallet-repository.intreface';
import { WalletCurrency } from '../../modules/wallet/types/wallet.type';
import { balanceMock, currencyMock, userIdMock, walletIdMock } from '../mocks';

export type WalletRepositoryMock = jest.Mocked<
  Pick<WalletRepository, 'create'>
>;

export const createWalletRepositoryMock = (): WalletRepositoryMock => ({
  create: jest.fn(),
});

export const createWalletMock = (props?: {
  currency?: WalletCurrency;
  balance?: number;
}): WalletEntity => {
  return WalletEntity.create({
    walletId: walletIdMock,
    currency: props?.currency ?? currencyMock,
    balance: props?.balance ?? Number(balanceMock),
    userId: userIdMock,
  });
};
