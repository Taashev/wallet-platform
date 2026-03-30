import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableSessions1774516077632 implements MigrationInterface {
  name = 'CreateTableSessions1774516077632';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sessions" (
        "session_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "revoked_at" TIMESTAMP WITH TIME ZONE,
        "refresh_token_hash" text NOT NULL,
        "user_id" uuid NOT NULL,
        "user_agent" text NOT NULL,

        CONSTRAINT "SESSIONS_CONSTRAINT_SESSION_ID_PK" PRIMARY KEY ("session_id")
      )`,
    );

    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "SESSIONS_CONSTRAINT_USER_ID_FK" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "SESSIONS_CONSTRAINT_USER_ID_FK"`,
    );
    await queryRunner.query(`DROP TABLE "sessions"`);
  }
}
