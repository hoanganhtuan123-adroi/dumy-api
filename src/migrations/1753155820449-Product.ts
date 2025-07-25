import { MigrationInterface, QueryRunner } from "typeorm";

export class Product1753155820449 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT PRIMARY KEY AUTO_INCREMENT,
                category_id INT,
                title NVARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                tags NVARCHAR(200),
                price DECIMAL(10, 2) NOT NULL,
                discount_percentage DECIMAL(10, 2) NOT NULL,
                rating DECIMAL(10, 2) NOT NULL,
                stock INT NOT NULL,
                brand NVARCHAR(255) NOT NULL,
                sku NVARCHAR(255) NOT NULL,
                weight INT NOT NULL,
                dimensions_width DECIMAL(10, 2) NOT NULL,
                dimensions_height DECIMAL(10, 2) NOT NULL,
                dimensions_depth DECIMAL(10, 2) NOT NULL,
                warranty_information NVARCHAR(255) NOT NULL,
                shipping_information NVARCHAR(255) NOT NULL,
                availability_status NVARCHAR(255) NOT NULL,
                return_policy NVARCHAR(255) NOT NULL,
                minimumOrderQuantity INT NOT NULL,
                meta_barcode NVARCHAR(255) NOT NULL,
                meta_qrcode NVARCHAR(255) NOT NULL,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE ON UPDATE CASCADE

            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS products`);
    }

}
