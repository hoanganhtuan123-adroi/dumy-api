import { MigrationInterface, QueryRunner } from "typeorm";

export class Todo1753539965217 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE todos(
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT,
                name nvarchar(255),
                completed boolean,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
            )
            `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS todos`)
    }

}
