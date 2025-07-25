import { MigrationInterface, QueryRunner } from 'typeorm';

export class Token1752905147857 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                CREATE TABLE tokens (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    userId INT,
                    refreshToken VARCHAR(255),
                    FOREIGN KEY (userId) REFERENCES users(id)  ON DELETE CASCADE ON UPDATE CASCADE  
                )
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE tokens');
  }
}
