import path from 'path';
import express, { Router } from 'express';
import https from 'https';
import http from 'http';
import WebSocket from 'ws';
import fs from 'fs';
import cors from 'cors';
import dotenv from "dotenv";
import helmet from 'helmet';

const packInfo = require('../package.json');

import * as stats from "./middlewares/stats";

// some intriduction messages
console.log(`This is hironico.net static sites server version ${packInfo.version}`);
console.log(`Starting into: ${__dirname}`);

// loading environment configuration fom the .env file
dotenv.config();

console.log('Configuration loaded OK.');
console.log(`SSL key file: ${process.env.SERVER_SSL_KEY_FILE}`);
console.log(`SSL cert file: ${process.env.SERVER_SSL_CERT_FILE}`);

const app = express();

// protect against well know attacks
app.use(helmet());

// enable cors request for all routes
app.use(cors());

// body parser uses json
app.use(express.urlencoded({extended: false}));
app.use(express.json({ type: 'application/json' }));

// know more about the visitors 
app.use(stats.queryGeoIPMiddleware);

// if enabled in the .env conf file, we save the geo ip info into database.
if (process.env.DB_STATS_ENABLE === 'true') {
    console.info(`Stats database configuration : ${process.env.DB_USER} @ ${process.env.DB_HOSTNAME} / ${process.env.DB_DATABASE}`)

    // enable save of geoip into the database for all routes.
    app.use(stats.persistGeoIPMiddleware);
}

// create a router for handling the REST API
const router: Router = express.Router();

// install static middleware to serve various static sites
router.use('/', express.static(path.join(__dirname, '..', 'public', 'about.hironico')));

// install middleware to make stats about visitors
stats.handleRouteGeoIP(router);

// now add router to the app
app.use('/', router);

//initialize a simple https server if enabled in the configuration
let server = null;
if (process.env.SERVER_SSL_ENABLE === 'true') {
    server = https.createServer({
        key: fs.readFileSync(process.env.SERVER_SSL_KEY_FILE),
        cert: fs.readFileSync(process.env.SERVER_SSL_CERT_FILE)
    }, app)
} else {
    console.warn('Creating non secure HTTP server; USe only for development. See dotenv-sample file for info.');
    server = http.createServer(app);
}

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

// next file is initialized by a prior configuration message sent from the client
let nextFile: any = null;

wss.on('connection', (ws: WebSocket) => {
    //connection is up, let's add a simple event listener to save files on a directory
    ws.binaryType = 'arraybuffer';

    ws.on('message', (message: any) => {
        console.log(`Received message of type: ${typeof message}`);
        try {
            if (nextFile !== null) {
                const receivedData = new Uint8Array(message);
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
