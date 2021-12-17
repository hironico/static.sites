"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ping = exports.query = exports.tableTop = exports.getSequelizeFromParams = exports.getSequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
const getSequelize = () => {
    // ensure configuration is loaded whenever we rscall this script
    dotenv_1.default.config();
    const hostname = process.env.DB_HOSTNAME;
    const username = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;
    const database = process.env.DB_DATABASE;
    return (0, exports.getSequelizeFromParams)(hostname, username, password, database);
};
exports.getSequelize = getSequelize;
const getSequelizeFromParams = (hostname, username, password, database) => {
    console.info(`Connecting ${username} @ ${hostname} / ${database}`);
    let sequelize = new sequelize_1.Sequelize(database, username, password, {
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
};
exports.getSequelizeFromParams = getSequelizeFromParams;
const tableTop = (hostname, username, password, database, tablename, maxRowCount) => __awaiter(void 0, void 0, void 0, function* () {
    const sequelize = (0, exports.getSequelizeFromParams)(hostname, username, password, database);
    return sequelize.query(`SELECT top ${maxRowCount} * FROM ${tablename}`, { type: sequelize_1.QueryTypes.SELECT });
});
exports.tableTop = tableTop;
const query = (hostname, username, password, database, sql) => __awaiter(void 0, void 0, void 0, function* () {
    const sequelize = (0, exports.getSequelizeFromParams)(hostname, username, password, database);
    return sequelize.query(sql, { type: sequelize_1.QueryTypes.SELECT });
});
exports.query = query;
const ping = (hostname, username, password, database) => __awaiter(void 0, void 0, void 0, function* () {
    const sequelize = (0, exports.getSequelizeFromParams)(hostname, username, password, database);
    return new Promise((resolve, reject) => {
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
});
exports.ping = ping;
//# sourceMappingURL=mssql.js.map