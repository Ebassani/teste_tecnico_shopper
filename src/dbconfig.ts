import mysql, { RowDataPacket } from 'mysql2'

const {DB_HOST, DB_USER, DB_PASSWORD, DB_NAME} = process.env;

const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: 3306
}).promise()

type Insert_result = {
    fieldCount: number;
    affectedRows: number;
    insertId: number;
    info: string;
    serverStatus: number;
    warningStatus: number;
    changedRows: number;
}

type User = {
    id: number;
    customer_code: string;
}

type Measure = {
    measure_uuid: number;
    user_id: number;
    measure_type: string;
    measure_datetime: Date;
    image_url: string;
    has_confirmed: boolean;
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

    const insert = result as Insert_result;
    return insert.insertId
}

export async function getUserFromCode(customer_code: string) {
    const [result] = await pool.query<RowDataPacket[] & User[]>(
        "SELECT * FROM users WHERE customer_code = (?);",
    [customer_code]);
    
    return result
}


export async function addMeasure(customer_code: string, measure_value: number, measure_datetime: Date, image_url: string, measure_type: string) {
    const user_uid = (await getUserFromCode(customer_code))


    
    const [result] = await pool.query(`
        INSERT INTO measures (user_id, measure_type, measure_value, measure_datetime, img_url)
        VALUES (?)
        `, [user_uid, measure_type, measure_value, measure_datetime, image_url]);

    const insert = result as Insert_result;
    return insert.insertId
}

export async function getMeasuresFromUser(customer_code: string) {
    const user_uid = (await getUserFromCode(customer_code))
    
    const [results] = await pool.query<RowDataPacket[] & Measure[]>(
        "SELECT * FROM measures WHERE user_id = (?);",
    [user_uid]);
    
    return results
}

export async function patchConfirmMeasure(measure_id: number, confirmed_value: number) {
    
}