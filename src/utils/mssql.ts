import { Sequelize, QueryTypes } from "sequelize";

import dotenv from "dotenv";

export const getSequelize = (): Sequelize => {
    // ensure configuration is loaded whenever we rscall this script
    dotenv.config();

    const hostname = process.env.DB_HOSTNAME; 
    const username = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;
    const database = process.env.DB_DATABASE;
    
    return getSequelizeFromParams(hostname, username, password, database);
}

export const getSequelizeFromParams = (hostname: string, username: string, password: string, database: string): Sequelize => {    
    console.info(`Connecting ${username} @ ${hostname} / ${database}`);

    let sequelize = new Sequelize(database, username, password, {
        host: hostname,
        port: 1433,
        dialect: 'mssql',
        dialectOptions: {
            authentication: {
                options: {
                    trustedConnection: true,
                    userName: username,
                    password: password
                }
            },
            options: {
                database: database,
                port: 1433
            }
        },
        sync: {
            force: false
        },
        pool: {
            max: 10,
            idle: 30000,
            acquire: 60000
          }
    });

    return sequelize;
}

export const tableTop = async (hostname: string, username: string, password: string, database: string, tablename: string, maxRowCount: number): Promise<unknown> => {
    const sequelize = getSequelizeFromParams(hostname, username, password, database);
    return sequelize.query(`SELECT top ${maxRowCount} * FROM ${tablename}`, { type: QueryTypes.SELECT });
}

export const query = async (hostname: string, username: string, password: string, database: string, sql: string): Promise<unknown> => {
    const sequelize = getSequelizeFromParams(hostname, username, password, database);
    return sequelize.query(sql, { type: QueryTypes.SELECT });
}

export const ping = async (hostname: string, username: string, password: string, database: string): Promise<boolean> => {
    const sequelize = getSequelizeFromParams(hostname, username, password, database);

    return new Promise<boolean>((resolve, reject) => {
        sequelize.authenticate()
            .then(() => {
                console.log('Connection has been established successfully.');
                resolve(true);
            })
            .catch(error => {
                console.error('Unable to connect to the database:', error);
                reject(error);
            });
    });
}