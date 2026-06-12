import dotenv from 'dotenv';
import {env} from "process";

dotenv.config({quiet: true});

const config = {
    connectionString: env.DATABASE_URL as string,
    port: env.PORT as string,

    // local connection
    // user: env.DB_USER,
    // host: env.DB_HOST as string,
    // database: env.DB_NAME as string,
    // password: env.DB_PASSWORD as string,
    // db_port: env.DB_PORT,
}

export default config;
