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
const https = __importStar(require("https"));
const querystring = __importStar(require("querystring"));
const performRequest = (host, endpoint, method, data) => {
    const dataString = JSON.stringify(data);
    let headers = {};
    if (method === 'GET') {
        if (data !== null) {
            endpoint += '?' + querystring.stringify(data);
        }
    }
    else {
        headers = {
            'Content-Type': 'application/json',
            'Content-Length': dataString.length
        };
    }
    const options = {
        host: host,
        path: endpoint,
        method: method,
        headers: headers
    };
    // console.log('Requesting options:\n' + JSON.stringify(options));
    const p = new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            res.setEncoding('utf-8');
            var responseString = '';
            res.on('data', function (data) {
                responseString += data;
            });
            res.on('end', () => {
                resolve(responseString);
            });
        });
        req.write(dataString);
        req.end();
    });
    return p;
};
exports.default = performRequest;
//# sourceMappingURL=request.js.map