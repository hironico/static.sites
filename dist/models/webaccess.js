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
const sequelize_1 = require("sequelize");
const dotenv = __importStar(require("dotenv"));
const sequelize_2 = require("../utils/sequelize");
class WebAccess extends sequelize_1.Model {
}
exports.WebAccess = WebAccess;
;
// Override timezone formatting for MSSQL
sequelize_1.DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
    return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};
// init the model only if it is enabled in the config
dotenv.config();
if (process.env.DB_STATS_ENABLE === 'true') {
    WebAccess.init({
        id: {
            type: sequelize_1.DataTypes.NUMBER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        ip4: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        ip6: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        country: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        country_code: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        city: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        continent: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        latitude: {
            type: sequelize_1.DataTypes.NUMBER,
            allowNull: true
        },
        longitude: {
            type: sequelize_1.DataTypes.NUMBER,
            allowNull: true
        },
        timezone: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        postal_code: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        isp_name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        user_agent: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        visit_datetime: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        visit_url: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize: (0, sequelize_2.getSequelize)(),
        freezeTableName: true,
        tableName: 'web_access',
        timestamps: false
    });
}
//# sourceMappingURL=webaccess.js.map