import { MigrationInterface, QueryRunner } from 'typeorm';

export class Category1753155820400 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT PRIMARY KEY AUTO_INCREMENT,
                slug NVARCHAR(255) NOT NULL,
                name NVARCHAR(255) NOT NULL,
                url TEXT NOT NULL
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(` DROP TABLE IF EXISTS categories`);
  }
}
