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

export type Measure = {
    measure_uuid: number;
    user_id: number;
    measure_value: number;
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
        VALUES (?);
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
    const user_array = await getUserFromCode(customer_code)

    let user_uid = 0;

    if (user_array.length == 0) {
        user_uid = await addUser(customer_code);
    } else {
        user_uid = user_array[0].id;
    }
    
    const [result] = await pool.query(`
        INSERT INTO measures (user_id, measure_type,measure_datetime, measure_value, image_url)
        VALUES (?,?,?,?,?);
        `, [user_uid, measure_type, measure_datetime, measure_value, image_url]);

    const insert = result as Insert_result;
    
    return insert.insertId
}

export async function getMeasureFromId(measure_id: string) {
    const id_as_number = parseInt(measure_id);
    
    const [result] = await pool.query<RowDataPacket[] & Measure[]>(
        "SELECT * FROM measures WHERE measure_uuid = (?);",
    [id_as_number]);
    
    return result
}

export async function confirmMeasure(measure_id: number, value: number) {
    const [result] = await pool.query(
        "UPDATE measures SET measure_value = (?), has_confirmed = TRUE WHERE measure_uuid = (?);",
    [value, measure_id]);

}

export async function getMeasuresFromUser(user_uid: number) {
    
    const [results] = await pool.query<RowDataPacket[] & Measure[]>(
        "SELECT * FROM measures WHERE user_id = (?);",
    [user_uid]);
    
    return results
}

export async function getSortedMeasuresFromUser(user_uid: number, type: string) {
    
    const [results] = await pool.query<RowDataPacket[] & Measure[]>(
        "SELECT * FROM measures WHERE user_id = (?) AND measure_type = ?;",
    [user_uid, type]);
    
    return results
}

export async function verifyMeasureMonth(customer_code: string, measure_datetime: Date, measure_type: string) {
    const user_array = await getUserFromCode(customer_code);

    if (user_array.length == 0) {
        return false
    }

    const user_uid = user_array[0].id;

    const year = measure_datetime.getFullYear();
    const month = measure_datetime.getMonth() + 1;
    
    const [results] = await pool.query<RowDataPacket[] & Measure[]>(
        "SELECT * FROM measures WHERE EXTRACT(YEAR FROM measure_datetime) = (?) AND EXTRACT(MONTH FROM measure_datetime) = (?) AND user_id = (?) AND measure_type = (?);",
    [year, month, user_uid, measure_type]);

    if ((results as Measure[]).length == 0) {
        return false
    }

    return true
}