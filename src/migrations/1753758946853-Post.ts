import { MigrationInterface, QueryRunner } from 'typeorm';

export class Post1753758946853 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE TABLE posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            body TEXT NOT NULL,
            reactions_likes INT NOT NULL,
            reactions_dislikes INT NOT NULL,
            view INT NOT NULL,
            tags NVARCHAR(255),
            user_id INT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
            );
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS posts`)
  }
}
