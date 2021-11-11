import path from 'path';
import express from 'express';
import https from 'https';
import WebSocket from 'ws';
import fs from 'fs';

import dotenv from "dotenv";

// loading environment configuration fom the .env file
dotenv.config();

const app = express();

console.log(`Starting into: ${__dirname}`);
app.use('/', express.static(path.join(__dirname, '..', 'public', 'about.hironico')));

//initialize a simple http server
const server = https.createServer({
    key: fs.readFileSync(process.env.SERVER_SSL_KEY_FILE),
    cert: fs.readFileSync(process.env.SERVER_SSL_CERT_FILE)
}, app)

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

// next file is initialized by a prior configuration message sent from the client
let nextFile: any = null;

wss.on('connection', (ws: WebSocket) => {
    //connection is up, let's add a simple event listener to save files on a directory
    ws.binaryType = 'arraybuffer';

    ws.on('message', (message: any) => {
        try {
            if (nextFile !== null) {
                const receivedData = new Float32Array(message);                
                const filePath = `/tmp/${nextFile.name}`;
                console.log(`Writing ${receivedData.byteLength} bytes into ${filePath}`);
                const buffer = Buffer.from(receivedData.buffer);
                fs.writeFileSync(filePath, buffer);
                nextFile = null;
                ws.send('OK');
            } else {
                console.log(`Received: ${message}`);
                const myMessage = JSON.parse(message);
                if ('up' === myMessage.msgType) {
                    nextFile = {
                        name: myMessage.name,
                        size: myMessage.size
                    }
    
                    ws.send('READY');
                }
            }            
        } catch (error) {
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
