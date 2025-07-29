import { MigrationInterface, QueryRunner } from "typeorm";

export class Recipe1753599693547 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE recipes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            name VARCHAR(255) NOT NULL,
            ingredients TEXT NOT NULL,
            instructions TEXT NOT NULL,
            prepTimeMinutes VARCHAR(255) NOT NULL, 
            cookTimeMinutes VARCHAR(255) NOT NULL, 
            serving INT NOT NULL,
            difficult VARCHAR(255) NOT NULL,
            cuisine VARCHAR(255) NOT NULL,
            caloriesPerServing INT NOT NULL,
            tags TEXT NOT NULL,
            rating DECIMAL(3, 2) NOT NULL,
            reviewCount INT NOT NULL,
            mealType TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS recipes`)
    }

}
