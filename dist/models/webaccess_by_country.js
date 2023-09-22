"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAccessByCountry = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../utils/sequelize");
// Override timezone formatting for MSSQL
sequelize_1.DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
    return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};
class WebAccessByCountry extends sequelize_1.Model {
}
exports.WebAccessByCountry = WebAccessByCountry;
WebAccessByCountry.init({
    country_code: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true
    },
    country: {
        type: sequelize_1.DataTypes.STRING
    },
    count: {
        type: sequelize_1.DataTypes.INTEGER,
        get() {
            return parseInt('' + this.getDataValue('count'));
        }
    },
    last_visit: {
        type: sequelize_1.DataTypes.DATE
    }
}, {
    sequelize: (0, sequelize_2.getSequelize)(),
    freezeTableName: true,
    tableName: 'web_access_by_country',
    schema: 'public',
    timestamps: false
});
//# sourceMappingURL=webaccess_by_country.js.map