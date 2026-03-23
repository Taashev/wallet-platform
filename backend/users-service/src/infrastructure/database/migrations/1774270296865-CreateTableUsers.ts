import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableUsers1774270296865 implements MigrationInterface {
  name = 'CreateTableUsers1774270296865';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" (
      "user_id" uuid NOT NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      "username" character varying(50) NOT NULL,
      "email" character varying(255) NOT NULL,
      "password" character varying(255) NOT NULL,
      "date_of_birth" date,
      "about" character varying(1000) NOT NULL,

      CONSTRAINT "CONSTRAINT_USERS_USERNAME_UQ" UNIQUE ("username"),
      CONSTRAINT "CONSTRAINT_USERS_EMAIL_UQ" UNIQUE ("email"),
      CONSTRAINT "CONSTRAINT_USERS_USER_ID_PK" PRIMARY KEY ("user_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
