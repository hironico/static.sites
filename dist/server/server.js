"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");
const app = express();
console.log(`Starting into: ${__dirname}`);
app.use('/', express.static(path.join(__dirname, '..', '..', 'public', 'about.hironico')));
//initialize a simple http server
const server = http.createServer(app);
//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });
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
                fs.writeFileSync(filePath, buffer);
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
const port = process.env.PORT || 8999;
server.listen(port, () => {
    console.log(`Server started on port ${port} :)`);
});
//# sourceMappingURL=server.js.map