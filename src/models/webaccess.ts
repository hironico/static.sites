import { DataTypes, Model } from "sequelize";
import * as dotenv from "dotenv";

import { getSequelize } from "../utils/sequelize";

export class WebAccess extends Model {
};

// Override timezone formatting for MSSQL
DataTypes.DATE.prototype._stringify = function _stringify(date: Date, options: any) {
    return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

// init the model only if it is enabled in the config
dotenv.config();
if (process.env.DB_STATS_ENABLE === 'true') {
    WebAccess.init({
        id: {
            type: DataTypes.NUMBER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        ip4: {
            type: DataTypes.STRING,
            allowNull: true
        },
        ip6: {
            type: DataTypes.STRING,
            allowNull: true
        },
        country: {
            type: DataTypes.STRING,
            allowNull: true
        },
        country_code: {
            type: DataTypes.STRING,
            allowNull: true
        },
        city: {
            type: DataTypes.STRING,
            allowNull: true
        },
        continent: {
            type: DataTypes.STRING,
            allowNull: true
        },
        latitude: {
            type: DataTypes.DECIMAL(6,3),
            allowNull: true,
            get(this: WebAccess) {
                return parseFloat('' + this.getDataValue('latitude'));
            }
        },
        longitude: {
            type: DataTypes.DECIMAL(6,3),
            allowNull: true,
            get(this: WebAccess) {
                return parseFloat('' + this.getDataValue('longitude'));
            }
        },
        timezone: {
            type: DataTypes.STRING,
            allowNull: true
        },
        postal_code: {
            type: DataTypes.STRING,
            allowNull: true
        },
        isp_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        user_agent: {
            type: DataTypes.STRING,
            allowNull: true
        },
        visit_datetime: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        visit_url: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize: getSequelize(),
        freezeTableName: true,
        tableName: 'web_access',
        schema: 'public',
        timestamps: false
    });
}