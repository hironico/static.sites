"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const https_1 = __importDefault(require("https"));
const ws_1 = __importDefault(require("ws"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
// loading environment configuration fom the .env file
dotenv_1.default.config();
const app = (0, express_1.default)();
console.log(`Starting into: ${__dirname}`);
app.use('/', express_1.default.static(path_1.default.join(__dirname, '..', 'public', 'about.hironico')));
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
        try {
            if (nextFile !== null) {
                const receivedData = new Float32Array(message);
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
            console.log('Message not recognized.');
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