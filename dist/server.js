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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const https_1 = __importDefault(require("https"));
const ws_1 = __importDefault(require("ws"));
const fs_1 = __importDefault(require("fs"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const packInfo = require('../package.json');
const stats = __importStar(require("./middlewares/stats"));
// some intriduction messages
console.log(`This is hironico.net static sites server version ${packInfo.version}`);
console.log(`Starting into: ${__dirname}`);
// loading environment configuration fom the .env file
dotenv_1.default.config();
console.log('Configuration loaded OK.');
console.log(`SSL key file: ${process.env.SERVER_SSL_KEY_FILE}`);
console.log(`SSL cert file: ${process.env.SERVER_SSL_CERT_FILE}`);
const app = (0, express_1.default)();
// enable cors request for all routes
app.use((0, cors_1.default)());
// body parser uses json
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json({ type: 'application/json' }));
// know more about the visitors 
app.use(stats.queryGeoIPMiddleware);
// if enabled in the .env conf file, we save the geo ip info into database.
if (process.env.DB_STATS_ENABLE === 'true') {
    console.info(`Stats database configuration : ${process.env.DB_USER} @ ${process.env.DB_HOSTNAME} / ${process.env.DB_DATABASE}`);
    // enable save of geoip into the database for all routes.
    app.use(stats.persistGeoIPMiddleware);
}
// create a router for handling the REST API
const router = express_1.default.Router();
// install static middleware to serve various static sites
router.use('/', express_1.default.static(path_1.default.join(__dirname, '..', 'public', 'about.hironico')));
// install middleware to make stats about visitors
stats.handleRouteGeoIP(router);
// now add router to the app
app.use('/', router);
//initialize a simple http server
const server = https_1.default.createServer({
    key: fs_1.default.readFileSync(process.env.SERVER_SSL_KEY_FILE),
    cert: fs_1.default.readFileSync(process.env.SERVER_SSL_CERT_FILE)
}, app);
//initialize the WebSocket server instance
const wss = new ws_1.default.Server({ server });
// next file is initialized by a prior configuration message sent from the client
let nextFile = null;
wss.on('connection', (ws) => {
    //connection is up, let's add a simple event listener to save files on a directory
    ws.binaryType = 'arraybuffer';
    ws.on('message', (message) => {
        console.log(`Received message of type: ${typeof message}`);
        try {
            if (nextFile !== null) {
                const receivedData = new Uint8Array(message);
                const filePath = `/tmp/${nextFile.name}`;
                console.log(`Writing ${receivedData.byteLength} bytes into ${filePath}`);
                const buffer = Buffer.from(receivedData.buffer);
                fs_1.default.writeFileSync(filePath, buffer);
                nextFile = null;
                ws.send('OK');
            }
            else {
                console.log(`Received: ${message}`);
                const myMessage = JSON.parse(message);
                if ('up' === myMessage.msgType) {
                    nextFile = {
                        name: myMessage.name,
                        size: myMessage.size
                    };
                    ws.send('READY');
                }
            }
        }
        catch (error) {
            nextFile = null;
            console.log(`Message not recognized: ${error}.`);
            ws.send(`ERROR: Message not recognized: ${JSON.stringify(error)}`);
        }
    });
});
//start our server
const port = process.env.SERVER_PORT || 4000;
server.listen(port, () => {
    console.log(`Server started on port ${port} :)`);
});
//# sourceMappingURL=server.js.map