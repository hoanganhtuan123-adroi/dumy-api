import { MigrationInterface, QueryRunner } from 'typeorm';

export class User1752888980370 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            
            first_name VARCHAR(255),
            last_name VARCHAR(255),
            age INT,
            gender VARCHAR(255),
            email VARCHAR(255),
            phone VARCHAR(255),
            username VARCHAR(255),
            password VARCHAR(255),
            birth_date DATE,
            height INT,
            weight FLOAT,
            eye_color VARCHAR(255),
            hair_color VARCHAR(255),
            hair_type VARCHAR(255),

            address_address VARCHAR(255),
            address_city VARCHAR(255),
            address_state VARCHAR(255),
            address_state_code VARCHAR(255),
            address_lat FLOAT,
            address_lng FLOAT,
            address_country VARCHAR(255),

            role VARCHAR(255)

            );

            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE users`);
  }
}
