import { DataTypes, Model } from "sequelize";
import { getSequelize } from "../utils/sequelize";
import { parse } from "dotenv";

export class WebAccessByPlatform extends Model {
};

// Override timezone formatting for MSSQL
DataTypes.DATE.prototype._stringify = function _stringify(date: Date, options: any) {
    return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

WebAccessByPlatform.init({
    windows: {
        type: DataTypes.NUMBER,        
        primaryKey: true,
        get(this: WebAccessByPlatform) {
            return parseInt('' + this.getDataValue('windows'));
        }
    },
    mac: {
        type: DataTypes.NUMBER,
        get(this: WebAccessByPlatform) {
            return parseInt('' + this.getDataValue('mac'));
        }
    },
    linux: {
        type: DataTypes.NUMBER,
        get(this: WebAccessByPlatform) {
            return parseInt('' + this.getDataValue('linux'));
        }
    },
    ios: {
        type: DataTypes.NUMBER,
        get(this: WebAccessByPlatform) {
            return parseInt('' + this.getDataValue('ios'));
        }
    },
    android: {
        type: DataTypes.NUMBER,
        get(this: WebAccessByPlatform) {
            return parseInt('' + this.getDataValue('android'));
        }
    },
    search_engines: {
        type: DataTypes.NUMBER,
        get(this: WebAccessByPlatform) {
            return parseInt('' + this.getDataValue('search_engines'));
        }
    },
    total: {
        type: DataTypes.NUMBER,
        get(this: WebAccessByPlatform) {
            return parseInt('' + this.getDataValue('total'));
        }
    }
}, {
    sequelize: getSequelize(),
        freezeTableName: true,
        tableName: 'web_access_by_platform',
        schema: 'public',
        timestamps: false
});