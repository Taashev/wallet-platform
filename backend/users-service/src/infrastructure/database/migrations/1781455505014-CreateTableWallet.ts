import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableWallet1781455505014 implements MigrationInterface {
  name = 'CreateTableWallet1781455505014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "wallets" (
      "wallet_id" uuid NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "currency" character varying(3) NOT NULL,
      "balance" bigint NOT NULL,
      "user_id" uuid NOT NULL,

      CONSTRAINT "WALLET_CONSTRAINT_UNIQUE_USERID_CURRENCY" UNIQUE ("user_id", "currency"),
      CONSTRAINT "WALLET_CONSTRAINT_CHECK_BALANCE" CHECK (balance >= 0),
      CONSTRAINT "WALLET_CONSTRAINT_WALLET_ID_PK" PRIMARY KEY ("wallet_id"))`,
    );

    await queryRunner.query(
      `CREATE TABLE "wallet_operations" (
      "wallet_operation_id" uuid NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "amount" bigint NOT NULL, "operation_type" character varying(50) NOT NULL,
      "wallet_id" uuid NOT NULL,

      CONSTRAINT "WALLET_OPERATIONS_CONSTRAINT_CHECK_AMOUNT" CHECK (amount != 0),
      CONSTRAINT "WALLET_OPERATIONS_CONSTRAINT_WALLET_OPERATION_ID_PK" PRIMARY KEY ("wallet_operation_id"))`,
    );

    await queryRunner.query(
      `ALTER TABLE "wallets" ADD CONSTRAINT "WALLET_CONSTRAINT_USER_ID_FK" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "wallet_operations" ADD CONSTRAINT "WALLET_OPERATIONS_CONSTRAINT_WALLET_ID_FK" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("wallet_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wallet_operations" DROP CONSTRAINT "WALLET_OPERATIONS_CONSTRAINT_WALLET_ID_FK"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP CONSTRAINT "WALLET_CONSTRAINT_USER_ID_FK"`,
    );
    await queryRunner.query(`DROP TABLE "wallet_operations"`);
    await queryRunner.query(`DROP TABLE "wallets"`);
  }
}
