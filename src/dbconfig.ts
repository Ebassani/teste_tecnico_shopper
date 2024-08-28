import mysql from 'mysql2'

const {DB_HOST, DB_USER, DB_PASSWORD, DB_NAME} = process.env;

const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: 3306
}).promise()

type insert_result = {
    fieldCount: number;
    affectedRows: number;
    insertId: number;
    info: string;
    serverStatus: number;
    warningStatus: number;
    changedRows: number;
}

export async function calldb() {
    const [result] = await pool.query("SELECT * FROM users;");
    return result
}

export async function addUser(customer_code: string) {
    const [result] = await pool.query(`
        INSERT INTO users (customer_code)
        VALUES (?)
        `, [customer_code]);

    const insert = result as insert_result;
    return insert.insertId
}
