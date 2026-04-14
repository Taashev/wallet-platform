import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUsersAddColumnDeletedAt1776097784532 implements MigrationInterface {
  name = 'UpdateUsersAddColumnDeletedAt1776097784532';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "deleted_at" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
  }
}
