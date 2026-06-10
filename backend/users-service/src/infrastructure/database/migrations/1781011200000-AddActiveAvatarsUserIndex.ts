import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActiveAvatarsUserIndex1781011200000 implements MigrationInterface {
  name = 'AddActiveAvatarsUserIndex1781011200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "AVATARS_INDEX_ACTIVE_USER" ON "avatars" ("user_id") WHERE "deleted_at" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."AVATARS_INDEX_ACTIVE_USER"`);
  }
}
