import { Sequelize } from "sequelize";

import dotenv from "dotenv";

// current sequelize
let _sequelize: Sequelize = null;

export const getSequelize = (): Sequelize => {

    if (_sequelize !== null) {
        return _sequelize;
    }

    // ensure configuration is loaded whenever we rscall this script
    dotenv.config();

    const hostname = process.env.DB_HOSTNAME;
    const username = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;
    const database = process.env.DB_DATABASE;
    const portnum = process.env.DB_PORT;
    const dbType = process.env.DB_TYPE;

    _sequelize = getSequelizeFromParams(hostname, username, password, database, portnum, dbType);
    return _sequelize;
}

const getSequelizeFromParams = (hostname: string, username: string, password: string, database: string, portnum: string, dbType: string): Sequelize => {
    console.info(`Connecting ${username} @ ${hostname} / ${database}`);

    const port = Number.parseInt(portnum);
    const dialect = 'MSSQL' === dbType.toUpperCase() ? 'mssql' : 'postgres';

    try {
        let sequelize = new Sequelize(database, username, password, {
            host: hostname,
            port: port,
            dialect: dialect,
            sync: {
                force: false
            },
            pool: {
                max: 50,
                min: 1,
                idle: 10000,
                acquire: 30000
            }
        });

        return sequelize;
    } catch (error) {
        console.error(`Cannot connect to database: ${error}`);
        return null;
    }
}