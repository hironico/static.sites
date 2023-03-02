"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
// current sequelize
let _sequelize = null;
const getSequelize = () => {
    if (_sequelize !== null) {
        return _sequelize;
    }
    // ensure configuration is loaded whenever we rscall this script
    dotenv_1.default.config();
    const hostname = process.env.DB_HOSTNAME;
    const username = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;
    const database = process.env.DB_DATABASE;
    const portnum = process.env.DB_PORT;
    const dbType = process.env.DB_TYPE;
    _sequelize = getSequelizeFromParams(hostname, username, password, database, portnum, dbType);
    return _sequelize;
};
exports.getSequelize = getSequelize;
const getSequelizeFromParams = (hostname, username, password, database, portnum, dbType) => {
    console.info(`Connecting ${username} @ ${hostname} / ${database}`);
    const port = Number.parseInt(portnum);
    const dialect = 'MSSQL' === dbType.toUpperCase() ? 'mssql' : 'postgres';
    try {
        let sequelize = new sequelize_1.Sequelize(database, username, password, {
            host: hostname,
            port: port,
            dialect: dialect,
            sync: {
                force: false
            },
            pool: {
                max: 9,
                min: 1,
                idle: 10000,
            }
        });
        return sequelize;
    }
    catch (error) {
        console.error(`Cannot connect to database: ${error}`);
        return null;
    }
};
//# sourceMappingURL=sequelize.js.map