import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableWalletTransfers1781652882533 implements MigrationInterface {
  name = 'CreateTableWalletTransfers1781652882533';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "wallet_transfers" (
        "wallet_transfer_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "from_wallet_id" uuid NOT NULL,
        "to_wallet_id" uuid NOT NULL,
        "amount" bigint NOT NULL,
        "currency" character varying(3) NOT NULL,
        "idempotency_key" uuid NOT NULL,

        CONSTRAINT "WALLET_TRANSFERS_CONSTRAINT_UNIQUE_IDEMPOTENCY_KEY" UNIQUE ("from_wallet_id", "idempotency_key"),
        CONSTRAINT "WALLET_TRANSFERS_CONSTRAINT_WALLET_TRANSFER_ID_PK" PRIMARY KEY ("wallet_transfer_id")
      )`,
    );

    await queryRunner.query(
      `ALTER TABLE "wallet_operations" ADD "wallet_transfer_id" uuid NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "wallet_transfers" ADD CONSTRAINT "WALLET_TRANSFERS_CONSTAINT_FROM_WALLET_ID_FK" FOREIGN KEY ("from_wallet_id") REFERENCES "wallets"("wallet_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "wallet_transfers" ADD CONSTRAINT "WALLET_TRANSFERS_CONSTAINT_TO_WALLET_ID_FK" FOREIGN KEY ("to_wallet_id") REFERENCES "wallets"("wallet_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "wallet_operations" ADD CONSTRAINT "WALLET_OPERATIONS_CONSTRAINT_WALLET_TRANSFER_ID_FK" FOREIGN KEY ("wallet_transfer_id") REFERENCES "wallet_transfers"("wallet_transfer_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
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
      `ALTER TABLE "wallet_operations" DROP COLUMN "wallet_transfer_id"`,
    );
    await queryRunner.query(`DROP TABLE "wallet_transfers"`);
  }
}
