import { DataTypes, InferAttributes, InferCreationAttributes, Model, Optional } from "sequelize";
import { getSequelize } from "../utils/sequelize";

// Override timezone formatting for MSSQL
DataTypes.DATE.prototype._stringify = function _stringify(date: Date, options: any) {
    return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

export class WebAccessByCountry extends Model<InferAttributes<WebAccessByCountry>, InferCreationAttributes<WebAccessByCountry>> {
    public country_code!: string;
    public country!: string;
    public count!: number;
    public last_visit!: Date;
}

WebAccessByCountry.init({
    country_code: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    country: {
        type: DataTypes.STRING
    },
    count: {
        type: DataTypes.INTEGER,
        get(this:WebAccessByCountry): unknown {
            return parseInt('' + this.getDataValue('count'));
        }
    },
    last_visit: {
        type: DataTypes.DATE
    }
}, {
    sequelize: getSequelize(),
        freezeTableName: true,
        tableName: 'web_access_by_country',
        schema: 'public',
        timestamps: false
});