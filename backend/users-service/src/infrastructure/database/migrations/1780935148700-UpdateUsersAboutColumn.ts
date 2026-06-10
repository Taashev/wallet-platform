import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUsersAboutColumn1780935148700 implements MigrationInterface {
  name = 'UpdateUsersAboutColumn1780935148700';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "about" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "about" SET NOT NULL`,
    );
  }
}
