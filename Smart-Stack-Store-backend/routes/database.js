import express from 'express';
import path from 'path';
    import mysql from 'mysql2/promise';
import { Connector, IpAddressTypes } from '@google-cloud/cloud-sql-connector';

const router = express.Router();
// router.use(express.static(path.join(__dirname, '../client/build')));

const connector = new Connector();

router.get('/getProductCatalog', (req, res) => {
    const clientOpts =  connector.getOptions({
        instanceConnectionName: "dark-alloy-460810-i1:us-central1:smartstack-mysql-db",
        ipType: IpAddressTypes.PUBLIC,
    });
    const pool = mysql.createPool({
        ...clientOpts,
        user: "smartstack-dbuser",
        password: "smartstackappian ",
        database: "product-catalog-db",
    });
    const conn =  pool.getConnection();

    let sqlContext = "";
    const [rows2] =  conn.query('SELECT product_ID, name, brand, category, price, stock, warranty_years, rating FROM product_catalog;');
    const products = rows2;
    if (products.length > 0) {
        sqlContext += "--- All Product Information from Database ---\n";
        products.forEach(product => {
            sqlContext += `Product_ID: ${product.product_ID}, ` +
                `Name: ${product.name}, ` +
                `Brand: ${product.brand}, ` +
                `Category: ${product.category}, ` +
                `Price: ${product.price}, ` +
                `Stock: ${product.stock}, ` +
                `Warranty_Years: ${product.warranty_years}, ` +
                `Rating: ${product.rating}\n`;
        });
        console.log(sqlContext);
        sqlContext += "\n";
    }


    res.status(200).send(sqlContext);
});
    export default router;