import { MigrationInterface, QueryRunner } from "typeorm";

export class Cart1753329208060 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.query(`
            CREATE TABLE carts (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
            )
        `);
        await queryRunner.query(`
            CREATE TABLE cart_items (
                cart_id INT,
                product_id INT,
                FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS cart_items
        `);
        await queryRunner.query(`
            DROP TABLE IF EXISTS carts
        `);
    }

}
