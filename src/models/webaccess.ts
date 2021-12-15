import { DataTypes, Model } from "sequelize/dist";
import * as dotenv from "dotenv";

import { getSequelize } from "../utils/mssql";

export class WebAccess extends Model {
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
            allowNull: false
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
            type: DataTypes.NUMBER,
            allowNull: true
        },
        longitude: {
            type: DataTypes.NUMBER,
            allowNull: true
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
            allowNull: false
        },
        visit_url: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        sequelize: getSequelize(),
        freezeTableName: true,
        tableName: 'WEB_ACCESS',
        timestamps: false
    });
}