import {Pool} from 'pg';
import config from "../config";


export const pool = new Pool({
    // connectionString: config.connectionString,

    // Local connection
    user: 'himaloy',
    host: 'localhost',
    database: 'express_api',
    password: '',
    port: 5432,
});

export const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users
            (
                id         SERIAL PRIMARY KEY,
                name       VARCHAR(255)                      NOT NULL,
                email      VARCHAR(255) UNIQUE               NOT NULL,
                password   VARCHAR(255)                      NOT NULL,
                role       VARCHAR(50) DEFAULT 'contributor' NOT NULL,
                created_at TIMESTAMP   DEFAULT NOW(),
                updated_at TIMESTAMP   DEFAULT NOW()
            );
        `)

        await pool.query(`
            CREATE TABLE IF NOT EXISTS issues
            (
                id          SERIAL PRIMARY KEY,
                title       VARCHAR(150)                                       NOT NULL,
                description TEXT                                               NOT NULL,
                type        VARCHAR(50)                                        NOT NULL,
                status      VARCHAR(50)              DEFAULT 'open'            NOT NULL,
                reporter_id INT                                                NOT NULL,
                created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `)
        console.log('Database connected');
    } catch (e) {
        console.log(e);
        throw e;
    }
}
