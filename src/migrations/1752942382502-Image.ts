import { MigrationInterface, QueryRunner } from 'typeorm';

export class Image1752942382502 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE images (
                id BIGINT PRIMARY KEY AUTO_INCREMENT,
                url VARCHAR(255) NOT NULL,        
                filename VARCHAR(255),                  
                imageable_type VARCHAR(100),       
                imageable_id BIGINT
                );
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE images`);
  }
}
