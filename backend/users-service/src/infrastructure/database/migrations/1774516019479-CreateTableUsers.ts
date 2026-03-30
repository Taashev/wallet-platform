import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableUsers1774516019479 implements MigrationInterface {
  name = 'CreateTableUsers1774516019479';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" (
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "username" character varying(50) NOT NULL,
        "email" character varying(255) NOT NULL,
        "password" character varying(255) NOT NULL,
        "date_of_birth" date NOT NULL,
        "about" character varying(1000) NOT NULL,

        CONSTRAINT "USERS_CONSTRAINT_USERNAME_UQ" UNIQUE ("username"),
        CONSTRAINT "USERS_CONSTRAINT_EMAIL_UQ" UNIQUE ("email"),
        CONSTRAINT "USERS_CONSTRAINT_USER_ID_PK" PRIMARY KEY ("user_id")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
