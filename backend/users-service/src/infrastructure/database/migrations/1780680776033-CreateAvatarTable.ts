import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAvatarTable1780680776033 implements MigrationInterface {
  name = 'CreateAvatarTable1780680776033';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "avatars" (
      "avatar_id" uuid NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "deleted_at" TIMESTAMP WITH TIME ZONE,
      "current" boolean NOT NULL DEFAULT false,
      "status" character varying(50) NOT NULL DEFAULT 'pending',
      "storage_key" character varying NOT NULL,
      "original_name" character varying(255) NOT NULL,
      "mime_type" character varying(50),
      "size_bytes" integer, "user_id" uuid NOT NULL,

      CONSTRAINT "AVATARS_CONSTRAINT_AVATAR_ID_PK" PRIMARY KEY ("avatar_id")
    )`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "AVATARS_CONSTRAINT_UNIQUE_CURRENT_USER" ON "avatars" ("user_id") WHERE "current" = true AND "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "avatars" ADD CONSTRAINT "AVATARS_CONSTRAINT_USER_ID_FK" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "avatars" DROP CONSTRAINT "AVATARS_CONSTRAINT_USER_ID_FK"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."AVATARS_CONSTRAINT_UNIQUE_CURRENT_USER"`,
    );
    await queryRunner.query(`DROP TABLE "avatars"`);
  }
}
