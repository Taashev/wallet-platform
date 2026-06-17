import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOperations1781709859429 implements MigrationInterface {
  name = 'UpdateOperations1781709859429';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wallet_transfers" DROP CONSTRAINT "WALLET_TRANSFERS_CONSTAINT_FROM_WALLET_ID_FK"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transfers" DROP CONSTRAINT "WALLET_TRANSFERS_CONSTAINT_TO_WALLET_ID_FK"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_operations" DROP CONSTRAINT "WALLET_OPERATIONS_CONSTRAINT_WALLET_TRANSFER_ID_FK"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_operations" ALTER COLUMN "wallet_transfer_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transfers" ADD CONSTRAINT "WALLET_TRANSFERS_CONSTRAINT_CHECK_AMOUNT" CHECK (amount > 0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transfers" ADD CONSTRAINT "WALLET_TRANSFERS_CONSTAINT_FROM_WALLET_ID_FK" FOREIGN KEY ("from_wallet_id") REFERENCES "wallets"("wallet_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transfers" ADD CONSTRAINT "WALLET_TRANSFERS_CONSTAINT_TO_WALLET_ID_FK" FOREIGN KEY ("to_wallet_id") REFERENCES "wallets"("wallet_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_operations" ADD CONSTRAINT "WALLET_OPERATIONS_CONSTRAINT_WALLET_TRANSFER_ID_FK" FOREIGN KEY ("wallet_transfer_id") REFERENCES "wallet_transfers"("wallet_transfer_id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wallet_operations" DROP CONSTRAINT "WALLET_OPERATIONS_CONSTRAINT_WALLET_TRANSFER_ID_FK"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transfers" DROP CONSTRAINT "WALLET_TRANSFERS_CONSTAINT_TO_WALLET_ID_FK"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transfers" DROP CONSTRAINT "WALLET_TRANSFERS_CONSTAINT_FROM_WALLET_ID_FK"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transfers" DROP CONSTRAINT "WALLET_TRANSFERS_CONSTRAINT_CHECK_AMOUNT"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_operations" ALTER COLUMN "wallet_transfer_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_operations" ADD CONSTRAINT "WALLET_OPERATIONS_CONSTRAINT_WALLET_TRANSFER_ID_FK" FOREIGN KEY ("wallet_transfer_id") REFERENCES "wallet_transfers"("wallet_transfer_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transfers" ADD CONSTRAINT "WALLET_TRANSFERS_CONSTAINT_TO_WALLET_ID_FK" FOREIGN KEY ("to_wallet_id") REFERENCES "wallets"("wallet_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transfers" ADD CONSTRAINT "WALLET_TRANSFERS_CONSTAINT_FROM_WALLET_ID_FK" FOREIGN KEY ("from_wallet_id") REFERENCES "wallets"("wallet_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }
}
