"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAccessByPlatform = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../utils/sequelize");
class WebAccessByPlatform extends sequelize_1.Model {
}
exports.WebAccessByPlatform = WebAccessByPlatform;
;
// Override timezone formatting for MSSQL
sequelize_1.DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
    return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};
WebAccessByPlatform.init({
    windows: {
        type: sequelize_1.DataTypes.NUMBER,
        primaryKey: true,
        get() {
            return parseInt('' + this.getDataValue('windows'));
        }
    },
    mac: {
        type: sequelize_1.DataTypes.NUMBER,
        get() {
            return parseInt('' + this.getDataValue('mac'));
        }
    },
    linux: {
        type: sequelize_1.DataTypes.NUMBER,
        get() {
            return parseInt('' + this.getDataValue('linux'));
        }
    },
    ios: {
        type: sequelize_1.DataTypes.NUMBER,
        get() {
            return parseInt('' + this.getDataValue('ios'));
        }
    },
    android: {
        type: sequelize_1.DataTypes.NUMBER,
        get() {
            return parseInt('' + this.getDataValue('android'));
        }
    },
    search_engines: {
        type: sequelize_1.DataTypes.NUMBER,
        get() {
            return parseInt('' + this.getDataValue('search_engines'));
        }
    },
    total: {
        type: sequelize_1.DataTypes.NUMBER,
        get() {
            return parseInt('' + this.getDataValue('total'));
        }
    }
}, {
    sequelize: (0, sequelize_2.getSequelize)(),
    freezeTableName: true,
    tableName: 'web_access_by_platform',
    schema: 'public',
    timestamps: false
});
//# sourceMappingURL=webaccess_by_platform.js.map