import { MigrationInterface, QueryRunner } from 'typeorm';

export class Review1753155878662 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE reviews (
                id INT PRIMARY KEY AUTO_INCREMENT,
                rating DECIMAL(2, 1) NOT NULL,
                comment TEXT NOT NULL,
                date DATE NOT NULL,
                reviewer_name NVARCHAR(255) NOT NULL,
                reviewer_email NVARCHAR(255) NOT NULL,
                product_id INT,
                FOREIGN KEY (product_id) REFERENCES products(id)
                    ON DELETE CASCADE ON UPDATE CASCADE
            )
        `);
    await queryRunner.query(`
            ALTER TABLE reviews
            ADD CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(id)
                ON DELETE CASCADE ON UPDATE CASCADE
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS reviews`);
  }
}
