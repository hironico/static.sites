"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAccess = void 0;
const dist_1 = require("sequelize/dist");
const dotenv = __importStar(require("dotenv"));
const mssql_1 = require("../utils/mssql");
class WebAccess extends dist_1.Model {
}
exports.WebAccess = WebAccess;
;
// init the model only if it is enabled in the config
dotenv.config();
if (process.env.DB_STATS_ENABLE === 'true') {
    WebAccess.init({
        id: {
            type: dist_1.DataTypes.NUMBER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        ip4: {
            type: dist_1.DataTypes.STRING,
            allowNull: false
        },
        ip6: {
            type: dist_1.DataTypes.STRING,
            allowNull: true
        },
        country: {
            type: dist_1.DataTypes.STRING,
            allowNull: true
        },
        country_code: {
            type: dist_1.DataTypes.STRING,
            allowNull: true
        },
        city: {
            type: dist_1.DataTypes.STRING,
            allowNull: true
        },
        continent: {
            type: dist_1.DataTypes.STRING,
            allowNull: true
        },
        latitude: {
            type: dist_1.DataTypes.NUMBER,
            allowNull: true
        },
        longitude: {
            type: dist_1.DataTypes.NUMBER,
            allowNull: true
        },
        timezone: {
            type: dist_1.DataTypes.STRING,
            allowNull: true
        },
        postal_code: {
            type: dist_1.DataTypes.STRING,
            allowNull: true
        },
        isp_name: {
            type: dist_1.DataTypes.STRING,
            allowNull: true
        },
        timestamp: {
            type: dist_1.DataTypes.DATE,
            allowNull: true
        },
        user_agent: {
            type: dist_1.DataTypes.STRING,
            allowNull: true
        }
    }, {
        sequelize: (0, mssql_1.getSequelize)(),
        freezeTableName: true,
        tableName: 'WEB_ACCESS',
        timestamps: false
    });
}
//# sourceMappingURL=webaccess.js.map